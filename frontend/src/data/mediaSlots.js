import { IMAGES } from './images';

// Every picture or video on the public site that the admin can replace (Admin > Site Media).
// `key` must match backend/config/mediaSlots.js. `fallback` is what shows until something is uploaded.
export const MEDIA_GROUPS = [
  {
    title: 'Home page: hero',
    slots: [
      {
        key: 'heroVideo',
        kind: 'video',
        title: 'Hero background video',
        usedOn: 'Home page hero (plays muted and looped behind the headline)',
        hint: 'MP4 or WebM, landscape 16:9, ideally 5 to 15 seconds. Max 4 MB for upload; for longer videos use a link.',
        aspect: 'aspect-video',
        wide: true,
        fallback: null,
      },
      {
        key: 'heroPoster',
        kind: 'image',
        title: 'Hero poster image',
        usedOn: 'Home page hero. Shown while the video loads, or if no video is set',
        hint: 'Landscape photo, at least 1600 px wide. Max 4 MB.',
        aspect: 'aspect-video',
        fallback: IMAGES.hero,
      },
    ],
  },
  {
    title: 'Home page: training cards',
    slots: [
      {
        key: 'cardStrength',
        kind: 'image',
        title: 'Strength card',
        usedOn: 'Home page training cards and the Strength program page',
        hint: 'Portrait photo (3:4), at least 800 px wide. Max 4 MB.',
        aspect: 'aspect-[3/4]',
        fallback: IMAGES.strength,
      },
      {
        key: 'cardCardio',
        kind: 'image',
        title: 'Cardio card',
        usedOn: 'Home page training cards and the Cardio program page',
        hint: 'Portrait photo (3:4), at least 800 px wide. Max 4 MB.',
        aspect: 'aspect-[3/4]',
        fallback: IMAGES.cardio,
      },
      {
        key: 'cardYoga',
        kind: 'image',
        title: 'Mobility & Yoga card',
        usedOn: 'Home page training cards and the Mobility & Yoga program page',
        hint: 'Portrait photo (3:4), at least 800 px wide. Max 4 MB.',
        aspect: 'aspect-[3/4]',
        fallback: IMAGES.yoga,
      },
      {
        key: 'cardNutrition',
        kind: 'image',
        title: 'Nutrition card',
        usedOn: 'Home page training cards and the Nutrition program page',
        hint: 'Portrait photo (3:4), at least 800 px wide. Max 4 MB.',
        aspect: 'aspect-[3/4]',
        fallback: IMAGES.nutrition,
      },
    ],
  },
  {
    title: 'Other pictures',
    slots: [
      {
        key: 'heroSide',
        kind: 'image',
        title: 'How it works photo',
        usedOn: 'Home page, next to the "how it works" steps',
        hint: 'Square or 4:5 photo, at least 900 px wide. Max 4 MB.',
        aspect: 'aspect-square',
        fallback: IMAGES.heroSide,
      },
      {
        key: 'authBackground',
        kind: 'image',
        title: 'Sign in / register background',
        usedOn: 'Left panel of the login, register and password pages (shown very softly)',
        hint: 'Portrait or landscape photo, at least 1200 px wide. Max 4 MB.',
        aspect: 'aspect-[4/5]',
        fallback: IMAGES.auth,
      },
    ],
  },
];

export const ALL_SLOTS = MEDIA_GROUPS.flatMap((g) => g.slots);

// Program slug -> its card slot (the program pages reuse the card picture)
export const PROGRAM_MEDIA_KEY = {
  strength: 'cardStrength',
  cardio: 'cardCardio',
  yoga: 'cardYoga',
  nutrition: 'cardNutrition',
};

export const MAX_UPLOAD_MB = 4;
