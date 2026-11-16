// Background reminder scheduler. ONE interval per server process (never per request).
//
// Strategy
//  - Every reminder stores `nextRunAt` (UTC instant) computed from its time/days/repeat in ITS OWN timezone.
//  - Each tick finds active reminders with nextRunAt <= now.
//  - Duplicate protection: the notification carries a unique dedupeKey (reminder id + occurrence), and the reminder is
//    advanced with a conditional update on the old nextRunAt, so a race or a crash between the two steps cannot
//    produce a second notification.
//  - After a restart, overdue reminders are processed on the first tick: an occurrence missed by <= MAX_LATE_MS
//    still notifies (once); older ones are skipped silently. Missed occurrences are never replayed in bulk.
//  - Disabled / deleted reminders are not matched by the query, so they stop immediately.
//  - This creates IN-APP notifications only. There is no browser push, email or SMS delivery.
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { computeNextRun } = require('./schedule');
const { createNotification } = require('./notify');

const MAX_LATE_MS = 6 * 60 * 60 * 1000;
const DEFAULT_MESSAGES = {
  workout: 'Time for your workout.',
  meal: 'Time to log or eat your meal.',
  water: 'Time to drink some water.',
  goal: 'Time to check in on your fitness goal.',
  supplement: 'Time to take your supplements.',
  weight: 'Time to log your weight.',
  general: 'You have a reminder.',
};

let timer = null;
let running = false;

const processOne = async (r, now) => {
  const occurrence = new Date(r.nextRunAt);
  const next = computeNextRun(r, now);
  const lateMs = now.getTime() - occurrence.getTime();

  const owner = await User.findById(r.user).select('isActive preferences');
  if (!owner) {
    await Reminder.findOneAndDelete({ _id: r._id }); // orphaned reminder
    return false;
  }
  const wantsAlerts = owner.isActive !== false && !(owner.preferences && owner.preferences.reminderAlerts === false);

  let notified = false;
  if (wantsAlerts && lateMs <= MAX_LATE_MS) {
    const created = await createNotification({
      user: r.user,
      title: `Reminder: ${r.title}`,
      message: r.notes || DEFAULT_MESSAGES[r.type] || DEFAULT_MESSAGES.general,
      type: 'reminder',
      link: '/reminders',
      dedupeKey: `reminder:${r._id}:${occurrence.getTime()}`,
    });
    notified = Boolean(created);
  }

  const update = { lastTriggeredAt: now, nextRunAt: next };
  if (r.repeat === 'once' || !next) update.active = false; // finished
  await Reminder.findOneAndUpdate({ _id: r._id, active: true, nextRunAt: r.nextRunAt }, { $set: update });
  return notified;
};

// Process everything that is due at `now`. Returns the number of notifications created.
const processDueReminders = async (now = new Date()) => {
  const due = await Reminder.find({
    active: true,
    $or: [{ nextRunAt: null }, { nextRunAt: { $exists: false } }, { nextRunAt: { $lte: now } }],
  });
  let count = 0;
  for (const r of due) {
    try {
      if (!r.nextRunAt) {
        // legacy reminder created before scheduling existed: schedule it, do not notify retroactively
        const next = computeNextRun(r, now);
        await Reminder.findOneAndUpdate(
          { _id: r._id, active: true, nextRunAt: null },
          { $set: next ? { nextRunAt: next } : { active: false, nextRunAt: null } }
        );
      } else if (await processOne(r, now)) {
        count += 1;
      }
    } catch (error) {
      console.error(`Reminder ${r._id} failed:`, error.message || error);
    }
  }
  return count;
};

const tick = async () => {
  if (running) return; // never overlap ticks
  running = true;
  try {
    await processDueReminders(new Date());
  } catch (error) {
    console.error('Reminder scheduler tick failed:', error.message || error);
  } finally {
    running = false;
  }
};

const startReminderScheduler = (intervalMs = Number(process.env.REMINDER_CHECK_INTERVAL_MS) || 30000) => {
  if (timer) return false; // already running: never schedule twice
  timer = setInterval(tick, intervalMs);
  if (timer.unref) timer.unref();
  tick(); // recovery pass right after (re)start
  console.log(`Reminder scheduler started (checking every ${Math.round(intervalMs / 1000)}s)`);
  return true;
};

const stopReminderScheduler = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

module.exports = { startReminderScheduler, stopReminderScheduler, processDueReminders, MAX_LATE_MS };
