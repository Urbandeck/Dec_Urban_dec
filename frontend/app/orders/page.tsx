'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { downloadInvoicePDF } from '@/lib/invoice-pdf';
import { ENV_CONFIG } from '@/lib/env-config';
import Notification from '@/components/ui/notification';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string } | null>(null);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        // Fetch orders from backend using session authentication
        const response = await fetch(`${ENV_CONFIG.API_URL}/api/orders/my-orders`, {
          credentials: 'include', // Include cookies for session
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const backendOrders = await response.json();

          // Merge backend and local orders (remove duplicates by ID)
          const orderMap = new Map();

          // Add backend orders first (they're the source of truth)
          backendOrders.forEach((order: any) => {
            orderMap.set(order.orderId || order.id, order);
          });

          const allOrders = Array.from(orderMap.values());
          setOrders(allOrders.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        } else {
          // If backend fails, use localStorage only
          const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
          // Filter by purchaser email OR customer email
          const userOrders = storedOrders.filter((order: any) =>
            order.purchaserEmail === user?.email ||
            order.customerDetails?.email === user?.email ||
            order.customerEmail === user?.email
          );
          setOrders(userOrders.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        }
      } catch (error) {
        // Fallback to localStorage
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const userOrders = storedOrders.filter((order: any) =>
          order.purchaserEmail === user?.email ||
          order.customerDetails?.email === user?.email ||
          order.customerEmail === user?.email
        );
        setOrders(userOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isHydrated, isAuthenticated, user, router]);

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = [...orders];

    // Filter by time period
    if (filterPeriod !== 'all') {
      const now = new Date();
      const periods: { [key: string]: number } = {
        '3months': 90,
        '6months': 180,
        'year': 365
      };
      const daysAgo = periods[filterPeriod];
      if (daysAgo) {
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        filtered = filtered.filter(order => new Date(order.createdAt) >= cutoffDate);
      }
    }

    // Filter by status
    if (orderStatus !== 'all') {
      filtered = filtered.filter(order => {
        if (orderStatus === 'active') {
          return ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status);
        } else if (orderStatus === 'delivered') {
          return order.status === 'DELIVERED';
        } else if (orderStatus === 'cancelled') {
          return ['CANCELLED', 'FAILED'].includes(order.status);
        }
        return true;
      });
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => {
        const searchLower = searchQuery.toLowerCase();
        return (
          order.orderId?.toLowerCase().includes(searchLower) ||
          order.items?.some((item: any) =>
            item.productName?.toLowerCase().includes(searchLower) ||
            item.name?.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    setFilteredOrders(filtered);
  }, [orders, filterPeriod, orderStatus, searchQuery]);

  const shareInvoice = (order: any) => {
    setSelectedOrder(order);
    setShareEmail(order.customerEmail || user?.email || '');
    setShowShareModal(true);
  };

  const handleShareInvoice = async () => {
    if (!shareEmail || !selectedOrder) return;

    setSharing(true);
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/orders/${selectedOrder.orderId}/send-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: shareEmail }),
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          title: 'Invoice sent successfully',
          message: `Invoice has been sent to ${shareEmail}`
        });
        setShowShareModal(false);
        setShareEmail('');
        setSelectedOrder(null);
      } else {
        const error = await response.json();
        setNotification({
          type: 'error',
          title: 'Failed to send invoice',
          message: error.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Failed to send invoice',
        message: 'Please try again later'
      });
    } finally {
      setSharing(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusConfig: { [key: string]: { label: string, color: string } } = {
      'PENDING': { label: 'Order Placed', color: 'text-yellow-600' },
      'PAID': { label: 'Payment Confirmed', color: 'text-green-600' },
      'PROCESSING': { label: 'Processing', color: 'text-blue-600' },
      'SHIPPED': { label: 'Shipped', color: 'text-blue-600' },
      'OUT_FOR_DELIVERY': { label: 'Out for Delivery', color: 'text-blue-600' },
      'DELIVERED': { label: 'Delivered', color: 'text-green-600' },
      'CANCELLED': { label: 'Cancelled', color: 'text-red-600' },
      'FAILED': { label: 'Payment Failed', color: 'text-red-600' }
    };
    return statusConfig[status] || { label: status, color: 'text-gray-600' };
  };

  const getDeliveryDate = (order: any) => {
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);

    if (order.status === 'DELIVERED') {
      return 'Delivered';
    } else if (['CANCELLED', 'FAILED'].includes(order.status)) {
      return '';
    } else {
      // Add estimated days based on status
      const daysToAdd = order.status === 'SHIPPED' ? 3 : 5;
      deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
      return `Expected by ${deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    }
  };

  // Show loading during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium text-gray-900">Your Orders</h1>
              <p className="text-sm text-gray-600 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search all orders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
                <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium">Filter by:</span>
            </div>

            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All time</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="year">Last year</option>
            </select>

            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All orders</option>
              <option value="active">Active orders</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled/Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusDisplay(order.status);
              const deliveryInfo = getDeliveryDate(order);

              return (
                <div key={order.id || order.orderId} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <span className="text-gray-600">ORDER PLACED</span>
                          <p className="font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">TOTAL</span>
                          <p className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">SHIP TO</span>
                          <p className="font-medium text-gray-900">
                            {order.customerName || order.customerDetails?.fullName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">
                          ORDER # {(order.orderId || order.id || '').slice(0, 16).toUpperCase()}
                        </p>
                        <Link
                          href={`/orders/${order.orderId || order.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          View order details
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className={`text-lg font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </h3>
                        {deliveryInfo && (
                          <p className="text-sm text-gray-600 mt-1">{deliveryInfo}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/orders/track/${order.orderId}`)}
                          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium rounded-md transition-colors"
                        >
                          Track package
                        </button>
                        {order.status === 'DELIVERED' && (
                          <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors">
                            Return items
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      {(order.items || []).map((item: any, index: number) => {
                        // Handle backend image URLs
                        let imageUrl = item.imageUrl;
                        if (imageUrl && imageUrl.startsWith('/api/')) {
                          imageUrl = `${ENV_CONFIG.API_URL}${imageUrl}`;
                        }

                        return (
                          <div key={index} className="flex gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.productName || item.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          <div className="flex-1">
                            <Link
                              href={`/products/${item.productId || ''}`}
                              className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline inline-block"
                            >
                              {item.productName || item.name}
                            </Link>
                            {(item.productAttributes || item.attributes) && (
                              <p className="text-sm text-gray-600 mt-1">{item.productAttributes || item.attributes}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {formatPrice(item.total || (item.price * item.quantity))}
                            </p>
                            <div className="flex gap-3 mt-3">
                              <Link
                                href={`/products/${item.productId || ''}`}
                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                Buy it again
                              </Link>
                              {order.status === 'DELIVERED' && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                                    Write a product review
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>

                    {/* Additional Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                      <button
                        onClick={() => downloadInvoicePDF(order)}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Download invoice
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => shareInvoice(order)}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Share invoice
                      </button>
                      {!['CANCELLED', 'FAILED', 'DELIVERED'].includes(order.status) && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                            Cancel items
                          </button>
                        </>
                      )}
                    </div>

                    {/* Failure Reason for Failed Orders */}
                    {(order.status === 'FAILED' || order.status === 'CANCELLED') && order.failureReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Reason: </span>
                          {order.failureReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12">
            <div className="text-center">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                {searchQuery || filterPeriod !== 'all' || orderStatus !== 'all'
                  ? 'No orders found matching your criteria'
                  : 'Looking for your orders?'
                }
              </h2>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterPeriod !== 'all' || orderStatus !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start shopping and your orders will appear here'
                }
              </p>
              <Link
                href="/products"
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-2 rounded-md font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Share Invoice Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-900">Share Invoice</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Enter the email address where you want to send the invoice for Order #{selectedOrder?.orderId?.slice(0, 16).toUpperCase()}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="recipient@example.com"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleShareInvoice}
                disabled={sharing || !shareEmail}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-medium disabled:cursor-not-allowed transition-colors"
              >
                {sharing ? 'Sending...' : 'Send Invoice'}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}