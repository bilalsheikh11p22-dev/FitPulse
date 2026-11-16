import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import api from '../../api/api';
import { toArray, toNumber, getErrorMessage, fmtDate } from '../../utils/normalize';
import Avatar from '../../components/ui/Avatar';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/feedback');
        setFeedbacks(toArray(res.data));
        setError('');
      } catch (err) {
        setFeedbacks([]);
        setError(getErrorMessage(err, 'Could not load feedback.'));
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const avgRating = feedbacks.length > 0 
    ? (() => {
        const sum = feedbacks.reduce((acc, f) => acc + toNumber(f.rating, 0), 0);
        const avg = sum / feedbacks.length;
        return Number.isFinite(avg) ? avg.toFixed(1) : null;
      })()
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>User Feedback & App Store Reviews</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit user sentiment, star ratings, and improvement suggestions.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
          <span className="text-slate-400">Average Platform Rating:</span>
          <span className="text-lg font-black text-amber-400">{avgRating ? `${avgRating} / 5.0 ★` : 'No ratings yet'}</span>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Feedback Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading reviews...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          No feedback submitted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbacks.map((f) => (
            <div
              key={f._id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {Array.from({ length: Math.max(0, Math.min(5, toNumber(f.rating))) }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {fmtDate(f.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{f.comments}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <Avatar src={f.user?.avatar} name={f.user?.name} size={24} rounded="rounded-full" />
                  <span className="font-semibold text-white">{f.user?.name || 'User'}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {f.category?.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
