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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchProducts();
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter and sort products
  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.basePrice - b.basePrice;
        case 'price-high':
          return b.basePrice - a.basePrice;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Header */}
      <div className="bg-slate-800">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className={`text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-4">
              Premium Collection
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              Digital Photo Frames
            </h1>
            <p className="text-slate-300 max-w-xl mx-auto">
              Discover our collection of premium digital photo frames that bring your memories to life
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className={`bg-white rounded-xl border border-stone-200 p-4 mb-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500 font-medium">Category:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-slate-800 text-white'
                      : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                  }`}
                >
                  {category === 'all' ? 'All Products' : category}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-stone-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className={`mb-6 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredProducts.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={`group block h-full transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="bg-white rounded-2xl h-full transition-all duration-300 hover:shadow-lg overflow-hidden border border-stone-200 hover:border-amber-300">
                <div className="aspect-square relative bg-stone-100 overflow-hidden">
                  <HoverImageSwap
                    images={product.images || []}
                    productName={product.name}
                    priority={index < 4}
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {index === 0 && (
                      <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        BESTSELLER
                      </span>
                    )}
                    {product.rating >= 4.5 && (
                      <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        TOP RATED
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  {/* Category Badge */}
                  {product.category && (
                    <span className="inline-block text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded mb-2">
                      {product.category}
                    </span>
                  )}
                  <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2 min-h-[40px]">
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
                        {product.reviewCount > 0 && (
                          <span className="text-xs text-slate-400">({product.reviewCount})</span>
                        )}
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
            style={{ transitionDelay: `${filteredProducts.length * 50}ms` }}
          >
            <CustomProductCheckout />
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No products found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters to find what you're looking for</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-700 transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <section className="py-14 bg-white border-t border-stone-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Can't find what you're looking for?
          </h2>
          <p className="text-slate-500 mb-6 max-w-lg mx-auto">
            Create a custom frame with your own photos. We'll handcraft it just for you!
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Custom Frame
          </button>
        </div>
      </section>
    </div>
  );
}
