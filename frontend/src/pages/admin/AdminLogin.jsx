import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthShell from '../../components/ui/AuthShell';
import { IMAGES } from '../../data/images';
import { getErrorMessage } from '../../utils/normalize';
import { inputCls, btnPrimary } from '../../components/admin/ui';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(emailOrUsername, password);
      if (data.role !== 'admin') {
        logout(); // do not leave a regular user signed in after a failed admin attempt
        setError('Access denied: This account does not possess Administrator privileges.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid administrator credentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminFill = () => {
    setEmailOrUsername('admin@fitpulse.com');
    setPassword('adminpassword123');
  };

  return (
    <AuthShell
      image={IMAGES.gym}
      title="Admin console."
      subtitle="Manage users, content, reports and support in one secure place."
      points={['User and content management', 'Platform-wide analytics', 'Support and feedback inbox']}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative z-10 space-y-6"
      >
        <div className="space-y-3">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/25">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to Admin</h2>
            <p className="mt-1.5 text-sm text-slate-400">Authorised administrators only. Activity on this console is monitored.</p>
          </div>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-950 border border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Demo credentials</p>
              <p className="text-xs text-slate-500 truncate">admin@fitpulse.com / adminpassword123</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoAdminFill}
            className="shrink-0 px-3 py-1.5 rounded-md border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Auto-fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-200 mb-1.5">Email or username</span>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                autoComplete="username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="admin@fitpulse.com"
                className={`${inputCls} pl-10`}
              />
            </div>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-200 mb-1.5">Password</span>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputCls} pl-10`}
              />
            </div>
          </label>

          <button type="submit" disabled={loading} className={`${btnPrimary} w-full !py-3`}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 pt-4 border-t border-slate-800">
          Not an administrator?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Go to user login
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
