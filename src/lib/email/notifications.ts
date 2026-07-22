// Server-side email orchestration. These read the DB with the service-role
// client, send via Resend, and flip a "sent" flag so each email goes out exactly
// once. They never throw — a failed email must not break signup or payment.

import { isMock } from '@/lib/supabase/config';
import { getAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from './resend';
import {
  welcomeEmailHtml,
  registrationConfirmedEmailHtml,
  SUPPORT_EMAIL,
} from './templates';

/**
 * Sends the welcome email to a freshly-signed-up user, once. Safe to call on
 * every login (OAuth) — the profiles.welcome_email_sent flag guards re-sends.
 */
export async function sendWelcomeEmail(userId: string): Promise<void> {
  if (isMock || !userId) return;

  try {
    const supabase = await getAdminClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, welcome_email_sent')
      .eq('id', userId)
      .maybeSingle();

    if (!profile || !profile.email || profile.welcome_email_sent) return;

    const name = profile.full_name || profile.email.split('@')[0];
    const { success } = await sendEmail({
      to: profile.email,
      subject: 'Welcome to DevTrackAcademy 🚀',
      html: welcomeEmailHtml({ name }),
      replyTo: SUPPORT_EMAIL,
    });

    if (success) {
      await supabase
        .from('profiles')
        .update({ welcome_email_sent: true })
        .eq('id', userId);
    }
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
    const { data: reg } = await supabase
      .from('registrations')
      .select(
        `id, full_name, email, confirmation_code, confirmation_email_sent, user_id,
         workshop_batches ( batch_label, date_label, price, workshops ( title ) )`
      )
      .eq('id', registrationId)
      .maybeSingle();

    if (!reg || reg.confirmation_email_sent) return;

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
    if (!email) return;

    const batch = (reg as any).workshop_batches;
    const workshop = batch?.workshops;
    const name = reg.full_name || email.split('@')[0];

    const { success } = await sendEmail({
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

    if (success) {
      await supabase
        .from('registrations')
        .update({ confirmation_email_sent: true })
        .eq('id', registrationId);
    }
  } catch (e) {
    console.error('sendRegistrationConfirmedEmail failed:', e);
  }
}
