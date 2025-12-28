'use client';
import { ENV_CONFIG } from '@/lib/env-config';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

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
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrders() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        status: mapBackendStatus(order.status, order.paymentStatus),
        paymentMethod: 'Razorpay',
        shippingAddress: `${order.shippingAddress || ''}, ${order.city || ''}, ${order.state || ''} ${order.pincode || ''}`.trim(),
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

  const mapBackendStatus = (orderStatus: string, paymentStatus: string): OrderStatus => {
    if (orderStatus === 'CANCELLED') return 'cancelled';
    if (orderStatus === 'DELIVERED') return 'delivered';
    if (orderStatus === 'SHIPPED') return 'shipped';
    if (orderStatus === 'PROCESSING' || paymentStatus === 'SUCCESS') return 'processing';
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
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading orders...</div>
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
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order number, customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Orders
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                    <div className="text-sm text-gray-500">{order.customer.email}</div>
                    <div className="text-sm text-gray-500">{order.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.map((item, idx) => (
                        <div key={idx}>
                          {item.quantity}x {item.product}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value as OrderStatus)}
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowViewModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowInvoiceModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Processing</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'processing').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Delivered</p>
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
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Order Number:</span> <span className="font-medium">{selectedOrder.orderNumber}</span></div>
                    <div><span className="text-gray-600">Status:</span> <span className={`font-medium ${getStatusColor(selectedOrder.status)} px-2 py-1 rounded-full text-xs`}>{selectedOrder.status}</span></div>
                    <div><span className="text-gray-600">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                    <div><span className="text-gray-600">Payment:</span> {selectedOrder.paymentMethod}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                  <div className="text-sm space-y-1">
                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedOrder.customer.name}</span></div>
                    <div><span className="text-gray-600">Email:</span> {selectedOrder.customer.email}</div>
                    <div><span className="text-gray-600">Phone:</span> {selectedOrder.customer.phone}</div>
                    <div><span className="text-gray-600">Address:</span> {selectedOrder.shippingAddress}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Order Items</h3>
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
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
                <h2 className="text-xl font-bold text-gray-900">Invoice</h2>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Invoice Content */}
              <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
                {/* Company Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-blue-600">Urbandec</h1>
                  <p className="text-sm text-gray-600">Premium Digital Photo Frames</p>
                  <p className="text-sm text-gray-600">urbandec.in@gmail.com | +91 8105663269</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h2 className="text-lg font-bold mb-4">TAX INVOICE</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
                      <p className="text-sm">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customer.phone}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm"><span className="font-semibold">Invoice No:</span> {selectedOrder.orderNumber}</p>
                      <p className="text-sm"><span className="font-semibold">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm"><span className="font-semibold">Payment:</span> {selectedOrder.paymentMethod}</p>
                    </div>
                  </div>

                  <table className="w-full mb-6">
                    <thead className="bg-gray-100">
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
                      <tr>
                        <td colSpan={3} className="text-right py-2 px-4 text-sm">GST (18%):</td>
                        <td className="text-right py-2 px-4 text-sm font-medium">{formatPrice(selectedOrder.total * 0.18)}</td>
                      </tr>
                      <tr className="border-t font-bold">
                        <td colSpan={3} className="text-right py-2 px-4">Grand Total:</td>
                        <td className="text-right py-2 px-4 text-lg text-blue-600">{formatPrice(selectedOrder.total * 1.18)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="border-t pt-4 text-center text-xs text-gray-500">
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
                        alert(`Invoice sent to ${email}`);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}