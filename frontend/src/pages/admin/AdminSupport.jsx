import React, { useState, useEffect } from 'react';
import { LifeBuoy, Send, User } from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, toDate } from '../../utils/normalize';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <LifeBuoy className="w-6 h-6 text-red-400" />
          <span>Support Tickets & Helpdesk Queue</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review, answer, and resolve technical issues and inquiries submitted by users.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              statusFilter === s
                ? 'bg-red-500 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          No support tickets found for this status.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div
              key={t._id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 text-slate-300 border border-slate-800">
                      {t.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Priority: {t.priority}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{t.subject}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    <span>From: {t.user?.name || 'Athlete'} ({t.user?.email})</span>
                  </p>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-red-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Message thread */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {toArray(t.messages).map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs ${
                      msg.sender === 'support'
                        ? 'bg-red-950/20 border border-red-500/30 text-red-200'
                        : 'bg-slate-950 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <strong className="capitalize">{msg.sender === 'support' ? 'You (Support Admin)' : t.user?.name || 'User'}</strong>
                      <span>{toDate(msg.timestamp) ? toDate(msg.timestamp).toLocaleString() : ''}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Admin reply input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Type official response as Administrator..."
                  value={replyText[t._id] || ''}
                  disabled={sendingId === t._id}
                  onChange={(e) => setReplyText({ ...replyText, [t._id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendReply(t._id);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={sendingId === t._id || !(replyText[t._id] || '').trim()}
                  onClick={() => handleSendReply(t._id)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingId === t._id ? 'Sending...' : 'Reply'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
