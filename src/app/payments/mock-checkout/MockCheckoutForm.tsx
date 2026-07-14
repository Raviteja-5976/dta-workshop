"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle } from 'lucide-react';
import { NeoButton } from '@/components/UI/NeoButton';
import { processStudentMockPaymentAction } from '@/actions/payments';

interface MockCheckoutFormProps {
  regId: string;
}

export default function MockCheckoutForm({ regId }: MockCheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePayment = async () => {
    if (!regId) {
      setErrorMsg('Missing registration ID.');
      setStatus('error');
      return;
    }
    setLoading(true);
    setStatus('idle');
    try {
      const res = await processStudentMockPaymentAction(regId);
      if (res.success) {
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard?payment=success');
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Simulated checkout processing failed.');
        setStatus('error');
      }
    } catch (e) {
      setErrorMsg('Network error while processing mock payment.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-mint/10 border-3 border-mint rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#1B1F3B] animate-bounce">
          <CheckCircle className="w-10 h-10 text-mint" />
        </div>
        <div>
          <h3 className="font-display font-black text-xl text-deep-navy uppercase">
            Payment Verified!
          </h3>
          <p className="text-xs font-semibold text-deep-navy/60 mt-1">
            Redirecting to your student workspace portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status === 'error' && (
        <div className="p-3 bg-coral/10 border-2 border-coral rounded-xl text-coral text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Selector mock methods */}
      <div className="space-y-2 text-xs font-semibold text-deep-navy/70">
        <p className="font-display uppercase text-deep-navy text-[10px]">Select payment method simulation</p>
        <div className="border-2 border-deep-navy rounded-xl p-3 bg-bg-cream flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <input type="radio" defaultChecked className="accent-primary-orange" />
            <span>UPI (PhonePe, GPay, PayTM)</span>
          </div>
          <span className="font-bold text-deep-navy text-[10px] uppercase">Default</span>
        </div>
      </div>

      <NeoButton
        variant="orange"
        size="md"
        className="w-full mt-4"
        onClick={handlePayment}
        disabled={loading}
      >
        <CreditCard size={16} className="mr-1.5" />
        {loading ? 'Processing transaction...' : 'Simulate Successful Payment'}
      </NeoButton>
    </div>
  );
}
