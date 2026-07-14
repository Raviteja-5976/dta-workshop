-- ============================================================================
-- DevTrackAcademy — Add payment_link column to workshop_batches
-- ----------------------------------------------------------------------------
-- Run this in your Supabase SQL Editor to add support for batch-specific
-- payment links.
-- ============================================================================

alter table public.workshop_batches 
add column if not exists payment_link text;

comment on column public.workshop_batches.payment_link is 'A static Razorpay or custom payment page URL for this batch';
