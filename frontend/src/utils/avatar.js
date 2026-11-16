// Older versions of the backend silently gave every new account this stock photo.
// It is treated as "no profile picture" so existing accounts behave like new ones.
const LEGACY_DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
];

// Returns a usable picture URL, or '' when the person has not set one.
export const resolveAvatar = (src) => {
  if (typeof src !== 'string') return '';
  const s = src.trim();
  return s && !LEGACY_DEFAULT_AVATARS.includes(s) ? s : '';
};

// "Alex Rivera" -> "AR", "madonna" -> "M", "" -> ""
export const getInitials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  const first = Array.from(parts[0])[0] || '';
  const last = parts.length > 1 ? Array.from(parts[parts.length - 1])[0] : '';
  return (first + last).toUpperCase();
};
