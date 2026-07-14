"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Download, RefreshCw, FileText, Info } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { Certificate } from '@/components/UI/Certificate';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';

function CertificatePortal() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse query parameters with fallback values
  const studentName = searchParams.get('name') || 'John Doe';
  const studentEmail = searchParams.get('email') || 'student@devtrackacademy.dev';
  const workshopName = searchParams.get('workshop') || 'Build Your Portfolio Website Using AI';
  const workshopDate = searchParams.get('date') || '11 - 12 July 2026';
  const completionDate = searchParams.get('completion') || '12 July 2026';
  const duration = searchParams.get('duration') || '2 Days (8 Hours)';
  const certificateId = searchParams.get('id') || 'DTA-PORT-99321-A';
  const founderName = 'Raviteja Karnati';
  const verificationUrl = `verify.devtrackacademy.com/certificate/${certificateId}`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      {/* Hide standard navbar when printing */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 bg-bg-cream bg-grid-pattern py-12 md:py-20 px-4">
        {/* Navigation & Controls Row (Hidden when printing) */}
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 font-display font-extrabold uppercase text-sm text-deep-navy hover:text-primary-orange transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          
          <div className="flex gap-3">
            <NeoButton variant="mint" size="sm" onClick={handlePrint}>
              <Printer size={16} className="mr-1.5 stroke-[2.5]" />
              Print / Save PDF
            </NeoButton>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="w-full flex items-center justify-center">
          <Certificate
            studentName={studentName}
            studentEmail={studentEmail}
            workshopName={workshopName}
            workshopDate={workshopDate}
            completionDate={completionDate}
            duration={duration}
            certificateId={certificateId}
            founderName={founderName}
            verificationUrl={verificationUrl}
          />
        </div>

        {/* Print Styles Overrides */}
        <style jsx global>{`
          @media print {
            body, html {
              background: #FFFFFF !important;
              color: #1B1F3B !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            main {
              padding: 0 !important;
              background: none !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            @page {
              size: landscape;
              margin: 0;
            }
          }
        `}</style>

        {/* Custom Certificate Verification Info Box (Hidden when printing) */}
        <div className="max-w-2xl mx-auto mt-12 print:hidden">
          <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6 text-left space-y-4">
            <div className="flex items-center gap-2 text-primary-orange border-b border-deep-navy/10 pb-3">
              <Info size={20} className="stroke-[2.5]" />
              <h4 className="font-display font-black text-lg text-deep-navy uppercase">Certificate Information</h4>
            </div>
            <p className="font-sans font-semibold text-sm text-deep-navy/80 leading-relaxed">
              This certificate verifies that the recipient successfully completed all requirements, coding sessions, and practical assignments for the specified DevTrackAcademy Workshop.
            </p>
            <div className="bg-bg-cream border-2 border-deep-navy rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center text-xs font-bold">
              <div>
                <span className="text-deep-navy/50 block">Recipient Name</span>
                <span className="text-deep-navy text-sm font-display font-bold mt-0.5 block">{studentName}</span>
              </div>
              <div>
                <span className="text-deep-navy/50 block">Credential ID</span>
                <span className="text-deep-navy font-mono text-sm mt-0.5 block">{certificateId}</span>
              </div>
              <div>
                <span className="text-deep-navy/50 block">Verification Link</span>
                <a href={`https://${verificationUrl}`} className="text-primary-orange hover:underline mt-0.5 block flex items-center gap-1">
                  Verify Credentials <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </NeoCard>
        </div>
      </main>

      {/* Hide standard footer when printing */}
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}

// Wrapping in Suspense is mandatory for useSearchParams in Next.js App Router static exports / prerendering
export default function CertificatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-cream">
        <h3 className="font-display font-black text-2xl text-deep-navy animate-pulse">Loading Certificate...</h3>
      </div>
    }>
      <CertificatePortal />
    </Suspense>
  );
}
const ExternalLink = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-external-link inline"
  >
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);
