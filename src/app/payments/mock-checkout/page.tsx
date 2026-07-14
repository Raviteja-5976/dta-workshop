import React from 'react';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';
import MockCheckoutForm from './MockCheckoutForm';

interface Props {
  searchParams: Promise<{ regId?: string; amount?: string }>;
}

export default async function MockCheckoutPage({ searchParams }: Props) {
  const params = await searchParams;
  const regId = params.regId || '';
  const amount = params.amount || '999';

  return (
    <div className="min-h-screen bg-bg-cream bg-grid-pattern flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 border-2 border-deep-navy bg-yellow px-3 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1B1F3B]">
            <ShieldCheck size={14} className="text-deep-navy" />
            Sandbox Gateway
          </div>
          <h1 className="font-display font-black text-3xl text-deep-navy leading-none uppercase pt-2">
            Razorpay Simulation
          </h1>
          <p className="text-xs font-bold text-deep-navy/60">
            This is a local simulated transaction gate. No real funds are moved.
          </p>
        </div>

        {/* Checkout Card */}
        <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-6 md:p-8 space-y-6 text-left">
          {/* Details */}
          <div className="border-b-2 border-deep-navy/10 pb-4 space-y-2 font-semibold text-sm">
            <div className="flex justify-between items-baseline">
              <span className="text-deep-navy/50">Merchant:</span>
              <span className="font-bold text-deep-navy">DevTrackAcademy Bootcamp</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-deep-navy/50">Transaction ID:</span>
              <span className="font-mono text-xs text-deep-navy/70 select-all">{regId}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-deep-navy/10">
              <span className="text-deep-navy/50 font-display uppercase text-xs">Total Amount:</span>
              <span className="font-display font-black text-2xl text-deep-navy">₹{amount}</span>
            </div>
          </div>

          {/* Interactive Form client component */}
          <MockCheckoutForm regId={regId} />
        </NeoCard>
      </div>
    </div>
  );
}
