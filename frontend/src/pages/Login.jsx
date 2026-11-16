import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { LogoMark } from '../components/ui/Logo';
import { motion } from 'framer-motion';
import AuthShell from '../components/ui/AuthShell';
import { IMAGES } from '../data/images';
import { getErrorMessage } from '../utils/normalize';

export default function Login() {
  const { login } = useAuth();
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
      navigate(data.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid username/email or password'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmailOrUsername('demo@fitpulse.com');
    setPassword('password123');
  };

  return (
    <AuthShell image={IMAGES.auth} title="Welcome back, champion." subtitle="Pick up exactly where you left off - your workouts, meals and progress are waiting." points={["Log workouts in seconds","Macro and calorie tracking","Beautiful progress analytics"]}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center space-y-2 mb-8">
          <LogoMark size={44} className="mx-auto mb-3 text-white" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your workout metrics and nutrition logs.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Account Quick-Fill Card */}
        <div className="mb-6 p-3 rounded-xl bg-slate-950 border border-brand-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <div>
              <p className="font-semibold text-white">Pre-Loaded Demo Data</p>
              <p className="text-[11px] text-slate-400">demo@fitpulse.com / password123</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-2.5 py-1 rounded bg-brand-500/20 text-brand-400 text-xs font-bold hover:bg-brand-500/30 transition border border-brand-500/30"
          >
            Auto-Fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="demo@fitpulse.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Signing In...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span>
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 font-semibold hover:underline">
                Register Here
              </Link>
            </span>
            <span className="text-slate-700">|</span>
            <Link to="/forgot-password" className="text-slate-400 hover:text-brand-400 transition">
              Forgot Password?
            </Link>
          </div>
        </div>
      </motion.div>
    </AuthShell>
  );
}
