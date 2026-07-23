"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Generic, responsive neo-brutalist popup used for short informational content
 * (e.g. the footer's Mentors / Careers dialogs). Full-screen on mobile, a
 * centered card on larger screens. Closes on Escape or backdrop click.
 */
export function InfoModal({ open, onClose, title, children }: InfoModalProps) {
  // Close on Escape and lock body scroll while the popup is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-deep-navy/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative flex w-full sm:max-w-lg md:max-w-xl h-full sm:h-auto sm:max-h-[88vh] flex-col overflow-hidden border-deep-navy bg-white sm:rounded-3xl sm:border-4 sm:shadow-neo">
        {/* Sticky header with close button */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b-3 border-deep-navy bg-bg-cream px-4 py-3 md:px-6 md:py-4">
          <span className="font-display text-base font-black uppercase tracking-wide text-deep-navy/70 md:text-lg">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-deep-navy bg-white shadow-[2px_2px_0px_0px_#1B1F3B] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1B1F3B] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#1B1F3B]"
          >
            <X className="h-5 w-5 text-deep-navy" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="grow overflow-y-auto overscroll-contain px-5 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default InfoModal;
