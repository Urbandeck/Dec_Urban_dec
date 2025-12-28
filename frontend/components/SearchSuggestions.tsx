'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import ProductImage from './ProductImage';

interface SearchSuggestionsProps {
  query: string;
  onClose: () => void;
  onSelect: () => void;
}

export default function SearchSuggestions({ query, onClose, onSelect }: SearchSuggestionsProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Fetch all products once
  useEffect(() => {
    async function fetchProducts() {
      try {
        const products = await api.getProducts();
        setAllProducts(products);
      } catch (error) {
      }
    }
    fetchProducts();
  }, []);

  // Filter products based on query
  useEffect(() => {
    if (query.length >= 2 && allProducts.length > 0) {
      setLoading(true);
      
      // Simulate slight delay for better UX
      const timer = setTimeout(() => {
        const searchQuery = query.toLowerCase();
        const filtered = allProducts.filter((product) => 
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.category?.toLowerCase().includes(searchQuery) ||
          product.brand?.toLowerCase().includes(searchQuery)
        ).slice(0, 5); // Limit to 5 suggestions
        
        setSuggestions(filtered);
        setLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  }, [query, allProducts]);

  const handleProductClick = (slug: string) => {
    onSelect();
    router.push(`/products/${slug}`);
  };

  const handleViewAll = () => {
    onSelect();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  if (query.length < 2) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
      {loading ? (
        <div className="p-3 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : suggestions.length > 0 ? (
        <>
          <div className="p-2">
            {suggestions.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product.slug)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded transition-colors text-left"
              >
                <div className="w-5 h-5 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-5 h-5 object-cover"
                    style={{ maxWidth: '20px', maxHeight: '20px', width: '20px', height: '20px' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.category} • {formatPrice(product.basePrice)}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 px-3 py-2">
            <button
              onClick={handleViewAll}
              className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 hover:bg-gray-50 rounded"
            >
              View all results for "{query}"
            </button>
          </div>
        </>
      ) : (
        <div className="p-4">
          <p className="text-sm text-gray-600 text-center">
            No products found for "{query}"
          </p>
          <button
            onClick={onClose}
            className="w-full mt-2 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Try a different search
          </button>
        </div>
      )}
    </div>
  );
}