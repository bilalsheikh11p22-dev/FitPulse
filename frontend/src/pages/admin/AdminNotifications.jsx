import React, { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import api from '../../api/api';
import { getErrorMessage } from '../../utils/normalize';
import { PageHeader, Card, Alert, Field, inputCls, btnPrimary } from '../../components/admin/ui';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('system');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await api.post('/admin/notifications/broadcast', {
        title,
        message,
        type,
      });
      setSuccess(res.data.message || 'Announcement broadcasted successfully!');
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send the broadcast.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon={Megaphone}
        title="Broadcast"
        description="Send an announcement, maintenance notice or motivation message to every active user's notification centre."
      />

      <div className="max-w-3xl space-y-4">
        {success && <Alert tone="success">{success}</Alert>}
        {error && <Alert>{error}</Alert>}

        <Card title="New announcement">
          <form onSubmit={handleBroadcast} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Headline *">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled maintenance on Sunday"
                  className={inputCls}
                />
              </Field>

              <Field label="Category">
                <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                  <option value="system">System announcement</option>
                  <option value="reminder">Training reminder</option>
                  <option value="goal_achievement">Community motivation</option>
                </select>
              </Field>
            </div>

            <Field label="Message *" hint="Delivered to every active user's notification centre.">
              <textarea
                rows="5"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the message users will see…"
                className={inputCls}
              />
            </Field>

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={loading} className={btnPrimary}>
                <Send className="w-4 h-4" />
                {loading ? 'Sending…' : 'Send to all active users'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
