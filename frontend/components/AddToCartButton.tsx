'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Product } from '@/lib/api';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
}

export default function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get the image URL - handle various formats
    let imageUrl = '/images/placeholder.jpg';
    if (product.imageUrl) {
      // Use product.imageUrl as-is (it might be a regular URL or data URI)
      imageUrl = product.imageUrl;
    } else if (product.images?.[0]?.base64Data) {
      // Check if base64Data already has data URI prefix
      if (product.images[0].base64Data.startsWith('data:')) {
        imageUrl = product.images[0].base64Data;
      } else {
        // Add the prefix if it's raw base64
        imageUrl = `data:${product.images[0].mimeType || 'image/jpeg'};base64,${product.images[0].base64Data}`;
      }
    }

    addItem({
      productId: product.id,
      skuId: product.id, // Using product ID as SKU for now
      name: product.name,
      price: product.basePrice,
      quantity,
      imageUrl,
    });
    
    setIsAdding(false);
    setShowSuccess(true);
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleAddToCart}
        disabled={isAdding || !product.active || isOutOfStock}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isAdding ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding to Cart...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add to Cart
          </>
        )}
      </button>
      
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center animate-fade-in">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Product added to cart successfully!
        </div>
      )}
      
      {isOutOfStock && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center font-semibold">
          Out of Stock
        </div>
      )}

      {!product.active && !isOutOfStock && (
        <p className="text-red-600 text-sm text-center">This product is currently unavailable</p>
      )}
    </div>
  );
}