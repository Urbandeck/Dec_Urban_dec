'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import HoverImageSwap from '@/components/HoverImageSwap';
import CustomProductCheckout from '@/components/CustomProductCheckout';
import AnimatedSection from '@/components/AnimatedSection';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add smooth scroll on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/products', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 animate-pulse">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading products: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ScrollAnimationWrapper animation="fade" className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Photo Frames</h1>
          <p className="text-gray-600">Discover our collection of premium digital photo frames</p>
        </ScrollAnimationWrapper>

        {products.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <AnimatedSection
                key={product.id}
                animation="scale"
                delay={index * 50}
                threshold={0.1}
                className="h-full"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="group block h-full"
                >
                  <div className="bg-white rounded-lg shadow-sm card-hover h-full transform transition-all duration-300 hover:scale-105">
                  <div className="aspect-square relative bg-gray-100 rounded-t-lg overflow-hidden">
                    <HoverImageSwap
                      images={product.images || []}
                      productName={product.name}
                      priority={false}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(product.basePrice)}
                      </span>
                      {product.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      )}
                    </div>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.rating} ({product.reviewCount} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                </Link>
              </AnimatedSection>
            ))}

            {/* Custom Product Upload Card - Always at the end */}
            <ScrollAnimationWrapper animation="scale" delay={300}>
              <CustomProductCheckout />
            </ScrollAnimationWrapper>
          </div>
        )}
      </div>
    </div>
  );
}