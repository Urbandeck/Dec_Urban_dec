'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import HoverImageSwap from '@/components/HoverImageSwap';
import CustomProductCheckout from '@/components/CustomProductCheckout';
import { useProductStore } from '@/store/products';

export default function ProductsPage() {
  const { products, fetchProducts } = useProductStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className={`text-center mb-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Photo Frames</h1>
          <p className="text-gray-600">Discover our collection of premium digital photo frames that bring your memories to life</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={`group block h-full transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
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
                    <div>
                      <span className="text-xs text-gray-500">Starting at</span>
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(product.basePrice)}
                      </p>
                    </div>
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
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* Custom Product Upload Card - Always at the end */}
          <div
            className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${products.length * 100}ms` }}
          >
            <CustomProductCheckout />
          </div>
        </div>
      </div>
    </div>
  );
}
