import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { sendWelcomeEmail } from '@/lib/email/notifications';

// OAuth (Google / GitHub) redirect target.
//
// After the user approves on the provider, Supabase sends them back here with a
// short-lived `code`. We exchange it for a cookie-based session (so Server
// Components and RLS see the logged-in user) and then forward them on to `next`.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Where to land after a successful login. Only allow same-site paths so this
  // callback can't be abused as an open redirect.
  const requestedNext = searchParams.get('next') || '/dashboard';
  const next = requestedNext.startsWith('/') ? requestedNext : '/dashboard';

  const failRedirect = (reason: string) =>
    NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(reason)}`);

  // Provider denied/cancelled, or the app is running without live Supabase keys.
  if (oauthError) return failRedirect(errorDescription || oauthError);
  if (isMock) return failRedirect('Social login is unavailable in simulated mode.');
  if (!code) return failRedirect('Missing authorization code.');

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return failRedirect(error.message);

  // First-time social signups get the welcome email (idempotent via the
  // welcome_email_sent flag, so repeat logins won't re-send).
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await sendWelcomeEmail(user.id);
  } catch {
    /* never block login on email */
  }

  // Honor the proxy's forwarded host in production (e.g. behind Vercel/NGINX),
  // otherwise use the request origin.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocal = process.env.NODE_ENV === 'development';
  if (!isLocal && forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
