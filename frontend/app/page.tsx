'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import HoverImageSwap from '@/components/HoverImageSwap';
import CustomProductCheckout from '@/components/CustomProductCheckout';
import CTAVideoSection from '@/components/CTAVideoSection';
import ProductCarousel from '@/components/ProductCarousel';
import { useEffect, useState } from 'react';
import { useProductStore } from '@/store/products';

export default function Home() {
  const { products, fetchProducts } = useProductStore();
  const featuredProducts = products.slice(0, 3);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Product Carousel */}
      <ProductCarousel autoPlayInterval={5000} />

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of premium digital frames that bring your memories to life</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Featured Products */}
            {featuredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={`group block h-full transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="bg-white rounded-lg shadow-sm card-hover h-full transform transition-all duration-300 hover:scale-105">
                  <div className="aspect-square relative bg-gray-100 rounded-t-lg overflow-hidden">
                    <HoverImageSwap
                      images={product.images || []}
                      productName={product.name}
                      priority={index === 0}
                    />
                    {index === 0 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        FEATURED
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-500">Starting at</span>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.basePrice)}
                        </p>
                      </div>
                      {product.rating > 0 && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Custom Product Upload Card - at the end */}
            <div
              className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${(featuredProducts.length + 1) * 100}ms` }}
            >
              <CustomProductCheckout />
            </div>
          </div>

          <div
            className={`text-center mt-12 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${(featuredProducts.length + 2) * 100}ms` }}
          >
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 transition-all shadow-md hover:shadow-lg"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section with Video */}
      <CTAVideoSection />
    </div>
  );
}
