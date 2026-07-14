"use client";

import React, { useState } from 'react';
import { Calendar, Brain, Sparkles, BellRing, X, CheckCircle2 } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';
import { NeoButton } from '@/components/UI/NeoButton';
import { workshopsData, Workshop } from '@/data/workshops';

export const UpcomingWorkshops = ({ workshops = workshopsData }: { workshops?: Workshop[] }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter only upcoming workshops
  const upcomingList = workshops.filter(w => w.status === 'Upcoming');

  const openNotifyModal = (title: string) => {
    setSelectedWorkshop(title);
    setModalOpen(true);
    setIsSuccess(false);
    setEmail('');
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSuccess(true);
    setTimeout(() => {
      // Keep open or close after some delay
    }, 2000);
  };

  return (
    <section className="py-20 bg-bg-cream border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="absolute top-10 right-10 text-coral opacity-15 font-display font-extrabold text-7xl select-none hidden md:block">
        UPCOMING
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 relative z-10 text-center">
        {/* Title */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-block border-2 border-deep-navy bg-yellow px-4 py-1.5 rounded-full font-display font-bold text-sm text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
            FUTURE TOPICS
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl text-deep-navy leading-none">
            Upcoming Workshops
          </h2>
          <p className="font-sans font-bold text-lg text-deep-navy/70 uppercase tracking-wide">
            Secure priority waitlist access to upcoming practical bootcamps.
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left max-w-6xl mx-auto">
          {upcomingList.map((shop, i) => {
            const colors = ['coral', 'sky', 'mint', 'yellow'];
            const accent = colors[i % colors.length];

            return (
              <NeoCard
                key={shop.slug}
                variant="white"
                borderSize="normal"
                shadowSize="normal"
                hoverEffect={true}
                className="p-6 flex flex-col justify-between items-start gap-5 border-3 h-full"
              >
                {/* Header Badge */}
                <div className="w-full flex items-center justify-between">
                  <span className={`px-2 py-0.5 border border-deep-navy rounded bg-${accent} text-deep-navy font-sans font-black text-[9px] uppercase`}>
                    Coming Soon
                  </span>
                  <div className="flex items-center gap-1 text-deep-navy/40 font-mono text-[10px] font-bold">
                    <Calendar size={10} />
                    <span>{shop.date}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 flex-1">
                  <h3 className="font-display font-black text-lg md:text-xl text-deep-navy leading-tight line-clamp-2">
                    {shop.title}
                  </h3>
                  <p className="font-sans font-semibold text-xs md:text-sm text-deep-navy/85 leading-relaxed line-clamp-4">
                    {shop.description}
                  </p>
                </div>

                {/* Footer spec */}
                <div className="w-full border-t-2 border-deep-navy/10 pt-4 flex items-center justify-between">
                  <span className="font-sans font-black text-[10px] uppercase text-deep-navy/50">
                    {shop.difficulty}
                  </span>
                  <NeoButton
                    variant={accent as any}
                    size="sm"
                    onClick={() => openNotifyModal(shop.title)}
                  >
                    <BellRing size={12} className="mr-1" />
                    Notify Me
                  </NeoButton>
                </div>
              </NeoCard>
            );
          })}
        </div>
      </div>

      {/* Interactive Modal overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-deep-navy/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <NeoCard
            variant="white"
            borderSize="thick"
            shadowSize="large"
            className="p-8 w-full max-w-md relative text-left"
          >
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-deep-navy bg-yellow rounded-lg shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1B1F3B] transition-all cursor-pointer"
            >
              <X size={16} className="text-deep-navy stroke-[3]" />
            </button>

            {!isSuccess ? (
              <form onSubmit={handleNotifySubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-sky/20 border-2 border-sky px-3 py-1 rounded-full text-deep-navy font-display font-black text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PRIORITY WAITLIST</span>
                  </div>
                  <h3 className="font-display font-black text-2xl text-deep-navy leading-none pt-2">
                    Coming Soon!
                  </h3>
                  <p className="font-sans font-semibold text-sm text-deep-navy/70 leading-relaxed">
                    Be the first to know when seats open for <strong className="text-primary-orange">{selectedWorkshop}</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="font-display font-bold text-xs uppercase text-deep-navy">Your Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="student@dta.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold text-sm focus:outline-none focus:bg-white shadow-neo-inset"
                  />
                </div>

                <NeoButton variant="orange" size="md" className="w-full" type="submit">
                  Subscribe for updates
                </NeoButton>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 border-3 border-deep-navy bg-mint rounded-2xl flex items-center justify-center shadow-neo mx-auto animate-bounce">
                  <CheckCircle2 size={32} className="text-deep-navy stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-black text-2xl text-deep-navy">You&apos;re on the list!</h3>
                  <p className="font-sans font-bold text-sm text-deep-navy/80">
                    We will notify you immediately at <strong className="text-primary-orange">{email}</strong> when batches open.
                  </p>
                </div>
                <div className="pt-4">
                  <NeoButton variant="white" size="sm" onClick={() => setModalOpen(false)}>
                    Close window
                  </NeoButton>
                </div>
              </div>
            )}
          </NeoCard>
        </div>
      )}
    </section>
  );
};
export default UpcomingWorkshops;
