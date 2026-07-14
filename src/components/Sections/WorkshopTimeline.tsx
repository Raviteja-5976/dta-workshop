import React from 'react';
import { Settings, BrainCircuit, Code, Rocket, CheckSquare } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';

export const WorkshopTimeline = () => {
  const sessions = [
    {
      num: 'Session 1',
      title: 'Setting Up Development Environment',
      icon: Settings,
      color: 'yellow',
      topics: ['VS Code Configuration', 'Git & GitHub Setup', 'AI Code Tools Integration', 'Cursor IDE Settings', 'Project Architecture Setup'],
      assignment: 'Setup your complete development environment and push a template repo to GitHub.',
    },
    {
      num: 'Session 2',
      title: 'Efficient AI-Assisted Development',
      icon: BrainCircuit,
      color: 'sky',
      topics: ['Advanced Prompt Engineering', 'Vibe Coding workflows', 'AI Context Rules setting', 'AI assisted styling', 'Iterative Code refactoring'],
      assignment: 'Generate, test, and style 2 customized website sub-sections using AI prompts.',
    },
    {
      num: 'Session 3',
      title: 'Build Portfolio Website',
      icon: Code,
      color: 'mint',
      topics: ['Landing Page Layouts', 'Custom React Components', 'Framer Motion Animations', 'Responsive Breakpoint Design', 'CSS Grid & Flexbox tricks'],
      assignment: 'Complete the core desktop and mobile screens of your developer portfolio.',
    },
    {
      num: 'Session 4',
      title: 'Deployment & Live Review',
      icon: Rocket,
      color: 'coral',
      topics: ['Deploy Website to Vercel/Netlify', 'Custom Domain Configuration', 'GitHub Readme Optimization', 'Resume & Project links sync', 'Live Portfolio reviews'],
      assignment: 'Deploy your portfolio publicly and submit the live URL for review.',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-bg-cream border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <div className="inline-block border-2 border-deep-navy bg-mint px-4 py-1.5 rounded-full font-display font-bold text-sm text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
            TIMELINE
          </div>
          <h2 className="font-display font-extrabold text-4xl md:text-6xl text-deep-navy leading-none">
            Workshop <span className="relative inline-block px-3 py-1 bg-yellow border-3 border-deep-navy rounded-xl shadow-[3px_3px_0_0_#1B1F3B] rotate-[1deg]">Curriculum</span>
          </h2>
          <p className="font-sans font-bold text-lg text-deep-navy/70 uppercase tracking-wide">
            Four intensive classes to build and deploy your project.
          </p>
        </div>

        {/* Timeline Line & Cards */}
        <div className="relative border-l-4 border-deep-navy pl-6 md:pl-12 ml-4 md:ml-10 space-y-16">
          {sessions.map((sess, i) => {
            const Icon = sess.icon;
            return (
              <div key={i} className="relative">
                {/* Timeline node icon */}
                <div className="absolute -left-[50px] md:-left-[74px] top-2 w-12 h-12 md:w-14 md:h-14 rounded-2xl border-3 border-deep-navy bg-white flex items-center justify-center shadow-[3px_3px_0px_0px_#1B1F3B] z-10">
                  <Icon className="w-6 h-6 text-deep-navy stroke-[2.5]" />
                </div>

                {/* Session Card */}
                <NeoCard
                  variant="white"
                  borderSize="normal"
                  shadowSize="normal"
                  hoverEffect={true}
                  className="p-6 md:p-8 text-left"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b-3 border-deep-navy pb-4 mb-6">
                    <span className={`px-4 py-1 rounded-full border-2 border-deep-navy font-display font-black text-sm uppercase shadow-[2px_2px_0px_0px_#1B1F3B] bg-${sess.color}`}>
                      {sess.num}
                    </span>
                    <h3 className="font-display font-black text-xl md:text-2xl text-deep-navy flex-1 min-w-[200px]">
                      {sess.title}
                    </h3>
                  </div>

                  {/* Topics Grid */}
                  <div className="space-y-4">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-deep-navy/50">What we will cover:</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {sess.topics.map((top, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-bg-cream border-2 border-deep-navy rounded-lg font-sans font-semibold text-xs md:text-sm text-deep-navy"
                        >
                          {top}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Assignment block */}
                  <div className="mt-8 border-3 border-deep-navy bg-white rounded-2xl p-4 shadow-[3px_3px_0px_0px_#1B1F3B] flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="p-2 border-2 border-deep-navy bg-primary-orange text-white rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] shrink-0">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-display font-black text-xs text-primary-orange uppercase block">Session Assignment</span>
                      <p className="font-sans font-bold text-sm md:text-base text-deep-navy mt-0.5">{sess.assignment}</p>
                    </div>
                  </div>
                </NeoCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default WorkshopTimeline;
