import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { LogoMark } from '../components/ui/Logo';
import { motion } from 'framer-motion';
import AuthShell from '../components/ui/AuthShell';
import { IMAGES } from '../data/images';
import api from '../api/api';
import { getErrorMessage } from '../utils/normalize';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const hasCalled = useRef(false);

  useEffect(() => {
    // Guard: only call once even in React Strict Mode double-invoke
    if (hasCalled.current) return;
    hasCalled.current = true;

    if (!token || !email) {
      setStatus('error');
      setErrorMsg('Invalid verification link — missing token or email parameter.');
      return;
    }

    const verify = async () => {
      try {
        await api.get('/auth/verify-email', { params: { token, email } });
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMsg(getErrorMessage(err, 'Email verification failed. The link may have expired or already been used.'));
      }
    };

    verify();
  }, [token, email]);

  const handleResend = async () => {
    setResendError('');
    setResendSuccess(false);
    setResending(true);
    try {
      await api.post('/auth/resend-verification');
      setResendSuccess(true);
    } catch (err) {
      setResendError(getErrorMessage(err, 'Could not resend verification email. Please try again later.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      image={IMAGES.auth}
      title="Verify your email."
      subtitle="One click to confirm your identity and unlock your FitPulse account."
      points={['Secure token verification', '24-hour link validity', 'One-time use link']}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center space-y-2 mb-8">
          <LogoMark size={44} className="mx-auto mb-3 text-white" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Email Verification</h2>
          {email && (
            <p className="text-xs text-slate-400 truncate">
              Verifying <span className="text-slate-200 font-medium">{email}</span>
            </p>
          )}
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
            <p className="text-sm text-slate-400">Verifying your email address…</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="space-y-5">
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto" />
              <p className="font-semibold text-base">Your email is verified!</p>
              <p className="text-xs text-emerald-300/80">
                Your account is now fully activated. You can access all FitPulse features.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-400 text-slate-950 font-bold hover:brightness-110 transition shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 text-sm"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <p className="font-semibold">Verification failed</p>
              <p className="text-xs text-red-300/80">{errorMsg}</p>
            </div>

            {/* Resend section — only useful if logged in */}
            <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4 space-y-3">
              <p className="text-xs text-slate-400 text-center">
                If you're signed in, you can request a fresh verification email.
              </p>

              {resendSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                  Verification email sent! Check your inbox (or backend console in dev mode).
                </div>
              )}

              {resendError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
                  {resendError}
                </div>
              )}

              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendSuccess}
                className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> Resend Verification Email</>
                )}
              </button>

              <Link
                to="/forgot-password"
                className="block text-center text-xs text-brand-400 hover:underline"
              >
                Need to reset your password instead?
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-400">
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            Back to Sign In
          </Link>
          {' · '}
          <Link to="/dashboard" className="text-slate-500 hover:text-slate-300 transition">
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}
