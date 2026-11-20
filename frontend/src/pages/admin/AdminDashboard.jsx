import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Dumbbell,
  Utensils,
  Scale,
  LifeBuoy,
  Star,
  LayoutDashboard,
  Megaphone,
  FileText,
  ArrowUpRight,
  UserCheck,
  UserX,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import api from '../../api/api';
import { toArray, toNumber, getErrorMessage } from '../../utils/normalize';
import Avatar from '../../components/ui/Avatar';
import {
  PageHeader,
  Card,
  StatCard,
  Badge,
  StatusDot,
  Alert,
  Spinner,
  EmptyState,
  DataTable,
  tdCls,
  btnPrimary,
  btnSecondary,
} from '../../components/admin/ui';

const chartTooltip = {
  contentStyle: {
    background: 'rgb(var(--s900))',
    border: '1px solid rgb(var(--s700))',
    borderRadius: 8,
    fontSize: 12,
    color: 'rgb(var(--white))',
  },
  cursor: { fill: 'rgb(var(--s700) / 0.35)' },
};

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

  if (loading) return <Spinner label="Loading dashboard…" />;

  const totalUsers = toNumber(stats?.totalUsers);
  const activeUsers = toNumber(stats?.activeUsers);
  const inactiveUsers = Math.max(0, totalUsers - activeUsers);

  const activityData = [
    { name: 'Workouts', value: toNumber(stats?.totalWorkouts), color: '#ff6b2c' },
    { name: 'Meals', value: toNumber(stats?.totalNutrition), color: '#10b981' },
    { name: 'Check-ins', value: toNumber(stats?.totalProgress), color: '#06b6d4' },
  ];
  const userSplit = [
    { name: 'Active', value: activeUsers, color: '#10b981' },
    { name: 'Suspended', value: inactiveUsers, color: '#64748b' },
  ];
  const hasActivity = activityData.some((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="A live snapshot of users, activity and support across the platform."
        actions={
          <>
            <Link to="/admin/reports" className={btnSecondary}>
              <FileText className="w-4 h-4" />
              Reports
            </Link>
            <Link to="/admin/notifications" className={btnPrimary}>
              <Megaphone className="w-4 h-4" />
              New broadcast
            </Link>
          </>
        }
      />

      {error && <Alert>{error}</Alert>}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Total users" value={totalUsers} hint={`${activeUsers} active`} icon={Users} tone="brand" />
        <StatCard label="Workouts logged" value={toNumber(stats?.totalWorkouts)} hint="Training sessions" icon={Dumbbell} tone="brand" />
        <StatCard label="Meals logged" value={toNumber(stats?.totalNutrition)} hint="Nutrition entries" icon={Utensils} tone="emerald" />
        <StatCard label="Progress check-ins" value={toNumber(stats?.totalProgress)} hint="Biometric records" icon={Scale} tone="cyan" />
        <StatCard label="Pending tickets" value={toNumber(stats?.pendingTickets)} hint="Awaiting a reply" icon={LifeBuoy} tone="amber" />
        <StatCard label="Feedback received" value={toNumber(stats?.totalFeedback)} hint="User reviews" icon={Star} tone="violet" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Platform activity" className="lg:col-span-2">
          {hasActivity ? (
            <div className="h-60 text-slate-400">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="35%">
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {activityData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={Dumbbell} title="No activity yet" description="Charts appear once users start logging workouts, meals and check-ins." />
          )}
        </Card>

        <Card title="User base">
          {totalUsers > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative w-44 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userSplit} dataKey="value" innerRadius={56} outerRadius={78} paddingAngle={2} stroke="none">
                      {userSplit.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white tabular-nums">{totalUsers}</span>
                  <span className="text-xs text-slate-400">users</span>
                </div>
              </div>
              <ul className="mt-4 w-full space-y-2 text-sm">
                {userSplit.map((d) => (
                  <li key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-white tabular-nums">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState icon={Users} title="No users yet" />
          )}
        </Card>
      </div>

      {/* Recent users */}
      <Card
        title="Recently registered users"
        icon={Users}
        padded={false}
        action={
          <Link to="/admin/users" className="text-sm font-medium text-brand-400 hover:text-brand-300 inline-flex items-center gap-1">
            Manage users <ArrowUpRight className="w-4 h-4" />
          </Link>
        }
      >
        {stats?.recentUsers?.length === 0 ? (
          <EmptyState icon={Users} title="No registered users found" />
        ) : (
          <DataTable
            columns={[
              { label: 'User' },
              { label: 'Email' },
              { label: 'Role' },
              { label: 'Fitness goal' },
              { label: 'Status' },
              { label: 'Actions', align: 'right' },
            ]}
          >
            {stats?.recentUsers?.map((u) => {
              const active = u.isActive !== false;
              return (
                <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className={tdCls}>
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size={36} rounded="rounded-full" />
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{u.name}</p>
                        <p className="text-xs text-slate-500">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${tdCls} text-slate-300`}>{u.email}</td>
                  <td className={tdCls}>
                    <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'} className="capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td className={`${tdCls} capitalize text-slate-400`}>{u.fitnessGoal?.replace('_', ' ') || 'General'}</td>
                  <td className={tdCls}>
                    <StatusDot active={active} />
                  </td>
                  <td className={`${tdCls} text-right`}>
                    <button
                      onClick={() => handleToggleUser(u._id, active, u.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'border-slate-700 text-slate-300 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10'
                          : 'border-slate-700 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      {active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </Card>

      {/* Activity feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title="Recent workouts"
          icon={Dumbbell}
          padded={false}
          action={
            <Link to="/admin/workouts" className="text-sm font-medium text-brand-400 hover:text-brand-300">
              View all
            </Link>
          }
        >
          {stats?.recentWorkouts?.length === 0 ? (
            <EmptyState icon={Dumbbell} title="No workouts logged yet" />
          ) : (
            <ul className="divide-y divide-slate-800/70">
              {stats?.recentWorkouts?.map((w) => (
                <li key={w._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{w.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {w.user?.name || 'Athlete'} · {w.category} · {w.duration} min
                    </p>
                  </div>
                  <Badge tone="warning" className="shrink-0 tabular-nums">
                    {w.caloriesBurned} kcal
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Recent feedback"
          icon={Star}
          padded={false}
          action={
            <Link to="/admin/feedback" className="text-sm font-medium text-brand-400 hover:text-brand-300">
              View all
            </Link>
          }
        >
          {stats?.recentFeedbacks?.length === 0 ? (
            <EmptyState icon={Star} title="No feedback submitted yet" />
          ) : (
            <ul className="divide-y divide-slate-800/70">
              {stats?.recentFeedbacks?.map((f) => {
                const rating = Math.max(0, Math.min(5, toNumber(f.rating)));
                return (
                  <li key={f._id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white truncate">{f.user?.name || 'User'}</span>
                      <span className="text-sm tracking-tight shrink-0" aria-label={`${rating} out of 5`}>
                        <span className="text-amber-400">{'★'.repeat(rating)}</span>
                        <span className="text-slate-700">{'★'.repeat(5 - rating)}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{f.comments}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
