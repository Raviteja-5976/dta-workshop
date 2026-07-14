import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: any | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  // Called once at app startup (see AuthProvider). Reads the current session
  // and then subscribes to auth changes so every component — Navbar, dashboard,
  // etc. — updates the instant the user logs in, out, or the token refreshes.
  initialize: () => {
    if (get().initialized) return;
    set({ initialized: true });

    supabase.auth.onAuthStateChange((_event: string, session: any) => {
      set({ user: session?.user ?? null, loading: false });
    });
  },

  checkUser: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user || null });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (e) {
      console.error(e);
    } finally {
      set({ loading: false });
    }
  }
}));
