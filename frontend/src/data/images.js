// Central place for all photos used across the site.
// Hosted on Unsplash (free to use). To use your own pictures, drop files into /public/images
// and replace the URLs below with e.g. "/images/hero.jpg".
const u = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  hero: u('photo-1534438327276-14e5300c3a48', 1600),
  heroSide: u('photo-1517836357463-d25dfeac3438', 900),
  gym: u('photo-1571019613454-1cb2f99b2d8b', 1400),
  gymDark: u('photo-1540497077202-7c8a3999166f', 1400),
  running: u('photo-1552674605-db6ffd4facb5', 1000),
  nutrition: u('photo-1490645935967-10de6ba17061', 1000),
  yoga: u('photo-1518611012118-696072aa579a', 1000),
  strength: u('photo-1583454110551-21f2fa2afe61', 1000),
  cardio: u('photo-1526506118085-60ce8714f8c5', 1000),
  crossfit: u('photo-1599058917212-d750089bc07e', 1000),
  team: u('photo-1549060279-7e168fcee0c2', 1200),
  auth: u('photo-1594737625785-a6cbdabd333c', 1200),
  avatars: {
    marcus: u('photo-1534528741775-53994a69daeb', 200),
    sophia: u('photo-1494790108377-be9c29b29330', 200),
    david: u('photo-1507003211169-0a1dd7228f2d', 200),
  },
};
