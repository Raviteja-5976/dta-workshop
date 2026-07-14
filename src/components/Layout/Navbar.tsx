"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { NeoButton } from '@/components/UI/NeoButton';

export const Navbar = () => {
  const { user, loading, checkUser, signOut } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [checkUser]);

  const handleLogout = async () => {
    await signOut();
    router.refresh();
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', href: '/#home' },
    { label: 'Workshops', href: '/workshops' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 w-full transition-all duration-300 border-b-4 border-transparent',
        scrolled
          ? 'bg-bg-cream border-deep-navy shadow-[0_4px_0_0_#1B1F3B] py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 border-2 border-deep-navy rounded-xl bg-primary-orange shadow-[2px_2px_0px_0px_#1B1F3B] p-1 flex items-center justify-center transition-transform group-hover:rotate-6">
            <Image
              src="/logo.png"
              alt="DevTrackAcademy Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-display font-bold text-lg md:text-2xl text-deep-navy leading-none">
            Workshop.<span className="text-primary-orange">DTA</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-display font-semibold text-lg text-deep-navy hover:text-primary-orange transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[3px] after:bg-primary-orange after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {loading ? (
            <div className="w-24 h-10 bg-deep-navy/10 animate-pulse rounded-xl border-3 border-deep-navy" />
          ) : user ? (
            <>
              <Link href="/dashboard">
                <NeoButton variant="mint" size="sm">
                  <LayoutDashboard className="w-4 h-4 text-deep-navy" />
                  Dashboard
                </NeoButton>
              </Link>
              <NeoButton variant="white" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 text-deep-navy" />
                Logout
              </NeoButton>
            </>
          ) : (
            <>
              <Link href="/auth">
                <NeoButton variant="white" size="sm">
                  <LogIn className="w-4 h-4 text-deep-navy" />
                  Login
                </NeoButton>
              </Link>
              <Link href="/workshops">
                <NeoButton variant="orange" size="sm">
                  All Workshops
                </NeoButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 border-3 border-deep-navy bg-yellow rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:shadow-[4px_4px_0px_0px_#1B1F3B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1B1F3B] cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-deep-navy" /> : <Menu className="w-6 h-6 text-deep-navy" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={clsx(
          'lg:hidden fixed top-[76px] left-0 w-full h-[calc(100vh-76px)] bg-bg-cream border-t-4 border-deep-navy transition-all duration-300 ease-in-out px-6 py-8 flex flex-col justify-between overflow-y-auto z-40',
          mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        )}
      >
        <div className="flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-display font-bold text-2xl text-deep-navy border-3 border-deep-navy bg-white rounded-2xl p-4 shadow-neo hover:translate-x-1 transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-4 mt-8">
          {loading ? (
            <div className="w-full h-12 bg-deep-navy/10 animate-pulse rounded-2xl border-3 border-deep-navy" />
          ) : user ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <NeoButton variant="mint" size="md" className="w-full">
                  <LayoutDashboard className="w-5 h-5 text-deep-navy" />
                  Dashboard
                </NeoButton>
              </Link>
              <NeoButton variant="white" size="md" onClick={handleLogout} className="w-full">
                <LogOut className="w-5 h-5 text-deep-navy" />
                Logout
              </NeoButton>
            </>
          ) : (
            <>
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <NeoButton variant="white" size="md" className="w-full">
                  <LogIn className="w-5 h-5 text-deep-navy" />
                  Login / Signup
                </NeoButton>
              </Link>
              <Link href="/workshops" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <NeoButton variant="orange" size="md" className="w-full">
                  All Workshops
                </NeoButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
