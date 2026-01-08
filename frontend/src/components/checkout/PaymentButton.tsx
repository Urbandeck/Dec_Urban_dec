'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { initiateRazorpayPayment } from '@/lib/razorpay';
import { useRouter } from 'next/navigation';

interface PaymentButtonProps {
  orderId: number;
  amount: number;
  userDetails: {
    name: string;
    email: string;
    contact: string;
  };
  className?: string;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  orderId,
  amount,
  userDetails,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    
    await initiateRazorpayPayment(
      orderId,
      userDetails,
      (response) => {
        router.push(`/order-success/${orderId}`);
      },
      (error) => {
        toast.error('Payment failed. Please try again.');
        setLoading(false);
      }
    );
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
    </button>
  );
};