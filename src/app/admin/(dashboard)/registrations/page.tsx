import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { GlobalRegistrationsClient } from './GlobalRegistrationsClient';

export default async function GlobalRegistrationsPage() {
  let registrations: any[] = [];

  if (isMock) {
    registrations = [
      {
        id: 'mock-reg-1',
        full_name: 'Amit Sharma',
        email: 'amit.sharma@example.com',
        phone: '+919876543210',
        status: 'confirmed',
        confirmation_code: 'DTA-CONF-A1B2C',
        registered_at: new Date(Date.now() - 3600000).toISOString(),
        workshop_title: 'Build Your Portfolio Website Using AI',
        batch_label: 'Batch 1',
        payment_status: 'paid'
      },
      {
        id: 'mock-reg-2',
        full_name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+919988776655',
        status: 'pending',
        confirmation_code: null,
        registered_at: new Date(Date.now() - 7200000).toISOString(),
        workshop_title: 'Build Your Portfolio Website Using AI',
        batch_label: 'Batch 1',
        payment_status: 'pending'
      }
    ];
  } else {
    try {
      const supabase = await createClient();

      const { data: dbRegs, error } = await supabase
        .from('registrations')
        .select(`
          id,
          full_name,
          email,
          phone,
          status,
          confirmation_code,
          registered_at,
          workshop_batches (
            batch_label,
            workshops ( title )
          )
        `)
        .order('registered_at', { ascending: false });

      if (error) throw error;

      if (dbRegs && dbRegs.length > 0) {
        const regIds = dbRegs.map(r => r.id);
        const { data: dbPayments } = await supabase
          .from('payments')
          .select('registration_id, status')
          .in('registration_id', regIds);

        registrations = dbRegs.map((r: any) => {
          const payment = dbPayments?.find(p => p.registration_id === r.id);
          return {
            id: r.id,
            full_name: r.full_name || 'Anonymous',
            email: r.email || '',
            phone: r.phone,
            status: r.status,
            confirmation_code: r.confirmation_code,
            registered_at: r.registered_at,
            workshop_title: r.workshop_batches?.workshops?.title || 'Unknown Workshop',
            batch_label: r.workshop_batches?.batch_label || 'Batch 1',
            payment_status: payment?.status || 'unpaid'
          };
        });
      }

    } catch (e) {
      console.error('Failed to load global registrations:', e);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b-2 border-deep-navy/10 pb-4 text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 border-2 border-deep-navy bg-yellow px-3 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1B1F3B]">
            Maintain
          </span>
          <h1 className="font-display font-black text-4xl text-deep-navy tracking-tight leading-none uppercase mt-2">
            All Registrations
          </h1>
        </div>
      </div>

      <GlobalRegistrationsClient initialRegistrations={registrations} />
    </div>
  );
}
