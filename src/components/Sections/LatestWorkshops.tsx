"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Brain, Users2, ArrowRight, Sparkles } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';
import { NeoButton } from '@/components/UI/NeoButton';
import { workshopsData, Workshop } from '@/data/workshops';

export const LatestWorkshops = ({ workshops = workshopsData }: { workshops?: Workshop[] }) => {
  const router = useRouter();

  // Select first 3 workshops representing the latest additions
  const latestList = workshops.slice(0, 3);

  const handleCardClick = (slug: string) => {
    router.push(`/workshops/${slug}`);
  };

  return (
    <section className="py-20 md:py-32 bg-white border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="absolute top-10 left-10 text-primary-orange opacity-20 font-display font-extrabold text-7xl select-none hidden md:block">
        LATEST
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 relative z-10 text-center">
        {/* Title */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-block border-2 border-deep-navy bg-mint px-4 py-1.5 rounded-full font-display font-bold text-sm text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
            EXPLORE THE BATCHES
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl text-deep-navy leading-none">
            Latest Workshops
          </h2>
          <p className="font-sans font-bold text-lg text-deep-navy/70 uppercase tracking-wide">
            Hands-on classes where you actively write code and build software.
          </p>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
          {latestList.map((shop, i) => {
            const bgClass = i % 3 === 0 ? 'yellow' : i % 3 === 1 ? 'sky' : 'mint';
            const rotateDir = i % 2 === 0 ? 'left' : 'right';

            return (
              <div key={shop.slug} onClick={() => handleCardClick(shop.slug)} className="cursor-pointer h-full">
                <NeoCard
                  variant="white"
                  borderSize="normal"
                  shadowSize="normal"
                  hoverEffect={true}
                  hoverRotate={rotateDir}
                  className="p-6 flex flex-col justify-between items-start gap-6 h-full border-3"
                >
                  {/* Category & Status Row */}
                  <div className="w-full flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 border-2 border-deep-navy bg-${bgClass} rounded-lg font-display font-black text-xs uppercase text-deep-navy`}>
                      {shop.category}
                    </span>
                    <span className={`px-2 py-0.5 border border-deep-navy rounded-md font-sans font-black text-[9px] uppercase ${
                      shop.status === 'Live' ? 'bg-success text-white animate-pulse' :
                      shop.status === 'Upcoming' ? 'bg-yellow text-deep-navy' : 'bg-deep-navy/10 text-deep-navy'
                    }`}>
                      {shop.status}
                    </span>
                  </div>

                  {/* Thumbnail Mockup */}
                  <div className="w-full h-36 border-2 border-deep-navy rounded-2xl bg-bg-cream flex flex-col justify-between p-4 relative overflow-hidden bg-grid-pattern shadow-neo-inset">
                    <div className="w-6 h-6 rounded-full bg-white border border-deep-navy flex items-center justify-center font-display font-black text-[10px]">
                      {i + 1}
                    </div>
                    <span className="font-display font-black text-xl text-deep-navy/30 select-none block text-right rotate-[-4deg]">
                      {shop.slug.toUpperCase()}
                    </span>
                  </div>

                  {/* Title & Short Desc */}
                  <div className="space-y-2">
                    <h3 className="font-display font-black text-xl md:text-2xl text-deep-navy leading-none">
                      {shop.title}
                    </h3>
                    <p className="font-sans font-semibold text-sm text-deep-navy/80 line-clamp-3 leading-relaxed">
                      {shop.description}
                    </p>
                  </div>

                  {/* Meta Details */}
                  <div className="w-full grid grid-cols-3 gap-2 border-t-2 border-deep-navy/10 pt-4 font-semibold text-[10px]">
                    <div>
                      <span className="text-deep-navy/40 uppercase block leading-none">Date</span>
                      <span className="text-deep-navy text-xs font-display font-bold mt-1 block leading-none">{shop.date}</span>
                    </div>
                    <div>
                      <span className="text-deep-navy/40 uppercase block leading-none">Seats Left</span>
                      <span className="text-deep-navy text-xs font-display font-bold mt-1 block leading-none">
                        {shop.status === 'Completed' ? 'Sold Out' : `${shop.remainingSeats} Seats`}
                      </span>
                    </div>
                    <div>
                      <span className="text-deep-navy/40 uppercase block leading-none">Price</span>
                      <span className="text-deep-navy text-xs font-display font-bold mt-1 block leading-none">
                        {shop.price === 0 ? 'FREE' : `₹${shop.price}`}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="w-full pt-2 flex items-center justify-between">
                    <span className="font-display font-extrabold text-xs uppercase text-primary-orange group-hover:underline flex items-center gap-1.5 leading-none">
                      View details <ArrowRight size={14} className="stroke-[3]" />
                    </span>
                    <span className="font-sans font-bold text-[10px] text-deep-navy/50 italic">
                      Difficulty: {shop.difficulty}
                    </span>
                  </div>
                </NeoCard>
              </div>
            );
          })}
        </div>

        {/* View All Workshops Button */}
        <div className="pt-6">
          <NeoButton
            variant="orange"
            size="lg"
            onClick={() => router.push('/workshops')}
          >
            View All Workshops
            <ArrowRight className="w-5 h-5 ml-1.5 stroke-[3]" />
          </NeoButton>
        </div>
      </div>
    </section>
  );
};
export default LatestWorkshops;
