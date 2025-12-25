'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    // Check session on mount to see if user has an active session
    checkSession();
  }, [checkSession]);

  return <>{children}</>;
}