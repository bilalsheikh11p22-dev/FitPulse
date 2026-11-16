import React from 'react';
import { motion } from 'framer-motion';
import Img from './Img';

// Image banner used at the top of public pages (About / Features / Contact)
export default function PageHero({ eyebrow, title, highlight, subtitle, image, children }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Img src={image} alt="" eager className="absolute inset-0 -z-20" imgClassName="scale-105" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/80 via-slate-950/85 to-slate-950" />
      <div className="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full bg-brand-500/20 blur-[120px] -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        {eyebrow && (
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="section-eyebrow">
            {eyebrow}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.7 }}
          className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white"
        >
          {title} {highlight && <span className="text-gradient">{highlight}</span>}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.7 }}
            className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
        {children}
      </div>
    </section>
  );
}
