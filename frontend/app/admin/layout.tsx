'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ENV_CONFIG } from '@/lib/env-config';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [pendingCustomRequests, setPendingCustomRequests] = useState(0);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Fetch pending custom requests count
  const fetchPendingCount = async () => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/custom-products/pending-count`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPendingCustomRequests(data.count);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    // Check if user is admin after a delay to allow store hydration
    const checkAuth = async () => {
      // Wait for zustand persist to hydrate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the latest state
      const state = useAuthStore.getState();

      // Check if user has admin role from backend
      if (!state.isAuthenticated || !state.user?.roles?.includes('ADMIN')) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
      setAuthChecked(true);
    };

    if (!authChecked) {
      checkAuth();
    }
  }, [router, authChecked]);

  // Fetch pending count on mount and every 10 seconds
  useEffect(() => {
    if (!isLoading) {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Also refresh when pathname changes (when navigating between pages)
  useEffect(() => {
    if (!isLoading) {
      fetchPendingCount();
    }
  }, [pathname, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Products', href: '/admin/products', icon: '📦' },
    { name: 'Custom Products', href: '/admin/custom-products', icon: '🎨' },
    { name: 'Orders', href: '/admin/orders', icon: '🛒' },
    { name: 'Returns', href: '/admin/returns', icon: '↩️' },
{ name: 'Video Manager', href: '/admin/video-manager', icon: '🎥' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { name: 'Customers', href: '/admin/customers', icon: '👥' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 min-h-screen transition-all duration-300 flex flex-col`}>
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              {sidebarOpen ? (
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">UD</span>
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                    <p className="text-xs text-slate-400">Urbandec Dashboard</p>
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-lg">UD</span>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-slate-700 p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
                </svg>
              </button>
            </div>

            <nav className="mt-8">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg mb-1 transition-colors ${
                      isActive ? 'bg-amber-500/20 text-amber-400 border-l-4 border-amber-500' : ''
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className={`ml-3 ${!sidebarOpen && 'hidden'} flex-1`}>{item.name}</span>
                    {item.name === 'Custom Products' && pendingCustomRequests > 0 && (
                      <span className={`${!sidebarOpen && 'hidden'} bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full`}>
                        {pendingCustomRequests}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Info - Fixed at bottom */}
            {sidebarOpen && (
              <div className="mt-auto pt-4 border-t border-slate-700">
                <div className="text-slate-300 text-sm mb-3">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-slate-500">{user?.email}</p>
                </div>
                <Link
                  href="/"
                  className="block text-center bg-slate-700 text-slate-300 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Back to Store
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b border-stone-200">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                  {pathname === '/admin' ? 'Dashboard' : ''}
                  {pathname === '/admin/products' ? 'Product Management' : ''}
                  {pathname === '/admin/custom-products' ? 'Custom Product Requests' : ''}
                  {pathname === '/admin/orders' ? 'Order Management' : ''}
{pathname === '/admin/video-manager' ? 'CTA Video Manager' : ''}
                  {pathname === '/admin/analytics' ? 'Analytics' : ''}
                  {pathname === '/admin/customers' ? 'Customer Management' : ''}
                  {pathname === '/admin/settings' ? 'Settings' : ''}
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-500">
                    Welcome, {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-amber-500 text-white px-4 py-2 rounded-full hover:bg-amber-600 transition-colors font-medium shadow-lg shadow-amber-500/25"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
