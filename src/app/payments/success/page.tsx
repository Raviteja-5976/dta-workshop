import React from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';
import SuccessCountdown from './SuccessCountdown';

// Razorpay redirects here (GET) after a successful payment, appending
// razorpay_payment_id, razorpay_payment_link_id, razorpay_payment_link_reference_id,
// razorpay_payment_link_status and razorpay_signature as query params.
interface Props {
  searchParams: Promise<{
    razorpay_payment_id?: string;
    razorpay_payment_link_status?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const paymentId = params.razorpay_payment_id || '';
  const status = params.razorpay_payment_link_status || 'paid';
  const isPaid = status === 'paid';

  return (
    <div className="min-h-screen bg-bg-cream bg-grid-pattern flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 border-2 border-deep-navy bg-yellow px-3 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1B1F3B]">
            <ShieldCheck size={14} className="text-deep-navy" />
            Razorpay Checkout
          </div>
        </div>

        {/* Result Card */}
        <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-6 md:p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-mint/10 border-3 border-mint rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#1B1F3B] animate-bounce">
            <CheckCircle className="w-10 h-10 text-mint" />
          </div>

          <div className="space-y-1">
            <h1 className="font-display font-black text-2xl md:text-3xl text-deep-navy leading-none uppercase">
              {isPaid ? 'Payment Successful!' : 'Payment Received'}
            </h1>
            <p className="text-xs font-bold text-deep-navy/60 leading-relaxed">
              Your seat is being confirmed. Your registration will show as confirmed on
              your dashboard once the payment is verified (usually within a few seconds).
            </p>
          </div>

          {paymentId && (
            <div className="p-3 border-2 border-deep-navy/10 bg-bg-cream rounded-xl text-left">
              <span className="text-[10px] font-display font-black tracking-widest text-deep-navy/40 uppercase block">
                Payment Reference
              </span>
              <span className="font-mono text-xs text-deep-navy/70 select-all break-all">{paymentId}</span>
            </div>
          )}

          <SuccessCountdown />
        </NeoCard>
      </div>
    </div>
  );
}
