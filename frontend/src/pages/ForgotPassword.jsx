import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { LogoMark } from '../components/ui/Logo';
import { motion } from 'framer-motion';
import AuthShell from '../components/ui/AuthShell';
import { IMAGES } from '../data/images';
import api from '../api/api';
import { getErrorMessage } from '../utils/normalize';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not process your request. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      image={IMAGES.auth}
      title="Reset your access."
      subtitle="Enter your registered email and we'll send you a secure link to set a new password."
      points={['Single-use, time-limited link', 'No password sent in email', 'Secure token hashing']}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center space-y-2 mb-8">
          <LogoMark size={44} className="mx-auto mb-3 text-white" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h2>
          <p className="text-xs text-slate-400">
            We'll email you a secure reset link valid for 1 hour.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto" />
              <p className="font-semibold">Check your inbox!</p>
              <p className="text-xs text-emerald-300/80">
                If <strong>{email}</strong> is registered, a password reset link has been sent.
                Check your spam folder if you don't see it within a few minutes.
              </p>
            </div>
            <p className="text-center text-xs text-slate-500">
              In development mode, the reset link is logged in the backend console.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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
                <span className="animate-pulse">Sending Reset Link...</span>
              ) : (
                <span>Send Reset Link</span>
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
