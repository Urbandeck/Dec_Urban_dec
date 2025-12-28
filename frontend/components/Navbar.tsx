'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SearchSuggestions from './SearchSuggestions';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionSelect = () => {
    setSearchQuery('');
    setShowSearch(false);
    setShowSuggestions(false);
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg" className="h-14 w-auto">
              <defs>
                <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#10B981',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#059669',stopOpacity:1}} />
                </linearGradient>
              </defs>

              <text x="10" y="40"
                    fontFamily="'Poppins', 'Segoe UI', Arial, sans-serif"
                    fontSize="32"
                    fontWeight="900"
                    fill="#1E293B"
                    letterSpacing="1.5"
                    stroke="#1E293B"
                    strokeWidth="1.5">
                Urban
              </text>

              <g>
                <text x="112" y="37"
                      fontFamily="'Montserrat', 'Helvetica Neue', Arial, sans-serif"
                      fontSize="32"
                      fontWeight="700"
                      fill="url(#mainGrad)"
                      letterSpacing="1.5">
                  Dec.
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="translate"
                    values="0 0; 0 -3; 0 0"
                    dur="2s"
                    repeatCount="indefinite"
                    additive="sum"/>
                </text>

                <rect x="112" y="43" width="72" height="3.5" fill="url(#mainGrad)" rx="1.75">
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="translate"
                    values="0 0; 0 -3; 0 0"
                    dur="2s"
                    repeatCount="indefinite"
                    additive="sum"/>
                </rect>
              </g>
            </svg>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              {showSearch ? (
                <div className="relative">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      placeholder="Search products..."
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
                      autoFocus
                      onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    />
                    <button
                      type="submit"
                      className="ml-2 text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </form>
                  {showSuggestions && (
                    <SearchSuggestions
                      query={searchQuery}
                      onClose={() => setShowSuggestions(false)}
                      onSelect={handleSuggestionSelect}
                    />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* User Account */}
            {user ? (
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    {user?.roles?.includes('ADMIN') && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Account
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <svg className="w-6 h-6 text-gray-700 hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            {/* Mobile Search */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="relative">
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Search products..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                  >
                    Search
                  </button>
                </form>
                {showSuggestions && (
                  <SearchSuggestions
                    query={searchQuery}
                    onClose={() => setShowSuggestions(false)}
                    onSelect={() => {
                      handleSuggestionSelect();
                      setIsMobileMenuOpen(false);
                    }}
                  />
                )}
              </div>
            </div>

            <div className="py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}