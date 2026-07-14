-- ============================================================================
-- DevTrackAcademy — Admin RLS policies
-- ----------------------------------------------------------------------------
-- Run this ONCE in the Supabase SQL Editor of the SHARED project, AFTER
-- supabase/schema.sql has been applied. It lets users whose profile role is
-- 'admin' read and write every table (for the admin portal), while the existing
-- public-read / owner-only policies from schema.sql stay in place for students.
--
-- These policies are additive (PERMISSIVE): a request is allowed if EITHER an
-- existing policy OR one of these admin policies passes.
--
-- To make someone an admin, set their role once:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: is the currently-authenticated user an admin?
-- SECURITY DEFINER so it can read profiles.role without tripping RLS (and
-- without causing a recursive policy check on the profiles table).
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- Admin full-access policies (SELECT + INSERT + UPDATE + DELETE) per table.
-- `for all` covers every command; both USING and WITH CHECK gate on is_admin().
-- Drop-if-exists first so this script is safe to re-run.
-- ----------------------------------------------------------------------------

-- workshops
drop policy if exists "admin full access workshops" on public.workshops;
create policy "admin full access workshops"
  on public.workshops for all
  using (public.is_admin()) with check (public.is_admin());

-- workshop_batches
drop policy if exists "admin full access batches" on public.workshop_batches;
create policy "admin full access batches"
  on public.workshop_batches for all
  using (public.is_admin()) with check (public.is_admin());

-- batch_sessions
drop policy if exists "admin full access sessions" on public.batch_sessions;
create policy "admin full access sessions"
  on public.batch_sessions for all
  using (public.is_admin()) with check (public.is_admin());

-- instructors
drop policy if exists "admin full access instructors" on public.instructors;
create policy "admin full access instructors"
  on public.instructors for all
  using (public.is_admin()) with check (public.is_admin());

-- profiles  (admins can view/manage every student profile)
drop policy if exists "admin full access profiles" on public.profiles;
create policy "admin full access profiles"
  on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- registrations
drop policy if exists "admin full access registrations" on public.registrations;
create policy "admin full access registrations"
  on public.registrations for all
  using (public.is_admin()) with check (public.is_admin());

-- payments
drop policy if exists "admin full access payments" on public.payments;
create policy "admin full access payments"
  on public.payments for all
  using (public.is_admin()) with check (public.is_admin());

-- certificates
drop policy if exists "admin full access certificates" on public.certificates;
create policy "admin full access certificates"
  on public.certificates for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- Notes
-- ----------------------------------------------------------------------------
-- * The admin PORTAL still does its privileged writes with the SERVICE ROLE key
--   on the server (which bypasses RLS entirely). These policies are
--   defense-in-depth: they keep the anon/authed client safe even if it is used
--   directly, and they let an admin read all rows through the normal client.
-- * The batch_seat_status view reads workshop_batches + registrations; admins
--   see full counts through these policies.
-- ============================================================================
