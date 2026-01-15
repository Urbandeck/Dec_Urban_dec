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
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Product Carousel */}
      <ProductCarousel autoPlayInterval={5000} />

      {/* Features Section */}
      <section className="py-14 bg-white border-b border-stone-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                ),
                title: 'Free Shipping',
                description: 'On all orders across India'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Quality Guaranteed',
                description: 'Premium materials & craftsmanship'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: 'Handcrafted with Love',
                description: 'Each frame is uniquely made for you'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-5 rounded-xl bg-stone-50 transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
              Our Collection
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              Featured Products
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Discover our handpicked selection of premium digital frames that bring your memories to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={`group block h-full transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="bg-white rounded-2xl h-full transition-all duration-300 hover:shadow-lg overflow-hidden border border-stone-200 hover:border-amber-300">
                  <div className="aspect-square relative bg-stone-100 overflow-hidden">
                    <HoverImageSwap
                      images={product.images || []}
                      productName={product.name}
                      priority={index === 0}
                    />
                    {index === 0 && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        BESTSELLER
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Starting at</span>
                        <p className="text-xl font-bold text-slate-800">
                          {formatPrice(product.basePrice)}
                        </p>
                      </div>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-slate-600">{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Custom Product Upload Card */}
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
              className="inline-flex items-center gap-2 bg-slate-800 text-white px-7 py-3 rounded-full font-medium hover:bg-slate-700 transition-colors"
            >
              View All Products
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Why Choose Urbandec?
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto">
              We're not just selling frames, we're helping you preserve your most precious memories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '50+', label: 'Frame Designs' },
              { number: '4.9', label: 'Customer Rating' },
              { number: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-slate-700/50 border border-slate-600"
              >
                <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-1">
                  {stat.number}
                </div>
                <div className="text-slate-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Video */}
      <CTAVideoSection />

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Priya Sharma',
                location: 'Mumbai',
                text: 'Absolutely love my digital frame! The quality is outstanding and it looks beautiful in my living room. Perfect for displaying family photos.',
                rating: 5
              },
              {
                name: 'Rahul Verma',
                location: 'Delhi',
                text: 'Ordered a custom frame for my parents anniversary. They were thrilled! The craftsmanship and attention to detail is remarkable.',
                rating: 5
              },
              {
                name: 'Anjali Patel',
                location: 'Bangalore',
                text: 'Fast delivery and excellent customer service. The frame exceeded my expectations. Will definitely order more for gifting!',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-stone-50 p-6 rounded-xl border border-stone-200"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-slate-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-slate-800 rounded-2xl p-10 md:p-14">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Frame Your Memories?
            </h2>
            <p className="text-slate-300 mb-8">
              Join thousands of happy customers who trust Urbandec for their precious moments
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-7 py-3 rounded-full font-medium hover:bg-amber-600 transition-colors"
            >
              Start Shopping
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
