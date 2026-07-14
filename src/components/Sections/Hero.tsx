"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Terminal as TerminalIcon, CheckSquare, Laptop, Code2, Users } from 'lucide-react';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import Link from 'next/link';

export const Hero = () => {
  return (
    <section id="home" className="relative min-h-[calc(100vh-80px)] flex items-center py-12 md:py-20 overflow-hidden bg-bg-cream bg-grid-pattern border-b-4 border-deep-navy">
      {/* Decorative Floating Shapes */}
      <div className="absolute top-10 left-10 text-primary-orange animate-float opacity-30 select-none hidden md:block">
        <Sparkles size={48} />
      </div>
      <div className="absolute bottom-20 left-[15%] text-sky animate-float-delayed opacity-40 select-none hidden md:block">
        <span className="font-display font-extrabold text-7xl">&lt;/&gt;</span>
      </div>
      <div className="absolute top-20 right-10 text-coral animate-float-slow opacity-30 select-none hidden md:block">
        <span className="font-display font-extrabold text-8xl">*</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Side Content */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 border-3 border-deep-navy bg-yellow px-4 py-1.5 rounded-full font-display font-bold text-sm md:text-base shadow-[2px_2px_0px_0px_#1B1F3B] rotate-[-1deg]">
              <Sparkles className="w-4 h-4 text-deep-navy animate-spin" />
              <span>LIVE PRACTICAL BATCHES</span>
            </div>

            {/* Giant Heading */}
            <h1 className="font-display font-extrabold text-5xl md:text-7xl xl:text-8xl text-deep-navy leading-none tracking-tight">
              <span className="relative inline-block mr-2 rotate-[-2deg] bg-primary-orange text-white border-4 border-deep-navy px-4 py-1 shadow-[4px_4px_0_0_#1B1F3B] rounded-2xl">
                Build.
              </span>
              <br className="md:hidden" />
              Break.
              <br />
              Learn. Repeat.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl font-semibold text-deep-navy/90 max-w-xl leading-relaxed font-sans"
          >
            Join live instructor-led workshops where you build real projects, complete practical assignments, and receive personal guidance in small batches of maximum 50 students.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <a href="#workshops">
              <NeoButton variant="orange" size="lg">
                Browse Workshops
              </NeoButton>
            </a>
            <Link href="/auth">
              <NeoButton variant="white" size="lg">
                Register Now
              </NeoButton>
            </Link>
          </motion.div>
        </div>

        {/* Right Side Visuals */}
        <div className="lg:col-span-6 relative w-full flex items-center justify-center">
          {/* Main Visual Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-lg relative"
          >
            {/* Background solid offset shadow layer for the whole group */}
            <div className="absolute inset-0 bg-deep-navy rounded-[32px] translate-x-4 translate-y-4 -z-10 border-4 border-deep-navy" />

            {/* Main Laptop/Dashboard Screen container */}
            <div className="bg-bg-cream border-4 border-deep-navy rounded-[32px] p-6 space-y-6 relative overflow-hidden">
              {/* Dash Header */}
              <div className="flex items-center justify-between border-b-3 border-deep-navy pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-coral border-2 border-deep-navy" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow border-2 border-deep-navy" />
                  <div className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-deep-navy" />
                </div>
                <div className="border-2 border-deep-navy bg-white px-3 py-0.5 rounded-lg text-xs font-mono font-bold text-deep-navy/60">
                  workshop.devtrackacademy.dev
                </div>
              </div>

              {/* Grid content representing classroom/coding layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Code Window Mockup */}
                <NeoCard variant="navy" borderSize="normal" shadowSize="none" className="p-3 font-mono text-[10px] space-y-1 relative h-40">
                  <div className="flex items-center justify-between border-b border-white/20 pb-1 mb-2">
                    <span className="text-mint font-bold flex items-center gap-1"><Code2 size={10} /> App.tsx</span>
                    <span className="text-white/40">TypeScript</span>
                  </div>
                  <p className="text-coral"><span className="text-sky">import</span> React <span className="text-sky">from</span> <span className="text-yellow">&apos;react&apos;</span>;</p>
                  <p className="text-sky">function <span className="text-yellow">WorkshopApp</span>() &#123;</p>
                  <p className="text-white/70 pl-3">return (</p>
                  <p className="text-mint pl-6">&lt;<span className="text-coral">div</span> className=<span className="text-yellow">&quot;font-bold&quot;</span>&gt;</p>
                  <p className="text-white pl-9">Build Project in Live Class!</p>
                  <p className="text-mint pl-6">&lt;/<span className="text-coral">div</span>&gt;</p>
                  <p className="text-white/70 pl-3">);</p>
                  <p className="text-sky">&#125;</p>
                </NeoCard>

                {/* AI Assistant chat Mockup */}
                <NeoCard variant="white" borderSize="normal" shadowSize="none" className="p-3 space-y-2 text-xs flex flex-col justify-between h-40">
                  <div className="flex items-center gap-1.5 font-display font-bold border-b border-deep-navy/10 pb-1 text-deep-navy">
                    <Sparkles className="w-3 h-3 text-primary-orange" />
                    <span>DTA AI Mentor</span>
                  </div>
                  <div className="space-y-1.5 flex-1 overflow-y-auto">
                    <div className="bg-bg-cream border border-deep-navy rounded-lg p-1.5 text-[10px] font-semibold text-deep-navy/80">
                      Write prompts for Tailwind styles.
                    </div>
                    <div className="bg-mint/30 border border-deep-navy rounded-lg p-1.5 text-[10px] font-semibold text-deep-navy">
                      Use `shadow-neo` for the brutalist effect!
                    </div>
                  </div>
                </NeoCard>
              </div>

              {/* Terminal Window & Project Status */}
              <div className="grid grid-cols-12 gap-4">
                {/* Project Task board list */}
                <NeoCard variant="yellow" borderSize="normal" shadowSize="none" className="col-span-5 p-3 space-y-2">
                  <span className="font-display font-bold text-xs flex items-center gap-1"><CheckSquare size={12} /> Project Board</span>
                  <div className="space-y-1 text-[10px] font-bold">
                    <div className="flex items-center gap-1 text-deep-navy/60 line-through">
                      <input type="checkbox" defaultChecked className="accent-deep-navy" />
                      <span>Setup IDE</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="checkbox" defaultChecked className="accent-deep-navy" />
                      <span>AI Coding</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="checkbox" className="accent-deep-navy" />
                      <span>Deploy App</span>
                    </div>
                  </div>
                </NeoCard>

                {/* Simulated Live Terminal */}
                <NeoCard variant="navy" borderSize="normal" shadowSize="none" className="col-span-7 p-3 font-mono text-[9px] text-white/95 space-y-1">
                  <div className="flex items-center gap-1.5 text-white/50 border-b border-white/10 pb-1">
                    <TerminalIcon size={10} />
                    <span>terminal - bash</span>
                  </div>
                  <p className="text-white/60">$ npm run deploy</p>
                  <p className="text-mint">✓ Uploaded assets successfully</p>
                  <p className="text-sky">→ Live at: portfolio-ai.dta.dev</p>
                  <p className="text-yellow">Running audit checks...</p>
                </NeoCard>
              </div>
            </div>

            {/* Overlapping Floating Cards for high-fidelity Neo Brutalism */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-8 w-44"
            >
              <NeoCard variant="mint" className="p-3 shadow-neo border-3 flex items-center gap-2 rotate-6">
                <Users className="w-6 h-6 text-deep-navy shrink-0" />
                <div>
                  <h4 className="font-display font-bold text-xs leading-none">Max Capacity</h4>
                  <p className="font-sans font-bold text-lg text-primary-orange">50 Students</p>
                </div>
              </NeoCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-8 w-48"
            >
              <NeoCard variant="coral" className="p-3 shadow-neo border-3 flex items-center gap-2 -rotate-3 text-white">
                <Laptop className="w-6 h-6 text-white shrink-0" />
                <div>
                  <h4 className="font-display font-bold text-xs leading-none">Real Project</h4>
                  <p className="font-sans font-bold text-sm text-yellow">100% Practical</p>
                </div>
              </NeoCard>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
