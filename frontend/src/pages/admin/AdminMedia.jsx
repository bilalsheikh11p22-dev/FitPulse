import React, { useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import api from '../../api/api';
import { getErrorMessage, fmtDate } from '../../utils/normalize';
import { useSiteMedia } from '../../context/SiteMediaContext';
import { MEDIA_GROUPS, MAX_UPLOAD_MB } from '../../data/mediaSlots';
import { UploadIcon, LinkIcon, FilmIcon, PictureIcon, UndoIcon } from '../../components/admin/icons';
import { PageHeader, Badge, Alert, inputCls, btnPrimary, btnSecondary } from '../../components/admin/ui';

const MAX_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const fmtSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

function Preview({ slot, src }) {
  const [failed, setFailed] = useState(false);
  const Icon = slot.kind === 'video' ? FilmIcon : PictureIcon;

  const placeholder = (text) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 text-sm px-6 text-center">
      <Icon className="w-7 h-7" />
      {text}
    </div>
  );

  let body;
  if (!src) body = placeholder('No video set. The home page shows the poster image instead.');
  else if (failed) body = placeholder('This file could not be loaded. Check the link or upload again.');
  else if (slot.kind === 'video') {
    body = (
      <video
        key={src}
        src={src}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      />
    );
  } else {
    body = (
      <img
        key={src}
        src={src}
        alt={slot.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return <div className={`relative w-full ${slot.aspect} bg-slate-950 overflow-hidden`}>{body}</div>;
}

function SlotCard({ slot, onNotice }) {
  const { getItem, getUrl, refresh } = useSiteMedia();
  const item = getItem(slot.key);
  const src = getUrl(slot.key, slot.fallback);

  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');

  const Icon = slot.kind === 'video' ? FilmIcon : PictureIcon;
  const accept = slot.kind === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/gif,image/avif';

  const finish = async (text) => {
    await refresh();
    onNotice({ tone: 'success', text });
  };

  const fail = (err, fallback) => {
    const tooLarge = err?.response?.status === 413;
    onNotice({
      tone: 'danger',
      text: tooLarge
        ? `That file is too large. The maximum for upload is ${MAX_UPLOAD_MB} MB. Use a link for bigger files.`
        : getErrorMessage(err, fallback),
    });
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // allow choosing the same file again later
    if (!file) return;

    const typeOk =
      slot.kind === 'video'
        ? ['video/mp4', 'video/webm'].includes(file.type)
        : file.type.startsWith('image/') && file.type !== 'image/svg+xml';
    if (!typeOk) {
      onNotice({
        tone: 'danger',
        text: slot.kind === 'video' ? 'Choose an MP4 or WebM video.' : 'Choose a JPG, PNG, WebP, GIF or AVIF image.',
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      onNotice({
        tone: 'danger',
        text: `"${file.name}" is ${fmtSize(file.size)}. The maximum for upload is ${MAX_UPLOAD_MB} MB. Compress it, or use a link instead.`,
      });
      return;
    }

    try {
      setBusy(true);
      setProgress(0);
      await api.put(`/media/${slot.key}/upload`, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (ev) => setProgress(Math.round((ev.loaded * 100) / (ev.total || file.size))),
      });
      await finish(`${slot.title} updated. It is live on the website now.`);
    } catch (err) {
      fail(err, 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const handleSaveLink = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await api.put(`/media/${slot.key}/link`, { url: linkValue.trim() });
      setLinkOpen(false);
      setLinkValue('');
      await finish(`${slot.title} now uses your link.`);
    } catch (err) {
      fail(err, 'Could not save the link.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Restore the default for "${slot.title}"?`)) return;
    try {
      setBusy(true);
      await api.delete(`/media/${slot.key}`);
      await finish(`${slot.title} restored to the default.`);
    } catch (err) {
      fail(err, 'Could not restore the default.');
    } finally {
      setBusy(false);
    }
  };

  let status;
  if (item?.source === 'upload') status = <Badge tone="info">Uploaded · {fmtSize(item.size)}</Badge>;
  else if (item?.source === 'link') status = <Badge tone="brand">External link</Badge>;
  else status = <Badge tone="neutral">{slot.kind === 'video' ? 'Not set' : 'Default'}</Badge>;

  return (
    <article className={`rounded-xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden ${slot.wide ? 'lg:col-span-2' : ''}`}>
      <Preview slot={slot} src={src} />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 min-w-0">
            <Icon className="w-4 h-4 text-brand-400 shrink-0" />
            <span className="truncate">{slot.title}</span>
          </h3>
          {status}
        </div>
        <p className="mt-2 text-sm text-slate-300">
          <span className="text-slate-500">Used on: </span>
          {slot.usedOn}
        </p>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{slot.hint}</p>
        {item?.updatedAt && <p className="mt-1.5 text-xs text-slate-500">Last changed {fmtDate(item.updatedAt)}</p>}

        {item?.source === 'link' && (
          <p className="mt-2 text-xs text-slate-400 break-all line-clamp-2" title={item.src}>
            {item.src}
          </p>
        )}

        <div className="mt-auto pt-5">
          {linkOpen ? (
            <form onSubmit={handleSaveLink} className="space-y-2">
              <input
                type="text"
                autoFocus
                required
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                placeholder="https://example.com/file"
                aria-label={`Link for ${slot.title}`}
                className={inputCls}
              />
              <div className="flex gap-2">
                <button type="submit" disabled={busy || !linkValue.trim()} className={btnPrimary}>
                  {busy ? 'Saving…' : 'Save link'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setLinkOpen(false);
                    setLinkValue('');
                  }}
                  className={btnSecondary}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <input ref={fileRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
              <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={btnPrimary}>
                <UploadIcon />
                {progress !== null ? `Uploading ${progress}%` : 'Upload'}
              </button>
              <button type="button" disabled={busy} onClick={() => setLinkOpen(true)} className={btnSecondary}>
                <LinkIcon />
                Use link
              </button>
              {item && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                  title="Restore the default"
                >
                  <UndoIcon />
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function AdminMedia() {
  const [notice, setNotice] = useState(null);

  return (
    <div>
      <PageHeader
        icon={PictureIcon}
        title="Site Media"
        description="Change the background video and pictures shown on the public website. Changes go live straight away."
        actions={
          <a href="/" target="_blank" rel="noreferrer" className={btnSecondary}>
            View website
            <ExternalLink className="w-4 h-4" />
          </a>
        }
      />

      {notice && (
        <div className="mb-6">
          <Alert tone={notice.tone}>{notice.text}</Alert>
        </div>
      )}

      <div className="space-y-10">
        {MEDIA_GROUPS.map((group) => {
          const hasWide = group.slots.some((s) => s.wide);
          const cols = hasWide
            ? 'lg:grid-cols-3'
            : group.slots.length >= 4
              ? 'sm:grid-cols-2 xl:grid-cols-4'
              : 'sm:grid-cols-2';
          return (
            <section key={group.title}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{group.title}</h2>
              <div className={`grid grid-cols-1 gap-4 items-stretch ${cols}`}>
                {group.slots.map((slot) => (
                  <SlotCard key={slot.key} slot={slot} onNotice={setNotice} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-xs text-slate-500 max-w-2xl">
        Uploads are limited to {MAX_UPLOAD_MB} MB each by the hosting platform. For a longer or higher-quality video, host it
        elsewhere and paste its direct link with "Use link".
      </p>
    </div>
  );
}
