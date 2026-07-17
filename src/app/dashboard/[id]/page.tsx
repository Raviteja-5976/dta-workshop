"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { supabase, isMock } from '@/lib/supabase';
import {
  LogOut,
  User,
  CheckCircle,
  Clock,
  Video,
  Sparkles,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { FaDiscord, FaXTwitter, FaInstagram, FaLinkedin, FaReddit } from 'react-icons/fa6';

export default function RegistrationDetailPage() {
  const { user, loading, checkUser, signOut } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const registrationId = String(params?.id || '');

  const [reg, setReg] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [payment, setPayment] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchRegistration() {
      setLoadingData(true);
      setNotFound(false);
      try {
        if (isMock) {
          const mockReg = {
            id: registrationId,
            status: 'confirmed',
            confirmation_code: 'DTA-CONF-PORT5',
            registered_at: new Date().toISOString(),
            batch_id: 'mock-batch-1',
            workshop_batches: {
              batch_label: 'Batch 1',
              price: 999,
              date_label: '11 - 12 July',
              status: 'Live',
              workshops: {
                title: 'Build Your Portfolio Website Using AI',
                slug: 'build-your-portfolio',
              },
            },
          };
          setReg(mockReg);
          setSessions([
            { id: '1', title: 'IDE Setup & Prompting Patterns', session_order: 1, duration_label: '2 Hours', topics: ['Cursor Rules', 'v0 Dev'], assignment: 'Submit GitHub repository link.', resources: ['Rules Template'] },
            { id: '2', title: 'Deploying & SEO Basics', session_order: 2, duration_label: '2 Hours', topics: ['Vercel DNS', 'Meta Tags'], assignment: 'Submit live deployment link.', resources: ['SEO Guide'] },
          ]);
          setLoadingData(false);
          return;
        }

        // Fetch this specific registration (RLS + user_id both restrict to owner).
        const { data: dbReg, error } = await supabase
          .from('registrations')
          .select(`
            id,
            status,
            confirmation_code,
            registered_at,
            batch_id,
            workshop_batches (
              id,
              batch_label,
              price,
              date_label,
              status,
              workshops ( id, title, slug )
            )
          `)
          .eq('id', registrationId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!dbReg) {
          setNotFound(true);
          setLoadingData(false);
          return;
        }
        setReg(dbReg);

        if (dbReg.status === 'confirmed') {
          const { data: dbSessions } = await supabase
            .from('batch_sessions')
            .select('*')
            .eq('batch_id', dbReg.batch_id)
            .order('session_order', { ascending: true });
          setSessions(dbSessions || []);
        } else if (dbReg.status === 'pending') {
          const { data: dbPayment } = await supabase
            .from('payments')
            .select('receipt_url, amount')
            .eq('registration_id', dbReg.id)
            .eq('status', 'pending')
            .maybeSingle();
          setPayment(dbPayment || null);
        }
      } catch (err) {
        console.error('Error fetching registration details:', err);
        setNotFound(true);
      } finally {
        setLoadingData(false);
      }
    }

    fetchRegistration();
  }, [user, registrationId]);

  const handleLogout = async () => {
    await signOut();
    router.push('/auth');
    router.refresh();
  };

  if (loading || (user && loadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-cream bg-grid-pattern">
        <NeoCard variant="yellow" borderSize="thick" className="p-8 text-center max-w-sm">
          <h2 className="font-display font-black text-2xl text-deep-navy animate-pulse">
            Loading Enrollment...
          </h2>
        </NeoCard>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const userEmail = user.email || 'student@dta.com';
  const userName = user.user_metadata?.full_name || userEmail.split('@')[0];
  const workshop = reg?.workshop_batches?.workshops;
  const batch = reg?.workshop_batches;

  return (
    <div className="min-h-screen bg-bg-cream bg-grid-pattern pb-12">
      {/* Top Header */}
      <header className="border-b-4 border-deep-navy bg-white py-4 shadow-[0_4px_0_0_#1B1F3B] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-display font-extrabold uppercase text-sm text-deep-navy hover:text-primary-orange transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-sm uppercase bg-yellow px-3 py-1 border-2 border-deep-navy rounded-lg shadow-[2px_2px_0px_0px_#1B1F3B] hidden md:inline-block">
              Welcome, {userName}!
            </span>
            <NeoButton variant="white" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 text-deep-navy" />
              Logout
            </NeoButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        {notFound || !reg ? (
          <div className="max-w-xl mx-auto text-center py-16">
            <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-8 md:p-12 space-y-6">
              <h2 className="font-display font-black text-3xl text-deep-navy leading-none uppercase">
                Enrollment Not Found
              </h2>
              <p className="font-sans font-bold text-deep-navy/60 text-sm">
                We couldn&apos;t find this registration, or it doesn&apos;t belong to your account.
              </p>
              <Link href="/dashboard">
                <NeoButton variant="orange" size="md" className="px-8">
                  Back to Dashboard
                  <ChevronRight size={16} className="ml-1" />
                </NeoButton>
              </Link>
            </NeoCard>
          </div>
        ) : reg.status === 'pending' ? (
          /* Pending Payment Checkout */
          <div className="max-w-xl mx-auto py-8">
            <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-8 md:p-12 space-y-6 text-left">
              <div className="flex items-center gap-1.5 border-2 border-deep-navy bg-coral px-3 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1B1F3B] text-white self-start w-fit">
                <Clock size={12} />
                Pending Payment
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-display font-black tracking-widest text-deep-navy/40 uppercase block">
                  Registration Gate
                </span>
                <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy leading-snug uppercase">
                  {workshop?.title}
                </h2>
                <p className="text-sm font-semibold text-deep-navy/60">
                  {batch?.batch_label} — Scheduled run: <span className="font-bold text-deep-navy">{batch?.date_label}</span>
                </p>
              </div>

              <div className="p-4 border-2 border-deep-navy bg-bg-cream rounded-2xl space-y-2 font-semibold text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-deep-navy/50">Tuition Price:</span>
                  <span className="font-display font-black text-lg text-deep-navy">₹{batch?.price}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-deep-navy/50">Seat Hold Status:</span>
                  <span className="font-bold text-coral uppercase text-xs">Temporary Hold (15 Min)</span>
                </div>
              </div>

              {payment?.receipt_url ? (
                <a href={payment.receipt_url} className="w-full block">
                  <NeoButton variant="orange" size="md" className="w-full py-4 text-base">
                    Complete Checkout / Pay Now
                    <ChevronRight size={16} className="ml-1" />
                  </NeoButton>
                </a>
              ) : (
                <div className="p-4 bg-yellow/10 border-2 border-yellow rounded-xl text-deep-navy text-xs font-bold text-center">
                  Payment Link is being generated. Please reload in a few seconds.
                </div>
              )}
            </NeoCard>
          </div>
        ) : (
          /* Confirmed enrollment detail */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Profile & batch info */}
            <div className="lg:col-span-4 space-y-8">
              <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6 text-left">
                <div className="flex items-center gap-4 border-b-2 border-deep-navy/10 pb-4 mb-4">
                  <div className="w-16 h-16 border-2 border-deep-navy bg-primary-orange rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1B1F3B]">
                    <User className="w-8 h-8 text-white stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-deep-navy leading-none capitalize">{userName}</h3>
                    <p className="font-sans font-bold text-xs text-deep-navy/50 mt-1">{userEmail}</p>
                  </div>
                </div>

                <div className="space-y-3 font-semibold text-sm">
                  <div className="flex justify-between items-baseline">
                    <span className="text-deep-navy/50">Active Batch:</span>
                    <span className="text-deep-navy font-display font-bold text-sm">{batch?.batch_label}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-deep-navy/50">Scheduled Run:</span>
                    <span className="text-deep-navy font-display font-bold text-sm">{batch?.date_label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-deep-navy/50">Confirmation:</span>
                    <span className="font-mono text-xs bg-bg-cream border border-deep-navy/20 px-2 py-0.5 rounded font-bold text-deep-navy select-all">
                      {reg?.confirmation_code}
                    </span>
                  </div>
                </div>
              </NeoCard>

              {/* Socials / Community Links */}
              <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6 text-left space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-orange" />
                  <h4 className="font-display font-black text-lg text-deep-navy">Join Our Community</h4>
                </div>
                <p className="font-sans font-bold text-sm text-deep-navy/80 leading-relaxed">
                  Connect with other builders, get updates, and follow DevTrackAcademy across our channels:
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a
                    href="https://discord.gg/dftPTfdde"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border-2 border-deep-navy bg-yellow rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1F3B] transition-all text-xs font-bold text-deep-navy"
                  >
                    <FaDiscord className="w-4 h-4 text-deep-navy" />
                    <span>Discord</span>
                  </a>
                  <a
                    href="https://x.com/DevTrackAcademy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border-2 border-deep-navy bg-yellow rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1F3B] transition-all text-xs font-bold text-deep-navy"
                  >
                    <FaXTwitter className="w-4 h-4 text-deep-navy" />
                    <span>Twitter / X</span>
                  </a>
                  <a
                    href="https://www.instagram.com/devtrackacademy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border-2 border-deep-navy bg-yellow rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1F3B] transition-all text-xs font-bold text-deep-navy"
                  >
                    <FaInstagram className="w-4 h-4 text-deep-navy" />
                    <span>Instagram</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/devtrackacademy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border-2 border-deep-navy bg-yellow rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1F3B] transition-all text-xs font-bold text-deep-navy"
                  >
                    <FaLinkedin className="w-4 h-4 text-deep-navy" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://www.reddit.com/r/devtrackacademy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border-2 border-deep-navy bg-yellow rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1F3B] transition-all text-xs font-bold text-deep-navy col-span-2 justify-center"
                  >
                    <FaReddit className="w-4 h-4 text-deep-navy" />
                    <span>Reddit</span>
                  </a>
                </div>
              </NeoCard>
            </div>

            {/* Right: Sessions, assignments, resources */}
            <div className="lg:col-span-8 space-y-8 text-left">
              <NeoCard variant="yellow" borderSize="thick" shadowSize="normal" className="p-6 md:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-display font-black text-xs text-primary-orange uppercase bg-white border-2 border-deep-navy px-2.5 py-0.5 rounded-md shadow-[1.5px_1.5px_0_0_#1B1F3B]">
                      Currently Enrolled
                    </span>
                    <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy leading-none mt-2 uppercase">
                      {workshop?.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 border-2 border-deep-navy rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B]">
                    <Video className="w-5 h-5 text-deep-navy" />
                    <span className="font-display font-black text-sm text-deep-navy">
                      {sessions.length} Live Sessions
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t-2 border-deep-navy/10">
                  <h3 className="font-display font-black text-lg text-deep-navy uppercase">
                    Your Class Schedule
                  </h3>

                  {sessions.length === 0 ? (
                    <p className="text-sm font-semibold text-deep-navy/50 italic">
                      The schedule for this batch run is being finalized.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sessions.map((sess, idx) => (
                        <NeoCard key={sess.id || idx} variant="white" borderSize="normal" className="p-4 flex flex-col justify-between min-h-[140px] shadow-[2px_2px_0px_0px_#1B1F3B]">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-display font-black bg-coral text-white border-2 border-deep-navy px-2 py-0.5 rounded shadow-[1px_1px_0_0_#1B1F3B] uppercase">
                                Session {sess.session_order}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-deep-navy/40">
                                {sess.duration_label}
                              </span>
                            </div>
                            <h4 className="font-display font-black text-sm text-deep-navy mt-2 leading-tight">
                              {sess.title}
                            </h4>
                          </div>

                          <div className="pt-3 border-t border-dashed border-deep-navy/10 mt-3 flex items-center justify-between text-[10px] font-bold text-primary-orange">
                            <span>Topics: {Array.isArray(sess.topics) ? sess.topics.slice(0, 2).join(', ') : 'TBA'}</span>
                            <span className="text-deep-navy/40">Upcoming</span>
                          </div>
                        </NeoCard>
                      ))}
                    </div>
                  )}
                </div>
              </NeoCard>

              {sessions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Assignments */}
                  <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6 space-y-4">
                    <h3 className="font-display font-black text-xl text-deep-navy flex items-center gap-2 border-b-2 border-deep-navy/10 pb-3">
                      <Sparkles className="w-5 h-5 text-primary-orange" />
                      <span>Homework Assignments</span>
                    </h3>
                    <ul className="space-y-3 font-semibold text-sm">
                      {sessions.map((sess, idx) => (
                        <li key={sess.id || idx} className="border-2 border-deep-navy bg-bg-cream p-3 rounded-xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-display font-bold text-xs text-deep-navy">
                              Session {sess.session_order} Assignment
                            </span>
                            <span className="text-[9px] px-2 py-0.5 border border-deep-navy bg-white rounded font-mono font-bold">
                              Assigned
                            </span>
                          </div>
                          <p className="text-xs text-deep-navy/70 leading-relaxed font-sans">
                            {sess.assignment || 'No specific assignment listed yet.'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </NeoCard>

                  {/* Resources */}
                  <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6 space-y-4">
                    <h3 className="font-display font-black text-xl text-deep-navy flex items-center gap-2 border-b-2 border-deep-navy/10 pb-3">
                      <CheckCircle className="w-5 h-5 text-mint" />
                      <span>Session Resources</span>
                    </h3>
                    <ul className="space-y-3 font-semibold text-sm">
                      {sessions.map((sess, idx) => (
                        <li key={sess.id || idx} className="border-2 border-deep-navy bg-white p-3 rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] space-y-1">
                          <span className="font-display font-bold text-xs text-deep-navy block">
                            Session {sess.session_order} Materials
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(sess.resources) && sess.resources.length > 0 ? (
                              sess.resources.map((res: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 border border-deep-navy/20 bg-bg-cream text-[9px] font-mono rounded font-bold">
                                  {res}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-deep-navy/40 italic">Materials will be posted during class.</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </NeoCard>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
