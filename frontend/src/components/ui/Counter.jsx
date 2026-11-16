import React, { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

// Animated number that counts up when scrolled into view
export default function Counter({ to = 0, suffix = '', prefix = '', duration = 1.8, decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);

  const safeTo = typeof to === 'number' && Number.isFinite(to) ? to : (Number.parseFloat(to) || 0);
  const safeDecimals = Math.max(0, Math.min(20, Math.floor(Number(decimals) || 0)));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, safeTo, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setVal(typeof v === 'number' && Number.isFinite(v) ? v : 0),
    });
    return () => controls.stop();
  }, [inView, safeTo, duration]);

  const displayVal = Number.isFinite(val) ? val : 0;

  return (
    <span ref={ref}>
      {prefix}
      {displayVal.toLocaleString(undefined, { minimumFractionDigits: safeDecimals, maximumFractionDigits: safeDecimals })}
      {suffix}
    </span>
  );
}
