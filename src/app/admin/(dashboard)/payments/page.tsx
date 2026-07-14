import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { PaymentsListClient } from './PaymentsListClient';

export default async function PaymentsPage() {
  let payments: any[] = [];

  if (isMock) {
    payments = [
      {
        id: 'mock-pay-1',
        amount: 999,
        currency: 'INR',
        status: 'paid',
        provider: 'razorpay',
        provider_order_id: 'plink_mock_123',
        provider_payment_id: 'pay_mock_999',
        payment_method: 'upi',
        receipt_url: null,
        paid_at: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date(Date.now() - 3900000).toISOString(),
        full_name: 'Amit Sharma',
        email: 'amit.sharma@example.com',
        workshop_title: 'Build Your Portfolio Website Using AI',
        batch_label: 'Batch 1'
      },
      {
        id: 'mock-pay-2',
        amount: 999,
        currency: 'INR',
        status: 'pending',
        provider: 'razorpay',
        provider_order_id: 'plink_mock_456',
        provider_payment_id: null,
        payment_method: null,
        receipt_url: '/admin/payments/mock-checkout?regId=mock-reg-2',
        paid_at: null,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        full_name: 'Priya Patel',
        email: 'priya.patel@example.com',
        workshop_title: 'Build Your Portfolio Website Using AI',
        batch_label: 'Batch 1'
      }
    ];
  } else {
    try {
      const supabase = await createClient();

      const { data: dbPayments, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          currency,
          status,
          provider,
          provider_order_id,
          provider_payment_id,
          payment_method,
          receipt_url,
          paid_at,
          created_at,
          registrations (
            full_name,
            email,
            workshop_batches (
              batch_label,
              workshops ( title )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (dbPayments) {
        payments = dbPayments.map((p: any) => ({
          id: p.id,
          amount: Number(p.amount),
          currency: p.currency,
          status: p.status,
          provider: p.provider,
          provider_order_id: p.provider_order_id,
          provider_payment_id: p.provider_payment_id,
          payment_method: p.payment_method,
          receipt_url: p.receipt_url,
          paid_at: p.paid_at,
          created_at: p.created_at,
          full_name: p.registrations?.full_name || 'Anonymous',
          email: p.registrations?.email || '',
          workshop_title: p.registrations?.workshop_batches?.workshops?.title || 'Unknown Workshop',
          batch_label: p.registrations?.workshop_batches?.batch_label || 'Batch 1'
        }));
      }

    } catch (e) {
      console.error('Failed to load payments history:', e);
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
            Payments History
          </h1>
        </div>
      </div>

      <PaymentsListClient initialPayments={payments} />
    </div>
  );
}
