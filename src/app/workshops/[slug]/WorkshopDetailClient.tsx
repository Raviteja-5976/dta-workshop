"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Video,
  Users2,
  Brain,
  Share2,
  Award,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Rocket,
  Lock,
  Timer
} from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { NeoCard } from '@/components/UI/NeoCard';
import { NeoButton } from '@/components/UI/NeoButton';
import { AccordionItem } from '@/components/UI/Accordion';
import { Workshop } from '@/data/workshops';
import { Certificate } from '@/components/UI/Certificate';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { registerStudentAction } from '@/actions/payments';
import {
  formatDeadline,
  formatTimeLeft,
  isRegistrationClosed,
} from '@/lib/datetime';
import { useEffect, useState } from 'react';

export default function WorkshopDetailClient({
  workshop,
  relatedWorkshops,
  slug,
  registrationStatus,
}: {
  workshop?: Workshop;
  relatedWorkshops: Workshop[];
  slug: string;
  registrationStatus?: string;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [registering, setRegistering] = useState(false);
  const isRegistered = !!registrationStatus;
  const isConfirmed = registrationStatus === 'confirmed';

  // Registration window. The server already evaluated it for the first paint;
  // a timer re-checks so the CTA closes itself when the deadline passes while
  // the page is open.
  const deadline = workshop?.registrationDeadline ?? null;
  const [closed, setClosed] = useState<boolean>(workshop?.registrationClosed ?? false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const registrationOpen = workshop?.registrationOpen;
    const tick = () => {
      setClosed(isRegistrationClosed({ registrationOpen, registrationDeadline: deadline }));
      setTimeLeft(formatTimeLeft(deadline));
    };
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [deadline, workshop?.registrationOpen]);

  // Handle Share Click
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard! Share it with your friends. 🚀');
    }
  };

  const handleRegister = async () => {
    if (closed) {
      alert('Registrations for this batch are closed.');
      return;
    }

    if (!user) {
      router.push(`/auth?redirect=/workshops/${slug}`);
      return;
    }

    if (!workshop?.batchId) {
      alert("No active batch is currently open for registration.");
      return;
    }

    setRegistering(true);
    try {
      const res = await registerStudentAction(workshop.batchId);
      if (res.success) {
        if (res.alreadyConfirmed) {
          router.push('/dashboard');
        } else if (res.paymentLink) {
          router.push(res.paymentLink);
        } else {
          router.push('/dashboard');
        }
      } else {
        alert(res.error || 'Failed to register. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('An unexpected error occurred during registration.');
    } finally {
      setRegistering(false);
    }
  };

  if (!workshop) {
    return (
      <>
        <Navbar />
        <main className="min-h-[60vh] flex flex-col items-center justify-center bg-bg-cream bg-grid-pattern p-6">
          <NeoCard variant="coral" borderSize="thick" className="p-8 text-center max-w-md space-y-4">
            <h2 className="font-display font-black text-3xl text-white">Workshop Not Found</h2>
            <p className="font-sans font-bold text-deep-navy">
              The workshop with slug &quot;{slug}&quot; could not be found or is not yet published.
            </p>
            <NeoButton variant="white" size="sm" onClick={() => router.push('/workshops')}>
              Back to Catalog
            </NeoButton>
          </NeoCard>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-bg-cream bg-grid-pattern pb-20">

        {/* Back Link Row */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
          <Link href="/workshops" className="inline-flex items-center gap-2 font-display font-extrabold uppercase text-sm text-deep-navy hover:text-primary-orange transition-colors">
            <ArrowLeft size={16} />
            Back to Catalog
          </Link>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-6 md:p-10 border-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-3 border-deep-navy pb-6 mb-6">
              <div className="space-y-2">
                <span className="font-display font-black text-xs uppercase tracking-wider text-primary-orange bg-yellow/20 border-2 border-primary-orange px-3 py-1 rounded-full">
                  {workshop.category}
                </span>
                <h1 className="font-display font-black text-3xl md:text-5xl text-deep-navy leading-none mt-1">
                  {workshop.title}
                </h1>
              </div>
              <div className="flex gap-3">
                <NeoButton variant="white" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 text-deep-navy" />
                  Share
                </NeoButton>
                <span className="px-4 py-2 border-3 border-deep-navy rounded-xl font-display font-black text-sm uppercase bg-mint shadow-[2px_2px_0px_0px_#1B1F3B] text-deep-navy inline-flex items-center">
                  {workshop.status}
                </span>
              </div>
            </div>

            {/* Quick specifications grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Date', val: workshop.date, icon: Calendar },
                { label: 'Sessions', val: `${workshop.sessions} Live Classes`, icon: Video },
                { label: 'Capacity limit', val: `${workshop.seatLimit} Students`, icon: Users2 },
                { label: 'Difficulty', val: workshop.difficulty, icon: Brain },
              ].map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <div key={i} className="flex items-center gap-3 border-2 border-deep-navy bg-bg-cream p-3 rounded-xl">
                    <div className="p-1.5 border border-deep-navy bg-yellow rounded-lg shrink-0">
                      <Icon className="w-5 h-5 text-deep-navy" />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-[9px] text-deep-navy/50 uppercase leading-none">{spec.label}</p>
                      <p className="font-display font-bold text-sm text-deep-navy mt-1">{spec.val}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Registration window */}
            {(deadline || closed) && (
              <div
                className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-2 border-deep-navy rounded-xl px-4 py-3 ${
                  closed ? 'bg-coral/20' : 'bg-yellow/30'
                }`}
              >
                {closed ? (
                  <Lock className="w-4 h-4 text-deep-navy stroke-[3]" />
                ) : (
                  <Timer className="w-4 h-4 text-deep-navy stroke-[3]" />
                )}
                <span className="font-display font-black text-xs md:text-sm uppercase text-deep-navy">
                  {closed ? 'Registrations Closed' : 'Registration closes'}
                </span>
                {deadline && (
                  <span className="font-sans font-bold text-xs md:text-sm text-deep-navy/80">
                    {closed ? `Deadline was ${formatDeadline(deadline)}` : formatDeadline(deadline)}
                  </span>
                )}
                {!closed && timeLeft && (
                  <span className="sm:ml-auto px-2.5 py-0.5 border-2 border-deep-navy bg-white rounded-full font-display font-black text-[10px] uppercase text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B]">
                    {timeLeft}
                  </span>
                )}
              </div>
            )}
          </NeoCard>
        </section>

        {/* Dynamic Split Layout */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Workshop details */}
          <div className="lg:col-span-8 space-y-12">

            {/* About Workshop */}
            <NeoCard variant="white" borderSize="normal" className="p-6 md:p-8 text-left space-y-4">
              <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy border-b-2 border-deep-navy/10 pb-2">
                About this Workshop
              </h2>
              <p className="font-sans font-semibold text-base md:text-lg text-deep-navy/80 leading-relaxed">
                {workshop.aboutText || workshop.description}
              </p>
              <div className="space-y-2">
                <span className="font-sans font-black text-xs uppercase text-deep-navy/40">INSTRUCTOR</span>
                <p className="font-display font-bold text-deep-navy">{workshop.instructor}</p>
              </div>
            </NeoCard>

            {/* Project Preview — "What you build by the end of Workshop" */}
            {workshop.projectPreviewEnabled && workshop.projectPreviewUrl && (
              <NeoCard variant="mint" borderSize="normal" className="p-6 md:p-8 text-left space-y-4">
                <div className="inline-flex items-center gap-1.5 border-2 border-deep-navy bg-white px-3 py-1 rounded-full font-display font-bold text-xs shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
                  <Rocket className="w-3.5 h-3.5 text-deep-navy" />
                  <span>Project Preview</span>
                </div>
                <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy leading-none">
                  What you build by the end of Workshop
                </h2>
                <p className="font-sans font-semibold text-sm md:text-base text-deep-navy/80">
                  Take a live look at the finished project you&apos;ll walk away with — explore the
                  real, deployed result before you register.
                </p>
                <NeoButton
                  variant="orange"
                  size="md"
                  onClick={() =>
                    window.open(workshop.projectPreviewUrl, '_blank', 'noopener,noreferrer')
                  }
                >
                  What you build by the end of Workshop
                  <ExternalLink size={16} className="ml-1.5" />
                </NeoButton>
              </NeoCard>
            )}

            {/* Learning Outcomes */}
            {workshop.learningOutcomes.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy text-left">
                  By the end of this class, you will:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {workshop.learningOutcomes.map((out, idx) => (
                    <NeoCard key={idx} variant="white" borderSize="normal" className="p-6 text-left space-y-2 hover:-translate-y-0.5 transition-all">
                      <div className="w-8 h-8 rounded-lg border-2 border-deep-navy bg-mint flex items-center justify-center shadow-[1.5px_1.5px_0_0_#1B1F3B]">
                        <CheckCircle2 size={16} className="text-deep-navy stroke-[3]" />
                      </div>
                      <h4 className="font-display font-bold text-lg text-deep-navy pt-2">{out.title}</h4>
                      <p className="font-sans font-semibold text-xs md:text-sm text-deep-navy/70 leading-relaxed">
                        {out.desc}
                      </p>
                    </NeoCard>
                  ))}
                </div>
              </div>
            )}

            {/* Workshop Schedule Timeline */}
            {workshop.schedule.length > 0 && (
              <div className="space-y-6 text-left">
                <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy">
                  Session Timeline
                </h2>
                <div className="relative border-l-4 border-deep-navy pl-6 ml-4 space-y-8">
                  {workshop.schedule.map((sess, i) => (
                    <div key={i} className="relative">
                      {/* Node circle */}
                      <div className="absolute -left-[38px] top-1 w-6 h-6 rounded-full border-3 border-deep-navy bg-yellow shadow-[1.5px_1.5px_0_0_#1B1F3B] z-10" />

                      <NeoCard variant="white" borderSize="normal" className="p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-deep-navy/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 border-2 border-deep-navy bg-coral text-white font-display font-black text-xs rounded shadow-[1.5px_1.5px_0_0_#1B1F3B]">
                              {sess.num}
                            </span>
                            <h4 className="font-display font-black text-lg text-deep-navy">{sess.title}</h4>
                          </div>
                          <div className="flex flex-col items-end text-right">
                            {sess.scheduledAt && (
                              <span className="font-mono text-xs font-bold text-primary-orange">
                                {new Date(sess.scheduledAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  // scheduled_at is stored as the naive wall-clock time the
                                  // admin entered (batch timezone), so render it as-is (UTC)
                                  // rather than re-shifting it by the IST offset.
                                  timeZone: 'UTC',
                                })}{' '}
                                IST
                              </span>
                            )}
                            {sess.duration && (
                              <span className="font-mono text-xs font-bold text-deep-navy/40">{sess.duration}</span>
                            )}
                          </div>
                        </div>

                        {/* About this session */}
                        {sess.about && (
                          <p className="font-sans font-semibold text-sm text-deep-navy/80">{sess.about}</p>
                        )}

                        {/* Topics */}
                        <div className="flex flex-wrap gap-2">
                          {sess.topics.map((t, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 border-2 border-deep-navy bg-bg-cream text-[10px] md:text-xs font-sans font-bold rounded-lg">
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Assignment */}
                        <div className="border-2 border-deep-navy bg-yellow/10 p-3.5 rounded-xl text-xs font-sans font-bold text-deep-navy">
                          <span className="font-display font-black text-xs text-primary-orange block uppercase">Assignment</span>
                          <p className="mt-0.5 text-deep-navy/90">{sess.assignment}</p>
                        </div>
                      </NeoCard>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {workshop.faq.length > 0 && (
              <div className="space-y-6 text-left">
                <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {workshop.faq.map((faq, index) => (
                    <AccordionItem key={index} title={faq.q}>
                      {faq.a}
                    </AccordionItem>
                  ))}
                </div>
              </div>
            )}

            {/* Related Workshops Carousel */}
            {relatedWorkshops.length > 0 && (
              <div className="space-y-6 text-left">
                <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy">
                  Related Workshops
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedWorkshops.map((w, idx) => (
                    <div key={w.slug} onClick={() => router.push(`/workshops/${w.slug}`)} className="cursor-pointer">
                      <NeoCard variant="white" borderSize="normal" hoverEffect={true} className="p-6 space-y-4 border-3 h-full flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="px-2 py-0.5 border border-deep-navy rounded bg-bg-cream text-deep-navy font-sans font-black text-[9px] uppercase">
                            {w.category}
                          </span>
                          <h4 className="font-display font-black text-lg text-deep-navy mt-1 leading-snug">{w.title}</h4>
                          <p className="font-sans font-semibold text-xs text-deep-navy/70 line-clamp-3 leading-relaxed">
                            {w.description}
                          </p>
                        </div>
                        <div className="w-full flex items-center justify-between border-t border-deep-navy/10 pt-4 text-[10px] font-bold text-deep-navy/55">
                          <span>{w.date}</span>
                          <span>{w.price === 0 ? 'FREE' : `₹${w.price}`}</span>
                        </div>
                      </NeoCard>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Certificate Preview */}
            <div className="space-y-6 text-left border-t-3 border-deep-navy/10 pt-10">
              <div className="inline-flex items-center gap-1.5 border-2 border-deep-navy bg-yellow px-3 py-1 rounded-full font-display font-bold text-xs shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
                <Award className="w-3.5 h-3.5 text-deep-navy" />
                <span>CREDENTIAL PREVIEW</span>
              </div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy leading-none">
                Earn Your Completion Certificate
              </h2>
              <p className="font-sans font-semibold text-sm md:text-base text-deep-navy/80">
                Prove your skills by completing practical tasks. Recruiters and teams will be able to verify your credentials with a secure verification code link.
              </p>

              <div className="border-3 border-deep-navy rounded-[28px] overflow-hidden bg-[#FFF8F0] shadow-neo p-4 relative group">
                <div className="pointer-events-none select-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <Certificate
                    studentName="Alex Coder"
                    studentEmail="student@devtrackacademy.dev"
                    workshopName={workshop.title}
                    workshopDate={workshop.date}
                    completionDate={workshop.date.split(' - ')[1] || workshop.date}
                    duration={workshop.duration}
                    certificateId="DTA-PORT-99321-A"
                    founderName="Raviteja Karnati"
                    verificationUrl={`verify.devtrackacademy.com/certificate/DTA-PORT-99321-A`}
                  />
                </div>

                <div className="absolute inset-0 bg-deep-navy/10 group-hover:bg-deep-navy/20 flex items-center justify-center transition-all">
                  <NeoButton
                    variant="yellow"
                    size="sm"
                    onClick={() => router.push(`/certificate?name=Alex+Coder&email=student@devtrackacademy.dev&workshop=${encodeURIComponent(workshop.title)}&date=${encodeURIComponent(workshop.date)}&completion=${encodeURIComponent(workshop.date.split(' - ')[1] || workshop.date)}&duration=${encodeURIComponent(workshop.duration)}&id=DTA-PORT-99321-A`)}
                    className="shadow-[4px_4px_0px_0px_#1B1F3B] opacity-95 hover:opacity-100"
                  >
                    View Full Certificate Demo
                    <ExternalLink size={14} className="ml-1.5" />
                  </NeoButton>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Pricing & Action box */}
          <aside className="lg:col-span-4 sticky top-28 space-y-6 w-full hidden lg:block">
            <NeoCard variant="yellow" borderSize="thick" shadowSize="large" className="p-6 text-left space-y-6 rotate-1">
              <div className="space-y-2 border-b-2 border-deep-navy pb-4">
                <span
                  className={`font-display font-black text-[10px] uppercase px-2 py-0.5 border border-deep-navy rounded-full ${
                    closed ? 'text-white bg-coral' : 'text-primary-orange bg-white'
                  }`}
                >
                  {closed ? 'Registrations closed' : 'Batch filling fast'}
                </span>
                <h3 className="font-display font-black text-2xl text-deep-navy leading-none pt-1">
                  Join {workshop.batchLabel || 'This Batch'}
                </h3>
              </div>

              {/* Price Details */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-black text-4xl text-deep-navy">
                    {workshop.price === 0 ? 'FREE' : `₹${workshop.price}`}
                  </span>
                  {workshop.originalPrice && (
                    <span className="font-display font-bold text-base text-deep-navy/40 line-through">
                      ₹{workshop.originalPrice}
                    </span>
                  )}
                </div>
                <p className="font-sans font-bold text-[10px] text-deep-navy/60 uppercase">
                  Seats remaining: {workshop.remainingSeats} / {workshop.seatLimit}
                </p>
                {deadline && !closed && (
                  <p className="font-sans font-bold text-[10px] text-deep-navy/60 uppercase">
                    Closes: {formatDeadline(deadline)}
                    {timeLeft ? ` · ${timeLeft}` : ''}
                  </p>
                )}
              </div>

              {/* Inclusions list */}
              {workshop.highlights.length > 0 && (
                <ul className="space-y-2 font-sans font-bold text-xs">
                  {workshop.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-primary-orange shrink-0 stroke-[3]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                {isRegistered ? (
                  <>
                    <div className="w-full border-3 border-deep-navy bg-mint rounded-xl px-4 py-2.5 text-center font-display font-black text-sm uppercase text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={16} className="stroke-[3]" />
                      {isConfirmed ? "You're Registered" : workshop.price === 0 ? 'Confirmation Pending' : 'Payment Pending'}
                    </div>
                    <NeoButton
                      variant="orange"
                      size="md"
                      className="w-full"
                      onClick={() => router.push('/dashboard')}
                    >
                      {isConfirmed ? 'Go to Dashboard' : workshop.price === 0 ? 'Confirm Seat' : 'Complete Payment'}
                      <ChevronRight size={14} className="ml-1" />
                    </NeoButton>
                  </>
                ) : closed ? (
                  <>
                    <div className="w-full border-3 border-deep-navy bg-coral rounded-xl px-4 py-2.5 text-center font-display font-black text-sm uppercase text-white shadow-[2px_2px_0px_0px_#1B1F3B] flex items-center justify-center gap-1.5">
                      <Lock size={16} className="stroke-[3]" />
                      Registration Closed
                    </div>
                    <p className="font-sans font-bold text-[10px] text-deep-navy/60 uppercase text-center">
                      {deadline
                        ? `The deadline passed on ${formatDeadline(deadline)}.`
                        : 'This batch is no longer accepting registrations.'}
                    </p>
                  </>
                ) : (
                  <NeoButton
                    variant="orange"
                    size="md"
                    className="w-full"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering ? 'Registering...' : 'Register Now'}
                    <ChevronRight size={14} className="ml-1" />
                  </NeoButton>
                )}
                <NeoButton
                  variant="white"
                  size="sm"
                  className="w-full"
                  onClick={handleShare}
                >
                  Share Workshop
                </NeoButton>
              </div>
            </NeoCard>
          </aside>

        </div>

        {/* Mobile-only sticky bottom drawer register card */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t-3 border-deep-navy p-4 flex items-center justify-between gap-4 z-40 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="text-left">
            <span className="font-display font-bold text-[10px] text-deep-navy/55 uppercase leading-none block">Featured Batch</span>
            <span className="font-display font-black text-xl text-deep-navy mt-1 block">
              {workshop.price === 0 ? 'FREE' : `₹${workshop.price}`}
            </span>
          </div>
          {isRegistered ? (
            <NeoButton variant="mint" size="sm" onClick={() => router.push('/dashboard')}>
              {isConfirmed ? 'Registered ✓' : workshop.price === 0 ? 'Confirm Seat' : 'Payment Pending'} <ChevronRight size={12} className="ml-0.5" />
            </NeoButton>
          ) : closed ? (
            <span className="px-3 py-2 border-3 border-deep-navy bg-coral rounded-xl font-display font-black text-xs uppercase text-white inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1B1F3B]">
              <Lock size={12} className="stroke-[3]" />
              Closed
            </span>
          ) : (
            <NeoButton variant="orange" size="sm" onClick={handleRegister} disabled={registering}>
              {registering ? 'Registering...' : 'Register'} <ChevronRight size={12} className="ml-0.5" />
            </NeoButton>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}
