import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Ruler, 
  Bell, 
  ShieldCheck, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Download 
} from 'lucide-react';
import { getErrorMessage } from '../utils/normalize';

export default function Settings() {
  const { user, updateUser, theme, changeTheme, refreshUser } = useAuth();

  const [unitSystem, setUnitSystem] = useState(user?.preferences?.unitSystem || 'metric');
  const [emailNotifications, setEmailNotifications] = useState(
    user?.preferences?.emailNotifications ?? true
  );
  const [reminderAlerts, setReminderAlerts] = useState(
    user?.preferences?.reminderAlerts ?? true
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  useEffect(() => {
    if (user?.preferences) {
      if (user.preferences.unitSystem) setUnitSystem(user.preferences.unitSystem);
      if (user.preferences.emailNotifications !== undefined) {
        setEmailNotifications(Boolean(user.preferences.emailNotifications));
      }
      if (user.preferences.reminderAlerts !== undefined) {
        setReminderAlerts(Boolean(user.preferences.reminderAlerts));
      }
    }
  }, [user?.preferences]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        preferences: {
          unitSystem,
          theme,
          emailNotifications,
          reminderAlerts,
        },
      };

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
      setSuccessMessage('Preferences updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Error updating settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadGDPR = async () => {
    try {
      const res = await api.get('/auth/export-data', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `FitPulse_Account_Data_${user?.username || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: download only the cached user object if the backend is unavailable
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `FitPulse_Account_Data_${user?.username || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-brand-400" />
          <span>Settings & User Preferences</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize UI appearance, measurement standards, alerts, and account privacy.
        </p>
      </div>

      {successMessage && (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* 1. Theme Configuration */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Theme Preference</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => changeTheme('dark')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition ${
                theme === 'dark'
                  ? 'bg-brand-500/10 border-brand-500 text-white font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4 text-brand-400" />
              <span className="text-xs">Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => changeTheme('light')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition ${
                theme === 'light'
                  ? 'bg-brand-500/10 border-brand-500 text-white font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs">Light Mode</span>
            </button>
          </div>
        </div>

        {/* 2. Units of Measurement */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Ruler className="w-4 h-4 text-cyan-400" />
            <span>Measurement Units</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => setUnitSystem('metric')}
              className={`p-3 rounded-xl border flex flex-col text-left transition ${
                unitSystem === 'metric'
                  ? 'bg-cyan-500/10 border-cyan-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-xs font-bold">Metric System</span>
              <span className="text-[11px] text-slate-400">Kilograms (kg), Centimeters (cm)</span>
            </button>

            <button
              type="button"
              onClick={() => setUnitSystem('imperial')}
              className={`p-3 rounded-xl border flex flex-col text-left transition ${
                unitSystem === 'imperial'
                  ? 'bg-cyan-500/10 border-cyan-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-xs font-bold">Imperial System</span>
              <span className="text-[11px] text-slate-400">Pounds (lbs), Inches (in)</span>
            </button>
          </div>
        </div>

        {/* 3. Notification Preferences */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Alert & Notification Channels</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Daily Workout & Meal Prompts</p>
                <p className="text-[11px] text-slate-400">Receive in-app alerts when routine schedules hit.</p>
              </div>
              <input
                type="checkbox"
                checked={reminderAlerts}
                onChange={(e) => setReminderAlerts(e.target.checked)}
                className="w-4 h-4 accent-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Email Digest & Milestone Achievements</p>
                <p className="text-[11px] text-slate-400">Weekly progress summaries delivered to your inbox.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-brand-500"
              />
            </label>
          </div>
        </div>

        {/* 4. Security & Password Update */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Security & Password</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* 5. Privacy & Data Portability (GDPR) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>GDPR Privacy & Data Portability</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            In compliance with GDPR standards, you retain complete ownership of your fitness logs, biometrics, and profile.
          </p>

          <button
            type="button"
            onClick={handleDownloadGDPR}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-brand-400" />
            <span>Download All Personal Account Data (JSON)</span>
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition shadow-lg shadow-brand-500/25 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save All Preferences'}</span>
        </button>
      </form>
    </div>
  );
}
