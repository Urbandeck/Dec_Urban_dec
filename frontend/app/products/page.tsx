'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import HoverImageSwap from '@/components/HoverImageSwap';
import CustomProductCheckout from '@/components/CustomProductCheckout';
import { useProductStore } from '@/store/products';
import { motion, useInView } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ProductsPage() {
  const { products, fetchProducts } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.basePrice - b.basePrice;
        case 'price-high': return b.basePrice - a.basePrice;
        case 'rating': return b.rating - a.rating;
        default: return 0;
      }
    });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Header */}
      <section className="relative bg-slate-800 overflow-hidden pb-16">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-4 border border-amber-500/30"
            >
              Premium Collection
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              Digital Photo Frames
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-300 max-w-xl mx-auto"
            >
              Discover our collection of premium handcrafted frames
            </motion.p>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#fafaf9"/>
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-stone-200 p-5 mb-10 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500 font-medium">Category:</span>
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                  }`}
                >
                  {category === 'all' ? 'All Products' : category}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <p className="text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredProducts.length}</span> products
          </p>
        </motion.div>

        {/* Products Grid */}
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div key={product.id} variants={scaleIn}>
                <Link href={`/products/${product.slug}`} className="group block h-full">
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl sm:rounded-2xl h-full overflow-hidden border border-stone-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-square relative bg-stone-100 overflow-hidden">
                      <HoverImageSwap
                        images={product.images || []}
                        productName={product.name}
                        priority={index < 4}
                      />
                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2">
                        {index === 0 && (
                          <span className="bg-amber-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-md">
                            BESTSELLER
                          </span>
                        )}
                        {product.rating >= 4.5 && (
                          <span className="bg-slate-800 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-md hidden sm:block">
                            TOP RATED
                          </span>
                        )}
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300" />
                    </div>
                    <div className="p-3 sm:p-4 md:p-6">
                      {product.category && (
                        <span className="hidden sm:inline-block text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded mb-2 sm:mb-3">
                          {product.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-slate-800 text-sm sm:text-base md:text-lg mb-1 sm:mb-2 group-hover:text-amber-600 transition-colors truncate">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mb-2 sm:mb-4 hidden sm:block" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] sm:text-xs text-slate-400 block">Starting at</span>
                          <span className="text-base sm:text-xl md:text-2xl font-bold text-slate-800">{formatPrice(product.basePrice)}</span>
                        </div>
                        {product.rating > 0 && (
                          <div className="flex items-center gap-0.5 sm:gap-1 bg-amber-50 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-semibold text-amber-700">{product.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}

            {/* Custom Product Card */}
            <motion.div variants={scaleIn}>
              <CustomProductCheckout />
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No products found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className="bg-slate-800 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-700 transition-colors"
            >
              View All Products
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Bottom CTA */}
      <section className="py-16 bg-white border-t border-stone-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
              Can't find what you're looking for?
            </h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">
              Create a custom frame with your own photos. We'll handcraft it just for you!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const card = document.getElementById('custom-product-card');
                if (card) {
                  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => card.click(), 600);
                }
              }}
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Custom Frame
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
