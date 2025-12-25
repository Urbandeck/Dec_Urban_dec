import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOrder {
  paymentId: number;
  orderId: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  razorpayKeyId: string;
  createdAt: string;
}

export interface PaymentVerification {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: number;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const createPaymentOrder = async (orderId: number): Promise<PaymentOrder> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payments/create-order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyPayment = async (verification: PaymentVerification): Promise<PaymentOrder> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payments/verify`, verification);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const initiateRazorpayPayment = async (
  orderId: number,
  userDetails: { name: string; email: string; contact: string },
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    alert('Failed to load Razorpay SDK. Please check your internet connection.');
    return;
  }

  try {
    const paymentOrder = await createPaymentOrder(orderId);
    
    const options = {
      key: paymentOrder.razorpayKeyId,
      amount: paymentOrder.amount * 100,
      currency: paymentOrder.currency,
      name: 'Digital Frames Shop',
      description: `Order #${orderId}`,
      order_id: paymentOrder.razorpayOrderId,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.contact,
      },
      theme: {
        color: '#3399cc',
      },
      handler: async function (response: any) {
        try {
          const verification: PaymentVerification = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: orderId,
          };
          
          const verifiedPayment = await verifyPayment(verification);
          onSuccess(verifiedPayment);
        } catch (error) {
          onFailure(error);
        }
      },
      modal: {
        ondismiss: function () {
          onFailure({ message: 'Payment cancelled by user' });
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    onFailure(error);
  }
};