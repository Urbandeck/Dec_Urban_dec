'use client';
import { ENV_CONFIG } from '@/lib/env-config';
import toast from 'react-hot-toast';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId: string;
  paymentMethod: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrders() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);
  const [shippingCharge, setShippingCharge] = useState(50);
  const [includeShipping, setIncludeShipping] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/admin/orders`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();

      // Transform backend data to match frontend structure
      const transformedOrders = data.map((order: any) => ({
        id: order.id.toString(),
        orderNumber: order.orderId || `ORD-${order.id}`,
        customer: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
        },
        items: order.items?.map((item: any) => ({
          product: item.productName,
          quantity: item.quantity,
          price: item.price,
        })) || [],
        total: order.totalAmount,
        status: mapBackendStatus(order.status),
        paymentStatus: mapPaymentStatus(order.paymentStatus),
        paymentId: order.paymentId || '',
        paymentMethod: order.paymentId && order.paymentId.startsWith('COD_') ? 'COD' : 'Razorpay',
        shippingAddress: order.shippingAddress || '',
        city: order.city || '',
        state: order.state || '',
        pincode: order.pincode || '',
        createdAt: order.createdAt,
        updatedAt: order.createdAt,
      }));

      setOrders(transformedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const mapBackendStatus = (orderStatus: string): OrderStatus => {
    if (orderStatus === 'CANCELLED') return 'cancelled';
    if (orderStatus === 'DELIVERED') return 'delivered';
    if (orderStatus === 'SHIPPED') return 'shipped';
    if (orderStatus === 'PROCESSING' || orderStatus === 'PAID') return 'processing';
    return 'pending';
  };

  const mapPaymentStatus = (paymentStatus: string): PaymentStatus => {
    if (!paymentStatus) return 'pending';
    const status = paymentStatus.toLowerCase();
    if (status === 'success') return 'success';
    if (status === 'failed') return 'failed';
    if (status === 'refunded') return 'refunded';
    return 'pending';
  };


  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-amber-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-slate-700';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'success': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-stone-100 text-slate-700 border-stone-200';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const order = orders.find(o => o.orderNumber === orderId);
      if (!order) return;

      const response = await fetch(`${ENV_CONFIG.API_URL}/api/admin/orders/${order.orderNumber}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders after successful update
      await fetchOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const processRefund = async () => {
    if (!selectedOrder) return;

    setRefundingOrderId(selectedOrder.id);
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: refundReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund');
      }

      toast.success(`Refund processed successfully! Refund ID: ${data.refundId}`, { duration: 5000 });
      setShowRefundModal(false);
      setRefundReason('');
      await fetchOrders();
    } catch (err) {
      toast.error(`Failed to process refund: ${err instanceof Error ? err.message : 'Unknown error'}`, { duration: 5000 });
    } finally {
      setRefundingOrderId(null);
    }
  };

  const canRefund = (order: Order): boolean => {
    // Can refund only if payment was successful and not already refunded
    return order.paymentStatus === 'success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-500">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with filters */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order number, customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
            className="px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
            Export Orders
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-100 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Payment Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-slate-800">{order.orderNumber}</div>
                      {(new Date().getTime() - new Date(order.createdAt).getTime()) < 24 * 60 * 60 * 1000 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded animate-pulse">NEW</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-slate-400">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-800">{order.customer.name}</div>
                    <div className="text-xs text-slate-400">{order.customer.email}</div>
                    <div className="text-xs text-slate-400">{order.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${order.paymentMethod === 'COD' ? 'bg-blue-100 text-blue-800 border-blue-200' : getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentMethod === 'COD' ? '💵 COD' : (
                          <>
                            {order.paymentStatus === 'success' && '✓ Paid'}
                            {order.paymentStatus === 'pending' && '⏱ Pending'}
                            {order.paymentStatus === 'failed' && '✗ Failed'}
                            {order.paymentStatus === 'refunded' && '↺ Refunded'}
                          </>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {order.paymentMethod}
                      </div>
                      {order.paymentId && (
                        <div className="text-xs text-slate-400 font-mono truncate max-w-[150px]" title={order.paymentId}>
                          ID: {order.paymentId.substring(0, 16)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-slate-800">{formatPrice(order.total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value as OrderStatus)}
                      className={`px-3 py-1.5 text-xs rounded-full font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowViewModal(true);
                        }}
                        className="text-amber-600 hover:text-blue-900 font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowInvoiceModal(true);
                        }}
                        className="text-slate-500 hover:text-slate-800 font-medium"
                      >
                        Invoice
                      </button>
                      {canRefund(order) && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRefundModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-2xl font-bold text-slate-800">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <p className="text-sm text-slate-500">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <p className="text-sm text-slate-500">Processing</p>
          <p className="text-2xl font-bold text-amber-600">
            {orders.filter(o => o.status === 'processing').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <p className="text-sm text-slate-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Order Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-slate-400 hover:text-slate-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Information */}
              <div className="space-y-4">
                <div className="bg-stone-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Order Number:</span>
                      <div className="font-medium text-slate-800">{selectedOrder.orderNumber}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Order Date & Time:</span>
                      <div className="font-medium text-slate-800">{new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Order Status:</span>
                      <div><span className={`${getStatusColor(selectedOrder.status)} px-3 py-1 rounded-full text-xs font-semibold`}>{selectedOrder.status.toUpperCase()}</span></div>
                    </div>
                    <div>
                      <span className="text-slate-500">Items Count:</span>
                      <div className="font-medium text-slate-800">{selectedOrder.items.length} item(s)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-amber-700">Payment Status:</span>
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${selectedOrder.paymentMethod === 'COD' ? 'bg-blue-100 text-blue-800 border-blue-200' : getPaymentStatusColor(selectedOrder.paymentStatus)} mt-1`}>
                          {selectedOrder.paymentMethod === 'COD' ? '💵 Cash on Delivery' : (
                            <>
                              {selectedOrder.paymentStatus === 'success' && '✓ Payment Successful'}
                              {selectedOrder.paymentStatus === 'pending' && '⏱ Payment Pending'}
                              {selectedOrder.paymentStatus === 'failed' && '✗ Payment Failed'}
                              {selectedOrder.paymentStatus === 'refunded' && '↺ Payment Refunded'}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-amber-700">Payment Method:</span>
                      <div className="font-medium text-blue-900">{selectedOrder.paymentMethod}</div>
                    </div>
                    {selectedOrder.paymentId && (
                      <div className="col-span-2">
                        <span className="text-amber-700">Transaction ID:</span>
                        <div className="font-mono text-xs bg-white px-3 py-2 rounded border border-blue-200 mt-1 break-all">
                          {selectedOrder.paymentId}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-stone-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Customer Information</h3>
                  <div className="text-sm space-y-1">
                    <div><span className="text-slate-500">Name:</span> <span className="font-medium">{selectedOrder.customer.name}</span></div>
                    <div><span className="text-slate-500">Email:</span> {selectedOrder.customer.email}</div>
                    <div><span className="text-slate-500">Phone:</span> {selectedOrder.customer.phone}</div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="col-span-2">
                      <span className="text-green-700">Address:</span>
                      <div className="font-medium text-green-900">{selectedOrder.shippingAddress}</div>
                    </div>
                    <div>
                      <span className="text-green-700">City:</span>
                      <div className="font-medium text-green-900">{selectedOrder.city}</div>
                    </div>
                    <div>
                      <span className="text-green-700">State:</span>
                      <div className="font-medium text-green-900">{selectedOrder.state}</div>
                    </div>
                    <div>
                      <span className="text-green-700">Pincode:</span>
                      <div className="font-medium text-green-900">{selectedOrder.pincode}</div>
                    </div>
                    <div>
                      <span className="text-green-700">Phone:</span>
                      <div className="font-medium text-green-900">{selectedOrder.customer.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Order Items</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Product</th>
                        <th className="text-center py-2">Qty</th>
                        <th className="text-right py-2">Price</th>
                        <th className="text-right py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{item.product}</td>
                          <td className="text-center py-2">{item.quantity}</td>
                          <td className="text-right py-2">{formatPrice(item.price)}</td>
                          <td className="text-right py-2">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="text-right font-semibold py-2">Total:</td>
                        <td className="text-right font-bold py-2">{formatPrice(selectedOrder.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-stone-200 text-slate-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Invoice</h2>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-slate-400 hover:text-slate-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Shipping Controls */}
              <div className="bg-stone-100 p-4 rounded-lg mb-4 border border-stone-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeShipping}
                        onChange={(e) => setIncludeShipping(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-600">Include Shipping Charges</span>
                    </label>
                  </div>
                  {includeShipping && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-500">Amount:</label>
                      <input
                        type="number"
                        value={shippingCharge}
                        onChange={(e) => setShippingCharge(Number(e.target.value))}
                        className="w-24 px-3 py-1 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="10"
                      />
                      <span className="text-sm text-slate-500">₹</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Content */}
              <div className="border-2 border-stone-200 rounded-lg p-6 bg-white">
                {/* Company Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-amber-600">Urbandec</h1>
                  <p className="text-sm text-slate-500">Premium Digital Photo Frames</p>
                  <p className="text-sm text-slate-500">urbandec.in@gmail.com | +91 8105663269</p>
                </div>

                <div className="border-t border-stone-200 pt-4">
                  <h2 className="text-lg font-bold mb-4">TAX INVOICE</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-slate-600 mb-2">Bill To:</h3>
                      <p className="text-sm">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-slate-500">{selectedOrder.customer.email}</p>
                      <p className="text-sm text-slate-500">{selectedOrder.customer.phone}</p>
                      <p className="text-sm text-slate-500">{selectedOrder.shippingAddress}</p>
                      <p className="text-sm text-slate-500">{selectedOrder.city}, {selectedOrder.state} {selectedOrder.pincode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm"><span className="font-semibold">Invoice No:</span> {selectedOrder.orderNumber}</p>
                      <p className="text-sm"><span className="font-semibold">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm"><span className="font-semibold">Payment:</span> {selectedOrder.paymentMethod}</p>
                    </div>
                  </div>

                  <table className="w-full mb-6">
                    <thead className="bg-stone-100">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm">Item Description</th>
                        <th className="text-center py-2 px-4 text-sm">Qty</th>
                        <th className="text-right py-2 px-4 text-sm">Unit Price</th>
                        <th className="text-right py-2 px-4 text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2 px-4 text-sm">{item.product}</td>
                          <td className="text-center py-2 px-4 text-sm">{item.quantity}</td>
                          <td className="text-right py-2 px-4 text-sm">{formatPrice(item.price)}</td>
                          <td className="text-right py-2 px-4 text-sm">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={3} className="text-right py-2 px-4 text-sm">Subtotal:</td>
                        <td className="text-right py-2 px-4 text-sm font-medium">{formatPrice(selectedOrder.total)}</td>
                      </tr>
                      {includeShipping && (
                        <tr>
                          <td colSpan={3} className="text-right py-2 px-4 text-sm">Shipping Charges:</td>
                          <td className="text-right py-2 px-4 text-sm font-medium">{formatPrice(shippingCharge)}</td>
                        </tr>
                      )}
                      <tr className="border-t font-bold">
                        <td colSpan={3} className="text-right py-2 px-4">Grand Total:</td>
                        <td className="text-right py-2 px-4 text-lg text-amber-600">
                          {formatPrice(selectedOrder.total + (includeShipping ? shippingCharge : 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="border-t pt-4 text-center text-xs text-slate-400">
                    <p>Thank you for your business!</p>
                    <p>This is a computer generated invoice and does not require signature.</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const email = prompt('Enter email address to send invoice:', selectedOrder.customer.email);
                      if (email) {
                        toast.success(`Invoice sent to ${email}`);
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send to Email
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-stone-200 text-slate-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Process Refund</h2>
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundReason('');
                  }}
                  className="text-slate-400 hover:text-slate-400"
                  disabled={refundingOrderId !== null}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Refund Information */}
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-yellow-900 mb-1">Refund Confirmation</h3>
                      <p className="text-sm text-yellow-800">
                        You are about to process a refund of <span className="font-bold">{formatPrice(selectedOrder.total)}</span> for order <span className="font-bold">{selectedOrder.orderNumber}</span>. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Reason for Refund (Optional)
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter reason for refund..."
                    rows={3}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={refundingOrderId !== null}
                  />
                </div>

                <div className="bg-stone-100 p-3 rounded-lg">
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Customer:</span>
                      <span className="font-medium">{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-medium">{selectedOrder.customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Refund Amount:</span>
                      <span className="font-bold text-red-600">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundReason('');
                  }}
                  className="px-4 py-2 bg-stone-200 text-slate-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  disabled={refundingOrderId !== null}
                >
                  Cancel
                </button>
                <button
                  onClick={processRefund}
                  disabled={refundingOrderId !== null}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {refundingOrderId === selectedOrder.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Process Refund'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}