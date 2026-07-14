"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Mail, Lock, Info, ArrowLeft } from 'lucide-react';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { supabase, isMock } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/useAuthStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onLogin = async (data: LoginFormValues) => {
    setAuthLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        const user = authData.user;
        setUser(user);
        
        if (isMock) {
          setSuccessMsg('Authenticating admin...');
          setTimeout(() => {
            router.push('/admin/verify');
            router.refresh();
          }, 1000);
          return;
        }

        // Verify role is admin in Supabase profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          // Sign out immediately if not admin
          await supabase.auth.signOut();
          setUser(null);
          setErrorMsg('Access Denied: This account does not have administrative privileges.');
        } else {
          setSuccessMsg('Identity verified! Redirecting to secure passcode gate...');
          setTimeout(() => {
            router.push('/admin/verify');
            router.refresh();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-bg-cream">
      {/* Left panel: Admin Terminal Info */}
      <div className="lg:col-span-5 bg-deep-navy border-r-4 border-deep-navy relative overflow-hidden flex flex-col justify-between p-8 md:p-12 text-white bg-grid-pattern">
        <Link href="/" className="inline-flex items-center gap-2 font-display font-extrabold uppercase text-sm text-yellow hover:text-white transition-colors self-start border-2 border-white/20 bg-white/5 px-3 py-1.5 rounded-xl cursor-pointer">
          <ArrowLeft size={16} />
          Back to Site
        </Link>

        <div className="my-auto py-12 space-y-8 relative z-10">
          <div className="space-y-2">
            <span className="font-display font-extrabold text-xs uppercase bg-primary-orange border-2 border-white px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] text-white inline-block">
              Operator Portal
            </span>
            <h2 className="font-display font-black text-5xl md:text-7xl tracking-tight leading-none text-white drop-shadow-[4px_4px_0_#FF6B35]">
              Secure Gate
            </h2>
          </div>
          <p className="font-sans font-bold text-base text-white/80 max-w-sm leading-relaxed">
            This is a restricted workstation. Administrative credentials and secondary security passcode authentication are required to proceed.
          </p>
        </div>

        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs font-bold text-white/50">
          <span>DevTrackAcademy.Admin v1.0</span>
          {isMock && (
            <span className="bg-yellow text-deep-navy border border-deep-navy px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Info size={10} />
              Simulated Mode
            </span>
          )}
        </div>
      </div>

      {/* Right panel: Login form */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12 relative bg-grid-pattern">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="font-display font-black text-4xl text-deep-navy leading-none">
              Sign In to Terminal
            </h1>
            <p className="font-sans font-bold text-deep-navy/60">
              Enter your email and password to verify your administrative identity.
            </p>
          </div>

          <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 bg-yellow/10 border-2 border-yellow rounded-xl p-3 text-deep-navy text-xs font-bold">
              <ShieldCheck className="w-5 h-5 text-warning stroke-[2.5]" />
              <span>Identity verification is monitored. Secure credentials are required.</span>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-coral/10 border-2 border-coral rounded-xl text-coral text-sm font-bold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-mint/10 border-2 border-mint rounded-xl text-deep-navy text-sm font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onLogin)} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="font-display font-black text-xs uppercase text-deep-navy flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  Admin Email
                </label>
                <input
                  type="email"
                  placeholder="admin@devtrackacademy.com"
                  className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-coral font-bold text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="font-display font-black text-xs uppercase text-deep-navy flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Admin Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-coral font-bold text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <NeoButton
                variant="orange"
                type="submit"
                className="w-full mt-4"
                disabled={authLoading}
              >
                {authLoading ? 'Verifying Identity...' : 'Verify & Continue'}
              </NeoButton>
            </form>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}
