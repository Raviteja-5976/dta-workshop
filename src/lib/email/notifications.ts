// Server-side email orchestration. These read the DB with the service-role
// client, send via Resend, and flip a "sent" flag so each email goes out exactly
// once. They never throw — a failed email must not break signup or payment.
//
// The idempotency flags (profiles.welcome_email_sent /
// registrations.confirmation_email_sent) are read/written in a SEPARATE, tolerant
// step so that if the add-email-flags.sql migration hasn't been run yet, emails
// still send (just without dedupe) instead of silently failing.

import { isMock } from '@/lib/supabase/config';
import { getAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from './resend';
import {
  welcomeEmailHtml,
  registrationConfirmedEmailHtml,
  SUPPORT_EMAIL,
} from './templates';

// Reads a boolean flag column, tolerating the column not existing yet (returns
// false so the caller proceeds to send). Logs a hint when the migration is missing.
async function alreadySent(
  supabase: any,
  table: string,
  id: string,
  column: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    if (error.code === '42703') {
      console.warn(
        `[email] ${table}.${column} missing — run supabase/add-email-flags.sql to enable send-once dedupe.`
      );
    } else {
      console.error(`[email] flag read failed on ${table}.${column}:`, error.message);
    }
    return false; // don't block the send on a flag problem
  }
  return data?.[column] === true;
}

// Best-effort flag write; a missing column is a no-op (already warned above).
async function markSent(supabase: any, table: string, id: string, column: string) {
  const { error } = await supabase.from(table).update({ [column]: true }).eq('id', id);
  if (error && error.code !== '42703') {
    console.error(`[email] flag write failed on ${table}.${column}:`, error.message);
  }
}

/**
 * Sends the welcome email to a freshly-signed-up user, once. Safe to call on
 * every login (OAuth) — the profiles.welcome_email_sent flag guards re-sends.
 */
export async function sendWelcomeEmail(userId: string): Promise<void> {
  if (isMock || !userId) return;

  try {
    const supabase = await getAdminClient();

    // Core fields only (these columns always exist).
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[email] welcome: could not read profile:', error.message);
      return;
    }
    if (!profile?.email) {
      console.warn('[email] welcome: no email on profile for user', userId);
      return;
    }

    if (await alreadySent(supabase, 'profiles', userId, 'welcome_email_sent')) return;

    const name = profile.full_name || profile.email.split('@')[0];
    const { success, error: sendErr } = await sendEmail({
      to: profile.email,
      subject: 'Welcome to DevTrackAcademy 🚀',
      html: welcomeEmailHtml({ name }),
      replyTo: SUPPORT_EMAIL,
    });

    if (!success) {
      console.error('[email] welcome send failed:', sendErr);
      return;
    }
    await markSent(supabase, 'profiles', userId, 'welcome_email_sent');
  } catch (e) {
    console.error('sendWelcomeEmail failed:', e);
  }
}

/**
 * Sends the payment-confirmation email for a registration, once. Called from
 * every place a registration becomes 'confirmed' (Razorpay webhook + both mock
 * checkout paths); the confirmation_email_sent flag prevents duplicates.
 */
export async function sendRegistrationConfirmedEmail(registrationId: string): Promise<void> {
  if (isMock || !registrationId) return;

  try {
    const supabase = await getAdminClient();

    // Core fields only (no flag column here, so this never errors pre-migration).
    const { data: reg, error } = await supabase
      .from('registrations')
      .select(
        `id, full_name, email, confirmation_code, user_id,
         workshop_batches ( batch_label, date_label, price, workshops ( title ) )`
      )
      .eq('id', registrationId)
      .maybeSingle();

    if (error) {
      console.error('[email] confirmation: could not read registration:', error.message);
      return;
    }
    if (!reg) return;

    if (await alreadySent(supabase, 'registrations', registrationId, 'confirmation_email_sent')) {
      return;
    }

    // Prefer the registration's email snapshot; fall back to the profile.
    let email = reg.email as string | null;
    if (!email && reg.user_id) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', reg.user_id)
        .maybeSingle();
      email = prof?.email ?? null;
    }
    if (!email) {
      console.warn('[email] confirmation: no email for registration', registrationId);
      return;
    }

    const batch = (reg as any).workshop_batches;
    const workshop = batch?.workshops;
    const name = reg.full_name || email.split('@')[0];

    const { success, error: sendErr } = await sendEmail({
      to: email,
      subject: `You're confirmed for ${workshop?.title || 'your workshop'} ✅`,
      html: registrationConfirmedEmailHtml({
        name,
        workshopTitle: workshop?.title || 'Your Workshop',
        batchLabel: batch?.batch_label || undefined,
        dateLabel: batch?.date_label || undefined,
        amount: batch?.price != null ? Number(batch.price) : undefined,
        confirmationCode: reg.confirmation_code || undefined,
      }),
      replyTo: SUPPORT_EMAIL,
    });

    if (!success) {
      console.error('[email] confirmation send failed:', sendErr);
      return;
    }
    await markSent(supabase, 'registrations', registrationId, 'confirmation_email_sent');
  } catch (e) {
    console.error('sendRegistrationConfirmedEmail failed:', e);
  }
}
