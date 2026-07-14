// Shared Supabase configuration. Safe to import from both server and client:
// it only reads NEXT_PUBLIC_* env vars, which Next.js inlines at build time.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// True once real credentials are present. Placeholder values (the ones shipped
// in .env.example) keep this false so the app runs on static/mock data until
// you paste your real project keys into .env.local.
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 &&
  SUPABASE_ANON_KEY.length > 0 &&
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('your-project');

// Convenience inverse used across the app to decide whether to fall back to the
// bundled static data / mock auth.
export const isMock = !isSupabaseConfigured;
