'use client';
import { ENV_CONFIG } from '@/lib/env-config';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isHydrated, setIsHydrated] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editAddressData, setEditAddressData] = useState<any>({});

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      // Load saved profile from localStorage
      const profileKey = `profile_${user.email}`;
      const savedProfile = localStorage.getItem(profileKey);
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData({
          name: parsedProfile.name || user.name || '',
          email: parsedProfile.email || user.email || '',
          phone: parsedProfile.phone || '',
          address: parsedProfile.address || '',
          city: parsedProfile.city || '',
          state: parsedProfile.state || '',
          pincode: parsedProfile.pincode || '',
        });
      } else {
        // Use default values from user object
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: '',
          state: '',
          pincode: '',
        });
      }
      
      // Load orders from backend and localStorage
      fetchOrders(user.email);
      // Load saved addresses
      loadAddresses();
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const fetchOrders = async (email: string) => {
    try {
      // Fetch from backend
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/orders?email=${email}`);
      if (response.ok) {
        const backendOrders = await response.json();
        
        // Backend is the single source of truth when available
        // Don't merge with localStorage to avoid duplicates
        setOrders(backendOrders.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } else {
        // Fallback to localStorage only if backend fails
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        // Filter by purchaser email OR customer email
        const userOrders = storedOrders.filter((order: any) => 
          order.purchaserEmail === email ||
          order.customerDetails?.email === email ||
          order.customerEmail === email
        );
        setOrders(userOrders.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      // Fallback to localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const userOrders = storedOrders.filter((order: any) => 
        order.purchaserEmail === email ||
        order.customerDetails?.email === email ||
        order.customerEmail === email
      );
      setOrders(userOrders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
  };

  const loadAddresses = () => {
    // Load addresses from localStorage
    const savedAddresses = JSON.parse(localStorage.getItem(`addresses_${user?.email}`) || '[]');
    setAddresses(savedAddresses);
  };

  const handleAddAddress = async () => {
    setIsSavingAddress(true);
    try {
      // Validate required fields
      if (!newAddress.fullName || !newAddress.email || !newAddress.phone || !newAddress.addressLine1 || 
          !newAddress.city || !newAddress.state || !newAddress.pincode) {
        alert('Please fill all required fields');
        setIsSavingAddress(false);
        return;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAddress.email)) {
        alert('Please enter a valid email address');
        setIsSavingAddress(false);
        return;
      }

      // Add timestamp and ID
      const addressToSave = {
        ...newAddress,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      // If this is the first address or marked as default, set as default
      if (addresses.length === 0 || newAddress.isDefault) {
        addressToSave.isDefault = true;
        // Update other addresses to not be default
        addresses.forEach(addr => addr.isDefault = false);
      }

      // Save to localStorage
      const updatedAddresses = [...addresses, addressToSave];
      localStorage.setItem(`addresses_${user?.email}`, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);

      // Reset form
      setNewAddress({
        label: 'Home',
        fullName: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
      setShowAddressForm(false);
    } catch (error) {
      alert('Failed to save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    localStorage.setItem(`addresses_${user?.email}`, JSON.stringify(updatedAddresses));
    setAddresses(updatedAddresses);
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    localStorage.setItem(`addresses_${user?.email}`, JSON.stringify(updatedAddresses));
    setAddresses(updatedAddresses);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address.id);
    setEditAddressData({ ...address });
  };

  const handleUpdateAddress = async () => {
    setIsSavingAddress(true);
    try {
      // Validate required fields
      if (!editAddressData.fullName || !editAddressData.email || !editAddressData.phone || 
          !editAddressData.addressLine1 || !editAddressData.city || !editAddressData.state || 
          !editAddressData.pincode) {
        alert('Please fill all required fields');
        setIsSavingAddress(false);
        return;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editAddressData.email)) {
        alert('Please enter a valid email address');
        setIsSavingAddress(false);
        return;
      }

      // Update the address
      const updatedAddresses = addresses.map(addr => 
        addr.id === editingAddress 
          ? { ...editAddressData, updatedAt: new Date().toISOString() }
          : addr
      );

      localStorage.setItem(`addresses_${user?.email}`, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      setEditingAddress(null);
      setEditAddressData({});
    } catch (error) {
      alert('Failed to update address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
    setEditAddressData({});
  };

  const validateForm = () => {
    const errors = [];
    
    if (!profileData.name.trim()) {
      errors.push('Name is required');
    }
    
    if (!profileData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (profileData.phone && !/^[6-9]\d{9}$/.test(profileData.phone.replace(/\D/g, ''))) {
      errors.push('Please enter a valid 10-digit Indian mobile number');
    }
    
    if (profileData.pincode && !/^[1-9][0-9]{5}$/.test(profileData.pincode)) {
      errors.push('Please enter a valid 6-digit PIN code');
    }
    
    return errors;
  };

  const handleSaveProfile = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setIsSaving(true);
    try {
      // Save profile data to localStorage
      const profileKey = `profile_${user?.email}`;
      const profileToSave = {
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(profileKey, JSON.stringify(profileToSave));
      
      // If email changed, show warning
      if (profileData.email !== user?.email) {
        alert('Email change will require verification. Please check your new email for verification link.');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Show loading during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Orders
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'addresses'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Addresses
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Security
                  </div>
                </button>

                <hr className="my-4" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="space-x-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                          Note: Changing your email will require verification
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="Enter your street address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="Enter your city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <select
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Delhi">Delhi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={profileData.pincode}
                        onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="Enter 6-digit PIN code"
                        maxLength={6}
                        pattern="[0-9]{6}"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.orderId || order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                Order #{(order.orderId || order.id || '').toString().slice(0, 8)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status || 'PENDING'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            {(order.items || []).map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {item.productName || item.name} {(item.productAttributes || item.attributes) && `(${item.productAttributes || item.attributes})`} × {item.quantity}
                                </span>
                                <span className="text-gray-900">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900">Total</span>
                              <span className="font-semibold text-lg text-gray-900">
                                ₹{order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                            {order.paymentId && (
                              <p className="text-xs text-gray-500 mt-1">
                                Payment ID: {order.paymentId}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                      <Link
                        href="/products"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
                    {!showAddressForm && (
                      <button 
                        onClick={() => setShowAddressForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                      >
                        Add New Address
                      </button>
                    )}
                  </div>

                  {showAddressForm && (
                    <div className="border rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Label *
                          </label>
                          <select
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={newAddress.email}
                            onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter email address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter pincode"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newAddress.addressLine1}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="House/Flat No, Building Name"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={newAddress.addressLine2}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Street, Landmark (Optional)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter state"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newAddress.isDefault}
                              onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Set as default address</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleAddAddress}
                          disabled={isSavingAddress}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {isSavingAddress ? 'Saving...' : 'Save Address'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setNewAddress({
                              label: 'Home',
                              fullName: '',
                              email: '',
                              phone: '',
                              addressLine1: '',
                              addressLine2: '',
                              city: '',
                              state: '',
                              pincode: '',
                              isDefault: false,
                            });
                          }}
                          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {addresses.length > 0 ? (
                    <div className="grid gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          {editingAddress === address.id ? (
                            // Edit mode
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Address</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Label <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={editAddressData.label || ''}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, label: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editAddressData.fullName || ''}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, fullName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="email"
                                    value={editAddressData.email || ''}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="tel"
                                    value={editAddressData.phone || ''}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Line 1 <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editAddressData.addressLine1 || ''}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, addressLine1: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Line 2
                                  </label>
                                  <input
                                    type="text"
                                    value={editAddressData.addressLine2 || ''}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, addressLine2: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editAddressData.city || ''}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editAddressData.state || ''}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, state: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pincode <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editAddressData.pincode || ''}
                                    onChange={(e) => setEditAddressData({ ...editAddressData, pincode: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-3 mt-6">
                                <button
                                  onClick={handleUpdateAddress}
                                  disabled={isSavingAddress}
                                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                  {isSavingAddress ? 'Updating...' : 'Update Address'}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-gray-900">{address.label}</span>
                                  {address.isDefault && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Default</span>
                                  )}
                                </div>
                                <p className="text-gray-700">{address.fullName}</p>
                                {address.email && (
                                  <p className="text-sm text-gray-600">Email: {address.email}</p>
                                )}
                                <p className="text-sm text-gray-600">{address.addressLine1}</p>
                                {address.addressLine2 && (
                                  <p className="text-sm text-gray-600">{address.addressLine2}</p>
                                )}
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleEditAddress(address)}
                                  className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  Edit
                                </button>
                                {!address.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(address.id)}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                  >
                                    Set as Default
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="text-sm text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    !showAddressForm && (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-600">No saved addresses yet</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Update your password to keep your account secure
                      </p>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Update Password
                      </button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Enable 2FA
                      </button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Login History</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        View recent login activity on your account
                      </p>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        View History
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}