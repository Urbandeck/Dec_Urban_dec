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
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string } | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrder, setReturnOrder] = useState<any>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnReasonDetails, setReturnReasonDetails] = useState('');
  const [returnProductIndex, setReturnProductIndex] = useState(0);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [orderReturns, setOrderReturns] = useState<{ [orderId: string]: any[] }>({});

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for both React hydration AND Zustand store hydration
    if (!isHydrated || !_hasHydrated) return;

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

    // Fetch return requests for the user
    const fetchReturns = async () => {
      try {
        const userEmail = user?.email;
        if (!userEmail) return;
        const returnsResponse = await fetch(`${ENV_CONFIG.API_URL}/api/returns?email=${encodeURIComponent(userEmail)}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (returnsResponse.ok) {
          const returnsData = await returnsResponse.json();
          const returnsMap: { [orderId: string]: any[] } = {};
          returnsData.forEach((ret: any) => {
            if (!returnsMap[ret.orderId]) returnsMap[ret.orderId] = [];
            returnsMap[ret.orderId].push(ret);
          });
          setOrderReturns(returnsMap);
        }
      } catch (e) {
        // Silently fail
      }
    };
    fetchReturns();
  }, [isHydrated, _hasHydrated, isAuthenticated, user, router]);

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

  const openCancelModal = (order: any) => {
    setSelectedOrder(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // Helper to get order ID (handles both orderId and id fields)
  const getOrderId = (order: any): string => {
    return order?.orderId || order?.id || '';
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    const orderId = getOrderId(selectedOrder);
    if (!orderId) {
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Order ID not found'
      });
      setCancellingOrder(false);
      return;
    }

    setCancellingOrder(true);
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: cancelReason || 'Cancelled by customer' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification({
          type: 'success',
          title: 'Order cancelled successfully',
          message: data.shiprocketCancelled
            ? 'Order and shipment have been cancelled'
            : 'Order has been cancelled'
        });
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancelReason('');

        // Update the order in the local state
        const cancelledOrderId = getOrderId(selectedOrder);
        setOrders(prevOrders =>
          prevOrders.map(order =>
            getOrderId(order) === cancelledOrderId
              ? { ...order, status: 'CANCELLED', failureReason: cancelReason || 'Cancelled by customer' }
              : order
          )
        );

        // Show refund info if applicable
        if (data.refundEligible) {
          setTimeout(() => {
            setNotification({
              type: 'info',
              title: 'Refund Available',
              message: data.refundMessage || 'You may be eligible for a refund. Please contact support.'
            });
          }, 3000);
        }
      } else {
        setNotification({
          type: 'error',
          title: 'Failed to cancel order',
          message: data.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Failed to cancel order',
        message: 'Please try again later'
      });
    } finally {
      setCancellingOrder(false);
    }
  };

  const openReturnModal = (order: any) => {
    setReturnOrder(order);
    setReturnReason('');
    setReturnReasonDetails('');
    setReturnProductIndex(0);
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async () => {
    if (!returnOrder || !returnReason) return;

    const orderId = getOrderId(returnOrder);
    const item = returnOrder.items?.[returnProductIndex];
    if (!item) return;

    setSubmittingReturn(true);
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          productId: item.productId || 0,
          productName: item.productName || item.name,
          quantity: item.quantity || 1,
          reason: returnReason,
          reasonDetails: returnReasonDetails || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          title: 'Return request submitted',
          message: `Return ID: ${data.returnId || 'Pending'}. We'll process your request shortly.`,
        });
        setShowReturnModal(false);
        setReturnOrder(null);
        // Update return status in local state
        const orderId = getOrderId(returnOrder);
        setOrderReturns(prev => ({
          ...prev,
          [orderId]: [...(prev[orderId] || []), data],
        }));
      } else {
        setNotification({
          type: 'error',
          title: 'Return request failed',
          message: data.error || 'Please try again later',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Return request failed',
        message: 'Please try again later',
      });
    } finally {
      setSubmittingReturn(false);
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
    return statusConfig[status] || { label: status, color: 'text-slate-500' };
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

  // Show loading during hydration (both React and Zustand)
  if (!isHydrated || !_hasHydrated) {
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
    <div className="min-h-screen bg-stone-50">
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
              <h1 className="text-2xl font-medium text-slate-800">Your Orders</h1>
              <p className="text-sm text-slate-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search all orders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
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
              <span className="text-sm text-slate-600 font-medium">Filter by:</span>
            </div>

            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-1.5 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All time</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="year">Last year</option>
            </select>

            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-yellow-500"
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
                <div key={order.id || order.orderId} className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-stone-100 px-6 py-3 border-b border-stone-200">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <span className="text-slate-500">ORDER PLACED</span>
                          <p className="font-medium text-slate-800">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">TOTAL</span>
                          <p className="font-medium text-slate-800">{formatPrice(order.totalAmount)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">SHIP TO</span>
                          <p className="font-medium text-slate-800">
                            {order.customerName || order.customerDetails?.fullName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500">
                          ORDER # {(order.orderId || order.id || '').slice(0, 16).toUpperCase()}
                        </p>
                        <Link
                          href={`/orders/${order.orderId || order.id}`}
                          className="text-amber-600 hover:text-amber-700 hover:underline"
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
                          <p className="text-sm text-slate-500 mt-1">{deliveryInfo}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/orders/track/${order.orderId}`)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-800 text-sm font-medium rounded-md transition-colors"
                        >
                          Track package
                        </button>
                        {order.status === 'DELIVERED' && (() => {
                          const orderId = order.orderId || order.id;
                          const returns = orderReturns[orderId];
                          if (returns && returns.length > 0) {
                            const ret = returns[0];
                            const statusLabels: { [key: string]: { label: string; color: string } } = {
                              REQUESTED: { label: 'Return Requested', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                              APPROVED: { label: 'Return Approved', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                              PICKUP_SCHEDULED: { label: 'Pickup Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                              PICKED_UP: { label: 'Picked Up', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                              RECEIVED: { label: 'Return Received', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                              REFUND_INITIATED: { label: 'Refund Initiated', color: 'bg-green-100 text-green-800 border-green-200' },
                              REFUNDED: { label: 'Refunded', color: 'bg-green-100 text-green-800 border-green-200' },
                              REJECTED: { label: 'Return Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
                              CLOSED: { label: 'Return Closed', color: 'bg-stone-100 text-slate-700 border-stone-200' },
                            };
                            const info = statusLabels[ret.status] || { label: ret.status, color: 'bg-stone-100 text-slate-700 border-stone-200' };
                            return (
                              <span className={`px-3 py-2 text-sm font-medium rounded-md border ${info.color}`}>
                                {info.label}
                              </span>
                            );
                          }
                          return (
                            <button
                              onClick={() => openReturnModal(order)}
                              className="px-4 py-2 border border-stone-200 hover:bg-stone-100 text-slate-600 text-sm font-medium rounded-md transition-colors"
                            >
                              Return items
                            </button>
                          );
                        })()}
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
                            <div className="w-24 h-24 bg-stone-50 rounded flex-shrink-0">
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
                              className="text-base font-medium text-amber-600 hover:text-amber-700 hover:underline inline-block"
                            >
                              {item.productName || item.name}
                            </Link>
                            {/* Non-refundable badge for custom orders */}
                            {(item.productId === 0 || (item.productName || item.name || '').includes('Custom Frame')) && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                Non-refundable
                              </span>
                            )}
                            {(item.productAttributes || item.attributes) && (
                              <p className="text-sm text-slate-500 mt-1">{item.productAttributes || item.attributes}</p>
                            )}
                            <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium text-slate-800 mt-1">
                              {formatPrice(item.total || (item.price * item.quantity))}
                            </p>
                            <div className="flex gap-3 mt-3">
                              {/* Hide "Buy it again" for custom orders (productId is 0 or name contains "Custom Frame") */}
                              {item.productId && item.productId !== 0 && !(item.productName || item.name || '').includes('Custom Frame') && (
                                <Link
                                  href={`/products/${item.productId}`}
                                  className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                                >
                                  Buy it again
                                </Link>
                              )}
                              {order.status === 'DELIVERED' && item.productId && item.productId !== 0 && (
                                <>
                                  {!(item.productName || item.name || '').includes('Custom Frame') && <span className="text-gray-300">|</span>}
                                  <button className="text-sm text-amber-600 hover:text-amber-700 hover:underline">
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
                    <div className="mt-6 pt-4 border-t border-stone-200 flex flex-wrap gap-3">
                      <button
                        onClick={() => downloadInvoicePDF(order)}
                        className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                      >
                        Download invoice
                      </button>
                      {/* Check if order contains custom items (non-cancellable) */}
                      {(() => {
                        const isCustomOrder = order.items?.some((item: any) =>
                          item.productId === 0 || (item.productName || item.name || '').includes('Custom Frame')
                        );
                        const canCancel = !['CANCELLED', 'FAILED', 'DELIVERED'].includes(order.status) && !isCustomOrder;

                        if (isCustomOrder && !['CANCELLED', 'FAILED', 'DELIVERED'].includes(order.status)) {
                          return (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="text-sm text-gray-500 italic">
                                Custom orders cannot be cancelled
                              </span>
                            </>
                          );
                        } else if (canCancel) {
                          return (
                            <>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => openCancelModal(order)}
                                className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                              >
                                Cancel items
                              </button>
                            </>
                          );
                        }
                        return null;
                      })()}
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
              <h2 className="text-xl font-medium text-slate-800 mb-2">
                {searchQuery || filterPeriod !== 'all' || orderStatus !== 'all'
                  ? 'No orders found matching your criteria'
                  : 'Looking for your orders?'
                }
              </h2>
              <p className="text-slate-500 mb-6">
                {searchQuery || filterPeriod !== 'all' || orderStatus !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start shopping and your orders will appear here'
                }
              </p>
              <Link
                href="/products"
                className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-800 px-8 py-2 rounded-md font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Return Items Modal */}
      {showReturnModal && returnOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-slate-800">Return Items</h2>
              <button
                onClick={() => { setShowReturnModal(false); setReturnOrder(null); }}
                className="text-gray-400 hover:text-slate-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Order #{getOrderId(returnOrder).slice(0, 16).toUpperCase()}
            </p>

            {/* Select item to return */}
            {returnOrder.items?.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-2">Select item to return</label>
                <select
                  value={returnProductIndex}
                  onChange={(e) => setReturnProductIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                >
                  {returnOrder.items.map((item: any, idx: number) => (
                    <option key={idx} value={idx}>
                      {item.productName || item.name} (Qty: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selected item preview */}
            {returnOrder.items?.[returnProductIndex] && (
              <div className="mb-4 p-3 bg-stone-50 rounded-md flex items-center gap-3">
                <div className="text-sm">
                  <p className="font-medium text-slate-800">{returnOrder.items[returnProductIndex].productName || returnOrder.items[returnProductIndex].name}</p>
                  <p className="text-slate-500">Qty: {returnOrder.items[returnProductIndex].quantity} &middot; {formatPrice(returnOrder.items[returnProductIndex].total || returnOrder.items[returnProductIndex].price)}</p>
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Reason for return *</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select a reason...</option>
                <option value="DEFECTIVE">Product is defective or damaged</option>
                <option value="WRONG_ITEM">Received wrong item</option>
                <option value="NOT_AS_DESCRIBED">Product not as described</option>
                <option value="QUALITY_ISSUE">Quality not satisfactory</option>
                <option value="CHANGED_MIND">Changed my mind</option>
                <option value="SIZE_ISSUE">Size/dimensions not suitable</option>
                <option value="OTHER">Other reason</option>
              </select>
            </div>

            {/* Additional details */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Additional details (optional)</label>
              <textarea
                value={returnReasonDetails}
                onChange={(e) => setReturnReasonDetails(e.target.value)}
                placeholder="Please describe the issue..."
                rows={3}
                className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Returns are accepted within 7 days of delivery. Once submitted, our team will review your request and get back to you.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitReturn}
                disabled={submittingReturn || !returnReason}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-slate-800 px-4 py-2 rounded-md font-medium disabled:cursor-not-allowed transition-colors"
              >
                {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
              </button>
              <button
                onClick={() => { setShowReturnModal(false); setReturnOrder(null); }}
                className="flex-1 border border-stone-200 text-slate-600 px-4 py-2 rounded-md font-medium hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-slate-800">Cancel Order</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrder(null);
                  setCancelReason('');
                }}
                className="text-gray-400 hover:text-slate-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. The order and any associated shipment will be cancelled.
              </p>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Are you sure you want to cancel Order #{getOrderId(selectedOrder).slice(0, 16).toUpperCase()}?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Reason for cancellation (optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select a reason...</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelOrder}
                disabled={cancellingOrder}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium disabled:cursor-not-allowed transition-colors"
              >
                {cancellingOrder ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrder(null);
                  setCancelReason('');
                }}
                className="flex-1 border border-stone-200 text-slate-600 px-4 py-2 rounded-md font-medium hover:bg-stone-100 transition-colors"
              >
                No, Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}