import React from 'react';
import { X, Check, Laptop2 } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';

export const Philosophy = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-bg-cream border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      {/* Decorative Star */}
      <div className="absolute top-10 right-20 text-yellow animate-float opacity-30 select-none text-8xl font-display font-extrabold">*</div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-display font-extrabold text-4xl md:text-6xl text-deep-navy leading-none">
            Workshops Built Around <span className="relative inline-block px-3 py-1 bg-yellow border-3 border-deep-navy rounded-xl shadow-[3px_3px_0_0_#1B1F3B] rotate-[1.5deg]">Practice.</span>
          </h2>
          <p className="font-sans font-bold text-lg text-deep-navy/70 uppercase tracking-wide">
            Stop watching lectures. Start writing code.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-stretch">
          {/* Traditional Card */}
          <NeoCard
            variant="coral"
            borderSize="thick"
            shadowSize="large"
            className="p-8 md:p-10 flex flex-col justify-between -rotate-1 relative"
          >
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full border-3 border-deep-navy bg-white flex items-center justify-center font-display font-black text-2xl text-coral shadow-[2px_2px_0px_0px_#1B1F3B]">
              OLD
            </div>
            
            <div className="space-y-6">
              <h3 className="font-display font-extrabold text-3xl text-white border-b-3 border-deep-navy pb-4">
                Traditional Webinars
              </h3>
              
              <ul className="space-y-4 font-sans font-bold text-lg text-deep-navy">
                {[
                  'Watch an instructor code passively',
                  'Listen to slides and theory definitions',
                  'Leave with a recording you never rewatch',
                  'Zero actual project setup or coding',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white/40 p-3 rounded-xl border-2 border-deep-navy">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-deep-navy flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-coral stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 text-center font-display font-extrabold text-xl text-deep-navy bg-white/30 rounded-xl p-3 border-2 border-deep-navy">
              Result: Passive Forgetfulness 😴
            </div>
          </NeoCard>

          {/* DevTrackAcademy Card */}
          <NeoCard
            variant="mint"
            borderSize="thick"
            shadowSize="large"
            className="p-8 md:p-10 flex flex-col justify-between rotate-1 relative"
          >
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full border-3 border-deep-navy bg-yellow flex items-center justify-center font-display font-black text-2xl text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B]">
              NEW
            </div>

            <div className="space-y-6">
              <h3 className="font-display font-extrabold text-3xl text-deep-navy border-b-3 border-deep-navy pb-4">
                DTA Workshops
              </h3>

              <ul className="space-y-4 font-sans font-bold text-lg text-deep-navy">
                {[
                  'Build complete projects from scratch live',
                  'Practice assignments after each session',
                  'Receive custom feedback on repository PRs',
                  'Learn AI workflows like Cursor/Prompting',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border-2 border-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B]">
                    <div className="w-6 h-6 rounded-full bg-yellow border-2 border-deep-navy flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-deep-navy stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 text-center font-display font-extrabold text-xl text-deep-navy bg-yellow rounded-xl p-3 border-2 border-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B]">
              Result: Production Project live! 🚀
            </div>
          </NeoCard>
        </div>
      </div>
    </section>
  );
};
export default Philosophy;
