'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';

export default function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate the cart store on client-side mount
    useCartStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}