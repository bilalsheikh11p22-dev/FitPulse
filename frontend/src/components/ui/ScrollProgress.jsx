import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

// Thin brand-coloured bar at the very top that fills as the page is scrolled
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[70] bg-gradient-to-r from-brand-500 via-brand-400 to-amber-400 pointer-events-none"
    />
  );
}
