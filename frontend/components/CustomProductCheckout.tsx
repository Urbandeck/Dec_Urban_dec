'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { config } from '@/lib/config';
import Modal from './Modal';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';
import { useAuthStore } from '@/store/auth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface DeliveryAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface SavedAddress extends DeliveryAddress {
  id?: string;
  label?: string;
  isDefault?: boolean;
}

const FRAME_PRICES = {
  '18x23': 2499
};

const COLOR_PRICES = {
  'walnut': 0
};

export default function CustomProductCheckout() {
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [productDetails, setProductDetails] = useState({
    frameSize: '18x23',
    frameColor: 'walnut',
    quantity: 1,
    specialInstructions: ''
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  });

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  // Load user data and saved addresses when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Auto-fill customer info if user is logged in
      setCustomerInfo({
        name: user.name || '',
        email: user.email || '',
        phone: '' // Phone might need to be fetched from profile
      });

      // Fetch saved addresses
      fetchSavedAddresses();
    }
  }, [isAuthenticated, user]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/user/addresses`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const addresses = await response.json();
        setSavedAddresses(addresses);

        const defaultAddr = addresses.find((addr: SavedAddress) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id || '');
          setUseExistingAddress(true);
        }
      } else {
        // API endpoint returns error or not found
        setSavedAddresses([]);
      }
    } catch (error) {
      // Network error - silently fail and show no saved addresses
      setSavedAddresses([]);
    }
  };

  const handleAddressSelection = (addressId: string) => {
    const selected = savedAddresses.find(addr => addr.id === addressId);
    if (selected) {
      setDeliveryAddress({
        addressLine1: selected.addressLine1,
        addressLine2: selected.addressLine2,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode,
        country: selected.country
      });
      setSelectedAddressId(addressId);
    }
  };

  const calculateTotalPrice = () => {
    const basePrice = FRAME_PRICES[productDetails.frameSize as keyof typeof FRAME_PRICES] || 1500;
    const colorPrice = COLOR_PRICES[productDetails.frameColor as keyof typeof COLOR_PRICES] || 0;
    const unitPrice = basePrice + colorPrice;
    return unitPrice * productDetails.quantity;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setUploadedImages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (uploadedImages.length === 0) {
          toast.error('Please upload at least one image');
          return false;
        }
        return true;
      case 2:
        // Product details are always valid (has defaults)
        return true;
      case 3:
        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
          toast.error('Please fill in all personal information');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (!/^[6-9]\d{9}$/.test(customerInfo.phone)) {
          toast.error('Please enter a valid 10-digit phone number');
          return false;
        }
        return true;
      case 4:
        if (!deliveryAddress.addressLine1 || !deliveryAddress.city ||
            !deliveryAddress.state || !deliveryAddress.pincode) {
          toast.error('Please fill in all required address fields');
          return false;
        }
        if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
          toast.error('Please enter a valid 6-digit pincode');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    setIsProcessing(true);
    try {
      // First save the data temporarily (no product request created yet)
      const formData = new FormData();

      // Add images
      uploadedImages.forEach((image, index) => {
        formData.append('images', image.file);
      });

      // Add product details
      formData.append('frameSize', productDetails.frameSize);
      formData.append('frameColor', productDetails.frameColor);
      formData.append('quantity', productDetails.quantity.toString());
      formData.append('specialInstructions', productDetails.specialInstructions);

      // Add customer info directly
      formData.append('customerName', customerInfo.name);
      formData.append('customerEmail', customerInfo.email);
      formData.append('customerPhone', customerInfo.phone);

      // Add address details
      formData.append('addressLine1', deliveryAddress.addressLine1);
      formData.append('addressLine2', deliveryAddress.addressLine2 || '');
      formData.append('city', deliveryAddress.city);
      formData.append('state', deliveryAddress.state);
      formData.append('pincode', deliveryAddress.pincode);
      formData.append('country', deliveryAddress.country);

      // Add total amount
      formData.append('totalAmount', calculateTotalPrice().toString());

      // Upload temporarily - NO product request created yet
      const response = await fetch(`${config.apiUrl}/api/custom-products/temporary`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload data');
      }

      const result = await response.json();
      const tempId = result.tempId;

      // Load Razorpay script
      await loadRazorpayScript();

      const totalAmount = calculateTotalPrice();

      // Create Razorpay order
      const orderResponse = await fetch(`${config.apiUrl}/api/payments/create-order`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `cust_${Date.now()}`,
          notes: {
            type: 'custom_product',
            tempId: tempId
          }
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      if (!orderData.id) {
        throw new Error('Invalid payment order response');
      }

      // Configure Razorpay options
      const options = {
        key: config.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Urbandec Digital Frames',
        description: `Custom Frame Order - ${productDetails.frameSize} ${productDetails.frameColor}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Payment successful - NOW create the actual product request
          try {
            // Create the actual product request after successful payment
            const createRequestData = new FormData();
            createRequestData.append('tempId', tempId);
            createRequestData.append('paymentId', response.razorpay_payment_id);
            createRequestData.append('orderId', response.razorpay_order_id);

            const createResponse = await fetch(`${config.apiUrl}/api/custom-products/confirm-payment`, {
              method: 'POST',
              credentials: 'include',
              body: createRequestData
            });

            if (createResponse.ok) {
              const createResult = await createResponse.json();

              // Payment verified and order created successfully
              toast.success('Payment successful! Your custom frame order has been placed.');
              setShowModal(false);
              resetForm();
            } else {
              toast.error('Failed to create order after payment. Please contact support.');
            }
          } catch (error) {
            toast.error('Error processing order after payment');
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        notes: {
          address: `${deliveryAddress.addressLine1}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setUploadedImages([]);
    setProductDetails({
      frameSize: '18x23',
      frameColor: 'walnut',
      quantity: 1,
      specialInstructions: ''
    });
    setCustomerInfo({
      name: '',
      email: '',
      phone: ''
    });
    setDeliveryAddress({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    });
  };

  return (
    <>
      {/* Card Button */}
      <ScrollAnimationWrapper animation="scale" threshold={0.2} delay={100}>
        <div
          onClick={() => setShowModal(true)}
          className="bg-white rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer group border border-stone-200 hover:border-amber-300 overflow-hidden h-full hover:shadow-lg"
        >
          <div className="aspect-square relative bg-slate-800 overflow-hidden flex flex-col items-center justify-center p-3 sm:p-6">
            {/* Icon */}
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-amber-500 rounded-full flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-xl font-bold text-white mb-1 sm:mb-2 text-center">Create Custom Frame</h3>
            <p className="text-[10px] sm:text-sm text-slate-300 text-center line-clamp-2">Upload your photos for a personalized frame</p>
            {/* Badge */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-amber-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">
              CUSTOM
            </div>
          </div>
          <div className="p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4 gap-1 sm:gap-0">
              <div>
                <span className="text-[10px] sm:text-xs text-slate-400">Starting from</span>
                <p className="text-base sm:text-xl font-bold text-slate-800">
                  {formatPrice(2499)}
                </p>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-slate-600">Personalized</span>
              </div>
            </div>
            <button className="w-full bg-amber-500 text-white py-2 sm:py-3 rounded-lg hover:bg-amber-600 transition-colors font-semibold text-sm sm:text-base">
              Get Started
            </button>
          </div>
        </div>
      </ScrollAnimationWrapper>

      {/* Multi-step Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }}>
            {/* Header */}
            <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-start flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold">Create Your Custom Frame</h2>
                <div className="flex items-center gap-1 sm:gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                        currentStep >= step ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      {step < 5 && (
                        <div className={`w-4 sm:w-12 h-0.5 sm:h-1 ${currentStep > step ? 'bg-amber-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Upload Images */}
              {currentStep === 1 && (
                <div className="h-full flex flex-col">
                  <h3 className="text-xl font-semibold mb-6">Step 1: Upload Your Images</h3>
                  <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-8 bg-gray-50">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <svg className="h-24 w-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-amber-500 text-white px-8 py-4 rounded-lg hover:bg-amber-600 transition-colors font-semibold text-lg mb-4"
                    >
                      Select Images
                    </button>
                    <p className="text-gray-600">or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img src={image.preview} alt={image.name} className="w-full h-32 object-cover rounded-lg" />
                          <button
                            onClick={() => removeImage(image.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Frame Details */}
              {currentStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 2: Customize Your Frame</h3>

                  {/* Non-refundable notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm text-amber-800">
                        <strong>Please Note:</strong> Custom products are made-to-order and are <strong>non-refundable</strong>. Please review your images and specifications carefully before placing your order.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frame Size</label>
                      <select
                        value={productDetails.frameSize}
                        onChange={(e) => setProductDetails({...productDetails, frameSize: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        <option value="18x23">18cm x 23cm - {formatPrice(2499)}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frame Color</label>
                      <select
                        value={productDetails.frameColor}
                        onChange={(e) => setProductDetails({...productDetails, frameColor: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        <option value="walnut">Walnut</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={productDetails.quantity}
                        onChange={(e) => setProductDetails({...productDetails, quantity: parseInt(e.target.value) || 1})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                      <textarea
                        value={productDetails.specialInstructions}
                        onChange={(e) => setProductDetails({...productDetails, specialInstructions: e.target.value})}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="Any special requirements or notes..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Personal Information */}
              {currentStep === 3 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 3: Personal Information</h3>

                  {/* Show info box for logged-in users */}
                  {isAuthenticated && user && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-amber-800">
                        We've pre-filled your information from your account. Please verify and update if needed.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Delivery Address */}
              {currentStep === 4 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 4: Delivery Address</h3>

                  {/* Show saved addresses for logged-in users */}
                  {isAuthenticated && savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            id="useExisting"
                            checked={useExistingAddress}
                            onChange={(e) => {
                              setUseExistingAddress(e.target.checked);
                              if (e.target.checked && selectedAddressId) {
                                handleAddressSelection(selectedAddressId);
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor="useExisting" className="font-medium text-gray-700">
                            Use saved address
                          </label>
                        </div>

                        {useExistingAddress && (
                          <div className="space-y-2">
                            {savedAddresses.map((addr) => (
                              <label
                                key={addr.id}
                                className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedAddressId === addr.id
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="savedAddress"
                                  value={addr.id}
                                  checked={selectedAddressId === addr.id}
                                  onChange={() => {
                                    setSelectedAddressId(addr.id || '');
                                    handleAddressSelection(addr.id || '');
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm">
                                  {addr.label && <strong>{addr.label}: </strong>}
                                  {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </span>
                                {addr.isDefault && (
                                  <span className="ml-2 text-xs text-amber-600 font-medium">Default</span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(!useExistingAddress || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                      <input
                        type="text"
                        value={deliveryAddress.addressLine1}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine1: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="House/Flat No, Building Name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={deliveryAddress.addressLine2}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine2: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="Street, Landmark"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                        <input
                          type="text"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          placeholder="City"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                        <input
                          type="text"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          placeholder="State"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                        <input
                          type="text"
                          value={deliveryAddress.pincode}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          placeholder="6-digit pincode"
                          maxLength={6}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          value={deliveryAddress.country}
                          disabled
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              )}

              {/* Step 5: Review & Payment */}
              {currentStep === 5 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 5: Review & Payment</h3>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Frame Size:</span>
                        <span className="font-medium">{productDetails.frameSize} inches</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frame Color:</span>
                        <span className="font-medium capitalize">{productDetails.frameColor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-medium">{productDetails.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Images:</span>
                        <span className="font-medium">{uploadedImages.length} files</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-amber-600">{formatPrice(calculateTotalPrice())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-3">Delivery Details</h4>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{customerInfo.name}</p>
                      <p>{deliveryAddress.addressLine1}</p>
                      {deliveryAddress.addressLine2 && <p>{deliveryAddress.addressLine2}</p>}
                      <p>{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}</p>
                      <p className="text-gray-600">{customerInfo.email} | {customerInfo.phone}</p>
                    </div>
                  </div>

                  {/* Non-refundable warning before payment */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h5 className="font-semibold text-red-800 mb-1">Non-Refundable Order</h5>
                        <p className="text-sm text-red-700">
                          Custom products are personalized items made specifically for you. Once your order is placed, it <strong>cannot be cancelled or refunded</strong>. Please ensure all details are correct before proceeding with payment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={initiatePayment}
                    disabled={isProcessing}
                    className="w-full bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 transition-colors font-semibold disabled:bg-gray-400"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(calculateTotalPrice())} with Razorpay`}
                  </button>
                </div>
              )}

            </div>

            {/* Navigation Footer */}
            <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              {currentStep < 5 && (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold"
                >
                  Next
                </button>
              )}
            </div>
      </Modal>
    </>
  );
}