import React, { useState, useEffect } from 'react';
import { LifeBuoy, Send, User } from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, toDate } from '../../utils/normalize';
import {
  PageHeader,
  Card,
  Badge,
  Alert,
  Spinner,
  EmptyState,
  FilterTabs,
  inputCls,
  btnPrimary,
} from '../../components/admin/ui';

const STATUS_TONE = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'neutral' };
const PRIORITY_TONE = { high: 'danger', urgent: 'danger', medium: 'warning', low: 'neutral' };

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyText, setReplyText] = useState({});
  const [sendingId, setSendingId] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/admin/tickets', { params });
      setTickets(toArray(res.data));
      setError('');
    } catch (err) {
      setTickets([]);
      setError(getErrorMessage(err, 'Could not load tickets.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.put(`/admin/tickets/${id}`, { status: newStatus });
      setTickets((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSendReply = async (id) => {
    const text = (replyText[id] || '').trim();
    if (!text) return;

    try {
      setSendingId(id);
      const res = await api.put(`/admin/tickets/${id}`, {
        replyMessage: text,
        status: 'in_progress',
      });
      setTickets((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      setReplyText((prev) => ({ ...prev, [id]: '' }));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        icon={LifeBuoy}
        title="Support tickets"
        description="Read, answer and resolve the issues and questions users send in."
      />

      <div className="space-y-4">
        <FilterTabs
          options={[
            { value: 'all', label: 'All' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        {error && <Alert>{error}</Alert>}

        {loading ? (
          <Spinner label="Loading tickets…" />
        ) : tickets.length === 0 ? (
          <Card>
            <EmptyState icon={LifeBuoy} title="No tickets here" description="There are no support tickets with this status." />
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <article key={t._id} className="rounded-xl bg-slate-900 border border-slate-800">
                <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge tone={STATUS_TONE[t.status] || 'neutral'} className="capitalize">
                        {String(t.status).replace('_', ' ')}
                      </Badge>
                      <Badge tone="neutral" className="capitalize">{t.category}</Badge>
                      <Badge tone={PRIORITY_TONE[String(t.priority).toLowerCase()] || 'neutral'} className="capitalize">
                        {t.priority} priority
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-white">{t.subject}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">
                        {t.user?.name || 'Athlete'} <span className="text-slate-500">{t.user?.email}</span>
                      </span>
                    </p>
                  </div>

                  <label className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-slate-400">Status</span>
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t._id, e.target.value)}
                      className={`${inputCls} !w-auto !py-2`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </label>
                </div>

                {/* Conversation */}
                <div className="px-5 pb-5 space-y-3">
                  {toArray(t.messages).map((msg, i) => {
                    const fromSupport = msg.sender === 'support';
                    return (
                      <div key={i} className={`flex ${fromSupport ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                            fromSupport
                              ? 'bg-brand-500/10 border border-brand-500/25 text-slate-100'
                              : 'bg-slate-950 border border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-xs text-slate-400 mb-1">
                            <strong className="font-medium text-slate-300">
                              {fromSupport ? 'You (Support)' : t.user?.name || 'User'}
                            </strong>
                            <span>{toDate(msg.timestamp) ? toDate(msg.timestamp).toLocaleString() : ''}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply */}
                <div className="px-5 py-4 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a reply to the user…"
                    aria-label="Reply message"
                    value={replyText[t._id] || ''}
                    disabled={sendingId === t._id}
                    onChange={(e) => setReplyText({ ...replyText, [t._id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendReply(t._id);
                      }
                    }}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    disabled={sendingId === t._id || !(replyText[t._id] || '').trim()}
                    onClick={() => handleSendReply(t._id)}
                    className={btnPrimary}
                  >
                    <Send className="w-4 h-4" />
                    {sendingId === t._id ? 'Sending…' : 'Reply'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
