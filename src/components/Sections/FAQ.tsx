import React from 'react';
import { AccordionItem } from '@/components/UI/Accordion';

export const FAQ = () => {
  const faqs = [
    {
      q: 'Why only 50 students per batch?',
      a: 'We cap our classes strictly to ensure instructors can give detailed code reviews on assignments, debug compiler issues live, and unmute participants to answer specific doubt threads without running out of time.',
    },
    {
      q: 'Do I need prior programming experience?',
      a: 'Basic knowledge of HTML, CSS, and Javascript is recommended since we write actual code. However, this workshop is designed to be beginner friendly, and we explain all AI-assisted tools from scratch.',
    },
    {
      q: 'Will session recordings be available?',
      a: 'Yes, absolutely! All session recordings, slides, prompts, and code templates will be made available inside your dashboard portal for life, so you can review them whenever you want.',
    },
    {
      q: 'Will my assignments actually be checked?',
      a: 'Yes. You will push your code to GitHub and submit it to our dashboard. A mentor will review your pull request, check the deployment, and leave comment feedback directly on your code.',
    },
    {
      q: 'How do I ask doubts outside live class hours?',
      a: 'You will get access to a private Discord/Slack group for your specific batch. Instructors and teaching assistants are active 24/7 to help resolve your coding queries and blockers.',
    },
    {
      q: 'Will I receive a completion certificate?',
      a: 'Yes, after successfully completing and deploying your portfolio project, you will be awarded a verified digital workshop completion certificate from DevTrackAcademy.',
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 bg-white border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-16">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-block border-2 border-deep-navy bg-yellow px-4 py-1.5 rounded-full font-display font-bold text-sm text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
            HELP CENTER
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl text-deep-navy leading-none">
            Frequently Asked <span className="relative inline-block px-3 py-1 bg-sky text-deep-navy border-3 border-deep-navy rounded-xl shadow-[3px_3px_0_0_#1B1F3B] rotate-[1.5deg]">Questions</span>
          </h2>
          <p className="font-sans font-bold text-lg text-deep-navy/70 uppercase tracking-wide">
            Everything you need to know about our workshops.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} title={faq.q}>
              {faq.a}
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FAQ;
