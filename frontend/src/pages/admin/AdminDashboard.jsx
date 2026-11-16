import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Dumbbell, 
  Utensils, 
  Scale, 
  LifeBuoy, 
  Star, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  ArrowRight,
  Bell,
  Activity
} from 'lucide-react';
import api from '../../api/api';
import { toArray, toNumber, getErrorMessage, fmtDate } from '../../utils/normalize';
import Avatar from '../../components/ui/Avatar';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      const d = res.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : {};
      setStats({
        ...d,
        recentUsers: toArray(d.recentUsers),
        recentWorkouts: toArray(d.recentWorkouts),
        recentFeedbacks: toArray(d.recentFeedbacks),
      });
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load dashboard statistics.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleUser = async (userId, active, name) => {
    if (!window.confirm(`${active ? 'Deactivate' : 'Activate'} the account of "${name}"?`)) return;
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      await fetchStats();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 border border-red-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FitPulse System Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time multi-tenant monitoring across users, workouts, nutrition records, and support queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/notifications"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-500/25 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            Full System Reports
          </Link>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* 1. Core Platform Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400">Total Users</p>
          <h3 className="text-2xl font-bold text-white mt-1">{toNumber(stats?.totalUsers)}</h3>
          <p className="text-[10px] text-brand-400 mt-1">{toNumber(stats?.activeUsers)} Active</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400">Total Workouts</p>
          <h3 className="text-2xl font-bold text-brand-400 mt-1">{toNumber(stats?.totalWorkouts)}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Logged sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400">Meals Logged</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{toNumber(stats?.totalNutrition)}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Nutrition items</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400">Progress Check-ins</p>
          <h3 className="text-2xl font-bold text-cyan-400 mt-1">{toNumber(stats?.totalProgress)}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Biometrics logged</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400">Pending Tickets</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">{toNumber(stats?.pendingTickets)}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Requires review</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400">Total Feedback</p>
          <h3 className="text-2xl font-bold text-purple-400 mt-1">{toNumber(stats?.totalFeedback)}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Reviews</p>
        </div>
      </div>

      {/* 2. Recent Registered Users Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold text-white">Recent Registered Users</h3>
          </div>
          <Link to="/admin/users" className="text-xs text-red-400 hover:underline flex items-center gap-1">
            <span>Manage All Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Fitness Goal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {stats?.recentUsers?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    No registered users found.
                  </td>
                </tr>
              )}
              {stats?.recentUsers?.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={u.avatar} name={u.name} size={28} rounded="rounded-lg" />
                      <div>
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-400">
                    {u.fitnessGoal?.replace('_', ' ') || 'General'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {u.isActive !== false ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      <span>{u.isActive !== false ? 'Active' : 'Suspended'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleUser(u._id, u.isActive !== false, u.name)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        u.isActive !== false
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Global Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Global Workouts */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-brand-400" />
              <span>Recent User Workouts</span>
            </h3>
            <Link to="/admin/workouts" className="text-xs text-red-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {stats?.recentWorkouts?.length === 0 && (
              <p className="text-xs text-slate-400 italic p-4 bg-slate-950 border border-slate-800 rounded-xl">
                No user workouts logged yet.
              </p>
            )}
            {stats?.recentWorkouts?.map((w) => (
              <div
                key={w._id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-semibold text-white">{w.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    By <strong className="text-slate-200">{w.user?.name || 'Athlete'}</strong> • {w.category} • {w.duration} mins
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                  {w.caloriesBurned} kcal
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback Feed */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Recent User Feedback</span>
            </h3>
            <Link to="/admin/feedback" className="text-xs text-red-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {stats?.recentFeedbacks?.length === 0 && (
              <p className="text-xs text-slate-400 italic p-4 bg-slate-950 border border-slate-800 rounded-xl">
                No user feedback submitted yet.
              </p>
            )}
            {stats?.recentFeedbacks?.map((f) => (
              <div
                key={f._id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{f.user?.name || 'User'}</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: Math.max(0, Math.min(5, toNumber(f.rating))) }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 italic text-[11px]">"{f.comments}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
