import React from 'react';
import { ArrowRight, ArrowDown, UserPlus, Laptop, CheckSquare, MessageSquare, Award, RefreshCw, Layers } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';

export const LearningJourney = () => {
  const steps = [
    { label: 'Register', desc: 'Secure your seat', icon: UserPlus, bg: 'white' },
    { label: 'Live Session', desc: 'Code along live', icon: Laptop, bg: 'yellow' },
    { label: 'Assignment', desc: 'Build it yourself', icon: CheckSquare, bg: 'sky' },
    { label: 'Feedback', desc: 'Get review/help', icon: MessageSquare, bg: 'mint' },
    { label: 'Next Session', desc: 'Iterate & learn', icon: RefreshCw, bg: 'white' },
    { label: 'Full Project', desc: 'Finalize deploy', icon: Layers, bg: 'coral' },
    { label: 'Certificate', desc: 'Claim credential', icon: Award, bg: 'yellow' },
  ];

  return (
    <section className="py-20 md:py-32 bg-bg-cream border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-block border-2 border-deep-navy bg-mint px-4 py-1.5 rounded-full font-display font-bold text-sm text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
            THE PROCESS
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl text-deep-navy leading-none">
            Your Learning <span className="relative inline-block px-3 py-1 bg-primary-orange text-white border-3 border-deep-navy rounded-xl shadow-[3px_3px_0_0_#1B1F3B] rotate-[-1deg]">Journey</span>
          </h2>
          <p className="font-sans font-bold text-lg text-deep-navy/70 uppercase tracking-wide">
            How we take you from setup to a deployed application.
          </p>
        </div>

        {/* Desktop Horizontal flow */}
        <div className="hidden xl:flex items-center justify-between gap-2 max-w-6xl mx-auto relative px-4">
          {/* Connector Line */}
          <div className="absolute top-[48px] left-[5%] right-[5%] h-[4px] bg-deep-navy -z-10" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center space-y-3 relative z-10 w-28 group">
                  <div className={`w-20 h-20 rounded-2xl border-3 border-deep-navy bg-${step.bg} flex items-center justify-center shadow-neo group-hover:-translate-y-1 group-hover:rotate-3 transition-all duration-200`}>
                    <Icon className="w-8 h-8 text-deep-navy stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-base text-deep-navy leading-tight">{step.label}</h4>
                    <p className="font-sans font-semibold text-[10px] text-deep-navy/70 mt-0.5">{step.desc}</p>
                  </div>
                </div>
                {/* Arrow */}
                {i < steps.length - 1 && (
                  <div className="w-8 h-8 border-2 border-deep-navy bg-white rounded-lg flex items-center justify-center shadow-[2px_2px_0_0_#1B1F3B] rotate-[-6deg] z-10 shrink-0">
                    <ArrowRight className="w-4 h-4 text-deep-navy stroke-[3]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile / Tablet Vertical flow */}
        <div className="xl:hidden flex flex-col items-center gap-6 max-w-md mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={i}>
                <NeoCard
                  variant={step.bg as any}
                  borderSize="normal"
                  shadowSize="normal"
                  className="p-5 flex items-center gap-4 w-full text-left"
                >
                  <div className="w-12 h-12 rounded-xl border-2 border-deep-navy bg-white flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#1B1F3B]">
                    <Icon className="w-6 h-6 text-deep-navy stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-sans font-extrabold text-[10px] text-deep-navy/50 uppercase">Step {i+1}</span>
                    <h4 className="font-display font-black text-lg text-deep-navy leading-tight">{step.label}</h4>
                    <p className="font-sans font-semibold text-xs text-deep-navy/80">{step.desc}</p>
                  </div>
                </NeoCard>
                {/* Arrow */}
                {i < steps.length - 1 && (
                  <div className="w-8 h-8 border-2 border-deep-navy bg-yellow rounded-lg flex items-center justify-center shadow-[2px_2px_0_0_#1B1F3B] rotate-6 shrink-0 my-1">
                    <ArrowDown className="w-4 h-4 text-deep-navy stroke-[3]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default LearningJourney;
