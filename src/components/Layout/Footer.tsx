"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Mail } from 'lucide-react';
import { FaDiscord, FaXTwitter, FaInstagram, FaLinkedin, FaReddit } from 'react-icons/fa6';
import { InfoModal } from '@/components/UI/InfoModal';
import { useLegalModal } from '@/lib/store/useLegalModal';

export const Footer = () => {
  const openLegal = useLegalModal((s) => s.open);
  const [infoModal, setInfoModal] = useState<'mentors' | 'careers' | null>(null);

  const mentorPoints = [
    'Hands-on builders who have designed, coded, and shipped real products to production.',
    'They understand the pain points that surface mid-build — the tricky bugs, the scaling walls, and the "why won\'t this work" moments.',
    'They know how to handle them: debugging live, unblocking you fast, and sharing the battle-tested workarounds that only come from experience.',
  ];

  return (
    <footer className="border-t-4 border-deep-navy bg-white text-deep-navy py-12 md:py-20 bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
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
              { icon: FaDiscord, href: 'https://discord.gg/dftPTfdde' },
              { icon: FaXTwitter, href: 'https://x.com/DevTrackAcademy' },
              { icon: FaInstagram, href: 'https://www.instagram.com/devtrackacademy/' },
              { icon: FaLinkedin, href: 'https://www.linkedin.com/company/devtrackacademy' },
              { icon: FaReddit, href: 'https://www.reddit.com/r/devtrackacademy/' },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
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
              <button
                type="button"
                onClick={() => setInfoModal('mentors')}
                className="hover:text-primary-orange transition-colors cursor-pointer"
              >
                Mentors
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setInfoModal('careers')}
                className="hover:text-primary-orange transition-colors cursor-pointer"
              >
                Careers
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t-3 border-deep-navy flex flex-col md:flex-row items-center justify-between gap-4 font-bold">
        <span>© {new Date().getFullYear()} Workshop.DevTrackAcademy. All rights reserved.</span>
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => openLegal('privacy')}
            className="hover:underline cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => openLegal('terms')}
            className="hover:underline cursor-pointer"
          >
            Terms of Service
          </button>
        </div>
      </div>

      {/* Mentors / Careers popups */}
      <InfoModal
        open={infoModal !== null}
        onClose={() => setInfoModal(null)}
        title={infoModal === 'careers' ? 'Careers' : 'Mentors'}
      >
        {infoModal === 'mentors' && (
          <div className="space-y-5">
            <h3 className="font-display font-black text-2xl md:text-3xl text-deep-navy leading-tight">
              Mentors who have built the real thing
            </h3>
            <p className="leading-relaxed text-deep-navy/80 font-medium">
              Every DevTrack Academy mentor has spent years designing, coding, and shipping
              production-grade projects that real users depend on — not just teaching from slides.
            </p>
            <ul className="space-y-3">
              {mentorPoints.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-deep-navy bg-mint shadow-[1.5px_1.5px_0_0_#1B1F3B]">
                    <Check className="h-3.5 w-3.5 text-deep-navy" />
                  </span>
                  <span className="leading-relaxed text-deep-navy/80 font-medium">{text}</span>
                </li>
              ))}
            </ul>
            <p className="leading-relaxed text-deep-navy/80 font-medium">
              {"So when you get stuck, you're guided by someone who has been exactly where you are — and knows the way out."}
            </p>
          </div>
        )}

        {infoModal === 'careers' && (
          <div className="space-y-5">
            <h3 className="font-display font-black text-2xl md:text-3xl text-deep-navy leading-tight">
              {"We're hiring — Marketing Personnel"}
            </h3>
            <p className="leading-relaxed text-deep-navy/80 font-medium">
              {"DevTrack Academy is growing, and we're hiring marketing personnel to help us reach more developers and grow the platform. If you love community, content, and getting the word out, we'd love to hear from you."}
            </p>
            <p className="leading-relaxed text-deep-navy/80 font-medium">
              {"Think you're a fit and want to get hired? Reach out to our founder:"}
            </p>
            <a
              href="mailto:founder@devtrackacademy.com"
              className="inline-flex items-center gap-2 font-display font-extrabold uppercase tracking-wide text-white border-3 border-deep-navy bg-primary-orange px-5 py-3 rounded-xl shadow-[3px_3px_0px_0px_#1B1F3B] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#1B1F3B] active:translate-y-0 active:shadow-[3px_3px_0px_0px_#1B1F3B] transition-all break-all"
            >
              <Mail className="h-5 w-5 shrink-0" />
              founder@devtrackacademy.com
            </a>
          </div>
        )}
      </InfoModal>
    </footer>
  );
};
export default Footer;
