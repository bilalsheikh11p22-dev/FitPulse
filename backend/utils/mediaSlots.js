// Every picture / video on the public website that the admin can control.
// `key` is what the frontend asks for (see frontend/src/data/images.js for the matching defaults).
const SLOTS = [
  // ---------------- Home page: hero ----------------
  { key: 'heroVideo', group: 'Home page - Hero', type: 'video', label: 'Hero background video',
    usedOn: 'Home page hero (plays muted and looped behind the headline)',
    hint: 'MP4 or WebM, landscape 16:9, ideally 5-15 sec and under 30 MB for fast loading.' },
  { key: 'hero', group: 'Home page - Hero', type: 'image', label: 'Hero poster image',
    usedOn: 'Shown while the video loads, and if the video cannot play',
    hint: 'Landscape photo, at least 1600 px wide.' },

  // ---------------- Home page: sections ----------------
  { key: 'strength', group: 'Home page - Training cards', type: 'image', label: 'Strength card', usedOn: 'Home page > "Train your way" cards', hint: 'Portrait photo (3:4).' },
  { key: 'cardio', group: 'Home page - Training cards', type: 'image', label: 'Cardio card', usedOn: 'Home page > "Train your way" cards', hint: 'Portrait photo (3:4).' },
  { key: 'yoga', group: 'Home page - Training cards', type: 'image', label: 'Mobility & Yoga card', usedOn: 'Home page > "Train your way" cards', hint: 'Portrait photo (3:4).' },
  { key: 'nutrition', group: 'Home page - Training cards', type: 'image', label: 'Nutrition card', usedOn: 'Home page > "Train your way" cards', hint: 'Portrait photo (3:4).' },
  { key: 'heroSide', group: 'Home page - Sections', type: 'image', label: '"How it works" photo', usedOn: 'Home page > How it works', hint: 'Square or 4:5 photo.' },
  { key: 'avatars.marcus', group: 'Home page - Testimonials', type: 'image', label: 'Testimonial: Marcus Vance', usedOn: 'Home page > Testimonials', hint: 'Square face photo, 200 px or larger.' },
  { key: 'avatars.sophia', group: 'Home page - Testimonials', type: 'image', label: 'Testimonial: Sophia Martinez', usedOn: 'Home page > Testimonials', hint: 'Square face photo, 200 px or larger.' },
  { key: 'avatars.david', group: 'Home page - Testimonials', type: 'image', label: 'Testimonial: David Kim', usedOn: 'Home page > Testimonials', hint: 'Square face photo, 200 px or larger.' },

  // ---------------- Banners & backgrounds ----------------
  { key: 'gym', group: 'Page banners', type: 'image', label: 'Features page banner', usedOn: 'Features page header', hint: 'Wide landscape photo.' },
  { key: 'gymDark', group: 'Page banners', type: 'image', label: 'About banner / Dashboard / Register', usedOn: 'About page, user Dashboard header, Register page side image', hint: 'Dark, moody landscape photo works best.' },
  { key: 'team', group: 'Page banners', type: 'image', label: 'Contact page banner', usedOn: 'Contact page header', hint: 'Wide landscape photo.' },
  { key: 'auth', group: 'Page banners', type: 'image', label: 'Login & password pages side image', usedOn: 'Login, Forgot / Reset password, Verify email', hint: 'Portrait or square photo.' },
];

const SLOT_MAP = new Map(SLOTS.map((s) => [s.key, s]));
const getSlot = (key) => SLOT_MAP.get(key);

const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };
const VIDEO_TYPES = { 'video/mp4': 'mp4', 'video/webm': 'webm' };

// Vercel functions reject request bodies over ~4.5 MB, so uploads there are capped at 4 MB
// (for a bigger hero video, paste a link instead - "Use link" has no size limit).
const ON_VERCEL = process.env.VERCEL === '1';
const MAX_IMAGE_BYTES = (ON_VERCEL ? 4 : 8) * 1024 * 1024;
const MAX_VIDEO_BYTES = (ON_VERCEL ? 4 : 60) * 1024 * 1024;

module.exports = { SLOTS, getSlot, IMAGE_TYPES, VIDEO_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES };
