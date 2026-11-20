import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Dumbbell, TrendingUp, Apple, FileText, Clock, BarChart3, ArrowRight, Play, Flame, Star,
  CheckCircle2, Target, Quote, Activity, Trophy, HeartPulse,
} from 'lucide-react';
import Img from '../components/ui/Img';
import Reveal from '../components/ui/Reveal';
import Counter from '../components/ui/Counter';
import { IMAGES } from '../data/images';

const features = [
  { icon: Dumbbell, title: 'Workout Builder', desc: 'Log exercises, sets, reps and weights. Tag sessions as Strength, Cardio or HIIT and see your history at a glance.', color: 'text-brand-400', bg: 'bg-brand-500/15' },
  { icon: Apple, title: 'Nutrition & Macros', desc: 'Track every meal and watch calories, protein, carbs and fats against your daily targets.', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  { icon: TrendingUp, title: 'Body Progress & PRs', desc: 'Record measurements and personal records to prove how far you have come.', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Interactive charts reveal trends in training volume, calories and weight over time.', color: 'text-purple-400', bg: 'bg-purple-500/15' },
  { icon: FileText, title: 'PDF & CSV Reports', desc: 'Export clean progress reports to share with a coach or keep for your own records.', color: 'text-rose-400', bg: 'bg-rose-500/15' },
  { icon: Clock, title: 'Goals & Reminders', desc: 'Set goals, get nudges for workouts and meals, and celebrate every milestone you hit.', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
];

const programs = [
  { slug: 'strength', title: 'Strength', tag: 'Build power', img: IMAGES.strength },
  { slug: 'cardio', title: 'Cardio', tag: 'Boost endurance', img: IMAGES.cardio },
  { slug: 'yoga', title: 'Mobility & Yoga', tag: 'Move better', img: IMAGES.yoga },
  { slug: 'nutrition', title: 'Nutrition', tag: 'Fuel right', img: IMAGES.nutrition },
];

const steps = [
  { n: '01', title: 'Create your profile', desc: 'Tell us your goal, height and weight - it takes under a minute.' },
  { n: '02', title: 'Log your training', desc: 'Add workouts and meals in a few taps from any device.' },
  { n: '03', title: 'Watch yourself improve', desc: 'Charts, streaks and reports turn effort into visible results.' },
];

const testimonials = [
  { name: 'Marcus Vance', role: 'CrossFit Coach', avatar: IMAGES.avatars.marcus, comment: 'My athletes finally have full visibility on progressive overload and daily protein. The PDF reports are a game changer.' },
  { name: 'Sophia Martinez', role: 'Marathon Runner', avatar: IMAGES.avatars.sophia, comment: 'Running times and body composition in one clean dashboard keeps me accountable every single week.' },
  { name: 'David Kim', role: 'Powerlifter', avatar: IMAGES.avatars.david, comment: 'Set-by-set tracking made my deadlift jump from 100kg to 130kg completely measurable. Love it.' },
];

const marquee = ['STRENGTH', 'CARDIO', 'HIIT', 'NUTRITION', 'MOBILITY', 'RECOVERY', 'GOALS', 'PROGRESS', 'ANALYTICS', 'REPORTS'];

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative overflow-hidden">
      {/* ================= HERO ================= */}
      <section ref={heroRef} className="relative isolate min-h-[92vh] flex items-center overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-0 -z-20">
          <Img src={IMAGES.hero} alt="Athlete training in the gym" eager className="w-full h-full" imgClassName="scale-110" />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/65 to-black/25" />
        <div className="absolute inset-x-0 bottom-0 h-40 -z-10 bg-gradient-to-t from-slate-950 to-transparent" />
        <div className="absolute -left-32 top-1/3 w-[460px] h-[460px] rounded-full bg-brand-500/25 blur-[140px] -z-10" />

        <motion.div style={{ y: textY, opacity: fade }} className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 text-[#fff]">
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff]/10 backdrop-blur border border-[#fff]/20 text-xs font-semibold"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-brand-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-500" />
              </span>
              Your complete fitness companion
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.02] tracking-tight"
            >
              Train smarter.
              <br />
              <span className="text-gradient">Track everything.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="mt-6 max-w-xl text-base sm:text-lg text-slate-200/90 leading-relaxed"
            >
              Log workouts, count macros, record personal bests and see your progress come alive with beautiful charts - all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-9 flex flex-col sm:flex-row gap-3.5"
            >
              <Link to="/register" className="btn-primary !px-8 !py-4 !text-base group">
                Start for free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/features" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[#fff]/25 bg-[#fff]/10 backdrop-blur text-[#fff] font-semibold text-base hover:bg-[#fff]/20 transition">
                <Play className="w-4 h-4 fill-current" /> See how it works
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="flex -space-x-3">
                {[IMAGES.avatars.marcus, IMAGES.avatars.sophia, IMAGES.avatars.david].map((a, i) => (
                  <Img key={i} src={a} alt="" className="w-10 h-10 rounded-full ring-2 ring-black" />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex text-amber-400">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                <p className="text-slate-300 text-xs mt-0.5">Loved by athletes and coaches</p>
              </div>
            </motion.div>
          </div>

          {/* Floating cards */}
          <div className="hidden lg:block lg:col-span-5 relative h-[460px]">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute top-4 right-0 w-64 p-5 rounded-2xl bg-black/50 backdrop-blur-xl border border-[#fff]/15 text-[#fff] animate-float"
            >
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-brand-400" /> Calories today</span>
                <span className="text-brand-400 font-bold">78%</span>
              </div>
              <p className="mt-2 text-3xl font-extrabold">1,840 <span className="text-sm font-medium text-slate-400">/ 2,400</span></p>
              <div className="mt-3 h-2 rounded-full bg-[#fff]/10 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '78%' }} transition={{ delay: 1.1, duration: 1.4, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute top-44 left-0 w-60 p-5 rounded-2xl bg-black/50 backdrop-blur-xl border border-[#fff]/15 text-[#fff] animate-float-delayed"
            >
              <div className="flex items-center gap-2 text-xs text-slate-300"><Trophy className="w-4 h-4 text-amber-400" /> New personal record</div>
              <p className="mt-2 text-2xl font-extrabold">Deadlift 130 kg</p>
              <p className="text-xs text-emerald-400 mt-1">+30 kg since January</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute bottom-0 right-6 w-56 p-5 rounded-2xl bg-black/50 backdrop-blur-xl border border-[#fff]/15 text-[#fff] animate-float"
            >
              <div className="flex items-center gap-2 text-xs text-slate-300"><HeartPulse className="w-4 h-4 text-rose-400" /> Weekly streak</div>
              <div className="mt-3 flex items-end gap-1.5 h-12">
                {[40, 65, 50, 85, 70, 95, 60].map((h, i) => (
                  <motion.span key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 1.3 + i * 0.07, duration: 0.6 }} className="flex-1 rounded bg-gradient-to-t from-brand-600 to-brand-400" />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ================= MARQUEE ================= */}
      <section className="relative border-y border-slate-800 bg-slate-900/60 py-5 overflow-hidden">
        <div className="flex w-max animate-marquee">
          {[...marquee, ...marquee, ...marquee, ...marquee].map((m, i) => (
            <span key={i} className="mx-6 flex items-center gap-12 font-display font-extrabold text-xl sm:text-2xl tracking-widest text-slate-600">
              {m}
              <span className="w-2 h-2 rounded-full bg-brand-500" />
            </span>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { to: 50, suffix: 'K+', label: 'Workouts logged', icon: Dumbbell },
            { to: 1.2, suffix: 'M', label: 'Meals tracked', icon: Apple, decimals: 1 },
            { to: 98, suffix: '%', label: 'Users hit weekly goals', icon: Target },
            { to: 24, suffix: '/7', label: 'Access on any device', icon: Activity },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="glass-card rounded-2xl p-5 sm:p-7 text-center hover-lift h-full">
                <s.icon className="w-6 h-6 text-brand-400 mx-auto mb-3" />
                <p className="text-3xl sm:text-5xl font-extrabold text-white font-display">
                  <Counter to={s.to} suffix={s.suffix} decimals={s.decimals || 0} />
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-400">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="absolute right-0 top-20 w-[420px] h-[420px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="section-eyebrow">Features</span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white">Everything you need to reach your goals</h2>
          <p className="mt-4 text-slate-400">Powerful tools wrapped in a clean interface that feels great on desktop, tablet and phone.</p>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.1}>
              <div className="group glass-card rounded-2xl p-7 h-full hover-lift">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= PROGRAMS (photo cards) ================= */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="section-eyebrow">Train your way</span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white max-w-xl">One tracker for every kind of training</h2>
            </div>
            <Link to="/features" className="inline-flex items-center gap-2 text-brand-400 font-semibold hover:gap-3 transition-all">
              Explore all features <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {programs.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.09}>
                <Link to={`/programs/${p.slug}`} aria-label={`${p.title}: ${p.tag}`} className="group relative block rounded-2xl overflow-hidden aspect-[3/4] img-zoom focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                  <Img src={p.img} alt={p.title} className="absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-[#fff]">
                    <p className="text-[11px] uppercase tracking-widest text-brand-400 font-bold">{p.tag}</p>
                    <h3 className="mt-1 text-lg sm:text-2xl font-extrabold">{p.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-focus-visible:opacity-100 transition-all duration-300">
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal x={-40} y={0}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500/30 to-amber-400/10 blur-2xl rounded-[2rem]" />
            <Img src={IMAGES.heroSide} alt="Woman exercising" className="relative rounded-3xl aspect-[4/5] sm:aspect-[5/5] w-full shadow-soft" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-2 sm:-right-6 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-soft flex items-center gap-3"
            >
              <span className="w-11 h-11 rounded-xl bg-brand-500/20 flex items-center justify-center"><Flame className="w-5 h-5 text-brand-400" /></span>
              <div>
                <p className="text-xs text-slate-400">Burned this week</p>
                <p className="text-lg font-extrabold text-white">3,420 kcal</p>
              </div>
            </motion.div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="section-eyebrow">How it works</span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white">Up and running in three simple steps</h2>
          </Reveal>
          <div className="mt-10 space-y-6">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.12}>
                <div className="flex gap-5 group">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-display font-extrabold text-brand-400 group-hover:bg-brand-500 group-hover:text-[#fff] group-hover:border-brand-500 transition-all">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{s.title}</h3>
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <ul className="mt-8 grid sm:grid-cols-2 gap-2.5 text-sm text-slate-300">
              {['Free to get started', 'Works on every device', 'Export your data anytime', 'Private and secure'].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-400" /> {t}</li>
              ))}
            </ul>
            <Link to="/register" className="btn-primary mt-8 !px-8">Create free account <ArrowRight className="w-4 h-4" /></Link>
          </Reveal>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="relative bg-slate-900/50 border-t border-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="section-eyebrow">Testimonials</span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white">Real people. Real progress.</h2>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.12}>
                <div className="glass-card rounded-2xl p-7 h-full hover-lift flex flex-col">
                  <Quote className="w-8 h-8 text-brand-500/60" />
                  <p className="mt-4 text-slate-300 leading-relaxed flex-1">{t.comment}</p>
                  <div className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-800">
                    <Img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full ring-2 ring-brand-500/40" />
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role}</p>
                    </div>
                    <div className="ml-auto flex text-amber-400">{[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-current" />)}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
