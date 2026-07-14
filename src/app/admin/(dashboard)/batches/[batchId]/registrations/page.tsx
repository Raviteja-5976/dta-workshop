import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { RegistrationsListClient } from './RegistrationsListClient';
import { workshopsData as staticWorkshops } from '@/data/workshops';

interface RegistrationsPageProps {
  params: Promise<{ batchId: string }>;
}

export default async function RegistrationsPage({ params }: RegistrationsPageProps) {
  const { batchId } = await params;
  let workshopId = 'mock-ws-id';
  let workshopTitle = 'Workshop';
  let batchLabel = 'Batch 1';
  let batchPrice = 999;
  let registrations: any[] = [];

  if (isMock) {
    const staticWs = staticWorkshops[0];
    workshopTitle = staticWs.title;
    workshopId = staticWs.slug;
    batchLabel = 'Batch 1';
    batchPrice = staticWs.price;
    registrations = [
      {
        id: 'mock-reg-1',
        user_id: 'mock-user-1',
        full_name: 'Amit Sharma',
        email: 'amit.sharma@example.com',
        phone: '+919876543210',
        status: 'confirmed',
        confirmation_code: 'DTA-PORT-7F3A9',
        registered_at: new Date(Date.now() - 3600000).toISOString(),
        payment_status: 'paid',
        payment_link: null,
        payment_amount: staticWs.price
      },
      {
        id: 'mock-reg-2',
        user_id: 'mock-user-2',
        full_name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+919988776655',
        status: 'pending',
        confirmation_code: null,
        registered_at: new Date(Date.now() - 7200000).toISOString(),
        payment_status: 'pending',
        payment_link: '/admin/payments/mock-checkout?regId=mock-reg-2',
        payment_amount: staticWs.price
      }
    ];
  } else {
    try {
      const supabase = await createClient();

      // Fetch batch details
      const { data: batch } = await supabase
        .from('workshop_batches')
        .select(`
          workshop_id,
          batch_label,
          price,
          workshops ( title )
        `)
        .eq('id', batchId)
        .single();
      
      if (batch) {
        workshopId = batch.workshop_id;
        batchLabel = batch.batch_label;
        batchPrice = Number(batch.price || 0);
        workshopTitle = (batch.workshops as any)?.title || 'Workshop';
      }

      // Fetch registrations
      const { data: dbRegs, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('batch_id', batchId)
        .order('registered_at', { ascending: false });

      if (regError) throw regError;

      if (dbRegs && dbRegs.length > 0) {
        // Fetch linked payments
        const regIds = dbRegs.map(r => r.id);
        const { data: dbPayments } = await supabase
          .from('payments')
          .select('registration_id, status, receipt_url, amount')
          .in('registration_id', regIds);

        registrations = dbRegs.map((r: any) => {
          const payment = dbPayments?.find(p => p.registration_id === r.id);
          return {
            id: r.id,
            user_id: r.user_id,
            full_name: r.full_name || 'Anonymous',
            email: r.email || '',
            phone: r.phone,
            status: r.status,
            confirmation_code: r.confirmation_code,
            registered_at: r.registered_at,
            payment_status: payment?.status || 'unpaid',
            payment_link: payment?.receipt_url || null,
            payment_amount: payment ? Number(payment.amount) : null
          };
        });
      }

    } catch (e) {
      console.error('Failed to load batch registrations:', e);
    }
  }

  return (
    <RegistrationsListClient
      batchId={batchId}
      workshopId={workshopId}
      workshopTitle={workshopTitle}
      batchLabel={batchLabel}
      batchPrice={batchPrice}
      initialRegistrations={registrations}
    />
  );
}
