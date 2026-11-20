import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Server, Lock, Save } from 'lucide-react';
import { getErrorMessage } from '../../utils/normalize';
import { PageHeader, Card, Alert, Field, inputCls, btnPrimary } from '../../components/admin/ui';

export default function AdminSettings() {
  const { user, updateUser, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || 'Administrator');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!name || !name.trim()) {
      setErrorMessage('Admin name cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      const payload = { name: name.trim() };
      if (password) {
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match');
          setLoading(false);
          return;
        }
        payload.password = password;
      }

      await updateUser(payload);
      setSuccessMessage('Admin profile settings updated successfully.');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Error updating settings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Manage your administrator profile and security credentials, and check the environment the platform runs in."
      />

      <div className="max-w-3xl space-y-4">
        {successMessage && <Alert tone="success">{successMessage}</Alert>}
        {errorMessage && <Alert>{errorMessage}</Alert>}

        <Card title="System status" icon={Server}>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-4">
              <dt className="text-xs text-slate-400">Database</dt>
              <dd className="mt-1.5 text-sm font-medium text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                MongoDB connected
              </dd>
            </div>
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-4">
              <dt className="text-xs text-slate-400">API server</dt>
              <dd className="mt-1.5 text-sm font-medium text-white">Express.js · port 5001</dd>
            </div>
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-4">
              <dt className="text-xs text-slate-400">Environment</dt>
              <dd className="mt-1.5 text-sm font-medium text-white">Development / Aptech SRS</dd>
            </div>
          </dl>
        </Card>

        <Card title="Administrator profile & security" icon={Lock}>
          <form onSubmit={handleSave} className="space-y-5">
            <Field label="Display name">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="New password" hint="Leave blank to keep the current password.">
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat the new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={loading} className={btnPrimary}>
                <Save className="w-4 h-4" />
                {loading ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
