import React, { useState, useEffect } from 'react';
import { Scale, Trash2 } from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, fmtDate } from '../../utils/normalize';
import { PageHeader, Card, Alert, Spinner, EmptyState, DataTable, tdCls, iconBtn } from '../../components/admin/ui';

export default function AdminProgress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/progress');
      setLogs(toArray(res.data));
      setError('');
    } catch (err) {
      setLogs([]);
      setError(getErrorMessage(err, 'Could not load progress records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this progress check-in?')) return;
    try {
      await api.delete(`/admin/progress/${id}`);
      setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      window.alert(getErrorMessage(err, 'Failed to delete progress record.'));
    }
  };

  const kg = (v) => (v ? `${v} kg` : '—');

  return (
    <div>
      <PageHeader
        icon={Scale}
        title="Progress"
        description="Weight, body measurements and personal-record check-ins from all users."
      />

      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}

        <Card padded={false} title={loading ? 'Check-ins' : `Check-ins (${logs.length})`} icon={Scale}>
          {loading ? (
            <Spinner label="Loading progress records…" />
          ) : logs.length === 0 ? (
            <EmptyState icon={Scale} title="No progress entries yet" description="Check-ins will appear here as users log them." />
          ) : (
            <DataTable
              columns={[
                { label: 'Athlete' },
                { label: 'Date' },
                { label: 'Weight' },
                { label: 'Waist' },
                { label: 'Bench' },
                { label: 'Squat' },
                { label: 'Deadlift' },
                { label: 'Notes' },
                { label: '', align: 'right' },
              ]}
            >
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className={tdCls}>
                    <p className="font-medium text-white">{log.user?.name || 'Athlete'}</p>
                    <p className="text-xs text-slate-500">@{log.user?.username}</p>
                  </td>
                  <td className={`${tdCls} text-slate-400 whitespace-nowrap`}>{fmtDate(log.date)}</td>
                  <td className={`${tdCls} text-white font-semibold tabular-nums whitespace-nowrap`}>{log.weight} kg</td>
                  <td className={`${tdCls} text-slate-300 tabular-nums whitespace-nowrap`}>
                    {log.bodyMeasurements?.waist ? `${log.bodyMeasurements.waist} cm` : '—'}
                  </td>
                  <td className={`${tdCls} text-slate-300 tabular-nums whitespace-nowrap`}>{kg(log.performanceMetrics?.benchPressMax)}</td>
                  <td className={`${tdCls} text-slate-300 tabular-nums whitespace-nowrap`}>{kg(log.performanceMetrics?.squatMax)}</td>
                  <td className={`${tdCls} text-slate-300 tabular-nums whitespace-nowrap`}>{kg(log.performanceMetrics?.deadliftMax)}</td>
                  <td className={`${tdCls} text-slate-400 max-w-[220px] truncate`} title={log.notes || ''}>{log.notes || '—'}</td>
                  <td className={`${tdCls} text-right`}>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className={`${iconBtn} hover:!text-red-400 hover:!bg-red-500/10`}
                      title="Delete check-in"
                      aria-label="Delete check-in"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>
      </div>
    </div>
  );
}
