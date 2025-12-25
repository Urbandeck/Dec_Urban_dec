'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { formatPrice } from '@/lib/utils';

export default function TestOrderPage() {
  const { user } = useAuthStore();
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [backendOrders, setBackendOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLocalOrders = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    setLocalOrders(orders);
  };

  const loadBackendOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/orders?email=${user?.email || ''}`);
      if (response.ok) {
        const data = await response.json();
        setBackendOrders(data);
      }
    } catch (error) {
    }
    setLoading(false);
  };

  const createTestOrder = () => {
    const testOrder = {
      id: 'test_' + Date.now(),
      orderId: 'ORD' + Date.now(),
      customerDetails: {
        fullName: user?.name || 'Test User',
        email: user?.email || 'test@example.com',
        phone: '9999999999',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      items: [
        {
          productId: '1',
          name: 'Test Digital Frame',
          quantity: 2,
          price: 2999,
          attributes: '10 inch, Black'
        }
      ],
      subtotal: 5998,
      tax: 1079.64,
      totalAmount: 7077.64,
      paymentId: 'pay_test_' + Date.now(),
      paymentStatus: 'SUCCESS',
      status: 'PAID',
      createdAt: new Date().toISOString()
    };

    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(testOrder);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    loadLocalOrders();
    alert('Test order created in localStorage!');
  };

  const clearLocalOrders = () => {
    if (confirm('Clear all orders from localStorage?')) {
      localStorage.removeItem('orders');
      loadLocalOrders();
    }
  };

  useEffect(() => {
    loadLocalOrders();
    loadBackendOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Order Debug Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LocalStorage Orders */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">LocalStorage Orders ({localOrders.length})</h2>
              <div className="space-x-2">
                <button
                  onClick={loadLocalOrders}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Refresh
                </button>
                <button
                  onClick={createTestOrder}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Add Test
                </button>
                <button
                  onClick={clearLocalOrders}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {localOrders.length === 0 ? (
                <p className="text-gray-500">No orders in localStorage</p>
              ) : (
                localOrders.map((order, idx) => (
                  <div key={idx} className="border rounded p-3 text-sm">
                    <div className="font-medium">Order #{order.orderId || order.id}</div>
                    <div className="text-gray-600">
                      Email: {order.customerDetails?.email || order.customerEmail || 'N/A'}
                    </div>
                    <div className="text-gray-600">
                      Total: {formatPrice(order.totalAmount || 0)}
                    </div>
                    <div className="text-gray-600">
                      Status: <span className={order.status === 'PAID' ? 'text-green-600' : ''}>{order.status}</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(order.createdAt || '').toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Backend Orders */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Database Orders ({backendOrders.length})</h2>
              <button
                onClick={loadBackendOrders}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {backendOrders.length === 0 ? (
                <p className="text-gray-500">No orders in database</p>
              ) : (
                backendOrders.map((order) => (
                  <div key={order.id} className="border rounded p-3 text-sm">
                    <div className="font-medium">Order #{order.orderId}</div>
                    <div className="text-gray-600">Email: {order.customerEmail}</div>
                    <div className="text-gray-600">Total: {formatPrice(order.totalAmount)}</div>
                    <div className="text-gray-600">
                      Status: <span className={order.status === 'PAID' ? 'text-green-600' : ''}>{order.status}</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {user?.name || 'Not logged in'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
            <p className="text-gray-500 mt-2">Orders are filtered by this email</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">How to Test:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Add Test" to create a test order in localStorage</li>
            <li>Go to checkout and complete a real payment</li>
            <li>Check if the order appears in either column</li>
            <li>Use "Refresh" buttons to reload the data</li>
            <li>Orders should appear in both localStorage (immediately) and database (after API call)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}