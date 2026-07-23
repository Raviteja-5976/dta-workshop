import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { renderMarkdown } from '@/lib/markdown';

/**
 * Shared shell for the /terms and /privacy pages. Renders the markdown source
 * (from legal/*.md) inside the site's neo-brutalist card styling.
 */
export function LegalDocument({ markdown }: { markdown: string }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-cream bg-grid-pattern">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display font-extrabold uppercase text-sm text-deep-navy hover:text-primary-orange transition-colors mb-6 border-3 border-deep-navy bg-yellow px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1B1F3B]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <article className="bg-white border-4 border-deep-navy rounded-3xl shadow-neo p-6 md:p-12">
            {renderMarkdown(markdown)}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default LegalDocument;
