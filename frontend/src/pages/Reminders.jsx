import { InlineLoader } from '../components/ui/Loader';
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Target, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Droplet, 
  Utensils, 
  Dumbbell,
  Edit,
  Scale
} from 'lucide-react';
import api from '../api/api';
import { toArray, toDate, getErrorMessage, goalProgress, goalProgressRaw, fmtDate } from '../utils/normalize';
import useFlash from '../utils/useFlash';
import { announceNotifications } from '../utils/notificationEvents';
import GoalModal from '../components/GoalModal';

const REPEAT_LABELS = { once: 'One time', daily: 'Every day', weekly: 'Weekly', custom: 'Selected days' };
const fmtDateTime = (v) => {
  const d = toDate(v);
  return d ? d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : null;
};

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, flash] = useFlash();
  const [editingGoal, setEditingGoal] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('goal'); // 'goal' or 'reminder'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remindersRes, goalsRes] = await Promise.all([
        api.get('/reminders/reminders'),
        api.get('/reminders/goals'),
      ]);
      setReminders(toArray(remindersRes.data));
      setGoals(toArray(goalsRes.data));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load reminders and goals.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleReminder = async (id) => {
    try {
      const res = await api.put(`/reminders/reminders/${id}/toggle`);
      setReminders((prev) => prev.map((r) => (r._id === id ? res.data : r)));
      setError('');
      flash(res.data?.active ? 'Reminder enabled.' : 'Reminder disabled.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.delete(`/reminders/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r._id !== id));
      setError('');
      flash('Reminder deleted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`/reminders/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g._id !== id));
      setError('');
      flash('Goal deleted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSaveModal = async (data) => {
    // errors propagate to the modal, which stays open and shows the message
    let message;
    if (modalMode === 'goal') {
      if (editingGoal) {
        const res = await api.put(`/reminders/goals/${editingGoal._id}`, data);
        message = res.data?.status === 'completed' && editingGoal.status !== 'completed' ? 'Goal completed. Congratulations!' : 'Goal updated.';
      } else {
        const res = await api.post('/reminders/goals', data);
        message = res.data?.status === 'completed' ? 'Goal saved and already completed.' : 'Goal created.';
      }
    } else {
      await api.post('/reminders/reminders', data);
      message = 'Reminder created.';
    }
    setEditingGoal(null);
    await fetchData();
    flash(message);
    announceNotifications(); // completing a goal creates a notification: refresh the navbar badge
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-brand-400" />;
      case 'meal':
        return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'water':
        return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'weight':
        return <Scale className="w-4 h-4 text-emerald-400" />;
      case 'goal':
        return <Target className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Target className="w-6 h-6 text-purple-400" />
            <span>Reminders, Alerts & Fitness Goals</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automate training notifications and track progressive milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingGoal(null);
              setModalMode('reminder');
              setModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-brand-400" />
            <span>New Reminder</span>
          </button>

          <button
            onClick={() => {
              setEditingGoal(null);
              setModalMode('goal');
              setModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold hover:bg-purple-400 transition shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Fitness Goal</span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          {success}
        </div>
      )}

      {loading && goals.length === 0 && reminders.length === 0 && (
        <InlineLoader label="Loading goals and reminders" className="py-10" />
      )}

      {/* 1. Goals Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          <span>Fitness Goals ({goals.length})</span>
        </h2>

        {goals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No fitness goals defined yet. Click "New Fitness Goal" to set a milestone!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const progressPct = goalProgress(goal);
              const rawPct = goalProgressRaw(goal);
              return (
                <div
                  key={goal._id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {goal.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {goal.status !== 'in_progress' && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              goal.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {goal.status}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setEditingGoal(goal);
                            setModalMode('goal');
                            setModalOpen(true);
                          }}
                          className="text-slate-500 hover:text-white transition"
                          title="Update goal progress"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal._id)}
                          className="text-slate-500 hover:text-red-400 transition"
                          title="Delete goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">
                      {goal.title}
                    </h3>
                    {goal.description && <p className="text-xs text-slate-400">{goal.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-bold text-purple-400">{rawPct > 100 ? `${rawPct}%` : `${progressPct}%`}</span>
                    </div>

                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Current: <strong className="text-white">{goal.currentValue} {goal.unit}</strong></span>
                      <span>Target: <strong className="text-purple-300">{goal.targetValue} {goal.unit}</strong></span>
                    </div>

                    {goal.deadline && (
                      <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                        {goal.startDate ? `Started ${fmtDate(goal.startDate)} • ` : ''}Deadline: {fmtDate(goal.deadline)}
                        {goal.status === 'completed' && goal.completedAt ? ` • Completed ${fmtDate(goal.completedAt)}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Reminders Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-400" />
          <span>Scheduled Reminders & Alerts ({reminders.length})</span>
        </h2>

        {reminders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No reminders configured yet. Add your workout or meal reminders above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((reminder) => (
              <div
                key={reminder._id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {getTypeIcon(reminder.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {reminder.title}
                      </h4>
                      <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                        {reminder.time}
                      </span>
                    </div>

                    {reminder.notes && (
                      <p className="text-xs text-slate-400">{reminder.notes}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                      <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {REPEAT_LABELS[reminder.repeat] || REPEAT_LABELS.custom}
                      </span>
                      {reminder.repeat === 'once' && reminder.runDate && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800">{fmtDate(`${reminder.runDate}T00:00:00`)}</span>
                      )}
                      {reminder.repeat !== 'daily' && toArray(reminder.days).map((d) => (
                        <span key={d} className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800">
                          {d}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {reminder.active && fmtDateTime(reminder.nextRunAt)
                        ? `Next: ${fmtDateTime(reminder.nextRunAt)}`
                        : reminder.repeat === 'once' && fmtDateTime(reminder.lastTriggeredAt)
                          ? `Sent ${fmtDateTime(reminder.lastTriggeredAt)}`
                          : 'Paused'}
                    </p>
                  </div>
                </div>

                {/* Toggle and Delete */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleReminder(reminder._id)}
                    aria-label={reminder.active ? 'Disable reminder' : 'Enable reminder'}
                    aria-pressed={Boolean(reminder.active)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      reminder.active ? 'bg-brand-500 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
                  </button>

                  <button
                    onClick={() => handleDeleteReminder(reminder._id)}
                    aria-label="Delete reminder"
                    className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveModal}
        mode={modalMode}
        initialData={editingGoal}
      />
    </div>
  );
}
