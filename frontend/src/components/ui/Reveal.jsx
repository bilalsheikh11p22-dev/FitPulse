import React from 'react';
import { motion } from 'framer-motion';

// Scroll-triggered fade/slide-in wrapper
export default function Reveal({ children, delay = 0, y = 28, x = 0, className = '', as = 'div', once = true }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}
