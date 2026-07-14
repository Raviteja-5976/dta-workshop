"use client";

import React from 'react';
import Image from 'next/image';
import { Award, CheckCircle2, QrCode, Sparkles, HelpCircle } from 'lucide-react';

interface CertificateProps {
  studentName?: string;
  studentEmail?: string;
  workshopName?: string;
  workshopDate?: string;
  completionDate?: string;
  duration?: string;
  certificateId?: string;
  founderName?: string;
  verificationUrl?: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  studentName = 'Alex Coder',
  studentEmail = 'alex@dta.dev',
  workshopName = 'Build Your Portfolio Website Using AI',
  workshopDate = '11 - 12 July 2026',
  completionDate = '12 July 2026',
  duration = '2 Days (8 Hours)',
  certificateId = 'DTA-PORT-99321-A',
  founderName = 'Raviteja Karnati',
  verificationUrl = 'verify.devtrackacademy.com/certificate/DTA-PORT-99321-A',
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-1 sm:p-2 print:p-0">
      {/* Certificate Frame wrapper preserving A4 Landscape aspect ratio */}
      <div 
        className="w-full bg-[#FFF8F0] border-4 md:border-[6px] border-[#1B1F3B] rounded-[24px] md:rounded-[28px] p-5 md:p-10 relative overflow-hidden aspect-[1.414] flex flex-col justify-between shadow-neo-lg print:shadow-none print:border-4"
        style={{ contentVisibility: 'auto' }}
      >
        {/* TOP ROW: Logo & Badges */}
        <div className="flex items-center justify-between border-b-2 border-[#1B1F3B] pb-3 md:pb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Image
              src="/logo.png"
              alt="DevTrackAcademy Logo Icon"
              width={48}
              height={48}
              className="h-10 w-10 md:h-14 md:w-14 object-contain shrink-0"
              priority
            />
            <span className="font-display font-black text-xs md:text-2xl text-[#1B1F3B] leading-none uppercase tracking-wider">
              DevTrack<span className="text-[#FF6B35]">Academy</span>
            </span>
          </div>
          
          <div className="inline-flex items-center gap-1 border-2 border-[#1B1F3B] bg-[#FF6B35] px-2.5 py-0.5 rounded-full text-white font-display font-black text-[8px] md:text-xs shadow-[1.5px_1.5px_0px_0px_#1B1F3B]">
            <Sparkles className="w-2.5 h-2.5 text-white" />
            <span>VERIFIED WORKSHOP</span>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="flex-1 py-2 md:py-5 flex flex-col justify-center items-center text-center space-y-3 md:space-y-6">
          <div className="space-y-0.5">
            <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1B1F3B] uppercase tracking-tight leading-none">
              Certificate
            </h1>
            <p className="font-sans font-bold text-[9px] md:text-sm uppercase tracking-widest text-[#1B1F3B]/60 leading-none">
              of Workshop Completion
            </p>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <span className="font-sans font-bold text-xs md:text-sm text-[#1B1F3B]/60 uppercase leading-none block">Presented To</span>
            <div>
              <h2 className="font-display font-black text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#1B1F3B] leading-none bg-[#FFD54F] border-2 md:border-3 border-[#1B1F3B] px-5 md:px-8 py-2 md:py-3.5 rounded-xl md:rounded-2xl shadow-neo inline-block rotate-[-0.5deg]">
                {studentName}
              </h2>
            </div>
            <p className="font-mono text-[9px] md:text-sm text-[#1B1F3B]/70 leading-none">{studentEmail}</p>
          </div>

          {/* Wording Block */}
          <p className="font-sans font-semibold text-xs md:text-base text-[#1B1F3B] max-w-xl md:max-w-3xl leading-relaxed">
            This certifies that the participant has successfully completed the <strong className="text-[#FF6B35]">{workshopName}</strong> conducted by DevTrackAcademy. Throughout the workshop, the participant actively engaged in live coding sessions, completed practical assignments, and demonstrated commitment toward building real-world development skills.
          </p>

          {/* Workshop Details Inlay (Brutalist Card) */}
          <div className="w-full max-w-3xl border-2 md:border-3 border-[#1B1F3B] bg-[#6EE7B7] rounded-xl md:rounded-2xl p-3 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-left shadow-[4px_4px_0_0_#1B1F3B] print:shadow-none">
            <div>
              <span className="text-[#1B1F3B]/70 font-sans font-bold text-[9px] md:text-[10px] uppercase leading-none block">Workshop</span>
              <span className="text-[#1B1F3B] font-display font-bold text-[10px] md:text-sm truncate block mt-1 leading-none">{workshopName}</span>
            </div>
            <div>
              <span className="text-[#1B1F3B]/70 font-sans font-bold text-[9px] md:text-[10px] uppercase leading-none block">Duration</span>
              <span className="text-[#1B1F3B] font-display font-bold text-[10px] md:text-sm block mt-1 leading-none">{duration}</span>
            </div>
            <div>
              <span className="text-[#1B1F3B]/70 font-sans font-bold text-[9px] md:text-[10px] uppercase leading-none block">Date</span>
              <span className="text-[#1B1F3B] font-display font-bold text-[10px] md:text-sm block mt-1 leading-none">{completionDate}</span>
            </div>
            <div>
              <span className="text-[#1B1F3B]/70 font-sans font-bold text-[9px] md:text-[10px] uppercase leading-none block">Certificate ID</span>
              <span className="text-[#1B1F3B] font-mono text-[9px] md:text-sm block mt-1 leading-none">{certificateId}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Signatures, QR, Logo */}
        <div className="border-t-2 border-[#1B1F3B] pt-3 md:pt-4 grid grid-cols-3 items-end">
          
          {/* Bottom Left: Founder Sign */}
          <div className="text-left space-y-0.5">
            <div className="relative h-6 md:h-8 flex items-end">
              <span className="font-signature text-xl md:text-2xl text-[#FF6B35] -rotate-3 select-none inline-block pl-2 transform origin-left font-normal italic leading-none">
                {founderName}
              </span>
            </div>
            <div className="border-t border-[#1B1F3B]/30 pt-0.5">
              <p className="font-display font-bold text-[10px] md:text-sm text-[#1B1F3B] leading-none">{founderName}</p>
              <p className="font-sans font-bold text-[8px] md:text-[10px] text-[#1B1F3B]/60 uppercase mt-0.5 leading-none">Founder, DevTrackAcademy</p>
            </div>
          </div>

          {/* Bottom Center: QR Mockup */}
          <div className="flex flex-col items-center justify-center space-y-0.5">
            <div className="p-0.5 border border-[#1B1F3B] bg-white rounded shadow-[1px_1px_0px_0px_#1B1F3B] print:shadow-none shrink-0">
              <QrCode className="text-[#1B1F3B] md:w-8 md:h-8 w-6 h-6" />
            </div>
            <span className="font-sans font-bold text-[7px] md:text-[10px] text-[#1B1F3B]/50 hover:underline cursor-pointer select-all select-none uppercase tracking-wide leading-none">
              {verificationUrl}
            </span>
          </div>

          {/* Bottom Right: Motto & Org details */}
          <div className="text-right space-y-0.5">
            <span className="font-display font-extrabold text-[10px] md:text-base text-[#FF6B35] leading-none block uppercase">
              DevTrackAcademy
            </span>
            <span className="font-sans font-black text-[8px] md:text-[11px] text-[#1B1F3B]/70 block italic leading-none">
              Learn by Building.
            </span>
          </div>
        </div>

      </div>

      {/* Quote Banner */}
      <p className="font-sans font-extrabold text-[9px] md:text-xs text-[#1B1F3B]/50 uppercase tracking-widest text-center mt-3 print:hidden">
        &ldquo;Learning doesn&apos;t end when the workshop ends. Keep Building. Keep Growing.&rdquo;
      </p>
    </div>
  );
};
export default Certificate;
