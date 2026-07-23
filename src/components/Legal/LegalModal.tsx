"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLegalModal } from '@/lib/store/useLegalModal';
import { renderMarkdown } from '@/lib/markdown';

// Markdown, once fetched, is cached so re-opening a doc is instant.
const contentCache: Record<string, string> = {};

/**
 * Single global popup for the Terms of Service / Privacy Policy documents.
 * Mounted once in the root layout; opened from anywhere via useLegalModal().
 * The document content is fetched from the static /api/legal/[doc] endpoint,
 * whose source of truth is the legal/*.md files.
 */
export function LegalModal() {
  const { activeDoc, close } = useLegalModal();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Fetch the markdown whenever a document becomes active. This is a genuine
  // "sync React state with an external system (the /api/legal endpoint)" effect,
  // so the synchronous state resets below are intentional.
  useEffect(() => {
    if (!activeDoc) return;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional resets when the active document changes */
    setError(false);

    if (contentCache[activeDoc]) {
      setContent(contentCache[activeDoc]);
      return;
    }

    setContent(null);
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    let cancelled = false;
    fetch(`/api/legal/${activeDoc}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.text();
      })
      .then((text) => {
        contentCache[activeDoc] = text;
        if (!cancelled) setContent(text);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeDoc]);

  // Close on Escape and lock body scroll while the popup is open.
  useEffect(() => {
    if (!activeDoc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeDoc, close]);

  if (!activeDoc || typeof document === 'undefined') return null;

  const label = activeDoc === 'terms' ? 'Terms of Service' : 'Privacy Policy';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-deep-navy/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel: full-screen on mobile, centered card on larger screens */}
      <div className="relative flex w-full sm:max-w-2xl md:max-w-3xl h-full sm:h-auto sm:max-h-[88vh] flex-col overflow-hidden border-deep-navy bg-white sm:rounded-3xl sm:border-4 sm:shadow-neo">
        {/* Sticky header with close button */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b-3 border-deep-navy bg-bg-cream px-4 py-3 md:px-6 md:py-4">
          <span className="font-display text-base font-black uppercase tracking-wide text-deep-navy/70 md:text-lg">
            {label}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-deep-navy bg-white shadow-[2px_2px_0px_0px_#1B1F3B] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1B1F3B] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#1B1F3B]"
          >
            <X className="h-5 w-5 text-deep-navy" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="grow overflow-y-auto overscroll-contain px-5 py-6 md:px-9 md:py-8">
          {loading && (
            <p className="font-display font-bold text-deep-navy/60 animate-pulse">Loading…</p>
          )}
          {error && (
            <p className="font-bold text-coral">
              Could not load this document. Please try again later.
            </p>
          )}
          {content && !loading && !error && (
            // Drop the leading H1 — the sticky header already shows the title.
            <div>{renderMarkdown(content.replace(/^#\s+.*\r?\n?/, ''))}</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default LegalModal;
