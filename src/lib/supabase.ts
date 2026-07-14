"use client";

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isMock } from '@/lib/supabase/config';

// ---------------------------------------------------------------------------
// Browser Supabase client.
//
// When real credentials are present in .env.local we return a genuine
// @supabase/ssr browser client (email/password auth + cookie-based sessions
// that server components can also read). When credentials are missing we fall
// back to the in-memory MockAuth below so the UI still works during local dev.
// ---------------------------------------------------------------------------

const setCookie = (name: string, value: string, maxAgeSecs: number) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSecs}`;
  }
};

const deleteCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; max-age=0`;
  }
};

class MockAuth {
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sb-mock-user');
      if (stored) {
        setCookie('sb-mock-session', stored, 3600);
      }
    }
  }

  async getSession() {
    if (typeof window === 'undefined') return { data: { session: null }, error: null };
    const storedUser = localStorage.getItem('sb-mock-user');
    if (!storedUser) return { data: { session: null }, error: null };

    try {
      const user = JSON.parse(storedUser);
      const session = {
        user,
        access_token: 'mock-access-token',
        expires_in: 3600,
      };
      return { data: { session }, error: null };
    } catch {
      return { data: { session: null }, error: null };
    }
  }

  async getUser() {
    const { data: { session } } = await this.getSession();
    return { data: { user: session?.user || null }, error: null };
  }

  async signUp({ email, password, options }: any) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const fullName = options?.data?.full_name || email.split('@')[0];
    const user = {
      id: 'mock-uuid-' + Math.random().toString(36).substring(2, 11),
      email,
      user_metadata: { full_name: fullName },
    };

    localStorage.setItem('sb-mock-user', JSON.stringify(user));
    setCookie('sb-mock-session', JSON.stringify(user), 3600);

    const session = { user, access_token: 'mock-access-token' };
    this.notify('SIGNED_IN', session);

    return { data: { user, session }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (password === 'fail' || password === 'error') {
      return { data: { user: null, session: null }, error: { message: 'Invalid credentials. Use any password except "fail" or "error" for simulated login.' } };
    }

    const user = {
      id: 'mock-uuid-logged-in',
      email,
      user_metadata: { full_name: email.split('@')[0] },
    };

    localStorage.setItem('sb-mock-user', JSON.stringify(user));
    setCookie('sb-mock-session', JSON.stringify(user), 3600);

    const session = { user, access_token: 'mock-access-token' };
    this.notify('SIGNED_IN', session);

    return { data: { user, session }, error: null };
  }

  async signOut() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    localStorage.removeItem('sb-mock-user');
    deleteCookie('sb-mock-session');
    this.notify('SIGNED_OUT', null);
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    this.getSession().then(({ data: { session } }) => {
      callback(session ? 'SIGNED_IN' : 'INITIAL_SESSION', session);
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private notify(event: string, session: any) {
    this.listeners.forEach(l => l(event, session));
  }
}

export const mockSupabase = {
  auth: new MockAuth(),
};

export const supabase = isMock
  ? (mockSupabase as any)
  : createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { isMock };
