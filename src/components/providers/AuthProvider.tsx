"use client";

import React, { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Boots the auth session listener once for the whole app so components stay in
// sync with login/logout without needing a page refresh.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
