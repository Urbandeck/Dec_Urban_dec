'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Register page now redirects to login since Google Sign-In handles both new and existing users
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-500">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
