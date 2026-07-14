"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa6';
import { NeoButton } from '@/components/UI/NeoButton';

export const Footer = () => {
  return (
    <footer className="border-t-4 border-deep-navy bg-white text-deep-navy py-12 md:py-20 bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-6">
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
            <span className="font-display font-bold text-2xl text-deep-navy">
              Workshop.<span className="text-primary-orange">DTA</span>
            </span>
          </Link>
          <p className="text-lg font-medium leading-relaxed max-w-sm text-deep-navy/80">
            A premium coding bootcamp where you build complete, production-ready applications with hands-on mentor support.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: FaGithub, href: '#' },
              { icon: FaTwitter, href: '#' },
              { icon: FaLinkedin, href: '#' },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                className="w-10 h-10 border-2 border-deep-navy bg-yellow rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#1B1F3B] transition-all cursor-pointer"
              >
                <social.icon className="w-5 h-5 text-deep-navy" />
              </a>
            ))}
          </div>
        </div>

        {/* Links Columns */}
        <div>
          <h4 className="font-display font-bold text-xl mb-4 border-b-2 border-deep-navy pb-1">Workshops</h4>
          <ul className="space-y-3 font-semibold">
            <li>
              <a href="#workshops" className="hover:text-primary-orange transition-colors">
                Portfolio using AI
              </a>
            </li>
            <li>
              <a href="#workshops" className="hover:text-primary-orange transition-colors">
                Dev Tools Credits
              </a>
            </li>
            <li>
              <a href="#workshops" className="hover:text-primary-orange transition-colors">
                Coming Soon
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-xl mb-4 border-b-2 border-deep-navy pb-1">Company</h4>
          <ul className="space-y-3 font-semibold">
            <li>
              <a href="#" className="hover:text-primary-orange transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary-orange transition-colors">
                Mentors
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary-orange transition-colors">
                Careers
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-4">
          <h4 className="font-display font-bold text-xl border-b-2 border-deep-navy pb-1">Newsletter</h4>
          <p className="font-semibold text-deep-navy/80">Stay updated with upcoming batches and new workshops.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="vibe-coder@dta.com"
              className="px-4 py-3 border-3 border-deep-navy rounded-xl bg-bg-cream text-deep-navy placeholder-deep-navy/40 font-semibold focus:outline-none focus:bg-white shadow-neo-inset"
            />
            <NeoButton variant="orange" size="sm" type="submit">
              Subscribe
            </NeoButton>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t-3 border-deep-navy flex flex-col md:flex-row items-center justify-between gap-4 font-bold">
        <span>© {new Date().getFullYear()} Workshop.DevTrackAcademy. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
