import React, { useState, useEffect } from 'react';
import { Users, Trash2, UserCheck, UserX, Eye } from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, fmtDate } from '../../utils/normalize';
import Avatar from '../../components/ui/Avatar';
import {
  PageHeader,
  Card,
  Badge,
  StatusDot,
  Alert,
  Spinner,
  EmptyState,
  SearchBar,
  FilterTabs,
  DataTable,
  Modal,
  tdCls,
  iconBtn,
  btnSecondary,
} from '../../components/admin/ui';

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
    <div>
      <PageHeader
        icon={Users}
        title="Users"
        description="Search accounts, review activity, suspend or reactivate users and manage administrator roles."
      />

      <div className="space-y-4">
        {/* Filters */}
        <Card>
          <div className="space-y-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              onSubmit={handleSearchSubmit}
              placeholder="Search by name, username or email"
            />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <FilterTabs label="Role" options={['all', 'user', 'admin']} value={roleFilter} onChange={setRoleFilter} />
              <FilterTabs label="Status" options={['all', 'active', 'inactive']} value={statusFilter} onChange={setStatusFilter} />
            </div>
          </div>
        </Card>

        {error && <Alert>{error}</Alert>}

        <Card
          padded={false}
          title={loading ? 'Accounts' : `Accounts (${users.length})`}
          icon={Users}
        >
          {loading ? (
            <Spinner label="Loading user accounts…" />
          ) : users.length === 0 ? (
            <EmptyState icon={Users} title="No users found" description="Try changing the search term or filters." />
          ) : (
            <DataTable
              columns={[
                { label: 'User' },
                { label: 'Email' },
                { label: 'Role' },
                { label: 'Weight / Height' },
                { label: 'Status' },
                { label: 'Registered' },
                { label: 'Actions', align: 'right' },
              ]}
            >
              {users.map((u) => {
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
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        title="Click to change role"
                        className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                      >
                        <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'} className="capitalize cursor-pointer hover:brightness-125 transition">
                          {u.role}
                        </Badge>
                      </button>
                    </td>
                    <td className={`${tdCls} text-slate-300 whitespace-nowrap tabular-nums`}>
                      {u.weight} kg · {u.height} cm
                    </td>
                    <td className={tdCls}>
                      <StatusDot active={active} />
                    </td>
                    <td className={`${tdCls} text-slate-400 whitespace-nowrap`}>{fmtDate(u.createdAt)}</td>
                    <td className={`${tdCls} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(u._id)}
                          disabled={detailLoading}
                          className={iconBtn}
                          title="View profile and activity"
                          aria-label={`View ${u.name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u._id, active, u.name)}
                          className={`${iconBtn} ${active ? 'hover:!text-amber-400' : 'hover:!text-emerald-400'}`}
                          title={active ? 'Deactivate user' : 'Activate user'}
                          aria-label={active ? `Deactivate ${u.name}` : `Activate ${u.name}`}
                        >
                          {active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className={`${iconBtn} hover:!text-red-400 hover:!bg-red-500/10`}
                          title="Delete user"
                          aria-label={`Delete ${u.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </Card>
      </div>

      {/* Details modal */}
      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User profile"
        footer={
          <button onClick={() => setSelectedUser(null)} className={btnSecondary}>
            Close
          </button>
        }
      >
        {selectedUser && (
          <>
            <div className="flex items-center gap-4">
              <Avatar src={selectedUser.user?.avatar} name={selectedUser.user?.name} size={56} rounded="rounded-full" />
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{selectedUser.user.name}</h3>
                <p className="text-sm text-slate-400 truncate">
                  @{selectedUser.user.username} · {selectedUser.user.email}
                </p>
                <Badge tone={selectedUser.user.role === 'admin' ? 'brand' : 'neutral'} className="capitalize mt-1.5">
                  {selectedUser.user.role}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ['Workouts', selectedUser.workoutsCount],
                ['Nutrition', selectedUser.nutritionCount],
                ['Progress logs', selectedUser.progressCount],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg bg-slate-950 border border-slate-800 p-3 text-center">
                  <p className="text-xl font-bold text-white tabular-nums">{val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Recent workouts</h4>
              {toArray(selectedUser.recentWorkouts).length > 0 ? (
                <ul className="rounded-lg border border-slate-800 divide-y divide-slate-800/70 overflow-hidden">
                  {toArray(selectedUser.recentWorkouts).map((w) => (
                    <li key={w._id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm bg-slate-950">
                      <span className="text-slate-200 truncate">
                        {w.title} <span className="text-slate-500">({w.category})</span>
                      </span>
                      <span className="text-brand-400 font-medium tabular-nums shrink-0">{w.caloriesBurned} kcal</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No workouts logged yet.</p>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
