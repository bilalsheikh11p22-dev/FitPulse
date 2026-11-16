import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Flame, 
  Award, 
  UserPlus, 
  MessageSquare, 
  Clock, 
  Info 
} from 'lucide-react';
import api from '../api/api';
import { toArray, toNumber, getErrorMessage, toDate } from '../utils/normalize';

import useFlash from '../utils/useFlash';
import { announceNotifications } from '../utils/notificationEvents';

const TYPE_LABELS = {
  workout_completion: 'Workout',
  goal_achievement: 'Goal',
  follower: 'Community',
  forum_reply: 'Community',
  reminder: 'Reminder',
  system: 'System',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, flash] = useFlash();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      // backend contract: { notifications: [], unreadCount: n } - never treat the object as an array
      const list = toArray(res.data, 'notifications');
      setNotifications(list);
      const unread =
        res.data && !Array.isArray(res.data) ? toNumber(res.data.unreadCount, list.filter((n) => !n.isRead).length) : 0;
      setUnreadCount(unread);
      announceNotifications(unread);
      setError('');
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
      setError(getErrorMessage(err, 'Could not load notifications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      const next = Math.max(0, unreadCount - (notifications.find((n) => n._id === id && !n.isRead) ? 1 : 0));
      setUnreadCount(next);
      announceNotifications(next);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      announceNotifications(0);
      setError('');
      flash('All notifications marked as read.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      const removed = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const next = removed && !removed.isRead ? Math.max(0, unreadCount - 1) : unreadCount;
      setUnreadCount(next);
      announceNotifications(next);
      setError('');
      flash('Notification deleted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'workout_completion':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'goal_achievement':
        return <Award className="w-5 h-5 text-brand-400" />;
      case 'follower':
        return <UserPlus className="w-5 h-5 text-cyan-400" />;
      case 'forum_reply':
        return <MessageSquare className="w-5 h-5 text-purple-400" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-rose-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const displayedNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brand-400" />
            <span>Activity Notifications & Alerts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Workout logs, goal achievements, follower updates, and system prompts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-brand-400" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-brand-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === 'unread'
              ? 'bg-brand-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
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

      {/* Notification List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading alerts...</p>
        </div>
      ) : displayedNotifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Bell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Notifications</h3>
          <p className="text-xs text-slate-400">
            {filter === 'unread'
              ? "You've read all your recent notifications!"
              : 'You have no activity alerts logged yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map((item) => (
            <div
              key={item._id}
              className={`p-4 rounded-2xl border transition shadow-md flex items-start justify-between gap-4 ${
                item.isRead
                  ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900 border-brand-500/40 text-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-400" />
                    )}
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-slate-950 border border-slate-800 text-slate-400">
                      {TYPE_LABELS[item.type] || 'System'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {toDate(item.createdAt)
                      ? toDate(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                      : ''}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item._id)}
                    aria-label="Mark as read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item._id)}
                  aria-label="Delete notification"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
