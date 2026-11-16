import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  UserCheck, 
  UserX, 
  Eye, 
  X
} from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, fmtDate } from '../../utils/normalize';
import Avatar from '../../components/ui/Avatar';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected user modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/admin/users', { params });
      setUsers(toArray(res.data));
      setError('');
    } catch (err) {
      setUsers([]);
      setError(getErrorMessage(err, 'Could not load users.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (id, active, name) => {
    if (!window.confirm(`${active ? 'Deactivate' : 'Activate'} the account of "${name}"?`)) return;
    try {
      const res = await api.put(`/admin/users/${id}/toggle-status`);
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data.user : u)));
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${name}" and all their workout/nutrition logs?`)) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } catch (err) {
        window.alert(getErrorMessage(err));
      }
    }
  };

  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Change role of this account to "${newRole}"?`)) {
      try {
        const res = await api.put(`/admin/users/${id}/role`, { role: newRole });
        setUsers((prev) => prev.map((u) => (u._id === id ? res.data : u)));
      } catch (err) {
        window.alert(getErrorMessage(err));
      }
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUser(res.data && res.data.user ? res.data : null);
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Users className="w-6 h-6 text-red-400" />
          <span>User Management & Authorization</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search, audit, inspect activity, toggle account statuses, and assign administrative roles.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Role:</span>
            {['all', 'user', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg capitalize ${
                  roleFilter === r
                    ? 'bg-red-500 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Status:</span>
            {['all', 'active', 'inactive'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg capitalize ${
                  statusFilter === s
                    ? 'bg-red-500 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No users found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Biometrics</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={u.avatar} name={u.name} size={32} rounded="rounded-lg" className="border border-slate-700" />
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        title="Click to toggle Role"
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                          u.role === 'admin'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {u.weight}kg • {u.height}cm
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
                    <td className="px-4 py-3 text-slate-400">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(u._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="View Full Profile & Activity"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive !== false, u.name)}
                          className={`p-1.5 rounded-lg transition ${
                            u.isActive !== false
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={u.isActive !== false ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.isActive !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <Avatar src={selectedUser.user?.avatar} name={selectedUser.user?.name} size={56} rounded="rounded-2xl" className="border border-slate-700" />
              <div>
                <h3 className="text-lg font-bold text-white">{selectedUser.user.name}</h3>
                <p className="text-xs text-red-400">@{selectedUser.user.username} • {selectedUser.user.email}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Role: <strong className="capitalize text-slate-200">{selectedUser.user.role}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400">Workouts</p>
                <p className="font-bold text-white text-base mt-0.5">{selectedUser.workoutsCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400">Nutrition</p>
                <p className="font-bold text-white text-base mt-0.5">{selectedUser.nutritionCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400">Progress Logs</p>
                <p className="font-bold text-white text-base mt-0.5">{selectedUser.progressCount}</p>
              </div>
            </div>

            {/* Recent Workouts */}
            <div className="space-y-1.5 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recent Workouts</h4>
              {toArray(selectedUser.recentWorkouts).length > 0 ? (
                toArray(selectedUser.recentWorkouts).map((w) => (
                  <div key={w._id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between">
                    <span>{w.title} ({w.category})</span>
                    <span className="text-brand-400">{w.caloriesBurned} kcal</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No workouts logged yet.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
