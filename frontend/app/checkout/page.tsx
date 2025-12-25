'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/lib/config';
import { useAuthStore } from '@/store/auth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Check if user is authenticated, redirect to login if not
  useEffect(() => {
    if (!isAuthenticated) {
      // Store the intended destination
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load saved addresses if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const addresses = JSON.parse(localStorage.getItem(`addresses_${user.email}`) || '[]');
      setSavedAddresses(addresses);

      // Set default address if exists
      const defaultAddress = addresses.find((addr: any) => addr.isDefault);

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        // Pre-fill form with default address
        const addressParts = [];
        if (defaultAddress.addressLine1) addressParts.push(defaultAddress.addressLine1);
        if (defaultAddress.addressLine2) addressParts.push(defaultAddress.addressLine2);
        const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : defaultAddress.address || '';

        const initialFormData = {
          fullName: defaultAddress.fullName || '',
          email: defaultAddress.email || user.email || '',  // Use saved address email or user's email
          phone: defaultAddress.phone || '',
          address: fullAddress,
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          pincode: defaultAddress.pincode || '',
        };

        setFormData(initialFormData);
      } else if (addresses.length === 0) {
        // No saved addresses, show new address form
        setShowNewAddressForm(true);
        // Pre-fill with user's email but let them change delivery email if needed
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          fullName: user.name || ''
        }));
      }
    } else {
      // Guest checkout - show new address form
      setShowNewAddressForm(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      // Razorpay SDK loaded
    };
    script.onerror = () => {
      // Failed to load Razorpay SDK
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Log the current form data for debugging

    if (!formData.fullName || !formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email || !formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone || !formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.address || !formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city || !formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state || !formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode || !formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);

    if (selectedAddress) {
      const addressParts = [];
      if (selectedAddress.addressLine1) addressParts.push(selectedAddress.addressLine1);
      if (selectedAddress.addressLine2) addressParts.push(selectedAddress.addressLine2);
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : selectedAddress.address || '';

      const newFormData = {
        fullName: selectedAddress.fullName || '',
        email: selectedAddress.email || user?.email || '', // Use address email first, then user's email
        phone: selectedAddress.phone || '',
        address: fullAddress,
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        pincode: selectedAddress.pincode || '',
      };

      setFormData(newFormData);
      setShowNewAddressForm(false);
    }
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    setFormData({
      fullName: '',
      email: '',  // Keep delivery email empty for user to fill
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  const saveNewAddress = () => {
    if (isAuthenticated && user) {
      const newAddress = {
        id: Date.now().toString(),
        label: 'Home',
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.address,
        addressLine2: '',
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        isDefault: savedAddresses.length === 0,
        createdAt: new Date().toISOString(),
      };
      
      const updatedAddresses = [...savedAddresses, newAddress];
      localStorage.setItem(`addresses_${user.email}`, JSON.stringify(updatedAddresses));
      setSavedAddresses(updatedAddresses);
      setSelectedAddressId(newAddress.id);
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      // Scroll to the first error field
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Show alert with missing fields
      const missingFields = [];
      if (!formData.fullName) missingFields.push('Full Name');
      if (!formData.email) missingFields.push('Email');
      if (!formData.phone) missingFields.push('Phone');
      if (!formData.address) missingFields.push('Address');
      if (!formData.city) missingFields.push('City');
      if (!formData.state) missingFields.push('State');
      if (!formData.pincode) missingFields.push('Pincode');
      
      setPaymentError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      setTimeout(() => setPaymentError(null), 5000);
      return;
    }

    // Save address if it's new and user is authenticated
    if (showNewAddressForm && isAuthenticated && !selectedAddressId) {
      saveNewAddress();
    }

    setIsProcessing(true);

    try {
      const totalAmount = getTotalPrice() * 1.18; // Including tax
      
      // Create order data
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          skuId: item.skuId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          attributes: item.attributes,
          imageUrl: item.imageUrl,
        })),
        customerDetails: formData,
        subtotal: getTotalPrice(),
        tax: getTotalPrice() * 0.18,
        totalAmount: totalAmount,
        orderDate: new Date().toISOString(),
      };

      // Check if Razorpay key is configured
      const razorpayKey = config.razorpayKeyId;
      if (!razorpayKey) {
        setPaymentError('Payment gateway is not configured. Please contact support.');
        setTimeout(() => setPaymentError(null), 5000);
        setIsProcessing(false);
        return;
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: Math.round(totalAmount * 100), // Amount in paise
        currency: 'INR',
        name: 'UrbanDeck',
        description: 'Purchase of Digital Photo Frames',
        // image: '/logo.png', // Commented out - no logo file available
        handler: async function (response: any) {
          // Payment successful - show loading state
          setPaymentSuccess(true);

          try {
            // Add payment details and purchaser info to order data
            const completeOrderData = {
              ...orderData,
              paymentId: response.razorpay_payment_id,
              paymentStatus: 'SUCCESS',
              status: 'PAID',
              purchaserEmail: user?.email || formData.email // Track who placed the order
            };
            
            // Create the order with payment info
            const orderResponse = await fetch(`${config.apiUrl}/api/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(completeOrderData),
            });

            const responseText = await orderResponse.text();

            if (!orderResponse.ok) {
              throw new Error(`Failed to create order: ${responseText}`);
            }

            const createdOrder = JSON.parse(responseText);

            // Also store in localStorage as backup
            const order = {
              id: response.razorpay_payment_id,
              ...orderData,
              paymentId: response.razorpay_payment_id,
              paymentStatus: 'SUCCESS',
              status: 'PAID',
              createdAt: new Date().toISOString(),
            };

            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            existingOrders.push(order);
            localStorage.setItem('orders', JSON.stringify(existingOrders));
            
            // Clear cart and redirect to orders page
            clearCart();
            // Small delay to ensure cart is cleared
            setTimeout(() => {
              router.push('/orders');
            }, 500);
          } catch (error) {
            // Still save to localStorage even if backend fails
            const fallbackOrder = {
              id: response.razorpay_payment_id,
              ...orderData,
              paymentId: response.razorpay_payment_id,
              paymentStatus: 'SUCCESS',
              status: 'PAID',
              createdAt: new Date().toISOString(),
            };

            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            existingOrders.push(fallbackOrder);
            localStorage.setItem('orders', JSON.stringify(existingOrders));

            clearCart();
            setTimeout(() => {
              router.push('/orders');
            }, 500);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function() {
            // Save cancelled order
            const cancelledOrder = {
              id: `CANCELLED_${Date.now()}`,
              ...orderData,
              paymentId: `CANCELLED_${Date.now()}`,
              paymentStatus: 'CANCELLED',
              status: 'CANCELLED',
              failureReason: 'Payment cancelled by user',
              createdAt: new Date().toISOString(),
            };

            // Save to localStorage
            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            existingOrders.push(cancelledOrder);
            localStorage.setItem('orders', JSON.stringify(existingOrders));

            // Try to save to backend as well
            fetch(`${config.apiUrl}/api/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(cancelledOrder),
            });

            // Don't clear cart for cancelled payments - user can retry
            setPaymentError('Payment cancelled. Redirecting to orders...');
            setTimeout(() => {
              setPaymentError(null);
              router.push('/orders');
            }, 2000);

            setIsProcessing(false);
            setPaymentSuccess(false); // Reset if modal is closed
          }
        }
      };

      if (window.Razorpay) {
        try {
          const razorpay = new window.Razorpay(options);
          razorpay.on('payment.failed', function (response: any) {
            // Save failed order
            const failedOrder = {
              id: `FAILED_${Date.now()}`,
              ...orderData,
              paymentId: response.error?.metadata?.payment_id || `FAILED_${Date.now()}`,
              paymentStatus: 'FAILED',
              status: 'FAILED',
              failureReason: response.error?.description || response.error?.reason || 'Payment failed',
              createdAt: new Date().toISOString(),
            };

            // Save to localStorage
            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            existingOrders.push(failedOrder);
            localStorage.setItem('orders', JSON.stringify(existingOrders));

            // Try to save to backend as well
            fetch(`${config.apiUrl}/api/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(failedOrder),
            });

            // Set user-friendly error message
            const errorMessage = response.error?.description ||
                               response.error?.reason ||
                               'Payment failed. Redirecting to orders...';

            setPaymentError(errorMessage);

            // Don't clear cart for failed payments - user can retry
            // Redirect to orders page after a short delay
            setTimeout(() => {
              router.push('/orders');
            }, 2000);

            setIsProcessing(false);
          });
          
          razorpay.open();
        } catch (error) {
          setPaymentError('Error initializing payment gateway. Please try again.');
          setTimeout(() => setPaymentError(null), 5000);
          setIsProcessing(false);
        }
      } else {
        setPaymentError('Payment gateway is not loaded. Please refresh the page and try again.');
        setTimeout(() => setPaymentError(null), 5000);
        setIsProcessing(false);
      }
    } catch (error) {
      setPaymentError('Something went wrong. Please try again.');
      setTimeout(() => setPaymentError(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading or redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Please login to continue</h2>
          <p className="text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect to cart
  }

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
              
              {/* Saved Addresses Section */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Select Delivery Address</h3>
                  <div className="space-y-3">
                    {savedAddresses.map(address => (
                      <div 
                        key={address.id}
                        onClick={() => handleAddressSelection(address.id)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedAddressId === address.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <input
                              type="radio"
                              checked={selectedAddressId === address.id}
                              onChange={() => handleAddressSelection(address.id)}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{address.fullName}</p>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  {address.label}
                                </span>
                                {address.isDefault && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              {address.email && (
                                <p className="text-sm text-gray-600">Email: {address.email}</p>
                              )}
                              <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors"
                    >
                      <span className="text-blue-600 font-medium">+ Add New Address</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Email Field - Always visible for recipient email */}
              {!showNewAddressForm && savedAddresses.length > 0 && selectedAddressId && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient's Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="recipient@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Order confirmation will be sent to this email</p>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || savedAddresses.length === 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient's Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="recipient@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Order confirmation will be sent to this email</p>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="9876543210"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street, Apartment 4B"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Mumbai"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Maharashtra"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.pincode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="400001"
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.skuId} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.imageUrl && item.imageUrl.startsWith('data:image') ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      {item.attributes && (
                        <p className="text-sm text-gray-600">{item.attributes}</p>
                      )}
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Pay with Razorpay'
                )}
              </button>

              <Link
                href="/cart"
                className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium mt-3"
              >
                ← Back to Cart
              </Link>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
                  <span>Powered by</span>
                  <span className="font-semibold text-blue-600">Razorpay</span>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Error Notification */}
      {paymentError && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Payment Failed</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{paymentError}</p>
                </div>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setPaymentError(null)}
                  className="inline-flex text-red-400 hover:text-red-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Loading Overlay */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
            <div className="flex flex-col items-center">
              {/* Success Icon with animation */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 text-center mb-4">Processing your order...</p>

              {/* Loading spinner */}
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}