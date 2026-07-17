import { isMock } from '@/lib/supabase/config';

// Map of batch id -> registration status ('pending' | 'confirmed' | ...) for the
// currently logged-in user. Used to show a "Registered" state on the workshop
// catalog and detail pages instead of the Register button.
export type RegistrationStatusMap = Record<string, string>;

export async function getMyRegistrations(): Promise<RegistrationStatusMap> {
  if (isMock) return {};

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return {};

    // registrations RLS lets a user read only their own rows, so the cookie
    // client is enough here.
    const { data } = await supabase
      .from('registrations')
      .select('batch_id, status')
      .eq('user_id', user.id);

    const map: RegistrationStatusMap = {};
    for (const r of data ?? []) {
      if (r.batch_id) map[r.batch_id] = r.status;
    }
    return map;
  } catch (e) {
    console.error('getMyRegistrations failed:', e);
    return {};
  }
}
