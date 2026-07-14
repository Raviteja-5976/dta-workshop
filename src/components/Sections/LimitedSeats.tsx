import React from 'react';
import { MessageSquareReply, ShieldAlert, GitPullRequest, Code2 } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';

export const LimitedSeats = () => {
  const points = [
    {
      title: 'Individual Q&A Answered',
      desc: 'No query goes unanswered. Instructors take breaks to solve individual bugs and unmute students to talk.',
      icon: MessageSquareReply,
    },
    {
      title: 'Custom Pull Request Reviews',
      desc: 'We review your assignments and suggest improvements directly inside your GitHub repositories.',
      icon: GitPullRequest,
    },
    {
      title: 'No Student Left Behind',
      desc: 'If you get stuck on a compiler or CSS bug, our mentors help debug it live so you can keep building.',
      icon: Code2,
    },
  ];

  return (
    <section className="py-20 bg-bg-cream border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <NeoCard
          variant="mint"
          borderSize="thick"
          shadowSize="large"
          className="p-8 md:p-12 text-left -rotate-1 relative overflow-hidden"
        >
          {/* Decorative Corner Badge */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow border-4 border-deep-navy rounded-full rotate-12 flex items-center justify-center font-display font-black text-xs text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] select-none">
            LIMITED!
          </div>

          <div className="space-y-8">
            {/* Title & Info */}
            <div className="space-y-4 max-w-2xl">
              <h2 className="font-display font-black text-3xl md:text-5xl text-deep-navy leading-none">
                Why Only 50 Students?
              </h2>
              <p className="font-sans font-bold text-lg md:text-xl text-deep-navy/90 leading-relaxed">
                Unlike large webinars with thousands of passive listeners, every workshop we run has strictly capped seats. We prioritize quality over scale.
              </p>
            </div>

            {/* Points list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t-3 border-deep-navy">
              {points.map((pt, i) => {
                const Icon = pt.icon;
                return (
                  <div key={i} className="space-y-3 bg-white/40 p-4 rounded-2xl border-2 border-deep-navy">
                    <div className="w-10 h-10 border-2 border-deep-navy bg-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1B1F3B] shrink-0">
                      <Icon className="w-5 h-5 text-deep-navy stroke-[2.5]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-lg text-deep-navy leading-tight">
                        {pt.title}
                      </h4>
                      <p className="font-sans font-semibold text-xs md:text-sm text-deep-navy/80 leading-relaxed">
                        {pt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Callout banner */}
            <div className="border-3 border-deep-navy bg-yellow p-4 rounded-xl flex items-center gap-3 shadow-[2px_2px_0px_0px_#1B1F3B]">
              <ShieldAlert className="w-5 h-5 text-deep-navy shrink-0 stroke-[2.5]" />
              <span className="font-sans font-black text-sm text-deep-navy">
                Strict Capping: Once 50 seats are filled, registrations close automatically. No exceptions.
              </span>
            </div>
          </div>
        </NeoCard>
      </div>
    </section>
  );
};
export default LimitedSeats;
