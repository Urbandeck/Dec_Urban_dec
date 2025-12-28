'use client';

import React, { useState, useEffect } from 'react';
import { config } from '@/lib/config';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const makePayment = () => {
    if (!scriptLoaded) {
      alert('Payment script is still loading. Please try again.');
      return;
    }

    const options = {
      key: config.razorpayKeyId,
      amount: 7315600, // ₹73,156 in paise
      currency: 'INR',
      name: 'Urbandec',
      description: 'Digital Frames Purchase',
      image: 'https://via.placeholder.com/150',
      handler: function (response: any) {
        alert(
          `Payment Successful!\n\nPayment ID: ${response.razorpay_payment_id}\n\nYou can now close this window.`
        );
      },
      prefill: {
        name: 'Ajay Vijay Patil',
        email: 'aramansaluja99@gmail.com',
        contact: '9999999999'
      },
      notes: {
        address: 'C6 block 502, Xrbia Township, Pune'
      },
      theme: {
        color: '#3399cc'
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response: any) {
      alert(`Payment failed: ${response.error.description}`);
    });
    paymentObject.open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span>Smart WiFi Digital Frame (2x)</span>
                  <span className="font-medium">₹61,997</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Classic 10-inch White Frame</span>
                  <span className="font-medium">₹11,159</span>
                </div>
                <div className="flex justify-between py-3 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₹73,156</span>
                </div>
              </div>
            </div>

            <button
              onClick={makePayment}
              disabled={!scriptLoaded}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scriptLoaded ? 'Pay Now ₹73,156' : 'Loading...'}
            </button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold mb-2">Test Payment Details:</p>
              <p className="text-xs text-gray-600">Card: 4111 1111 1111 1111</p>
              <p className="text-xs text-gray-600">UPI: success@razorpay</p>
              <p className="text-xs text-gray-600">Any CVV & Future Expiry</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}