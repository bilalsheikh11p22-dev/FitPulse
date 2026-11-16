import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const TONES = {
  brand: { rgb: '255, 107, 44', core: '#ffb27a' },
  red: { rgb: '239, 68, 68', core: '#fca5a5' },
};

/**
 * The glowing "light" under the active nav label.
 * Render it only inside the active item's label wrapper (which must be `relative`).
 * Because every item shares the same `layoutId`, Framer Motion glides the line
 * from the previous item to the new one; the glow ramps up on arrival like a lamp switching on.
 */
export default function NavUnderline({ layoutId, tone = 'brand' }) {
  const reduce = useReducedMotion();
  const { rgb, core } = TONES[tone] || TONES.brand;

  const dim = `0 0 0 0 rgba(${rgb}, 0), 0 0 0 0 rgba(${rgb}, 0)`;
  const lit = `0 0 6px 0 rgba(${rgb}, 0.85), 0 0 16px 2px rgba(${rgb}, 0.4)`;

  return (
    <motion.span
      layoutId={layoutId}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 right-0 -bottom-[7px] h-[2px] rounded-full"
      style={{
        background: `linear-gradient(90deg, rgba(${rgb}, 0.15), rgb(${rgb}) 22%, ${core} 50%, rgb(${rgb}) 78%, rgba(${rgb}, 0.15))`,
        boxShadow: lit,
      }}
      initial={reduce ? false : { boxShadow: dim }}
      animate={{ boxShadow: lit }}
      transition={
        reduce
          ? { duration: 0 }
          : { layout: { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }, boxShadow: { duration: 0.45, ease: 'easeOut' } }
      }
    />
  );
}
