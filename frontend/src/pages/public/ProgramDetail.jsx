import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  Dumbbell, HeartPulse, Flame, Target, Trophy, Zap, Activity, ShieldCheck, Sparkles,
  TrendingUp, ArrowRight, ArrowLeft, CheckCircle2, ChevronDown,
} from 'lucide-react';
import PageHero from '../../components/ui/PageHero';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import { useAuth } from '../../context/AuthContext';
import { PROGRAMS, getProgram } from '../../data/programs';

const ICONS = {
  dumbbell: Dumbbell,
  heart: HeartPulse,
  flame: Flame,
  target: Target,
  trophy: Trophy,
  zap: Zap,
  activity: Activity,
  shield: ShieldCheck,
  sparkles: Sparkles,
  trend: TrendingUp,
};

function SectionHeading({ title, intro }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h2>
      {intro && <p className="mt-3 text-slate-400 leading-relaxed">{intro}</p>}
    </div>
  );
}

export default function ProgramDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const program = getProgram(slug);

  if (!program) return <Navigate to="/" replace />;

  const ctaPath = user ? program.tracker.path : '/register';
  const ctaLabel = user ? program.tracker.label : 'Start tracking free';
  const others = PROGRAMS.filter((p) => p.slug !== program.slug);

  return (
    <div className="relative bg-slate-950 text-slate-100 overflow-hidden">
      <PageHero
        eyebrow={program.tag}
        title={program.fullTitle}
        subtitle={program.subtitle}
        image={program.heroImg}
      >
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={ctaPath} className="btn-primary !px-7 !py-3.5 group">
            {ctaLabel}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/features" className="btn-ghost !px-7 !py-3.5">
            Explore all features
          </Link>
        </div>
      </PageHero>

      {/* Quick facts */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <Reveal>
          <dl className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl bg-slate-900 border border-slate-800 divide-x divide-y lg:divide-y-0 divide-slate-800 overflow-hidden">
            {program.facts.map((f) => (
              <div key={f.label} className="p-5 sm:p-6">
                <dt className="text-xs text-slate-500">{f.label}</dt>
                <dd className="mt-1.5 text-sm sm:text-base font-semibold text-white">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20">
        {/* Overview + benefits */}
        <section className="grid lg:grid-cols-5 gap-10 lg:gap-14">
          <Reveal className="lg:col-span-2 space-y-4">
            <SectionHeading title={`What is ${program.title.toLowerCase()}?`} />
            {program.overview.map((para) => (
              <p key={para.slice(0, 24)} className="text-slate-400 leading-relaxed">
                {para}
              </p>
            ))}
          </Reveal>

          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
            {program.benefits.map((b, i) => {
              const Icon = ICONS[b.icon] || Target;
              return (
                <Reveal key={b.title} delay={i * 0.07}>
                  <div className="h-full rounded-2xl bg-slate-900 border border-slate-800 p-6">
                    <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-white">{b.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{b.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Movements / building blocks */}
        <section className="space-y-8">
          <Reveal>
            <SectionHeading title={program.movementsTitle} intro={program.movementsIntro} />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {program.movements.map((m, i) => (
              <Reveal key={m.name} delay={(i % 3) * 0.07}>
                <div className="h-full rounded-xl bg-slate-900/70 border border-slate-800 p-5 hover:border-brand-500/40 transition-colors">
                  <h3 className="text-base font-bold text-white">{m.name}</h3>
                  <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{m.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Sample week / day */}
        <section className="space-y-8">
          <Reveal>
            <SectionHeading title={program.weekTitle} intro={program.weekIntro} />
          </Reveal>
          <Reveal>
            <ul className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
              {program.week.map((d) => (
                <li key={d.label} className="grid grid-cols-[84px_1fr] sm:grid-cols-[120px_200px_1fr] gap-x-4 gap-y-1 px-5 py-4 items-baseline">
                  <span className="text-sm font-bold text-brand-400">{d.label}</span>
                  <span className="text-sm font-semibold text-white">{d.focus}</span>
                  <span className="col-start-2 sm:col-start-auto text-sm text-slate-400">{d.detail}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* Tracking + tips */}
        <section className="grid lg:grid-cols-2 gap-6">
          <Reveal>
            <div className="h-full rounded-2xl bg-slate-900 border border-slate-800 p-7">
              <h2 className="text-xl font-bold text-white">What FitPulse tracks for you</h2>
              <ul className="mt-5 space-y-3">
                {program.tracks.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-px" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to={ctaPath} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:gap-3 transition-all">
                {ctaLabel} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="h-full rounded-2xl bg-slate-900 border border-slate-800 p-7">
              <h2 className="text-xl font-bold text-white">Tips to get more from it</h2>
              <ul className="mt-5 space-y-3">
                {program.tips.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="grid lg:grid-cols-5 gap-10 lg:gap-14">
          <Reveal className="lg:col-span-2">
            <SectionHeading title="Common questions" intro="Quick answers to what people ask most when they start." />
          </Reveal>
          <Reveal className="lg:col-span-3">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
              {program.faqs.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-sm sm:text-base font-semibold text-white hover:bg-slate-800/40 transition-colors [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Other programs */}
        <section className="space-y-8">
          <Reveal>
            <SectionHeading title="Explore other programs" />
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {others.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link
                  to={`/programs/${p.slug}`}
                  className="group relative block rounded-2xl overflow-hidden aspect-[4/3] img-zoom"
                >
                  <Img src={p.img} alt={p.title} className="absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-[#fff]">
                    <p className="text-[11px] uppercase tracking-widest text-brand-400 font-bold">{p.tag}</p>
                    <h3 className="mt-1 text-xl font-extrabold">{p.title}</h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                      Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <Reveal>
          <section className="rounded-3xl bg-slate-900 border border-slate-800 px-6 py-12 sm:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Ready to start with {program.title.toLowerCase()}?</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              Create a free account and log your first session in under a minute.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={ctaPath} className="btn-primary !px-7 !py-3.5">
                {ctaLabel}
              </Link>
              <Link to="/" className="btn-ghost !px-7 !py-3.5">
                <ArrowLeft className="w-4 h-4" /> Back to home
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
