import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { AdminShell } from '@/components/Layout/AdminShell';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminName = 'Administrator';
  let adminEmail = 'admin@devtrackacademy.com';

  if (isMock) {
    const cookieStore = await cookies();
    const mockUserCookie = cookieStore.get('sb-mock-session')?.value;
    if (mockUserCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(mockUserCookie));
        adminEmail = user.email || adminEmail;
        adminName = user.user_metadata?.full_name || user.email?.split('@')[0] || adminName;
      } catch (e) {}
    }
  } else {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        adminEmail = user.email || adminEmail;
        adminName = user.user_metadata?.full_name || user.email?.split('@')[0] || adminName;
      }
    } catch (e) {
      console.error('Failed to retrieve authenticated admin user in layout:', e);
    }
  }

  return (
    <AdminShell adminName={adminName} adminEmail={adminEmail}>
      {children}
    </AdminShell>
  );
}
