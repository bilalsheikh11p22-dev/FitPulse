import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { LogoMark } from '../components/ui/Logo';
import { motion } from 'framer-motion';
import AuthShell from '../components/ui/AuthShell';
import { IMAGES } from '../data/images';
import api from '../api/api';
import { getErrorMessage } from '../utils/normalize';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token || !email) {
      setError('Invalid or missing reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, email, password });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reset your password. The link may have expired.'));
    } finally {
      setLoading(false);
    }
  };

  const isInvalidLink = !token || !email;

  return (
    <AuthShell
      image={IMAGES.auth}
      title="Set a new password."
      subtitle="Choose a strong password you haven't used before."
      points={['Single-use reset link', 'Secure token verification', 'Minimum 6 characters']}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center space-y-2 mb-8">
          <LogoMark size={44} className="mx-auto mb-3 text-white" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-400">
            {isInvalidLink
              ? 'This reset link appears to be invalid.'
              : `Resetting password for ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto" />
              <p className="font-semibold">Password updated!</p>
              <p className="text-xs text-emerald-300/80">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 text-sm"
            >
              Go to Sign In
            </Link>
          </div>
        ) : isInvalidLink ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm text-center space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <p className="font-semibold">Invalid reset link</p>
              <p className="text-xs text-amber-300/80">
                This link is missing required parameters. Please request a fresh password reset link.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 text-sm"
            >
              Request New Reset Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password match hint */}
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Passwords do not match
              </p>
            )}
            {confirmPassword && password === confirmPassword && password.length >= 6 && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords match
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Updating Password...</span>
              ) : (
                <span>Set New Password</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-400">
          <Link to="/login" className="text-brand-400 font-semibold hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}
