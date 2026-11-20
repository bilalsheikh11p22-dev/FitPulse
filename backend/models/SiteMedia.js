const mongoose = require('mongoose');

// One document per customised slot. A slot with no document simply uses the website default.
const siteMediaSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    url: { type: String, required: true },                          // '/api/media/file/<id>' (stored in MongoDB), a legacy '/uploads/media/x.jpg', or an external https:// link
    source: { type: String, enum: ['upload', 'link'], required: true },
    fileName: { type: String, default: '' },                         // GridFS file id (uploads only), used to delete the old file
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteMedia', siteMediaSchema);
