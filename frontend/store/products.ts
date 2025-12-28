import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ENV_CONFIG } from '@/lib/env-config'

interface ProductImage {
  id: number;
  productId: number;
  fileName: string;
  mimeType: string;
  fileSize: number;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
  imageUrl: string;
  base64Data?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  specsJson: string | null;
  basePrice: number;
  active: boolean;
  createdAt: string;
  skus: any[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  images?: ProductImage[];
}

interface ProductStore {
  products: Product[];
  lastFetched: number | null;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      lastFetched: null,

      fetchProducts: async () => {
        try {
          const response = await fetch(`${ENV_CONFIG.API_URL}/api/products`, {
            cache: 'no-store',
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            // Only cache if we got products
            if (data && data.length > 0) {
              set({ products: data, lastFetched: Date.now() });
            }
          }
        } catch (err) {
          // Keep existing cached products on error
          console.error('Failed to fetch products:', err);
        }
      },
    }),
    {
      name: 'products-storage',
    }
  )
)
