import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon, Film, UploadCloud, Link2, RotateCcw, CheckCircle2, AlertCircle, Loader2, ExternalLink, X,
} from 'lucide-react';
import api from '../../api/api';
import Reveal from '../../components/ui/Reveal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import useFlash from '../../utils/useFlash';
import { getErrorMessage } from '../../utils/normalize';
import { useMediaAdmin, resolveMediaUrl } from '../../context/MediaContext';
import { IMAGES } from '../../data/images';

const fmtSize = (bytes) => {
  if (!bytes) return '';
  return bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

// The built-in default for a slot key ('avatars.marcus' -> IMAGES.avatars.marcus)
const defaultFor = (key) => (key.startsWith('avatars.') ? IMAGES.avatars[key.slice(8)] : IMAGES[key]);

function SlotCard({ slot, onSaved, onError, limits }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState('');

  const isVideo = slot.type === 'video';
  const current = slot.current;
  const previewUrl = resolveMediaUrl(current?.url) || defaultFor(slot.key);
  const maxMB = isVideo ? limits.videoMB : limits.imageMB;

  const send = async (body, isFile) => {
    setBusy(true);
    setProgress(0);
    try {
      const res = await api.put(`/admin/media/${slot.key}`, body, {
        headers: isFile ? { 'Content-Type': 'multipart/form-data' } : undefined,
        onUploadProgress: (e) => e.total && setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      onSaved(slot, res.data.current, 'updated');
      setLinkOpen(false);
      setLink('');
    } catch (err) {
      onError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      onError(`"${file.name}" is ${fmtSize(file.size)}. The limit for this slot is ${maxMB} MB.`);
      e.target.value = '';
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    send(fd, true);
  };

  const onLink = (e) => {
    e.preventDefault();
    if (link.trim()) send({ url: link.trim() }, false);
  };

  const onReset = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/media/${slot.key}`);
      onSaved(slot, null, 'reset');
    } catch (err) {
      onError(getErrorMessage(err, 'Could not reset this item.'));
    } finally {
      setBusy(false);
    }
  };

  const badge = !current
    ? { text: 'Default', cls: 'bg-slate-800 text-slate-300 border-slate-700' }
    : current.source === 'upload'
      ? { text: 'Custom upload', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
      : { text: 'External link', cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      <div className={`relative bg-slate-950 ${isVideo ? 'aspect-video' : 'aspect-[16/10]'}`}>
        {isVideo ? (
          <video key={previewUrl} src={previewUrl} muted loop playsInline autoPlay controls={false} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <img src={previewUrl} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur ${badge.cls}`}>{badge.text}</span>
        {busy && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-[#fff]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-semibold">{progress > 0 && progress < 100 ? `Uploading ${progress}%` : 'Working...'}</span>
            {progress > 0 && (
              <div className="w-40 h-1.5 rounded-full bg-[#fff]/15 overflow-hidden">
                <div className="h-full bg-brand-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-2">
          {isVideo ? <Film className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" /> : <ImageIcon className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white leading-snug">{slot.label}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Used on: {slot.usedOn}</p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">{slot.hint} Max {maxMB} MB.</p>
        {current && (
          <p className="mt-2 text-[11px] text-slate-400 truncate">
            {current.source === 'upload' ? `${current.originalName || 'file'}${current.size ? ` - ${fmtSize(current.size)}` : ''}` : current.url}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            hidden
            accept={isVideo ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/gif,image/avif'}
            onChange={onFile}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-[#fff] text-xs font-bold transition disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" /> {current ? 'Replace' : 'Upload'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setLinkOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800/70 text-xs font-semibold transition disabled:opacity-50"
          >
            <Link2 className="w-3.5 h-3.5" /> Use link
          </button>
          {current && (
            <button
              type="button"
              disabled={busy}
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-semibold transition disabled:opacity-50"
              title="Remove the custom file and go back to the default"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {linkOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={onLink}
            className="mt-3 flex gap-2"
          >
            <input
              type="url"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={isVideo ? 'https://.../video.mp4' : 'https://.../photo.jpg'}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
            />
            <button type="submit" disabled={busy} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition disabled:opacity-50">Save</button>
          </motion.form>
        )}
      </div>
    </div>
  );
}

export default function AdminMedia() {
  const { refresh } = useMediaAdmin();
  const [slots, setSlots] = useState([]);
  const [limits, setLimits] = useState({ imageMB: 8, videoMB: 60 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, flash] = useFlash(4000);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/media');
      setSlots(res.data.slots || []);
      if (res.data.limits) setLimits(res.data.limits);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load site media.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = (slot, current, kind) => {
    setSlots((prev) => prev.map((s) => (s.key === slot.key ? { ...s, current } : s)));
    setError('');
    flash(kind === 'reset' ? `"${slot.label}" restored to the default.` : `"${slot.label}" updated - the website now shows it.`);
    refresh(); // push the change to the public site immediately
  };

  const groups = slots.reduce((acc, s) => {
    (acc[s.group] = acc[s.group] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
      <AdminPageHeader
        icon={ImageIcon}
        title="Site Media"
        subtitle="Pictures and the hero video shown on the public website. Upload a file or paste a link and the site updates instantly - no code changes needed. Reset brings back the built-in default."
      >
        <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-100 text-xs font-bold transition">
          View website <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </AdminPageHeader>

      {limits.videoMB <= 5 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed">
          Uploads are limited to {limits.videoMB} MB on this hosting. For a larger hero video, upload it to any video host or storage and use <strong>Use link</strong> - links have no size limit.
        </div>
      )}

      <div aria-live="polite" className="space-y-3">
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
          </div>
        )}
        {error && (
          <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        Object.entries(groups).map(([group, items]) => (
          <section key={group}>
            <Reveal>
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400 mb-4">{group}</h2>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((slot, i) => (
                <Reveal key={slot.key} delay={(i % 3) * 0.08} className={`h-full ${slot.type === 'video' ? 'sm:col-span-2' : ''}`}>
                  <SlotCard slot={slot} limits={limits} onSaved={handleSaved} onError={setError} />
                </Reveal>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
