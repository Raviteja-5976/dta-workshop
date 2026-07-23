"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, CheckCircle2, Lock, Mail, User, Info, ArrowLeft } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { supabase, isMock } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useLegalModal } from '@/lib/store/useLegalModal';
import { sendWelcomeEmailAction } from '@/actions/email';

// Form Validation Schemas
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm Password is required'),
  acceptTerms: z.literal(true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

function AuthPageContent() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/dashboard';
  const { setUser, user } = useAuthStore();
  const openLegal = useLegalModal((s) => s.open);

  // If already logged in, redirect to target page
  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo]);

  // Surface any error handed back by the OAuth callback (?error=...).
  useEffect(() => {
    const err = searchParams?.get('error');
    if (err) setErrorMsg(err);
  }, [searchParams]);

  // Kick off a Google / GitHub OAuth login. Supabase redirects the browser to
  // the provider and back to /auth/callback, which finalizes the session.
  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isMock) {
      setErrorMsg('Social login needs live Supabase keys — it is disabled in simulated mode.');
      return;
    }

    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setOauthLoading(null);
      }
      // On success the browser is redirected to the provider — nothing more here.
    } catch {
      setErrorMsg('Could not start social login. Please try again.');
      setOauthLoading(null);
    }
  };

  // Form Hooks
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
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
        setUser(authData.user);
        setSuccessMsg('Successfully logged in! Redirecting...');
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    setAuthLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (authData.session) {
        // Email confirmation is OFF — user is signed in immediately.
        setUser(authData.session.user);
        // Fire the welcome email (server resolves the user from the session
        // cookie + dedupes). Fire-and-forget so it never blocks the redirect.
        sendWelcomeEmailAction().catch(() => {});
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 1000);
      } else {
        // Email confirmation is ON — no session yet. Don't redirect (it would
        // just bounce back to /auth). Tell the user to confirm their email.
        resetSignupForm();
        setActiveTab('login');
        setSuccessMsg('Account created! Check your inbox and confirm your email, then log in.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-bg-cream">
      {/* Left panel: Illustration and Benefits */}
      <div className="lg:col-span-5 bg-deep-navy border-r-4 border-deep-navy relative overflow-hidden flex flex-col justify-between p-8 md:p-12 text-white bg-grid-pattern">
        {/* Top bar back link */}
        <Link href="/" className="inline-flex items-center gap-2 font-display font-extrabold uppercase text-sm text-yellow hover:text-white transition-colors self-start border-2 border-white/20 bg-white/5 px-3 py-1.5 rounded-xl cursor-pointer">
          <ArrowLeft size={16} />
          Back to Homepage
        </Link>

        {/* Motivational Core loop */}
        <div className="my-auto py-12 space-y-12 relative z-10">
          <div className="space-y-2">
            {['Learn.', 'Build.', 'Deploy.', 'Repeat.'].map((word, i) => (
              <motion.h2
                key={i}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="font-display font-black text-6xl md:text-8xl tracking-tight leading-none text-white drop-shadow-[4px_4px_0_#FF6B35]"
              >
                {word}
              </motion.h2>
            ))}
          </div>

          <p className="font-sans font-bold text-lg text-white/80 max-w-sm leading-relaxed">
            Join Workshop.DevTrackAcademy and take part in small-batch mentor-led coding sessions. Build full-stack code live.
          </p>
        </div>

        {/* Floating illustrations simulation */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Floating laptop */}
          <div className="absolute top-[12%] right-[5%] w-24 h-24 border-2 border-white/20 bg-white/5 rounded-2xl flex items-center justify-center animate-float-delayed">
            <span className="text-white/20 font-display font-extrabold text-3xl">&lt;/&gt;</span>
          </div>

          {/* Floating code board */}
          <div className="absolute bottom-[20%] right-[10%] w-32 border-2 border-white/20 bg-white/5 rounded-2xl p-3 animate-float space-y-1">
            <div className="h-2 w-12 bg-white/20 rounded" />
            <div className="h-2 w-16 bg-white/20 rounded" />
            <div className="h-2 w-10 bg-white/20 rounded" />
          </div>

          {/* Floating star */}
          <div className="absolute top-[40%] right-[25%] text-yellow font-display font-black text-6xl opacity-25 animate-float-slow">
            *
          </div>
        </div>

        {/* Footer info showing status */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs font-bold text-white/50">
          <span>DevTrackAcademy.Workshop</span>
          {isMock && (
            <span className="bg-yellow text-deep-navy border border-deep-navy px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Info size={10} />
              Simulated Mode
            </span>
          )}
        </div>
      </div>

      {/* Right panel: Authentication Card */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12 relative bg-grid-pattern">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="font-display font-black text-4xl text-deep-navy leading-none">
              Welcome to the Bootcamp
            </h1>
            <p className="font-sans font-bold text-deep-navy/60">
              Sign in to manage your workshop seats and live tasks.
            </p>
          </div>

          {/* Auth Card */}
          <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-6 md:p-8">
            {/* Sliding tab selector */}
            <div className="flex border-3 border-deep-navy rounded-2xl bg-bg-cream p-1 mb-8 relative overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                }}
                className="flex-1 py-3 text-center font-display font-black text-lg text-deep-navy cursor-pointer relative z-10 focus:outline-none"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg(null);
                }}
                className="flex-1 py-3 text-center font-display font-black text-lg text-deep-navy cursor-pointer relative z-10 focus:outline-none"
              >
                Sign Up
              </button>
              {/* Sliding background indicator */}
              <motion.div
                className="absolute top-1 bottom-1 left-1 bg-yellow border-2 border-deep-navy rounded-xl -z-0"
                style={{ width: 'calc(50% - 6px)' }}
                animate={{ x: activeTab === 'login' ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="border-3 border-deep-navy bg-coral text-white p-4 rounded-xl font-sans font-bold text-sm mb-6 flex items-start gap-2 shadow-[2px_2px_0px_0px_#1B1F3B]">
                <Info className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="border-3 border-deep-navy bg-mint text-deep-navy p-4 rounded-xl font-sans font-bold text-sm mb-6 flex items-start gap-2 shadow-[2px_2px_0px_0px_#1B1F3B]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Panels */}
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit(onLogin)}
                  className="space-y-5 text-left"
                >
                  <div className="space-y-1.5">
                    <label className="font-display font-bold text-sm text-deep-navy uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-deep-navy/40" />
                      <input
                        type="email"
                        placeholder="coder@dta.com"
                        {...loginRegister('email')}
                        className="w-full pl-12 pr-4 py-3 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold focus:outline-none focus:bg-white shadow-neo-inset"
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-coral font-bold text-xs mt-1">{loginErrors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-display font-bold text-sm text-deep-navy uppercase">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-deep-navy/40" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...loginRegister('password')}
                        className="w-full pl-12 pr-4 py-3 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold focus:outline-none focus:bg-white shadow-neo-inset"
                      />
                    </div>
                    {loginErrors.password && (
                      <p className="text-coral font-bold text-xs mt-1">{loginErrors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        {...loginRegister('rememberMe')}
                        className="w-4 h-4 accent-primary-orange border-2 border-deep-navy rounded"
                      />
                      <span>Remember Me</span>
                    </label>
                    <a href="#" onClick={(e) => { e.preventDefault(); setErrorMsg("Password reset feature coming soon! Or just input any credentials in simulator."); }} className="text-primary-orange hover:underline">
                      Forgot Password?
                    </a>
                  </div>

                  <NeoButton variant="orange" size="md" className="w-full mt-6" type="submit" disabled={authLoading}>
                    {authLoading ? 'Signing In...' : 'Login'}
                  </NeoButton>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignupSubmit(onSignup)}
                  className="space-y-5 text-left"
                >
                  <div className="space-y-1.5">
                    <label className="font-display font-bold text-sm text-deep-navy uppercase">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-deep-navy/40" />
                      <input
                        type="text"
                        placeholder="Alex Coder"
                        {...signupRegister('fullName')}
                        className="w-full pl-12 pr-4 py-3 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold focus:outline-none focus:bg-white shadow-neo-inset"
                      />
                    </div>
                    {signupErrors.fullName && (
                      <p className="text-coral font-bold text-xs mt-1">{signupErrors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-display font-bold text-sm text-deep-navy uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-deep-navy/40" />
                      <input
                        type="email"
                        placeholder="coder@dta.com"
                        {...signupRegister('email')}
                        className="w-full pl-12 pr-4 py-3 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold focus:outline-none focus:bg-white shadow-neo-inset"
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-coral font-bold text-xs mt-1">{signupErrors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-display font-bold text-sm text-deep-navy uppercase">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-deep-navy/40" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...signupRegister('password')}
                        className="w-full pl-12 pr-4 py-3 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold focus:outline-none focus:bg-white shadow-neo-inset"
                      />
                    </div>
                    {signupErrors.password && (
                      <p className="text-coral font-bold text-xs mt-1">{signupErrors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-display font-bold text-sm text-deep-navy uppercase">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-deep-navy/40" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...signupRegister('confirmPassword')}
                        className="w-full pl-12 pr-4 py-3 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold focus:outline-none focus:bg-white shadow-neo-inset"
                      />
                    </div>
                    {signupErrors.confirmPassword && (
                      <p className="text-coral font-bold text-xs mt-1">{signupErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="flex items-start gap-2 cursor-pointer select-none font-bold text-sm text-deep-navy">
                      <input
                        type="checkbox"
                        {...signupRegister('acceptTerms')}
                        className="w-4.5 h-4.5 accent-primary-orange border-2 border-deep-navy rounded mt-0.5 shrink-0"
                      />
                      <span>
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => openLegal('terms')}
                          className="text-primary-orange underline hover:text-deep-navy cursor-pointer"
                        >
                          Terms of Service
                        </button>
                        {' '}and{' '}
                        <button
                          type="button"
                          onClick={() => openLegal('privacy')}
                          className="text-primary-orange underline hover:text-deep-navy cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                        .
                      </span>
                    </label>
                    {signupErrors.acceptTerms && (
                      <p className="text-coral font-bold text-xs mt-1">{signupErrors.acceptTerms.message}</p>
                    )}
                  </div>

                  <NeoButton variant="orange" size="md" className="w-full mt-6" type="submit" disabled={authLoading}>
                    {authLoading ? 'Creating Account...' : 'Create Account'}
                  </NeoButton>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Social Authentication */}
            <div className="relative my-6 text-center border-t-3 border-deep-navy">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white px-4 font-display font-bold text-sm text-deep-navy/50 border-2 border-deep-navy rounded-full uppercase shadow-[1.5px_1.5px_0_0_#1B1F3B]">
                OR CONTINUE WITH
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={oauthLoading !== null}
                className="py-3 border-3 border-deep-navy bg-white rounded-xl text-deep-navy font-display font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1B1F3B] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#1B1F3B] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle className="w-5 h-5" />
                {oauthLoading === 'google' ? 'Redirecting...' : 'Google'}
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('github')}
                disabled={oauthLoading !== null}
                className="py-3 border-3 border-deep-navy bg-white rounded-xl text-deep-navy font-display font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1B1F3B] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#1B1F3B] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGithub className="w-5 h-5" />
                {oauthLoading === 'github' ? 'Redirecting...' : 'GitHub'}
              </button>
            </div>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-cream bg-grid-pattern">
        <div className="p-8 text-center bg-white border-4 border-deep-navy rounded-3xl max-w-sm shadow-neo">
          <h2 className="font-display font-black text-2xl text-deep-navy animate-pulse">Loading Auth Gate...</h2>
        </div>
      </div>
    }>
      <AuthPageContent />
    </React.Suspense>
  );
}
