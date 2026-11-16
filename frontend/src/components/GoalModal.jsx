import React, { useState } from 'react';
import { getErrorMessage, toNumber } from '../utils/normalize';
import { X, Target, Bell } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

const validateGoal = (g) => {
  if (!g.title.trim()) return 'Please enter a goal objective.';
  if (g.targetValue === '' || !Number.isFinite(Number(g.targetValue)) || Number(g.targetValue) <= 0) return 'Target value must be a number greater than 0.';
  if (g.currentValue !== '' && (!Number.isFinite(Number(g.currentValue)) || Number(g.currentValue) < 0)) return 'Current value cannot be negative.';
  if (g.startDate && g.deadline && g.deadline < g.startDate) return 'The deadline cannot be before the start date.';
  return null;
};

// Numbers are sent as numbers. In edit mode the status is only sent when the user changed it.
const buildGoalPayload = (g, editing, initial) => {
  const payload = {
    title: g.title.trim(),
    description: g.description.trim(),
    category: g.category,
    unit: g.unit.trim() || 'kg',
    targetValue: Number(g.targetValue),
    currentValue: g.currentValue === '' ? 0 : toNumber(g.currentValue),
  };
  if (g.startDate) payload.startDate = g.startDate;
  if (g.deadline) payload.deadline = g.deadline;
  if (editing && g.status !== (initial.status === 'completed' ? 'completed' : 'in_progress')) payload.status = g.status;
  return payload;
};

const validateReminder = (r) => {
  if (!r.title.trim()) return 'Please enter a reminder title.';
  if (!r.time) return 'Please choose a time.';
  if (r.repeat === 'once') {
    if (!r.runDate) return 'Please choose a date for the one-time reminder.';
    if (r.runDate < today()) return 'The date cannot be in the past.';
  }
  if (r.repeat === 'weekly' && r.days.length !== 1) return 'Choose one weekday for a weekly reminder.';
  if (r.repeat === 'custom' && r.days.length === 0) return 'Select at least one day.';
  return null;
};

const buildReminderPayload = (r) => ({
  title: r.title.trim(),
  type: r.type,
  time: r.time,
  repeat: r.repeat,
  days: r.repeat === 'daily' || r.repeat === 'once' ? [] : r.days,
  runDate: r.repeat === 'once' ? r.runDate : '',
  notes: r.notes.trim(),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
});

export default function GoalModal({ isOpen, onClose, onSave, mode = 'goal', initialData }) {
  if (!isOpen) return null;
  return <GoalModalForm onClose={onClose} onSave={onSave} mode={mode} initialData={initialData} />;
}

function GoalModalForm({ onClose, onSave, mode, initialData }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = mode === 'goal' && Boolean(initialData);

  // Mode can be 'goal' or 'reminder'
  const [goalData, setGoalData] = useState(
    editing
      ? {
          title: initialData.title || '',
          description: initialData.description || '',
          category: initialData.category || 'weight',
          targetValue: initialData.targetValue ?? '',
          currentValue: initialData.currentValue ?? '',
          unit: initialData.unit || 'kg',
          startDate: initialData.startDate ? String(initialData.startDate).slice(0, 10) : '',
          deadline: initialData.deadline ? String(initialData.deadline).slice(0, 10) : '',
          status: initialData.status === 'completed' ? 'completed' : 'in_progress',
        }
      : {
          title: '',
          description: '',
          category: 'weight',
          targetValue: '',
          currentValue: '',
          unit: 'kg',
          startDate: '',
          deadline: '',
        }
  );

  const [reminderData, setReminderData] = useState({
    title: '',
    type: 'workout',
    time: '07:30',
    repeat: 'custom',
    days: ['Mon', 'Wed', 'Fri'],
    runDate: '',
    notes: '',
  });

  const handleDayToggle = (day) => {
    setReminderData((prev) => {
      if (prev.repeat === 'weekly') return { ...prev, days: [day] }; // weekly = exactly one weekday
      const exists = prev.days.includes(day);
      return {
        ...prev,
        days: exists ? prev.days.filter((d) => d !== day) : [...prev.days, day],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setError('');
    const problem = mode === 'goal' ? validateGoal(goalData) : validateReminder(reminderData);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    try {
      await onSave(mode === 'goal' ? buildGoalPayload(goalData, editing, initialData) : buildReminderPayload(reminderData));
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            {mode === 'goal' ? <Target className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {mode === 'goal' ? (editing ? 'Update Fitness Goal' : 'Set New Fitness Goal') : 'Create Routine Alert / Reminder'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'goal' ? 'Define milestones and track target deadlines.' : 'Set scheduled prompts for meals and training.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'goal' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Goal Objective *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bench Press 100kg or Reach 70kg"
                  value={goalData.title}
                  onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="Optional details"
                  value={goalData.description}
                  onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={goalData.category}
                    onChange={(e) => setGoalData({ ...goalData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="weight">Body Weight</option>
                    <option value="strength">Strength Lift</option>
                    <option value="running">Cardio / Running</option>
                    <option value="workout">Workout Frequency</option>
                    <option value="nutrition">Calorie Target</option>
                    <option value="endurance">Endurance</option>
                    <option value="general">General Fitness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={goalData.unit}
                    onChange={(e) => setGoalData({ ...goalData, unit: e.target.value })}
                    placeholder="kg, reps, mins, sessions"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Value *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={goalData.targetValue}
                    onChange={(e) => setGoalData({ ...goalData, targetValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {editing ? 'Current Value' : 'Current Starting Value'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={goalData.currentValue}
                    onChange={(e) => setGoalData({ ...goalData, currentValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={goalData.startDate}
                    onChange={(e) => setGoalData({ ...goalData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Deadline Date
                  </label>
                  <input
                    type="date"
                    value={goalData.deadline}
                    onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {editing && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={goalData.status}
                    onChange={(e) => setGoalData({ ...goalData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Workout or Whey Shake"
                  value={reminderData.title}
                  onChange={(e) => setReminderData({ ...reminderData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alert Type
                  </label>
                  <select
                    value={reminderData.type}
                    onChange={(e) => setReminderData({ ...reminderData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="workout">Workout Session</option>
                    <option value="meal">Meal / Nutrition</option>
                    <option value="water">Hydration</option>
                    <option value="goal">Goal Check-in</option>
                    <option value="supplement">Supplements</option>
                    <option value="weight">Weight Tracking</option>
                    <option value="general">General Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Time (24hr)
                  </label>
                  <input
                    type="time"
                    required
                    value={reminderData.time}
                    onChange={(e) => setReminderData({ ...reminderData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Repeat
                  </label>
                  <select
                    value={reminderData.repeat}
                    onChange={(e) => {
                      const repeat = e.target.value;
                      setReminderData((prev) => ({
                        ...prev,
                        repeat,
                        days: repeat === 'weekly' ? prev.days.slice(0, 1) : prev.days,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="once">One time</option>
                    <option value="daily">Every day</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Selected weekdays</option>
                  </select>
                </div>
                {reminderData.repeat === 'once' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      min={today()}
                      value={reminderData.runDate}
                      onChange={(e) => setReminderData({ ...reminderData, runDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                )}
              </div>

              {(reminderData.repeat === 'weekly' || reminderData.repeat === 'custom') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {reminderData.repeat === 'weekly' ? 'Day Of The Week' : 'Repeat On Days'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const active = reminderData.days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          active
                            ? 'bg-brand-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  maxLength={300}
                  placeholder="e.g. Drink 500ml water and take pre-workout"
                  value={reminderData.notes}
                  onChange={(e) => setReminderData({ ...reminderData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold hover:bg-purple-400 transition shadow-lg shadow-purple-500/25 disabled:opacity-60"
            >
              {editing ? 'Update Goal' : `Save ${mode === 'goal' ? 'Goal' : 'Reminder'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
