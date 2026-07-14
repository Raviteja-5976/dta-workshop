import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';

export const Schedule = () => {
  const scheduleDays = [
    {
      day: 'Day 1',
      date: '11 July',
      color: 'sky',
      sessions: [
        {
          time: '07:00 PM IST',
          title: 'Session 1: Dev Environment Setup',
          desc: 'Get Git, VS Code, and AI tools configured to coordinate effectively.',
        },
      ],
    },
    {
      day: 'Day 2',
      date: '12 July',
      color: 'yellow',
      sessions: [
        {
          time: '10:00 AM IST',
          title: 'Session 2: Efficient AI Prompting',
          desc: 'Learn advanced vibe coding prompt strategies with Cursor.',
        },
        {
          time: '02:00 PM IST',
          title: 'Session 3: Build Portfolio Website',
          desc: 'Structure and design the responsive layout using React + Tailwind.',
        },
        {
          time: '06:00 PM IST',
          title: 'Session 4: Deployment & Live Review',
          desc: 'Deploy to Vercel, map custom domain, and review portfolios.',
        },
      ],
    },
  ];

  return (
    <section className="py-20 bg-white border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-block border-2 border-deep-navy bg-yellow px-4 py-1.5 rounded-full font-display font-bold text-sm text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
            SCHEDULE
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl text-deep-navy leading-none">
            Live Session <span className="relative inline-block px-3 py-1 bg-coral text-white border-3 border-deep-navy rounded-xl shadow-[3px_3px_0_0_#1B1F3B] rotate-[-1.5deg]">Schedule</span>
          </h2>
          <p className="font-sans font-bold text-lg text-deep-navy/70 uppercase tracking-wide">
            Lock these dates in your calendar. All sessions are live.
          </p>
        </div>

        {/* Day Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {scheduleDays.map((dayObj, i) => (
            <NeoCard
              key={i}
              variant="white"
              borderSize="thick"
              shadowSize="large"
              className={`p-6 md:p-8 flex flex-col justify-between hover:scale-[1.01]`}
            >
              <div className="space-y-6 text-left">
                {/* Header */}
                <div className={`flex items-center justify-between border-b-3 border-deep-navy pb-4 bg-${dayObj.color}/15 p-4 rounded-2xl border-2 border-deep-navy`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-deep-navy shrink-0" />
                    <span className="font-display font-black text-2xl text-deep-navy">{dayObj.day}</span>
                  </div>
                  <span className={`px-4 py-1 rounded-full border-2 border-deep-navy font-display font-black text-sm uppercase shadow-[2px_2px_0px_0px_#1B1F3B] bg-${dayObj.color}`}>
                    {dayObj.date}
                  </span>
                </div>

                {/* Sessions list */}
                <div className="space-y-6 pt-2">
                  {dayObj.sessions.map((sess, idx) => (
                    <div key={idx} className="flex gap-4 items-start border-b-2 border-deep-navy/10 pb-6 last:border-0 last:pb-0">
                      <div className="px-3 py-1.5 border-2 border-deep-navy bg-white rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] font-mono font-bold text-xs md:text-sm text-primary-orange flex items-center gap-1.5 shrink-0 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sess.time}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-display font-extrabold text-lg md:text-xl text-deep-navy">
                          {sess.title}
                        </h4>
                        <p className="font-sans font-semibold text-sm md:text-base text-deep-navy/80">
                          {sess.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </NeoCard>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Schedule;
