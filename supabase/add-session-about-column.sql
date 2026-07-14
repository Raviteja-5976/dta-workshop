-- ============================================================================
-- DevTrackAcademy — Add "about" column to batch_sessions
-- ----------------------------------------------------------------------------
-- Run this in your Supabase SQL Editor. Adds a per-session description
-- ("About this session"). The date & time already exist on batch_sessions
-- as the `scheduled_at` timestamptz column — no schema change needed for that.
-- ============================================================================

alter table public.batch_sessions
  add column if not exists about text;

comment on column public.batch_sessions.about is 'Short description shown to students explaining what this session is about';
