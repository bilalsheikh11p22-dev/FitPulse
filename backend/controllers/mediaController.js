const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// multer is only needed for admin uploads. If `npm install` was not run after updating, the rest of the
// backend must still start - uploads then answer with a clear message instead of crashing the server.
let multer = null;
try {
  multer = require('multer');
} catch (e) {
  console.warn('[media] "multer" is not installed - admin uploads are disabled. Run `npm install` inside /backend.');
}
const SiteMedia = require('../models/SiteMedia');
const { SLOTS, getSlot, IMAGE_TYPES, VIDEO_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } = require('../utils/mediaSlots');

// ── Storage ──────────────────────────────────────────────────────────────────
// Uploaded pictures / videos live in MongoDB (GridFS), not on the server's disk: serverless hosts such as
// Vercel have a read-only, throw-away file system, and a database is shared by every server instance.
const BUCKET = 'siteMedia';
const getBucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
const OID = /^[a-f0-9]{24}$/i;

// Legacy files written to disk by earlier versions (backend/uploads/media)
const LEGACY_DIR = path.resolve(__dirname, '..', 'uploads', 'media');

const makeUploader = (allowed, maxBytes) =>
  !multer ? null : multer({
    storage: multer.memoryStorage(), // buffered, validated, then written to GridFS by saveMedia
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (req, file, cb) => {
      if (allowed[file.mimetype]) return cb(null, true);
      const err = new Error(`Unsupported file type. Allowed: ${Object.keys(allowed).map((m) => m.split('/')[1]).join(', ')}`);
      err.status = 400;
      return cb(err);
    },
  }).single('file');

const imageUpload = makeUploader(IMAGE_TYPES, MAX_IMAGE_BYTES);
const videoUpload = makeUploader(VIDEO_TYPES, MAX_VIDEO_BYTES);

const storeBuffer = (buffer, filename, contentType) =>
  new Promise((resolve, reject) => {
    const stream = getBucket().openUploadStream(filename, { contentType });
    stream.on('error', reject);
    stream.on('finish', () => resolve(String(stream.id)));
    stream.end(buffer);
  });

// Deletes a stored file; never throws (a missing file is fine)
const removeFile = async (fileName) => {
  if (!fileName) return;
  try {
    if (OID.test(fileName)) await getBucket().delete(new mongoose.Types.ObjectId(fileName));
    else fs.unlink(path.join(LEGACY_DIR, path.basename(fileName)), () => {}); // basename() guards against path tricks
  } catch {
    /* already gone */
  }
};

// Runs multer for the slot's type and turns upload errors into clean 400 responses
const handleUpload = (req, res, next) => {
  const slot = getSlot(req.params.key);
  if (!slot) return res.status(404).json({ message: 'Unknown media slot' });
  const uploader = slot.type === 'video' ? videoUpload : imageUpload;
  if (!uploader && req.is('application/json')) return next(); // pasting a link needs no multer
  if (!uploader) {
    return res.status(503).json({ message: 'Uploads are not available yet: run "npm install" in the backend folder and restart the server.' });
  }
  return uploader(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      const mb = (slot.type === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES) / (1024 * 1024);
      return res.status(400).json({ message: `File is too large. Maximum size for this slot is ${mb} MB - use "Use link" for bigger files.` });
    }
    return res.status(err.status || 400).json({ message: err.message || 'Upload failed' });
  });
};

const toPublic = (doc) => ({
  url: doc.url,
  source: doc.source,
  originalName: doc.originalName,
  mimeType: doc.mimeType,
  size: doc.size,
  updatedAt: doc.updatedAt,
});

// GET /api/media  (public) -> { media: { heroVideo: '/api/media/file/..', 'avatars.marcus': 'https://..' } }
// Only customised slots are returned; the frontend falls back to its built-in defaults for the rest.
const getPublicMedia = async (req, res) => {
  try {
    const docs = await SiteMedia.find().select('key url').lean();
    const media = {};
    docs.forEach((d) => { media[d.key] = d.url; });
    res.set('Cache-Control', 'no-cache');
    res.json({ media });
  } catch (error) {
    res.status(500).json({ message: 'Could not load site media' });
  }
};

// GET /api/media/file/:id  (public) -> streams an uploaded picture / video, with Range support so <video> can seek
const serveFile = async (req, res) => {
  try {
    if (!OID.test(req.params.id)) return res.status(404).json({ message: 'File not found' });
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const file = await mongoose.connection.db.collection(`${BUCKET}.files`).findOne({ _id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const total = file.length;
    const type = file.contentType || 'application/octet-stream';
    res.set({
      'Content-Type': type,
      'Accept-Ranges': 'bytes',
      // The id changes with every upload, so the response can be cached for a long time
      'Cache-Control': 'public, max-age=604800, immutable',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });

    let start = 0;
    let end = total - 1;
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && (range[1] || range[2])) {
      if (range[1] === '') {
        start = Math.max(0, total - Number(range[2])); // "-500" = the last 500 bytes
      } else {
        start = Number(range[1]);
        if (range[2] !== '') end = Math.min(Number(range[2]), total - 1);
      }
      if (start > end || start >= total) {
        res.set('Content-Range', `bytes */${total}`);
        return res.status(416).end();
      }
      res.status(206).set('Content-Range', `bytes ${start}-${end}/${total}`);
    }

    res.set('Content-Length', String(total === 0 ? 0 : end - start + 1));
    if (total === 0) return res.end();
    const stream = getBucket().openDownloadStream(_id, { start, end: end + 1 }); // GridFS "end" is exclusive
    stream.on('error', () => (res.headersSent ? res.destroy() : res.status(500).end()));
    return stream.pipe(res);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load file' });
  }
};

// GET /api/admin/media -> every slot + its current override (if any)
const getAdminMedia = async (req, res) => {
  try {
    const docs = await SiteMedia.find().lean();
    const byKey = new Map(docs.map((d) => [d.key, d]));
    res.json({
      slots: SLOTS.map((s) => ({ ...s, current: byKey.has(s.key) ? toPublic(byKey.get(s.key)) : null })),
      limits: { imageMB: MAX_IMAGE_BYTES / (1024 * 1024), videoMB: MAX_VIDEO_BYTES / (1024 * 1024) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load media slots' });
  }
};

const isValidLink = (value) => {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
};

// PUT /api/admin/media/:key   multipart field "file"  OR  JSON/form field "url"
const saveMedia = async (req, res) => {
  const slot = getSlot(req.params.key);
  const uploaded = req.file;
  let newFileId = '';
  try {
    let fields;
    if (uploaded) {
      const ext = (slot.type === 'video' ? VIDEO_TYPES : IMAGE_TYPES)[uploaded.mimetype];
      // Never trust the client's file name: a generated name + extension derived from the verified mime type
      newFileId = await storeBuffer(uploaded.buffer, `${slot.key}.${ext}`, uploaded.mimetype);
      fields = {
        url: `/api/media/file/${newFileId}`,
        source: 'upload',
        fileName: newFileId,
        originalName: path.basename(uploaded.originalname || '').slice(0, 200),
        mimeType: uploaded.mimetype,
        size: uploaded.size,
      };
    } else if (req.body && req.body.url) {
      const link = String(req.body.url).trim();
      if (!isValidLink(link)) return res.status(400).json({ message: 'Please enter a valid http(s) link' });
      fields = { url: link, source: 'link', fileName: '', originalName: '', mimeType: '', size: 0 };
    } else {
      return res.status(400).json({ message: 'Choose a file to upload or paste a link' });
    }

    const previous = await SiteMedia.findOne({ key: slot.key });
    const doc = await SiteMedia.findOneAndUpdate(
      { key: slot.key },
      { ...fields, updatedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (previous?.fileName && previous.fileName !== fields.fileName) await removeFile(previous.fileName);
    return res.json({ key: slot.key, current: toPublic(doc) });
  } catch (error) {
    if (newFileId) await removeFile(newFileId); // do not leave orphan files behind on a DB failure
    return res.status(500).json({ message: 'Could not save media' });
  }
};

// DELETE /api/admin/media/:key -> back to the website default
const resetMedia = async (req, res) => {
  try {
    const slot = getSlot(req.params.key);
    if (!slot) return res.status(404).json({ message: 'Unknown media slot' });
    const doc = await SiteMedia.findOneAndDelete({ key: slot.key });
    if (doc?.fileName) await removeFile(doc.fileName);
    return res.json({ key: slot.key, current: null });
  } catch (error) {
    return res.status(500).json({ message: 'Could not reset media' });
  }
};

module.exports = { getPublicMedia, serveFile, getAdminMedia, handleUpload, saveMedia, resetMedia };
