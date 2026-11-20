// The editable media slots of the public website. The admin "Site Media" page can replace each one.
// Keep the keys in sync with frontend/src/data/mediaSlots.js.
const SLOTS = {
  heroVideo: { kind: 'video' },
  heroPoster: { kind: 'image' },
  heroSide: { kind: 'image' },
  cardStrength: { kind: 'image' },
  cardCardio: { kind: 'image' },
  cardYoga: { kind: 'image' },
  cardNutrition: { kind: 'image' },
  authBackground: { kind: 'image' },
};

// Vercel rejects request bodies above ~4.5 MB, so uploads are capped just below that.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

module.exports = { SLOTS, MAX_UPLOAD_BYTES };
