'use client';

import React, { useEffect } from 'react';
import { config } from '@/lib/config';

export default function RazorpayPage() {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    try {
      // Create order using the server at port 3001
      const response = await fetch('http://localhost:3001/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        alert('Razorpay SDK not loaded. Please refresh the page.');
        return;
      }

      // Configure Razorpay options
      const options = {
        key: config.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'UrbanDeck',
        description: 'Digital Frames Purchase',
        order_id: order.id,
        handler: function(response: any) {
          alert(`Payment Successful!\n\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${response.razorpay_order_id}`);
        },
        prefill: {
          name: 'Ajay Patil',
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      razorpay.open();
    } catch (error) {
      alert('Failed to initiate payment. Please check console.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Razorpay Payment</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h2 className="font-semibold mb-2">Order Details:</h2>
          <p>Digital Frames: ₹73,156</p>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Pay Now ₹73,156
        </button>

        <div className="mt-6 p-3 bg-gray-100 rounded text-sm">
          <p className="font-semibold mb-1">Test Credentials:</p>
          <p>Card: 4111 1111 1111 1111</p>
          <p>UPI: success@razorpay</p>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Make sure server is running on port 3001</p>
        </div>
      </div>
    </div>
  );
}