"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { supabase, isMock } from '@/lib/supabase';
import {
  LogOut,
  User,
  BookOpen,
  Clock,
  CheckCircle,
  Calendar,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, checkUser, signOut } = useAuthStore();
  const router = useRouter();

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Fetch the student's registrations (tiles only — full detail lives on
  // /dashboard/[id]).
  useEffect(() => {
    if (!user) return;

    async function fetchRegistrations() {
      setLoadingData(true);
      try {
        if (isMock) {
          setRegistrations([
            {
              id: 'mock-reg-123',
              status: 'confirmed',
              registered_at: new Date().toISOString(),
              batch_id: 'mock-batch-1',
              workshop_batches: {
                batch_label: 'Batch 1',
                price: 999,
                date_label: '11 - 12 July',
                status: 'Live',
                workshops: { title: 'Build Your Portfolio Website Using AI', slug: 'build-your-portfolio' },
              },
            },
          ]);
          setLoadingData(false);
          return;
        }

        const { data: dbRegs, error } = await supabase
          .from('registrations')
          .select(`
            id,
            status,
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
          .eq('user_id', user.id)
          .order('registered_at', { ascending: false });

        if (error) throw error;
        setRegistrations(dbRegs || []);
      } catch (err) {
        console.error('Error fetching registrations:', err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchRegistrations();
  }, [user]);

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
            Verifying Workspace...
          </h2>
          <p className="font-sans font-semibold text-deep-navy/80 mt-2">
            Loading your student portal and enrollments.
          </p>
        </NeoCard>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const userEmail = user.email || 'student@dta.com';
  const userName = user.user_metadata?.full_name || userEmail.split('@')[0];

  return (
    <div className="min-h-screen bg-bg-cream bg-grid-pattern pb-12">
      {/* Top Header */}
      <header className="border-b-4 border-deep-navy bg-white py-4 shadow-[0_4px_0_0_#1B1F3B] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <Link href="/workshops" className="flex items-center gap-2 font-display font-extrabold uppercase text-sm text-deep-navy hover:text-primary-orange transition-colors">
            <ArrowLeft size={16} />
            Browse Catalog
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

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        {/* Profile summary */}
        <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6 text-left mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border-2 border-deep-navy bg-primary-orange rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1B1F3B]">
              <User className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-deep-navy leading-none capitalize">{userName}</h3>
              <p className="font-sans font-bold text-xs text-deep-navy/50 mt-1">{userEmail}</p>
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <span className="font-sans font-bold text-[10px] text-deep-navy/40 uppercase block">Student ID</span>
              <span className="font-mono text-sm text-deep-navy font-bold">DTA-{user.id?.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </NeoCard>

        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display font-black text-2xl md:text-3xl text-deep-navy uppercase leading-none">
            Your Enrolled Workshops
          </h2>
          {registrations.length > 0 && (
            <span className="font-display font-black text-xs uppercase bg-yellow px-2.5 py-1 border-2 border-deep-navy rounded-lg shadow-[2px_2px_0px_0px_#1B1F3B]">
              {registrations.length}
            </span>
          )}
        </div>

        {registrations.length === 0 ? (
          /* Empty State: No registrations */
          <div className="max-w-xl mx-auto text-center py-10">
            <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-8 md:p-12 space-y-6">
              <div className="w-16 h-16 bg-yellow/10 border-3 border-yellow rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#1B1F3B]">
                <BookOpen className="w-8 h-8 text-primary-orange" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-black text-3xl text-deep-navy leading-none uppercase">
                  No Active Enrollments
                </h2>
                <p className="font-sans font-bold text-deep-navy/60 text-sm leading-relaxed max-w-sm mx-auto">
                  You are not registered in any scheduled live bootcamps or workshops. Browse our catalog to secure a seat.
                </p>
              </div>
              <Link href="/workshops">
                <NeoButton variant="orange" size="md" className="px-8 mt-4">
                  Browse Workshops Catalog
                  <ChevronRight size={16} className="ml-1" />
                </NeoButton>
              </Link>
            </NeoCard>
          </div>
        ) : (
          /* Registration tiles */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {registrations.map((reg) => {
              const workshop = reg.workshop_batches?.workshops;
              const batch = reg.workshop_batches;
              const isConfirmed = reg.status === 'confirmed';
              const isFreeBatch = Number(batch?.price ?? 0) <= 0;

              return (
                <Link key={reg.id} href={`/dashboard/${reg.id}`} className="block h-full">
                  <NeoCard
                    variant="white"
                    borderSize="normal"
                    shadowSize="normal"
                    hoverEffect={true}
                    className="p-6 h-full flex flex-col justify-between gap-5 border-3"
                  >
                    <div className="space-y-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border-2 border-deep-navy rounded-lg font-display font-black text-[10px] uppercase shadow-[1.5px_1.5px_0_0_#1B1F3B] ${
                          isConfirmed ? 'bg-mint text-deep-navy' : 'bg-coral text-white'
                        }`}
                      >
                        {isConfirmed ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {isConfirmed ? 'Confirmed' : isFreeBatch ? 'Pending' : 'Pending Payment'}
                      </span>
                      <h3 className="font-display font-black text-xl text-deep-navy leading-tight">
                        {workshop?.title || 'Workshop'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-deep-navy/60">
                        <Calendar size={12} className="text-deep-navy/40" />
                        <span>{batch?.batch_label}</span>
                        <span className="text-deep-navy/30">•</span>
                        <span>{batch?.date_label || 'TBA'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t-2 border-deep-navy/10 pt-4">
                      <span className="font-display font-black text-lg text-deep-navy">
                        {isFreeBatch ? 'FREE' : `₹${batch?.price}`}
                      </span>
                      <span className="inline-flex items-center gap-1 font-display font-black text-xs uppercase text-primary-orange">
                        {isConfirmed ? 'View Details' : isFreeBatch ? 'Confirm Seat' : 'Complete Payment'}
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </NeoCard>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
