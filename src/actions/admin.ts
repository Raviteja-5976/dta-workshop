"use server";

import { cookies } from 'next/headers';
import { signSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';

/**
 * Server action to verify the 6-digit admin security PIN.
 * If verified, sets a cryptographically signed cookie "dta_admin_session" valid for 2 hours.
 */
export async function verifyPasscodeAction(passcode: string) {
  const securityPin = process.env.ADMIN_SECURITY_PIN || '123456';
  
  if (passcode !== securityPin) {
    return { success: false, error: 'Invalid security passcode. Please try again.' };
  }

  try {
    let userId = 'mock-admin-id';
    let userEmail = 'admin@dta.com';

    if (!isMock) {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Authentication session not found. Please log in again.' };
      }

      // Check profiles role to ensure they are indeed an admin
      const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (dbError || !profile || profile.role !== 'admin') {
        return { success: false, error: 'Not authorized: Your user profile is not an admin.' };
      }

      userId = user.id;
      userEmail = user.email || '';
    }

    const payload = {
      userId,
      email: userEmail,
      exp: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };

    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-key-at-least-32-chars-long';
    const signedToken = await signSession(payload, secret);

    const cookieStore = await cookies();
    cookieStore.set('dta_admin_session', signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60, // 2 hours in seconds
      path: '/'
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred during verification.' };
  }
}

/**
 * Server action to clear the admin session cookie and log the admin out.
 */
export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete('dta_admin_session');
  return { success: true };
}
