"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, KeyRound, ArrowLeft } from 'lucide-react';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { verifyPasscodeAction } from '@/actions/admin';
import { supabase, isMock } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminVerifyPage() {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if not authenticated to begin with
  useEffect(() => {
    async function checkAuth() {
      if (isMock) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length < 4) {
      setErrorMsg('Please enter a valid passcode.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await verifyPasscodeAction(passcode);
      if (res.success) {
        setSuccessMsg('Passcode verified! Unlocking terminal...');
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1000);
      } else {
        setErrorMsg(res.error || 'Invalid passcode.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-bg-cream bg-grid-pattern text-deep-navy">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 border-3 border-deep-navy bg-yellow rounded-2xl flex items-center justify-center shadow-neo mx-auto mb-4 animate-bounce">
            <KeyRound className="w-8 h-8 text-deep-navy" />
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-deep-navy leading-none uppercase">
            Passcode Gated
          </h1>
          <p className="font-sans font-bold text-deep-navy/60 text-sm">
            Enter the secondary Admin Security PIN to establish a secure operator session.
          </p>
        </div>

        <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-6 md:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-coral/10 border-2 border-coral rounded-xl text-coral text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-mint/10 border-2 border-mint rounded-xl text-deep-navy text-xs font-bold">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-display font-black text-xs uppercase text-deep-navy flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-primary-orange" />
                Security PIN Code
              </label>
              <input
                type="password"
                maxLength={10}
                placeholder="••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center border-3 border-deep-navy rounded-xl bg-bg-cream font-black tracking-widest text-2xl px-4 py-4 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy"
                autoFocus
              />
              <span className="text-[10px] font-bold text-deep-navy/40 block text-center mt-2">
                Enter your administrative verification PIN
              </span>
            </div>

            <NeoButton
              variant="mint"
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Authorizing Terminal...' : 'Authorize Terminal'}
            </NeoButton>
          </form>

          <div className="mt-6 border-t border-deep-navy/10 pt-4 flex justify-between items-center text-xs font-bold">
            <Link href="/admin/login" className="text-deep-navy/60 hover:text-deep-navy flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Sign-in
            </Link>
            {isMock && (
              <span className="text-warning bg-warning/10 px-2.5 py-0.5 border border-warning rounded">
                Simulated PIN is 123456
              </span>
            )}
          </div>
        </NeoCard>
      </div>
    </div>
  );
}
