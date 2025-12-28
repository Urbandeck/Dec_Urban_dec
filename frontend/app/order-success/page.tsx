'use client';
import { ENV_CONFIG } from '@/lib/env-config';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { user } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // Try to get from backend first
        const response = await fetch(`${ENV_CONFIG.API_URL}/api/orders/by-order-id/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else {
          // Fallback to localStorage
          const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
          const foundOrder = localOrders.find((o: any) => 
            o.id === orderId || o.orderId === orderId || o.paymentId === orderId
          );
          if (foundOrder) {
            setOrder(foundOrder);
          }
        }
      } catch (error) {
        // Try localStorage as fallback
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const foundOrder = localOrders.find((o: any) => 
          o.id === orderId || o.orderId === orderId || o.paymentId === orderId
        );
        if (foundOrder) {
          setOrder(foundOrder);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully placed and will be delivered soon.
            </p>

            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-mono font-semibold text-gray-900">{orderId}</p>
              </div>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-6">
                {(order.items || []).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.productName || item.name}
                      </p>
                      {(item.productAttributes || item.attributes) && (
                        <p className="text-sm text-gray-600">
                          {item.productAttributes || item.attributes}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.total || (item.price * item.quantity))}
                    </p>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="border-t pt-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{order.customerName || order.customerDetails?.fullName}</p>
                  <p>{order.shippingAddress || order.customerDetails?.address}</p>
                  <p>
                    {order.city || order.customerDetails?.city}, 
                    {order.state || order.customerDetails?.state} - 
                    {order.pincode || order.customerDetails?.pincode}
                  </p>
                  <p className="mt-2">Phone: {order.customerPhone || order.customerDetails?.phone}</p>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(order.totalAmount || 0)}
                  </span>
                </div>
                {order.paymentId && (
                  <p className="text-xs text-gray-500 mt-2">
                    Payment ID: {order.paymentId}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What\'s Next?</h2>
            <ul className="text-left space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You will receive an order confirmation email shortly
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                We\'ll notify you when your order ships
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Expected delivery within 5-7 business days
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/orders"
              className="block w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center"
            >
              View All Orders
            </Link>
            
            <Link
              href="/products"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
            >
              Continue Shopping
            </Link>
            
            <Link
              href="/"
              className="block w-full text-center text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}