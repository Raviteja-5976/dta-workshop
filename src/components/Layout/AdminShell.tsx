"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CreditCard, 
  UserSquare2, 
  LogOut, 
  Menu, 
  X,
  ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';
import { logoutAdminAction } from '@/actions/admin';
import { NeoButton } from '@/components/UI/NeoButton';

interface AdminShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children, adminName, adminEmail }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Workshops', href: '/admin/workshops', icon: BookOpen },
    { label: 'Registrations', href: '/admin/registrations', icon: Users },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Instructors', href: '/admin/instructors', icon: UserSquare2 },
  ];

  const handleLogout = async () => {
    await logoutAdminAction();
    // Also clear supabase auth if configured (handled client-side)
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();
    } catch (e) {}
    
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-bg-cream font-sans text-deep-navy">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-deep-navy text-white border-r-4 border-deep-navy shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b-4 border-deep-navy bg-deep-navy flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-white rounded-xl bg-primary-orange shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] p-1 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="DTA Logo"
              width={28}
              height={28}
              className="object-contain invert"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl leading-none">
              Admin.<span className="text-yellow">DTA</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase mt-0.5">Control Center</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-6 space-y-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <div
                  className={clsx(
                    'flex items-center gap-4 px-4 py-3.5 rounded-xl font-display font-bold border-2 transition-all duration-150 cursor-pointer select-none group',
                    isActive
                      ? 'bg-yellow text-deep-navy border-deep-navy shadow-[3px_3px_0px_0px_#1B1F3B] -translate-x-[2px] -translate-y-[2px]'
                      : 'bg-transparent text-white/70 border-transparent hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className={clsx('w-5 h-5 transition-transform group-hover:scale-110', isActive ? 'text-deep-navy' : 'text-white/50 group-hover:text-white')} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer profile & logout */}
        <div className="p-6 border-t-2 border-white/10 bg-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center font-display font-black text-white text-lg">
              {adminName[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate leading-none capitalize">{adminName}</p>
              <p className="text-xs text-white/40 truncate mt-1">{adminEmail}</p>
            </div>
          </div>
          <NeoButton variant="white" size="sm" className="w-full text-deep-navy" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout Portal
          </NeoButton>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={clsx(
          'lg:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out',
          mobileOpen ? 'bg-deep-navy/70 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'
        )}
      >
        <aside
          className={clsx(
            'flex flex-col w-72 h-full bg-deep-navy text-white border-r-4 border-deep-navy transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="p-6 border-b-4 border-deep-navy bg-deep-navy flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-white rounded-lg bg-primary-orange p-0.5 flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={20} height={20} className="object-contain invert" />
              </div>
              <span className="font-display font-black text-lg">Admin.<span className="text-yellow">DTA</span></span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-1 border border-white/20 rounded-lg hover:bg-white/5">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}>
                  <div
                    className={clsx(
                      'flex items-center gap-4 px-4 py-3 rounded-xl font-display font-bold border-2 transition-all',
                      isActive
                        ? 'bg-yellow text-deep-navy border-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] -translate-x-[1px] -translate-y-[1px]'
                        : 'bg-transparent text-white/70 border-transparent hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t-2 border-white/10 bg-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center font-display font-bold">
                {adminName[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs truncate leading-none capitalize">{adminName}</p>
                <p className="text-[10px] text-white/40 truncate mt-1">{adminEmail}</p>
              </div>
            </div>
            <NeoButton variant="white" size="sm" className="w-full text-deep-navy" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout Portal
            </NeoButton>
          </div>
        </aside>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-16 border-b-4 border-deep-navy bg-white flex items-center justify-between px-6 shadow-[0_4px_0_0_#1B1F3B] sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 border-2 border-deep-navy bg-yellow rounded-lg shadow-[2px_2px_0px_0px_#1B1F3B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1B1F3B]"
            >
              <Menu className="w-5 h-5 text-deep-navy" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary-orange stroke-[2.5]" />
              <span className="font-display font-black text-sm uppercase bg-primary-orange/10 border-2 border-primary-orange px-3 py-1 rounded-lg text-primary-orange hidden sm:inline-block">
                Secure Operator Terminal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-display font-bold">
            <span className="text-sm text-deep-navy/60 hidden md:inline">Logged in as</span>
            <span className="px-3 py-1.5 border-2 border-deep-navy rounded-lg bg-bg-cream text-xs leading-none capitalize">
              {adminName}
            </span>
            <Link href="/" target="_blank" className="text-xs text-primary-orange hover:underline">
              View Public Site &rarr;
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 bg-grid-pattern overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
