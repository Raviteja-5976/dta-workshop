import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { StatTile } from '@/components/UI/StatTile';
import { StatusBadge } from '@/components/UI/StatusBadge';
import { NeoCard } from '@/components/UI/NeoCard';
import { NeoButton } from '@/components/UI/NeoButton';
import { 
  BookOpen, 
  Users, 
  CreditCard, 
  CheckSquare, 
  DollarSign, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  let stats = {
    totalWorkshops: 0,
    activeBatches: 0,
    totalRegistrations: 0,
    confirmedStudents: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  };
  let recentRegistrations: any[] = [];
  let fillingBatches: any[] = [];

  if (isMock) {
    // Populate with mock data only in simulated mode
    stats = {
      totalWorkshops: 1,
      activeBatches: 1,
      totalRegistrations: 10,
      confirmedStudents: 8,
      totalRevenue: 7992,
      pendingPayments: 2,
    };
    recentRegistrations = [
      {
        id: 'mock-reg-1',
        full_name: 'Amit Sharma',
        email: 'amit.sharma@example.com',
        registered_at: new Date(Date.now() - 3600000).toISOString(),
        status: 'confirmed',
        workshop_title: 'Build Your Portfolio Website Using AI',
        batch_label: 'Batch 1',
        payment_status: 'paid'
      },
      {
        id: 'mock-reg-2',
        full_name: 'Priya Patel',
        email: 'priya.patel@example.com',
        registered_at: new Date(Date.now() - 7200000).toISOString(),
        status: 'pending',
        workshop_title: 'Build Your Portfolio Website Using AI',
        batch_label: 'Batch 1',
        payment_status: 'pending'
      },
      {
        id: 'mock-reg-3',
        full_name: 'Rahul Verma',
        email: 'rahul.v@example.com',
        registered_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'confirmed',
        workshop_title: 'Build Your Portfolio Website Using AI',
        batch_label: 'Batch 1',
        payment_status: 'paid'
      }
    ];
    fillingBatches = [
      {
        id: 'mock-batch-1',
        workshop_title: 'Build Your Portfolio Website Using AI',
        batch_label: 'Batch 1',
        seat_limit: 50,
        seats_taken: 8,
        seats_remaining: 42,
        percentage: 16
      }
    ];
  } else {
    try {
      const supabase = await createClient();

      // Fetch workshops count
      const { count: wsCount } = await supabase
        .from('workshops')
        .select('*', { count: 'exact', head: true });

      // Fetch active batches (Upcoming / Live)
      const { count: batchCount } = await supabase
        .from('workshop_batches')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Live', 'Upcoming']);

      // Fetch registrations count
      const { count: regCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });

      // Fetch confirmed registrations
      const { count: confCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');

      // Fetch total revenue
      const { data: paidPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid');
      
      const revSum = paidPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Fetch pending payments count
      const { count: pendCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      stats = {
        totalWorkshops: wsCount ?? 0,
        activeBatches: batchCount ?? 0,
        totalRegistrations: regCount ?? 0,
        confirmedStudents: confCount ?? 0,
        totalRevenue: revSum,
        pendingPayments: pendCount ?? 0
      };

      // Fetch recent registrations (latest 10)
      const { data: dbRegs } = await supabase
        .from('registrations')
        .select(`
          id,
          full_name,
          email,
          registered_at,
          status,
          workshop_batches (
            batch_label,
            workshops ( title )
          )
        `)
        .order('registered_at', { ascending: false })
        .limit(10);

      if (dbRegs && dbRegs.length > 0) {
        // Fetch linked payment statuses
        const regIds = dbRegs.map(r => r.id);
        const { data: regPayments } = await supabase
          .from('payments')
          .select('registration_id, status')
          .in('registration_id', regIds);

        recentRegistrations = dbRegs.map((r: any) => {
          const matchingPayment = regPayments?.find(p => p.registration_id === r.id);
          return {
            id: r.id,
            full_name: r.full_name || 'Anonymous',
            email: r.email || '',
            registered_at: r.registered_at,
            status: r.status,
            workshop_title: r.workshop_batches?.workshops?.title || 'Unknown Workshop',
            batch_label: r.workshop_batches?.batch_label || 'Batch 1',
            payment_status: matchingPayment?.status || 'unpaid'
          };
        });
      }

      // Fetch seat status view details
      const { data: dbSeatStatus } = await supabase
        .from('batch_seat_status')
        .select(`
          batch_id,
          seat_limit,
          seats_taken,
          seats_remaining,
          workshop_batches:batch_id (
            batch_label,
            workshops:workshop_id ( title )
          )
        `);

      if (dbSeatStatus && dbSeatStatus.length > 0) {
        fillingBatches = dbSeatStatus.map((s: any) => {
          const limit = s.seat_limit || 50;
          const taken = s.seats_taken || 0;
          const pct = Math.min(Math.round((taken / limit) * 100), 100);
          return {
            id: s.batch_id,
            workshop_title: s.workshop_batches?.workshops?.title || 'Unknown Workshop',
            batch_label: s.workshop_batches?.batch_label || 'Batch 1',
            seat_limit: limit,
            seats_taken: taken,
            seats_remaining: s.seats_remaining ?? (limit - taken),
            percentage: pct
          };
        }).sort((a, b) => b.percentage - a.percentage); // highest filled first
      }

    } catch (e) {
      console.error('Failed to load database stats, using mock data fallback:', e);
    }
  }

  return (
    <div className="space-y-10">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1 text-left">
          <span className="inline-flex items-center gap-1.5 border-2 border-deep-navy bg-yellow px-3 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1B1F3B]">
            Dashboard
          </span>
          <h1 className="font-display font-black text-4xl text-deep-navy tracking-tight leading-none uppercase">
            Platform Overview
          </h1>
        </div>
        <div className="flex gap-3 self-start md:self-auto">
          <Link href="/admin/workshops/new">
            <NeoButton variant="orange" size="sm">
              + New Workshop
            </NeoButton>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatTile label="Total Workshops" value={stats.totalWorkshops} icon={BookOpen} variant="white" />
        <StatTile label="Active Runs" value={stats.activeBatches} icon={CreditCard} variant="sky" />
        <StatTile label="Registrations" value={stats.totalRegistrations} icon={Users} variant="yellow" />
        <StatTile label="Confirmed Students" value={stats.confirmedStudents} icon={CheckSquare} variant="mint" />
        <StatTile label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} variant="orange" />
        <StatTile label="Pending Payments" value={stats.pendingPayments} icon={Clock} variant="coral" />
      </div>

      {/* Main Section split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Recent Registrations */}
        <div className="lg:col-span-8 space-y-6">
          <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6">
            <div className="flex items-center justify-between border-b-2 border-deep-navy/10 pb-4 mb-6">
              <h2 className="font-display font-black text-2xl tracking-tight leading-none uppercase">
                Recent Signups
              </h2>
              <Link href="/admin/registrations">
                <span className="text-xs font-bold text-primary-orange hover:underline inline-flex items-center gap-1">
                  View All Registrations <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full divide-y-3 divide-deep-navy">
                  <thead>
                    <tr className="bg-yellow border-b-3 border-deep-navy text-left font-display font-black text-xs uppercase text-deep-navy">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Workshop & Batch</th>
                      <th className="px-4 py-3">Signup Date</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Reg Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-deep-navy/10 text-sm font-semibold">
                    {recentRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-deep-navy/40 font-bold">
                          No registrations found yet.
                        </td>
                      </tr>
                    ) : (
                      recentRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-bg-cream/50 transition-colors">
                          <td className="px-4 py-3 text-left">
                            <p className="font-bold text-deep-navy capitalize">{reg.full_name}</p>
                            <p className="text-xs text-deep-navy/50">{reg.email}</p>
                          </td>
                          <td className="px-4 py-3 text-left">
                            <p className="font-bold truncate max-w-xs">{reg.workshop_title}</p>
                            <span className="text-xs px-2 py-0.5 border border-deep-navy/20 bg-bg-cream rounded font-mono font-bold">
                              {reg.batch_label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-left text-xs text-deep-navy/60 font-mono">
                            {new Date(reg.registered_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 text-left">
                            <StatusBadge status={reg.payment_status} />
                          </td>
                          <td className="px-4 py-3 text-left">
                            <StatusBadge status={reg.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </NeoCard>
        </div>

        {/* Right Side: Batches Capacity / Filling Up */}
        <div className="lg:col-span-4 space-y-6">
          <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6">
            <div className="flex items-center justify-between border-b-2 border-deep-navy/10 pb-4 mb-6">
              <h2 className="font-display font-black text-xl tracking-tight leading-none uppercase">
                Batch Capacity
              </h2>
              <TrendingUp className="w-5 h-5 text-deep-navy" />
            </div>

            <div className="space-y-6">
              {fillingBatches.length === 0 ? (
                <p className="text-center text-sm font-bold text-deep-navy/40 py-8">
                  No active batches monitored.
                </p>
              ) : (
                fillingBatches.map((batch) => (
                  <div key={batch.id} className="space-y-2 text-left">
                    <div className="flex justify-between items-start text-xs font-bold">
                      <div className="max-w-[70%]">
                        <p className="font-display font-black text-deep-navy text-sm leading-tight truncate">
                          {batch.workshop_title}
                        </p>
                        <span className="text-[10px] text-deep-navy/50 font-mono">
                          {batch.batch_label}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-sm text-deep-navy">
                          {batch.seats_taken} / {batch.seat_limit}
                        </span>
                        <p className="text-[9px] text-deep-navy/40 font-bold uppercase">Seats Filled</p>
                      </div>
                    </div>

                    {/* Neo brutalist progress bar */}
                    <div className="w-full h-5 border-3 border-deep-navy bg-bg-cream rounded-xl overflow-hidden shadow-neo-inset p-0.5">
                      <div 
                        className="h-full bg-mint border-r-2 border-deep-navy rounded-lg transition-all duration-500"
                        style={{ width: `${batch.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-deep-navy/50">
                      <span>{batch.percentage}% Occupancy</span>
                      <span className={batch.seats_remaining <= 5 ? 'text-coral' : ''}>
                        {batch.seats_remaining} seats left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}
