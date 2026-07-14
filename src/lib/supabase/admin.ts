import { createClient as createBaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from './server';
import { SUPABASE_URL } from './config';

/**
 * Creates a server-side Supabase client for administrative operations.
 * Bypasses Row Level Security (RLS) using the service role key if available.
 * If the service role key is not configured, it falls back to the cookie-based
 * server client, which operates with admin policies (thanks to admin-policies.sql).
 */
export async function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && SUPABASE_URL && !serviceKey.includes('placeholder')) {
    return createBaseClient(SUPABASE_URL, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  
  // Fallback to normal cookie-based client
  return await createServerClient();
}
