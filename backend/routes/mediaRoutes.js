const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { MAX_UPLOAD_BYTES } = require('../config/mediaSlots');
const { listMedia, serveMedia, uploadMedia, setMediaLink, resetMedia } = require('../controllers/mediaController');

// Raw binary body (no multipart library needed). Only image/* and video/* bodies are read.
const rawFile = express.raw({
  type: (req) => /^(image|video)\//i.test(req.headers['content-type'] || ''),
  limit: MAX_UPLOAD_BYTES,
});

// Public: the website needs these to render
router.get('/', listMedia);
router.get('/:key', serveMedia);

// Admin only
router.put('/:key/upload', protect, adminOnly, rawFile, uploadMedia);
router.put('/:key/link', protect, adminOnly, setMediaLink);
router.delete('/:key', protect, adminOnly, resetMedia);

module.exports = router;
