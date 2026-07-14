import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';

// Server-side Supabase client for Server Components, Route Handlers, and (later)
// server actions. Reads the auth session from cookies so RLS policies apply.
//
// Only call this when `isSupabaseConfigured` is true — callers in the data layer
// short-circuit to static data while running in mock mode.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Components cannot set cookies. This throws there and is safely
        // ignored; token refresh happens in the browser client / middleware.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* called from a Server Component — ignore */
        }
      },
    },
  });
}
