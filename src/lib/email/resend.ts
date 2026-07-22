// Minimal Resend client — posts to the Resend REST API with `fetch` so we don't
// need the SDK as a dependency. Server-only (reads RESEND_API_KEY).
//
// Every send is best-effort: if the key is missing or Resend errors, we log and
// return { success:false } instead of throwing, so signup / payment flows never
// break because an email couldn't go out.

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'DevTrackAcademy <info@devtrackacademy.com>';

  // Treat the shipped placeholder as "not configured" so local dev stays quiet.
  if (!apiKey || apiKey.includes('your_resend_api_key')) {
    console.warn(`[email] RESEND_API_KEY not configured — skipping "${subject}"`);
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[email] Resend API error ${res.status}:`, detail);
      return { success: false, error: `Resend responded ${res.status}` };
    }

    return { success: true };
  } catch (e: any) {
    console.error('[email] Failed to send:', e);
    return { success: false, error: e?.message || 'send failed' };
  }
}
