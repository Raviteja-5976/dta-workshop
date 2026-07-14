"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { NeoButton } from '@/components/UI/NeoButton';

const REDIRECT_SECONDS = 15;

export default function SuccessCountdown() {
  const router = useRouter();
  const [remaining, setRemaining] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (remaining <= 0) {
      router.push('/dashboard?payment=success');
      router.refresh();
      return;
    }
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, router]);

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-deep-navy/60 text-center">
        Redirecting to your student dashboard in{' '}
        <span className="font-display font-black text-deep-navy">{remaining}</span>
        {' '}second{remaining === 1 ? '' : 's'}...
      </p>

      <Link href="/dashboard?payment=success" className="block">
        <NeoButton variant="orange" size="md" className="w-full py-4 text-base">
          Go to Dashboard Now
          <ChevronRight size={16} className="ml-1" />
        </NeoButton>
      </Link>
    </div>
  );
}
