const mongoose = require('mongoose');

// One document per editable slot. A slot is either an uploaded file (bytes stored in MongoDB,
// because serverless hosting has no writable disk) or an external link. No document = site default.
const siteMediaSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    kind: { type: String, enum: ['image', 'video'], required: true },
    source: { type: String, enum: ['upload', 'link'], required: true },
    url: { type: String, default: '' }, // only for source === 'link'
    data: { type: Buffer, select: false }, // only for source === 'upload'
    contentType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    version: { type: Number, default: 1 }, // bumped on every change, used to bust browser caches
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteMedia', siteMediaSchema);
