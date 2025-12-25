import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

export function useAuth() {
  const [isHydrated, setIsHydrated] = useState(false);
  const authStore = useAuthStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Return a safe version that handles hydration
  return {
    ...authStore,
    isAuthenticated: isHydrated ? authStore.isAuthenticated : false,
    user: isHydrated ? authStore.user : null,
    isHydrated,
  };
}