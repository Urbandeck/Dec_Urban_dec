import { useState } from 'react';
import { createPaymentOrder, verifyPayment, PaymentOrder, PaymentVerification } from '@/lib/razorpay';

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);

  const createOrder = async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const order = await createPaymentOrder(orderId);
      setPaymentOrder(order);
      return order;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPaymentSignature = async (verification: PaymentVerification) => {
    setLoading(true);
    setError(null);
    try {
      const result = await verifyPayment(verification);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    paymentOrder,
    createOrder,
    verifyPaymentSignature,
  };
};