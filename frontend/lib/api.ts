import { API_ENDPOINTS, ENV_CONFIG } from './env-config';

const API_BASE_URL = ENV_CONFIG.API_URL;

export interface ProductImage {
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

export interface Product {
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
  imageUrl?: string; // Legacy field, kept for backwards compatibility
  images?: ProductImage[]; // New field for multiple images
  isLive?: boolean; // Product visibility status
  stock?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const api = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        cache: 'no-store', // Disable caching
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return [];
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        cache: 'no-store', // Disable caching to always get fresh data
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async getHealth(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      return false;
    }
  }
};