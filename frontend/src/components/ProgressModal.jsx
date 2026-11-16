import React, { useState } from 'react';
import { getErrorMessage } from '../utils/normalize';
import { X, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MEASURES = ['chest', 'waist', 'hips', 'arms', 'thighs'];
const METRICS = ['runningTime5k', 'benchPressMax', 'squatMax', 'deadliftMax', 'pullUpsCount'];

// '' (left blank) is 0; anything else must be a finite number >= 0
const blankOrNumber = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v));

const validateProgress = (f) => {
  const w = Number(f.weight);
  if (f.weight === '' || !Number.isFinite(w) || w < 20 || w > 500) return 'Enter a valid body weight between 20 and 500 kg.';
  for (const k of MEASURES) {
    const n = blankOrNumber(f.bodyMeasurements[k]);
    if (!Number.isFinite(n) || n < 0) return 'Body measurements must be 0 or more.';
  }
  for (const k of METRICS) {
    const n = blankOrNumber(f.performanceMetrics[k]);
    if (!Number.isFinite(n) || n < 0) return 'Performance records must be 0 or more.';
  }
  return null;
};

const buildProgressPayload = (f) => ({
  weight: Number(f.weight),
  bodyMeasurements: Object.fromEntries(MEASURES.map((k) => [k, blankOrNumber(f.bodyMeasurements[k])])),
  performanceMetrics: Object.fromEntries(METRICS.map((k) => [k, blankOrNumber(f.performanceMetrics[k])])),
  notes: f.notes || '',
});

export default function ProgressModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;
  return <ProgressModalForm onClose={onClose} onSave={onSave} />;
}

function ProgressModalForm({ onClose, onSave }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    weight: user?.weight ?? '',
    bodyMeasurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' },
    performanceMetrics: { runningTime5k: '', benchPressMax: '', squatMax: '', deadliftMax: '', pullUpsCount: '' },
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const problem = validateProgress(formData);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(buildProgressPayload(formData));
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Record Check-in & Metrics</h3>
            <p className="text-xs text-slate-400">
              Update body weight, circumference measurements, and personal strength records.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cyan-400 mb-1">
              Current Body Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Body Circumference Measurements (cm)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['chest', 'waist', 'hips', 'arms', 'thighs'].map((part) => (
                <div key={part}>
                  <label className="block text-[11px] capitalize text-slate-400 mb-1">{part}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.bodyMeasurements[part]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bodyMeasurements: {
                          ...formData.bodyMeasurements,
                          [part]: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Performance Records (1RM / Times)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">5K Run (mins)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.performanceMetrics.runningTime5k}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      performanceMetrics: {
                        ...formData.performanceMetrics,
                        runningTime5k: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bench Press (kg)</label>
                <input
                  type="number"
                  value={formData.performanceMetrics.benchPressMax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      performanceMetrics: {
                        ...formData.performanceMetrics,
                        benchPressMax: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Squat Max (kg)</label>
                <input
                  type="number"
                  value={formData.performanceMetrics.squatMax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      performanceMetrics: {
                        ...formData.performanceMetrics,
                        squatMax: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Deadlift Max (kg)</label>
                <input
                  type="number"
                  value={formData.performanceMetrics.deadliftMax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      performanceMetrics: {
                        ...formData.performanceMetrics,
                        deadliftMax: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Max Pull-Ups</label>
                <input
                  type="number"
                  value={formData.performanceMetrics.pullUpsCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      performanceMetrics: {
                        ...formData.performanceMetrics,
                        pullUpsCount: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Physique Observation / Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Waist feeling leaner, muscles full and recovered"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {error && (
            <p role="alert" className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/25 disabled:opacity-60"
            >
              Save Check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
