'use client';

import Link from 'next/link';
import Image from 'next/image';
import { api, Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/ProductImage';
import HoverImageSwap from '@/components/HoverImageSwap';
import CustomProductCheckout from '@/components/CustomProductCheckout';
import CTAVideoSection from '@/components/CTAVideoSection';
import AnimatedSection from '@/components/AnimatedSection';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks/useScrollAnimation';
import { useEffect, useState } from 'react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const products = await api.getProducts();
        // Process products to use only base64 images
        const productsWithImages = products.map(product => {
          // Check if product has images array with base64 data
          if (product.images && product.images.length > 0) {
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
            // Use only base64 data
            return {
              ...product,
              imageUrl: primaryImage.base64Data || '/images/placeholder.jpg'
            };
          }
          // Fallback to placeholder if no images
          return {
            ...product,
            imageUrl: '/images/placeholder.jpg'
          };
        });
        setAllProducts(productsWithImages);
        setFeaturedProducts(productsWithImages.slice(0, 4));
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Auto-slide functionality for hero section
  useEffect(() => {
    if (allProducts.length === 0) return;

    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    const nextSlide = () => {
      if (slides.length === 0) return;

      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    };

    // Start with the first slide
    if (slides.length > 0) {
      slides[0].classList.add('active');
    }

    const interval = setInterval(nextSlide, 5000);

    return () => clearInterval(interval);
  }, [allProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white min-h-screen flex items-center overflow-hidden">
        {/* Background slideshow */}
        <div className="hero-slideshow">
          {allProducts.length > 0 ? (
            allProducts.slice(0, 4).map((product, index) => (
              <div key={product.id || index} className="slide">
                <div className="absolute inset-0">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="slide-image"
                    priority={index === 0}
                  />
                </div>
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/50"></div>
              </div>
            ))
          ) : (
            // Fallback when no products
            <div className="slide active">
              <div className="absolute inset-0 bg-blue-600"></div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 fade-in-text">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-gradient bg-300">
                Transform Your Memories
              </span>
              <br />
              <span className="text-white mt-2 block text-3xl md:text-5xl">
                into Stunning Displays
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 fade-in-text drop-shadow-lg" style={{ animationDelay: '0.2s' }}>
              Discover our premium collection of digital photo frames with WiFi connectivity,
              high-resolution displays, and smart features.
            </p>
            <div className="flex gap-4 fade-in-text" style={{ animationDelay: '0.4s' }}>
              <Link
                href="/products"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg inline-block"
              >
                Shop Now
                <span className="ml-2">→</span>
              </Link>
              <Link
                href="/about"
                className="bg-white/20 backdrop-blur px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all hover:scale-105 shadow-lg inline-block border border-white/30"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollAnimationWrapper animation="scale" threshold={0.3}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of premium digital frames that bring your memories to life</p>
            </div>
          </ScrollAnimationWrapper>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Featured Products */}
              {featuredProducts.slice(0, 3).map((product, index) => (
                <ScrollAnimationWrapper
                  key={product.id}
                  animation={index % 2 === 0 ? "slide-left" : "slide-right"}
                  delay={index * 150}
                  threshold={0.2}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block h-full"
                  >
                    <div className="bg-white rounded-lg shadow-sm card-hover h-full">
                      <div className="aspect-square relative bg-gray-100 rounded-t-lg overflow-hidden">
                        <HoverImageSwap
                          images={product.images || [{ imageUrl: product.imageUrl }]}
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
                </ScrollAnimationWrapper>
              ))}

              {/* Custom Product Upload Card - at the end */}
              <CustomProductCheckout />
            </div>
          )}

          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
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