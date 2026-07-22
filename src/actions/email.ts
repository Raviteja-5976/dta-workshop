"use server";

import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/notifications';
import { isMock } from '@/lib/supabase/config';

/**
 * Sends the welcome email to the currently authenticated user (once).
 * Called by the auth page right after a successful email/password signup. The
 * user is resolved server-side from the session cookie — the client can't spoof
 * who gets emailed, and the DB flag makes it idempotent.
 */
export async function sendWelcomeEmailAction(): Promise<{ success: boolean }> {
  try {
    if (isMock) return { success: true };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    await sendWelcomeEmail(user.id);
    return { success: true };
  } catch {
    return { success: false };
  }
}
