'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, isAuthenticated, _hasHydrated } = useAuthStore();
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    // Only check session once after hydration, and only if user appears to be logged in
    // This prevents logging out users on every navigation
    if (_hasHydrated && isAuthenticated && !hasCheckedSession.current) {
      hasCheckedSession.current = true;
      // Silently verify session in background - don't log out on failure
      // The persisted localStorage state is trusted
      checkSession().catch(() => {
        // Silently ignore - keep user logged in based on localStorage
        console.log('Session check failed, keeping local auth state');
      });
    }
  }, [_hasHydrated, isAuthenticated, checkSession]);

  return <>{children}</>;
}