import { InlineLoader } from '../components/ui/Loader';
import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Send, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  LifeBuoy, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import api from '../api/api';
import { toArray, getErrorMessage, fmtDate, toDate } from '../utils/normalize';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'feedback', 'faq'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New ticket form
  const [ticketData, setTicketData] = useState({
    subject: '',
    category: 'bug',
    priority: 'medium',
    message: '',
  });

  // Reply state
  const [replyText, setReplyText] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  // Feedback form
  const [rating, setRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('general');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // FAQ open item
  const [openFaq, setOpenFaq] = useState(null);

  const normalizeTickets = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.tickets)) return data.tickets;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.tickets)) return data.data.tickets;
    return [];
  };

  const normalizeFeedback = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.feedback)) return data.feedback;
    if (Array.isArray(data?.feedbacks)) return data.feedbacks;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.feedback)) return data.data.feedback;
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, feedbackRes] = await Promise.all([
        api.get('/support/tickets'),
        api.get('/support/feedback'),
      ]);
      // Defensive array normalization guarantees tickets & feedback are always valid arrays,
      // preventing "tickets.filter is not a function" and ensuring .filter/.map/.length are safe.
      setTickets(normalizeTickets(ticketsRes?.data));
      setFeedbacks(normalizeFeedback(feedbackRes?.data));
      setError('');
    } catch (err) {
      setTickets([]);
      setFeedbacks([]);
      setError(getErrorMessage(err, 'Could not load your support data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketData.subject.trim() || !ticketData.message.trim()) {
      setError('Please provide both subject and message description.');
      return;
    }
    setSubmitting(true);
    setTicketSuccess('');
    setError('');
    try {
      const res = await api.post('/support/tickets', {
        ...ticketData,
        subject: ticketData.subject.trim(),
        message: ticketData.message.trim(),
      });
      setTickets((prev) => [res.data, ...(Array.isArray(prev) ? prev : [])]);
      setTicketData({ subject: '', category: 'bug', priority: 'medium', message: '' });
      setTicketSuccess('Your ticket was sent. Our team will reply here.');
      setTimeout(() => setTicketSuccess(''), 5000);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send your ticket.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyTicket = async (ticketId) => {
    const text = (replyText[ticketId] || '').trim();
    if (!text) return;

    try {
      setReplyingId(ticketId);
      setError('');
      const res = await api.post(`/support/tickets/${ticketId}/reply`, { message: text });
      setTickets((prev) => (Array.isArray(prev) ? prev.map((t) => (t._id === ticketId ? res.data : t)) : [res.data]));
      setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send your reply.'));
    } finally {
      setReplyingId(null);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackComments.trim()) {
      setError('Feedback comments cannot be empty.');
      return;
    }
    setFeedbackSubmitting(true);
    setError('');
    try {
      const res = await api.post('/support/feedback', {
        rating: Number(rating),
        category: feedbackCategory,
        comments: feedbackComments.trim(),
      });
      setFeedbacks((prev) => [res.data, ...(Array.isArray(prev) ? prev : [])]);
      setFeedbackSuccess(true);
      setFeedbackComments('');
      setTimeout(() => setFeedbackSuccess(false), 4000);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not submit your feedback.'));
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How does progressive overload tracking work in FitPulse?',
      a: 'When you log a workout routine, you can record exact weights and reps for every exercise. Over time, the Analytics module plots your 1RM progression and volume load automatically.',
    },
    {
      q: 'Can I export my fitness and nutrition records for my doctor or coach?',
      a: 'Yes! Head to the Reports module, where you can generate formatted clinical PDF reports or export full CSV spreadsheets readable in Excel and Google Sheets.',
    },
    {
      q: 'How are daily calories and macronutrients calculated?',
      a: 'Protein and Carbohydrates yield approximately 4 calories per gram, while Dietary Fats yield 9 calories per gram. FitPulse sums your logged quantities against your personalized goals.',
    },
    {
      q: 'Is my data secure and private?',
      a: 'Yes, FitPulse hashes all passwords via bcrypt, authenticates sessions via signed JWT tokens, and provides full GDPR-compliant data export in the Settings tab.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <LifeBuoy className="w-6 h-6 text-brand-400" />
          <span>Support Desk, FAQs & User Feedback</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Open technical support inquiries, submit app ratings, and view frequently asked questions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'tickets'
              ? 'bg-brand-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Support Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'feedback'
              ? 'bg-brand-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Share Feedback & Reviews
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'faq'
              ? 'bg-brand-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Frequently Asked Questions
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Tab 1: Support Tickets */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Ticket Form */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <span>Submit New Support Inquiry</span>
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue syncing workouts or UI layout"
                  value={ticketData.subject}
                  onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={ticketData.category}
                    onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="bug">Bug Report</option>
                    <option value="account">Account Access</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="workout_sync">Workout Syncing</option>
                    <option value="other">General Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={ticketData.priority}
                    onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Urgency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Message Description *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Please describe what happened in detail..."
                  value={ticketData.message}
                  onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              {ticketSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{ticketSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs hover:bg-brand-400 transition disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Ticket'}
              </button>
            </form>
          </div>

          {/* Ticket Threads */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white">Your Support Conversations</h3>

            {loading ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800">
                <InlineLoader label="Loading your tickets" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-6 rounded-2xl bg-slate-900 border border-slate-800">
                You have no active support tickets.
              </p>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 text-slate-300 border border-slate-800">
                          {ticket.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ticket.status === 'resolved' || ticket.status === 'closed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {String(ticket.status || '').replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{ticket.subject}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {fmtDate(ticket.createdAt)}
                    </span>
                  </div>

                  {/* Messages Bubble thread */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    {toArray(ticket.messages).map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl text-xs ${
                          msg.sender === 'support'
                            ? 'bg-brand-950/40 border border-brand-500/30 text-brand-200'
                            : 'bg-slate-950 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <strong className="capitalize">{msg.sender === 'support' ? 'FitPulse Support Agent' : 'You'}</strong>
                          <span>{toDate(msg.timestamp) ? toDate(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  {ticket.status === 'closed' ? (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500 italic">
                      This ticket is closed and cannot receive replies.
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Type a follow-up reply..."
                        value={replyText[ticket._id] || ''}
                        disabled={replyingId === ticket._id}
                        onChange={(e) =>
                          setReplyText({ ...replyText, [ticket._id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleReplyTicket(ticket._id);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        disabled={replyingId === ticket._id || !(replyText[ticket._id] || '').trim()}
                        onClick={() => handleReplyTicket(ticket._id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-400 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Feedback & Reviews */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Leave Your Experience Rating</span>
            </h3>

            {feedbackSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! Your feedback has been recorded.</span>
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Overall App Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition ${
                        star <= rating ? 'text-amber-400 scale-110' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2">({rating} of 5 Stars)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  <option value="ui_design">UI & Scroll Animation Experience</option>
                  <option value="features">Workout & Macro Features</option>
                  <option value="performance">Speed & System Performance</option>
                  <option value="general">General Satisfaction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Thoughts & Suggestions *
                </label>
                <textarea
                  rows="4"
                  required
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  placeholder="Tell us what you like or how we can improve your training workflow..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={feedbackSubmitting}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition disabled:opacity-60"
              >
                {feedbackSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Community Ratings & Reviews</h3>
            {loading && (
              <div className="rounded-2xl bg-slate-900 border border-slate-800">
                <InlineLoader label="Loading feedback" />
              </div>
            )}
            {!loading && feedbacks.length === 0 && (
              <p className="text-xs text-slate-400 italic p-4 rounded-2xl bg-slate-900 border border-slate-800">
                You haven't submitted any feedback yet.
              </p>
            )}
            {feedbacks.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    {Array.from({ length: Math.max(0, Math.min(5, Number(item.rating) || 0)) }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {fmtDate(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">"{item.comments}"</p>
                <span className="inline-block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Category: {String(item.category || 'general').replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: FAQ Accordion */}
      {activeTab === 'faq' && (
        <div className="max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-brand-400 transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-brand-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
