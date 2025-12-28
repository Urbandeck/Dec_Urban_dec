'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearOrdersPage() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  const clearAllOrders = () => {
    // Clear from localStorage
    localStorage.removeItem('orders');
    localStorage.clear(); // Clear everything to be sure
    
    // Clear from sessionStorage too
    sessionStorage.clear();
    
    setCleared(true);
    
    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/orders');
    }, 2000);
  };

  useEffect(() => {
    // Auto-clear on page load
    clearAllOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        {cleared ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">All Orders Cleared!</h1>
            <p className="text-gray-600 mb-4">LocalStorage and SessionStorage have been cleared.</p>
            <p className="text-sm text-gray-500">Redirecting to orders page...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Clearing all orders...</p>
          </>
        )}
      </div>
    </div>
  );
}