"use client";

import React, { useState } from 'react';
import { Lightbulb, Laptop, CheckSquare, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';
import { NeoButton } from '@/components/UI/NeoButton';

export const SuggestWorkshop = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    description: '',
    level: 'Beginner',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.topic) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      topic: '',
      description: '',
      level: 'Beginner',
    });
    setIsSuccess(false);
  };

  return (
    <section className="py-20 md:py-32 bg-white border-b-4 border-deep-navy relative overflow-hidden bg-grid-pattern">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <NeoCard
          variant="mint"
          borderSize="thick"
          shadowSize="large"
          className="p-6 md:p-12 text-left relative overflow-hidden"
        >
          {/* Decorative floating star */}
          <div className="absolute top-4 right-12 text-yellow font-display font-black text-6xl opacity-30 select-none animate-float">
            *
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Side: Illustration board */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 border-2 border-deep-navy bg-white px-3 py-1 rounded-full font-display font-bold text-xs shadow-[2px_2px_0px_0px_#1B1F3B] uppercase rotate-[-1deg]">
                  <Lightbulb className="w-3.5 h-3.5 text-primary-orange" />
                  <span>Ideate</span>
                </div>
                <h2 className="font-display font-black text-3xl md:text-5xl text-deep-navy leading-none">
                  Didn&apos;t Find the Workshop You Need?
                </h2>
                <p className="font-sans font-bold text-sm md:text-base text-deep-navy/85 leading-relaxed">
                  We build workshops specifically for the community. Suggest a technical project or topic you want to learn, and we will format a batch around it.
                </p>
              </div>

              {/* Graphical Board Mockup */}
              <div className="border-3 border-deep-navy bg-white rounded-2xl p-4 shadow-[3px_3px_0_0_#1B1F3B] space-y-4 relative -rotate-1 hidden md:block">
                <div className="flex items-center gap-2 border-b border-deep-navy/10 pb-2">
                  <Laptop className="w-4 h-4 text-primary-orange" />
                  <span className="font-display font-bold text-xs">Community Requests</span>
                </div>
                <div className="space-y-2">
                  {[
                    'Rust Web Servers (12 Votes)',
                    'Dynamic SVG Animations (8 Votes)',
                    'Postgres Index Optimization (15 Votes)',
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold">
                      <CheckSquare className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Form / Success state */}
            <div className="lg:col-span-7 border-l-0 lg:border-l-3 border-deep-navy lg:pl-8 pt-6 lg:pt-0">
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-display font-bold text-xs uppercase text-deep-navy">Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Coder"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2 border-2 border-deep-navy rounded-xl bg-white font-semibold text-xs focus:outline-none shadow-neo-inset"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-display font-bold text-xs uppercase text-deep-navy">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@dta.dev"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2 border-2 border-deep-navy rounded-xl bg-white font-semibold text-xs focus:outline-none shadow-neo-inset"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="font-display font-bold text-xs uppercase text-deep-navy">Workshop Topic</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Next.js SaaS Stripe Integration"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full px-3.5 py-2 border-2 border-deep-navy rounded-xl bg-white font-semibold text-xs focus:outline-none shadow-neo-inset"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-display font-bold text-xs uppercase text-deep-navy">Difficulty Level</label>
                      <div className="relative">
                        <select
                          value={formData.level}
                          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                          className="w-full pl-3.5 pr-8 py-2 border-2 border-deep-navy rounded-xl bg-white font-semibold text-xs focus:outline-none appearance-none shadow-neo-inset cursor-pointer"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-deep-navy absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-display font-bold text-xs uppercase text-deep-navy">Brief Description</label>
                    <textarea
                      rows={3}
                      placeholder="What specific projects or concepts do you want to build?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 border-2 border-deep-navy rounded-xl bg-white font-semibold text-xs focus:outline-none shadow-neo-inset resize-none"
                    />
                  </div>

                  <NeoButton variant="orange" size="md" className="w-full pt-3" type="submit" disabled={loading}>
                    {loading ? 'Submitting Idea...' : 'Submit Workshop Suggestion'}
                  </NeoButton>

                  <p className="font-sans font-bold text-[10px] text-deep-navy/60 uppercase">
                    We regularly review community suggestions and prioritize workshops based on demand.
                  </p>
                </form>
              ) : (
                <div className="text-center py-10 space-y-5 bg-white/40 border-2 border-dashed border-deep-navy rounded-2xl p-6">
                  <div className="w-16 h-16 border-3 border-deep-navy bg-yellow rounded-2xl flex items-center justify-center shadow-neo mx-auto animate-bounce">
                    <CheckCircle2 size={32} className="text-deep-navy stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-black text-2xl text-deep-navy">Idea Submitted!</h3>
                    <p className="font-sans font-bold text-sm text-deep-navy/80 max-w-sm mx-auto">
                      Thanks <strong className="text-primary-orange">{formData.name}</strong>! We have registered your suggestion for <strong className="text-primary-orange">&quot;{formData.topic}&quot;</strong>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <NeoButton variant="white" size="sm" onClick={handleReset}>
                      Submit another idea
                    </NeoButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </NeoCard>
      </div>
    </section>
  );
};
export default SuggestWorkshop;
