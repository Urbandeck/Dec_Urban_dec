'use client';

import React, { useState, useEffect } from 'react';
import { config } from '@/lib/config';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayPage() {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // First, create an order using backend API
      const orderResponse = await fetch('http://localhost:8080/api/payments/create-order/test-order-' + Date.now(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 7315600, // Amount in paise
          currency: 'INR',
        }),
      });

      if (!orderResponse.ok) {
        // If backend fails, create order directly
        const options = {
          key: config.razorpayKeyId,
          amount: 7315600,
          currency: 'INR',
          name: 'Urbandec',
          description: 'Digital Photo Frames',
          handler: function (response: any) {
            alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
          },
          prefill: {
            name: 'Ajay Patil',
            email: 'test@example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#3399cc'
          }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const order = await orderResponse.json();

        const options = {
          key: config.razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Urbandec',
          description: 'Digital Photo Frames',
          order_id: order.id,
          handler: function (response: any) {
            alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${response.razorpay_order_id}`);
          },
          prefill: {
            name: 'Ajay Patil',
            email: 'test@example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#3399cc'
          }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      // Fallback to direct payment without order
      const options = {
        key: config.razorpayKeyId,
        amount: 7315600,
        currency: 'INR',
        name: 'Urbandec',
        description: 'Digital Photo Frames',
        handler: function (response: any) {
          alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
        },
        prefill: {
          name: 'Ajay Patil',
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Purchase</h1>
        
        <div className="mb-6 space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span>Digital Frames</span>
            <span className="font-semibold">₹73,156</span>
          </div>
        </div>
        
        <button
          onClick={handlePayment}
          disabled={loading || !scriptLoaded}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Processing...' : scriptLoaded ? 'Pay ₹73,156' : 'Loading Payment...'}
        </button>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Test: 4111 1111 1111 1111 | UPI: success@razorpay</p>
        </div>
      </div>
    </div>
  );
}