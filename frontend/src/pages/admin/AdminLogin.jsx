import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthShell from '../../components/ui/AuthShell';
import { IMAGES } from '../../data/images';
import { getErrorMessage } from '../../utils/normalize';

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
    <AuthShell accent="red" image={IMAGES.gym} title="Admin control centre." subtitle="Manage users, content, reports and support in one secure place." points={["User and content management","Platform-wide analytics","Support and feedback inbox"]}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mb-1 border border-red-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Portal</h2>
          <p className="text-xs text-slate-400">
            Authorized administrative personnel only. System operations monitored.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Admin Fill */}
        <div className="p-3 rounded-xl bg-slate-950 border border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-red-400" />
            <div>
              <p className="font-semibold text-white">Pre-Loaded Admin Credentials</p>
              <p className="text-[11px] text-slate-400">admin@fitpulse.com / adminpassword123</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoAdminFill}
            className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition border border-red-500/30"
          >
            Auto-Fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="admin@fitpulse.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold hover:brightness-110 transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Authenticate as Administrator'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
          Not an administrator?{' '}
          <Link to="/login" className="text-brand-400 hover:underline">
            Go to User Login
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}
