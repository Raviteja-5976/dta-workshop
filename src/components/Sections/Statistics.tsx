"use client";

import React from 'react';
import { Users, Video, Code, CheckSquare, MessageSquare, Briefcase } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';

export const Statistics = () => {
  const stats = [
    { value: '50 Max', label: 'Students per Batch', bg: 'mint', icon: Users },
    { value: '4 Live', label: 'Interactive Sessions', bg: 'sky', icon: Video },
    { value: '100%', label: 'Hands-On Practical', bg: 'yellow', icon: Code },
    { value: '4+', label: 'Assignments Checked', bg: 'coral', icon: CheckSquare },
    { value: '24/7', label: 'Q&A Chat Support', bg: 'orange', icon: MessageSquare },
    { value: '1 Solid', label: 'Portfolio Project', bg: 'white', icon: Briefcase },
  ];

  return (
    <section className="bg-white border-b-4 border-deep-navy py-12 md:py-16 relative overflow-hidden bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <NeoCard
                key={index}
                variant={stat.bg as any}
                borderSize="normal"
                shadowSize="normal"
                hoverEffect={true}
                hoverRotate={index % 2 === 0 ? 'left' : 'right'}
                className="p-6 flex flex-col justify-between items-center text-center group h-full"
              >
                {/* Icon wrapper */}
                <div className="w-12 h-12 rounded-xl border-2 border-deep-navy bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_#1B1F3B] group-hover:rotate-12 transition-transform mb-4">
                  <Icon className="w-6 h-6 text-deep-navy" />
                </div>
                
                {/* Stats Numbers */}
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight leading-none text-deep-navy">
                    {stat.value}
                  </h3>
                  <p className="font-sans font-bold text-xs md:text-sm text-deep-navy/80 uppercase tracking-wide">
                    {stat.label}
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
export default Statistics;
