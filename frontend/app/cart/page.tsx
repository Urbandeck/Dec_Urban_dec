'use client';

import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleProceedToCheckout = () => {
    router.push('/checkout');
  };

  const handleQuantityChange = async (skuId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(`${skuId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    updateQuantity(skuId, newQuantity);
    setIsUpdating(null);
  };

  const handleRemoveItem = async (skuId: number) => {
    setIsUpdating(`remove-${skuId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    removeItem(skuId);
    setIsUpdating(null);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h1>
            <p className="text-slate-500 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/25"
            >
              Continue Shopping
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-800 mb-8"
        >
          Shopping Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              {items.map((item, index) => (
                <motion.div
                  key={item.skuId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-6 border-b border-stone-100 last:border-b-0"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.imageUrl && item.imageUrl.startsWith('data:image') ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{item.name}</h3>
                    {item.attributes && (
                      <p className="text-sm text-slate-500 mb-2">{item.attributes}</p>
                    )}
                    <p className="text-lg font-semibold text-slate-800">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.skuId, item.quantity - 1)}
                      disabled={isUpdating === `${item.skuId}` || item.quantity <= 1}
                      className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-12 text-center font-medium text-slate-800">
                      {isUpdating === `${item.skuId}` ? (
                        <svg className="animate-spin h-5 w-5 mx-auto text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.skuId, item.quantity + 1)}
                      disabled={isUpdating === `${item.skuId}`}
                      className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                      </svg>
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-800">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.skuId)}
                    disabled={isUpdating === `remove-${item.skuId}`}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdating === `remove-${item.skuId}` ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-4">
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-stone-100 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-slate-800">
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProceedToCheckout}
                className="block w-full bg-amber-500 text-white text-center py-3 rounded-full font-semibold hover:bg-amber-600 transition-colors mb-3 shadow-lg shadow-amber-500/25"
              >
                Proceed to Checkout
              </motion.button>

              <Link
                href="/products"
                className="block w-full text-center text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Continue Shopping
              </Link>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t border-stone-100">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-2">
                  <span>Powered by</span>
                  <span className="font-semibold text-slate-700">Razorpay</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
