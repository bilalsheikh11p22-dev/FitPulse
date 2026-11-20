import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import api from '../../api/api';
import { toArray, toNumber, getErrorMessage, fmtDate } from '../../utils/normalize';
import Avatar from '../../components/ui/Avatar';
import { PageHeader, Card, Badge, Alert, Spinner, EmptyState } from '../../components/admin/ui';

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

  const avgRating =
    feedbacks.length > 0
      ? (() => {
          const sum = feedbacks.reduce((acc, f) => acc + toNumber(f.rating, 0), 0);
          const avg = sum / feedbacks.length;
          return Number.isFinite(avg) ? avg.toFixed(1) : null;
        })()
      : null;

  return (
    <div>
      <PageHeader
        icon={Star}
        title="Feedback"
        description="Ratings and comments users have left about FitPulse."
        actions={
          <div className="flex items-center gap-3 rounded-lg bg-slate-900 border border-slate-800 px-4 py-2">
            <span className="text-sm text-slate-400">Average rating</span>
            <span className="text-lg font-bold text-white tabular-nums">
              {avgRating ? (
                <>
                  {avgRating}
                  <span className="text-sm font-medium text-slate-500"> / 5</span>
                </>
              ) : (
                '—'
              )}
            </span>
            {avgRating && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
          </div>
        }
      />

      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}

        {loading ? (
          <Spinner label="Loading reviews…" />
        ) : feedbacks.length === 0 ? (
          <Card>
            <EmptyState icon={Star} title="No feedback yet" description="Reviews will appear here once users submit them." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {feedbacks.map((f) => {
              const rating = Math.max(0, Math.min(5, toNumber(f.rating)));
              return (
                <article key={f._id} className="rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base tracking-tight" aria-label={`${rating} out of 5 stars`}>
                        <span className="text-amber-400">{'★'.repeat(rating)}</span>
                        <span className="text-slate-700">{'★'.repeat(5 - rating)}</span>
                      </span>
                      <span className="text-xs text-slate-500">{fmtDate(f.createdAt)}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300 leading-relaxed">{f.comments}</p>
                  </div>
                  <div className="px-5 py-3.5 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar src={f.user?.avatar} name={f.user?.name} size={28} rounded="rounded-full" />
                      <span className="text-sm font-medium text-white truncate">{f.user?.name || 'User'}</span>
                    </div>
                    {f.category && (
                      <Badge tone="neutral" className="capitalize shrink-0">
                        {f.category.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
