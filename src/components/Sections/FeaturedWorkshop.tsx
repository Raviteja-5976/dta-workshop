"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Video, Users2, Brain, ChevronRight, Sparkles } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';
import { NeoButton } from '@/components/UI/NeoButton';
import { workshopsData, Workshop } from '@/data/workshops';

export const FeaturedWorkshop = ({ workshops = workshopsData }: { workshops?: Workshop[] }) => {
  const router = useRouter();

  // Find the portfolio workshop
  const workshop = workshops.find(w => w.slug === 'build-your-portfolio') || workshops[0];

  const handleCardClick = () => {
    router.push(`/workshops/${workshop.slug}`);
  };

  return (
    <section id="workshops" className="py-20 md:py-32 bg-primary-orange border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="absolute top-10 right-10 text-white opacity-25 font-display font-extrabold text-7xl select-none hidden md:block">
        FEATURED
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10 text-center">
        {/* Title */}
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-block border-2 border-deep-navy bg-yellow px-4 py-1.5 rounded-full font-display font-bold text-sm text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
            <Sparkles className="w-4 h-4 text-deep-navy inline-block mr-1.5 animate-spin" />
            Spotlight
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl text-white leading-none drop-shadow-[2.5px_2.5px_0_#1B1F3B]">
            Featured Workshop
          </h2>
        </div>

        {/* Clean Workshop Card Preview */}
        <div onClick={handleCardClick} className="cursor-pointer group text-left">
          <NeoCard
            variant="white"
            borderSize="thick"
            shadowSize="large"
            className="p-6 md:p-10 hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_#1B1F3B] transition-all duration-300 relative border-4"
          >
            {/* Top Row: Title, Status Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-deep-navy pb-6 mb-6">
              <div className="space-y-2">
                <span className="font-display font-black text-xs uppercase tracking-wider text-primary-orange bg-yellow/20 border-2 border-primary-orange px-3 py-1 rounded-full">
                  {workshop.category}
                </span>
                <h3 className="font-display font-black text-3xl md:text-4xl text-deep-navy leading-none mt-1">
                  {workshop.title}
                </h3>
              </div>
              <div className="shrink-0">
                <span className="px-4 py-2 border-3 border-deep-navy rounded-xl font-display font-black text-sm uppercase bg-mint shadow-[3px_3px_0px_0px_#1B1F3B] text-deep-navy animate-pulse">
                  {workshop.status} BATCH
                </span>
              </div>
            </div>

            {/* Middle Row: Description & Image Illustration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Info Details */}
              <div className="lg:col-span-7 space-y-6">
                <p className="font-sans font-semibold text-lg text-deep-navy/80 leading-relaxed">
                  {workshop.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Date', val: workshop.date, icon: Calendar },
                    { label: 'Sessions', val: `${workshop.sessions} Live Classes`, icon: Video },
                    { label: 'Seats Remaining', val: `${workshop.remainingSeats} / ${workshop.seatLimit}`, icon: Users2 },
                    { label: 'Difficulty', val: workshop.difficulty, icon: Brain },
                  ].map((spec, i) => {
                    const Icon = spec.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 border-2 border-deep-navy bg-bg-cream p-3 rounded-xl">
                        <div className="p-1.5 border border-deep-navy bg-yellow rounded-lg shrink-0">
                          <Icon className="w-5 h-5 text-deep-navy" />
                        </div>
                        <div>
                          <p className="font-sans font-bold text-[10px] text-deep-navy/50 uppercase leading-none">{spec.label}</p>
                          <p className="font-display font-bold text-sm text-deep-navy mt-1">{spec.val}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Graphic Mockup side */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="border-3 border-deep-navy bg-yellow rounded-3xl p-6 shadow-neo w-full text-center relative overflow-hidden -rotate-1 group-hover:rotate-0 transition-transform">
                  <div className="space-y-4">
                    <span className="font-sans font-black text-xs uppercase text-deep-navy/55">SPECIAL OFFER</span>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="font-display font-black text-5xl text-deep-navy">₹{workshop.price}</span>
                      {workshop.originalPrice && (
                        <span className="font-display font-bold text-xl text-deep-navy/40 line-through">
                          ₹{workshop.originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="font-sans font-bold text-xs text-deep-navy/70 uppercase">
                      Includes life-time recordings & Slack access.
                    </p>

                    <div className="flex flex-col gap-3 pt-2">
                      <NeoButton
                        variant="orange"
                        size="md"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/workshops/${workshop.slug}`);
                        }}
                      >
                        Register Now
                        <ChevronRight className="w-4 h-4 ml-1 stroke-[3]" />
                      </NeoButton>

                      <NeoButton
                        variant="white"
                        size="md"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/workshops/${workshop.slug}`);
                        }}
                      >
                        View Details
                      </NeoButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NeoCard>
        </div>
      </div>
    </section>
  );
};
export default FeaturedWorkshop;
