import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { NeoButton } from '@/components/UI/NeoButton';
import Link from 'next/link';

export const CTA = () => {
  return (
    <section className="py-20 md:py-32 bg-primary-orange border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern text-center">
      {/* Decos */}
      <div className="absolute top-10 left-10 text-yellow animate-float opacity-30 select-none text-8xl font-display font-extrabold">*</div>
      <div className="absolute bottom-10 right-10 text-white animate-float-delayed opacity-30 select-none text-7xl font-display font-extrabold">&lt;/&gt;</div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 border-2 border-deep-navy bg-yellow px-4 py-1 rounded-full font-display font-bold text-sm text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
          <Sparkles className="w-4 h-4 text-deep-navy" />
          <span>JOIN THE NEXT BATCH</span>
        </div>

        <h2 className="font-display font-black text-5xl md:text-7xl text-white leading-none drop-shadow-[3px_3px_0_#1B1F3B]">
          Ready To Build With Us?
        </h2>

        <p className="font-sans font-bold text-lg md:text-xl text-white max-w-xl mx-auto leading-relaxed drop-shadow-[1px_1px_0_#1B1F3B]">
          Stop watching tutorials. Secure your seat today and deploy a live project with real mentor feedback.
        </p>

        <div className="flex flex-wrap gap-4 items-center justify-center pt-4">
          <Link href="/workshops">
            <NeoButton variant="yellow" size="lg">
              Register Now
              <ArrowRight className="w-5 h-5 ml-1 stroke-[3]" />
            </NeoButton>
          </Link>
          <a href="#workshops">
            <NeoButton variant="white" size="lg">
              Browse Workshops
            </NeoButton>
          </a>
        </div>
      </div>
    </section>
  );
};
export default CTA;
