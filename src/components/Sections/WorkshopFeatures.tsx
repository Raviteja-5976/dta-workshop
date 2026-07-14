import React from 'react';
import { Users2, ShieldCheck, Laptop, FileCheck, HelpCircle, GraduationCap } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';

export const WorkshopFeatures = () => {
  const features = [
    {
      title: 'Limited Seats',
      desc: 'Strictly capped at 50 students per batch to ensure direct mentor-student interaction and doubt-solving.',
      variant: 'yellow',
      icon: Users2,
      rotate: 'left',
    },
    {
      title: 'Practical Sessions',
      desc: 'No theoretical slides. We spend 100% of the session time writing code and fixing compiler errors together.',
      variant: 'sky',
      icon: Laptop,
      rotate: 'right',
    },
    {
      title: 'Assignments',
      desc: 'Get hands-on coding tasks after every session to build muscle memory and validate your knowledge.',
      variant: 'coral',
      icon: FileCheck,
      rotate: 'left',
    },
    {
      title: 'Mentor Support',
      desc: 'Receive direct pull request reviews, code feedback, and async support from experienced team leads.',
      variant: 'mint',
      icon: HelpCircle,
      rotate: 'right',
    },
    {
      title: 'Project Based',
      desc: 'Build a production-grade application that you deploy live to show off in your developer portfolio.',
      variant: 'orange',
      icon: ShieldCheck,
      rotate: 'left',
    },
    {
      title: 'Certificate',
      desc: 'Earn a verified DevTrackAcademy Workshop completion credential to showcase on LinkedIn and resume.',
      variant: 'white',
      icon: GraduationCap,
      rotate: 'right',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-display font-extrabold text-4xl md:text-6xl text-deep-navy leading-none">
            What Makes Our <span className="relative inline-block px-3 py-1 bg-sky border-3 border-deep-navy rounded-xl shadow-[3px_3px_0_0_#1B1F3B] rotate-[-1.5deg]">Workshops</span> Different?
          </h2>
          <p className="font-sans font-bold text-lg text-deep-navy/70 uppercase tracking-wide">
            Designed for programmers who want to learn by building.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <NeoCard
                key={i}
                variant={feature.variant as any}
                borderSize="normal"
                shadowSize="normal"
                hoverEffect={true}
                hoverRotate={feature.rotate as any}
                className="p-8 flex flex-col justify-between items-start gap-6 h-full text-left"
              >
                {/* Icon wrapper */}
                <div className="w-12 h-12 rounded-2xl border-3 border-deep-navy bg-white flex items-center justify-center shadow-[3px_3px_0px_0px_#1B1F3B]">
                  <Icon className="w-6 h-6 text-deep-navy stroke-[2.5]" />
                </div>

                <div className="space-y-3">
                  <h3 className="font-display font-black text-2xl md:text-3xl text-deep-navy tracking-tight leading-none">
                    {feature.title}
                  </h3>
                  <p className="font-sans font-semibold text-base leading-relaxed text-deep-navy/90">
                    {feature.desc}
                  </p>
                </div>
              </NeoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default WorkshopFeatures;
