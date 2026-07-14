-- ============================================================================
-- DevTrackAcademy — Student payment policies (run AFTER schema.sql)
-- ----------------------------------------------------------------------------
-- The schema enables RLS and adds SELECT on payments for students, but
-- students also need INSERT (to create pending payment records during
-- registration) and UPDATE (to mark payments as paid during checkout).
--
-- These are PERMISSIVE policies, additive to the existing ones.
-- ============================================================================

-- Students can INSERT payments for their own user_id
drop policy if exists "own payments insert" on public.payments;
create policy "own payments insert"
  on public.payments for insert
  with check (auth.uid() = user_id);

-- Students can UPDATE their own payments (for mock/real checkout confirmation)
drop policy if exists "own payments update" on public.payments;
create policy "own payments update"
  on public.payments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
