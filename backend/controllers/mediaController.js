const SiteMedia = require('../models/SiteMedia');
const { SLOTS } = require('../config/mediaSlots');

// Identify the real file type from its first bytes, so a renamed file cannot be stored as something else.
const sniffType = (buf) => {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'GIF8') return 'image/gif';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'video/webm';
  if (buf.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buf.toString('ascii', 8, 12);
    return brand.startsWith('avi') ? 'image/avif' : 'video/mp4';
  }
  return null;
};

const toPublic = (doc) => ({
  key: doc.key,
  kind: doc.kind,
  source: doc.source,
  src: doc.source === 'upload' ? `/api/media/${doc.key}?v=${doc.version}` : doc.url,
  size: doc.size || 0,
  contentType: doc.contentType || '',
  updatedAt: doc.updatedAt,
});

const slotOr404 = (req, res) => {
  const slot = SLOTS[req.params.key];
  if (!slot) {
    res.status(404).json({ message: 'Unknown media slot' });
    return null;
  }
  return slot;
};

// GET /api/media  (public) - every customised slot; anything missing uses the site default
const listMedia = async (req, res, next) => {
  try {
    const docs = await SiteMedia.find().select('-data');
    const items = {};
    docs.forEach((d) => {
      if (SLOTS[d.key]) items[d.key] = toPublic(d);
    });
    res.set('Cache-Control', 'no-cache');
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// GET /api/media/:key  (public) - the uploaded file, with HTTP Range support (Safari needs it for video)
const serveMedia = async (req, res, next) => {
  try {
    if (!SLOTS[req.params.key]) return res.status(404).json({ message: 'Unknown media slot' });

    const doc = await SiteMedia.findOne({ key: req.params.key, source: 'upload' }).select('+data');
    if (!doc || !doc.data) return res.status(404).json({ message: 'No uploaded file for this slot' });

    const buf = Buffer.from(doc.data);
    const total = buf.length;

    res.set({
      'Content-Type': doc.contentType || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Cache-Control': req.query.v ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Content-Type-Options': 'nosniff',
    });

    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && (range[1] !== '' || range[2] !== '')) {
      let start;
      let end;
      if (range[1] === '') {
        start = Math.max(0, total - parseInt(range[2], 10)); // suffix range: last N bytes
        end = total - 1;
      } else {
        start = parseInt(range[1], 10);
        end = range[2] === '' ? total - 1 : Math.min(parseInt(range[2], 10), total - 1);
      }
      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= total) {
        res.set('Content-Range', `bytes */${total}`);
        return res.status(416).end();
      }
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': String(end - start + 1),
      });
      return res.end(buf.subarray(start, end + 1));
    }

    res.set('Content-Length', String(total));
    return res.status(200).end(buf);
  } catch (err) {
    return next(err);
  }
};

// PUT /api/media/:key/upload  (admin) - raw file bytes in the body
const uploadMedia = async (req, res, next) => {
  try {
    const slot = slotOr404(req, res);
    if (!slot) return undefined;

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: 'No file received. Send an image or video file.' });
    }

    const type = sniffType(req.body);
    if (!type) {
      return res.status(400).json({ message: 'Unsupported file. Use JPG, PNG, WebP, GIF, AVIF, MP4 or WebM.' });
    }
    if (!type.startsWith(`${slot.kind}/`)) {
      const article = (w) => (w === 'image' ? 'an image' : 'a video');
      return res.status(400).json({ message: `This slot needs ${article(slot.kind)}, but the file is ${article(type.split('/')[0])}.` });
    }

    const doc = await SiteMedia.findOneAndUpdate(
      { key: req.params.key },
      {
        $set: {
          kind: slot.kind,
          source: 'upload',
          url: '',
          data: req.body,
          contentType: type,
          size: req.body.length,
          updatedBy: req.user._id,
        },
        $inc: { version: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('-data');

    return res.json(toPublic(doc));
  } catch (err) {
    return next(err);
  }
};

// PUT /api/media/:key/link  (admin) - use an external URL instead of an upload
const setMediaLink = async (req, res, next) => {
  try {
    const slot = slotOr404(req, res);
    if (!slot) return undefined;

    const raw = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    if (!raw || raw.length > 2000) {
      return res.status(400).json({ message: 'Enter a link to the file.' });
    }

    let ok = false;
    if (raw.startsWith('/') && !raw.startsWith('//')) {
      ok = true; // a file inside this website, e.g. /images/hero.jpg
    } else {
      try {
        const parsed = new URL(raw);
        ok = parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      return res.status(400).json({ message: 'The link must start with https:// (or / for a file on this site).' });
    }

    const doc = await SiteMedia.findOneAndUpdate(
      { key: req.params.key },
      {
        $set: { kind: slot.kind, source: 'link', url: raw, contentType: '', size: 0, updatedBy: req.user._id },
        $unset: { data: 1 },
        $inc: { version: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('-data');

    return res.json(toPublic(doc));
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/media/:key  (admin) - go back to the site default
const resetMedia = async (req, res, next) => {
  try {
    if (!slotOr404(req, res)) return undefined;
    await SiteMedia.deleteOne({ key: req.params.key });
    return res.json({ message: 'Restored the default', key: req.params.key });
  } catch (err) {
    return next(err);
  }
};

module.exports = { listMedia, serveMedia, uploadMedia, setMediaLink, resetMedia };
