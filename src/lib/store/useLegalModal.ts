import { create } from 'zustand';
import type { LegalDocName } from '@/lib/legal';

interface LegalModalState {
  activeDoc: LegalDocName | null;
  open: (doc: LegalDocName) => void;
  close: () => void;
}

/**
 * Global state for the Terms / Privacy popup. Any component (Footer, auth page)
 * can call `open('terms')` and the single <LegalModal /> mounted in the root
 * layout renders the overlay.
 */
export const useLegalModal = create<LegalModalState>((set) => ({
  activeDoc: null,
  open: (doc) => set({ activeDoc: doc }),
  close: () => set({ activeDoc: null }),
}));
