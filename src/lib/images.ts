// Resolve a workshop's cover_image value into a fully-usable <img src>.
//
// The admin can store cover_image in three shapes:
//   1. A full URL         — "https://cdn.example.com/x.png"  → used as-is
//   2. A public asset path — "/covers/x.png"                 → used as-is
//   3. A bare bucket path  — "portfolio.png"                 → served from the
//      Supabase Storage bucket named in NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET.
//
// Only NEXT_PUBLIC_* env vars are read, so this is safe in client components.

import { SUPABASE_URL } from '@/lib/supabase/config';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? '';

export function resolveCoverImage(coverImage?: string | null): string | undefined {
  const value = coverImage?.trim();
  if (!value) return undefined;

  // Absolute URL or inline data URI — already loadable.
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;

  // Root-relative asset from /public.
  if (value.startsWith('/')) return value;

  // Bare path/filename → build the bucket's public object URL.
  if (SUPABASE_URL && STORAGE_BUCKET) {
    const path = value.replace(/^\/+/, '');
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
  }

  // No bucket configured yet — hand it back untouched so nothing breaks.
  return value;
}
