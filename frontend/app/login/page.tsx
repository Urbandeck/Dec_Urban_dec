'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ENV_CONFIG } from '@/lib/env-config';
import { jwtDecode } from 'jwt-decode';

interface GoogleUserInfo {
  email: string;
  name: string;
  sub: string;
  picture?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, router]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        toast.error('Google sign in failed');
        return;
      }

      // Decode the JWT to get user info
      const decoded: GoogleUserInfo = jwtDecode(credentialResponse.credential);
      const { email, name, sub: googleId, picture } = decoded;

      // Send to backend for authentication
      const response = await axios.post(
        `${ENV_CONFIG.API_URL}/api/auth/google`,
        { email, name, googleId, picture },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.message || 'Sign in failed. Please try again.');
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Premium Quality Frames',
      description: 'Handcrafted digital frames for your precious memories'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping across India'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Secure Payments',
      description: 'Safe transactions powered by Razorpay'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: '24/7 Support',
      description: 'Dedicated customer service for all your queries'
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500 rounded-full -translate-x-1/2 -translate-y-1/2 filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full translate-x-1/3 translate-y-1/3 filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-500 rounded-full -translate-x-1/2 -translate-y-1/2 filter blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center mb-12">
            <svg viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg" className="h-16 w-auto">
              <text x="10" y="40"
                    fontFamily="'Poppins', 'Segoe UI', Arial, sans-serif"
                    fontSize="32"
                    fontWeight="900"
                    fill="#FFFFFF"
                    letterSpacing="1.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5">
                Urban
              </text>
              <g>
                <text x="112" y="37"
                      fontFamily="'Montserrat', 'Helvetica Neue', Arial, sans-serif"
                      fontSize="32"
                      fontWeight="700"
                      fill="#FCD34D"
                      letterSpacing="1.5">
                  Dec.
                </text>
                <rect x="112" y="43" width="72" height="3.5" fill="#FCD34D" rx="1.75" />
              </g>
            </svg>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Transform Your Memories<br />
            <span className="text-amber-400">Into Timeless Art</span>
          </h1>
          <p className="text-slate-300 text-lg mb-12 max-w-md">
            Discover our premium collection of digital photo frames designed to showcase your most cherished moments.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 group">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-amber-400 group-hover:bg-white/20 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                  <p className="text-slate-400 text-xs mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 flex items-center space-x-8 pt-8 border-t border-white/20">
          <div>
            <div className="text-3xl font-bold text-white">1000+</div>
            <div className="text-slate-400 text-sm">Happy Customers</div>
          </div>
          <div className="w-px h-12 bg-white/20"></div>
          <div>
            <div className="text-3xl font-bold text-white">4.9</div>
            <div className="text-slate-400 text-sm flex items-center">
              <span>Rating</span>
              <div className="flex ml-2">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          <div className="w-px h-12 bg-white/20"></div>
          <div>
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-slate-400 text-sm">Secure Checkout</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <svg viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg" className="h-14 w-auto">
              <defs>
                <linearGradient id="mobileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#f59e0b',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#d97706',stopOpacity:1}} />
                </linearGradient>
              </defs>
              <text x="10" y="40"
                    fontFamily="'Poppins', 'Segoe UI', Arial, sans-serif"
                    fontSize="32"
                    fontWeight="900"
                    fill="#1F2937"
                    letterSpacing="1.5">
                Urban
              </text>
              <g>
                <text x="112" y="37"
                      fontFamily="'Montserrat', 'Helvetica Neue', Arial, sans-serif"
                      fontSize="32"
                      fontWeight="700"
                      fill="url(#mobileGrad)"
                      letterSpacing="1.5">
                  Dec.
                </text>
                <rect x="112" y="43" width="72" height="3.5" fill="url(#mobileGrad)" rx="1.75" />
              </g>
            </svg>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
            <p className="text-gray-600">Sign in to continue shopping</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Google Sign In */}
            <div className="flex flex-col items-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <p className="text-gray-500 text-sm mb-6 text-center">
                Quick and secure sign in with your Google account
              </p>

              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Sign in failed')}
                useOneTap
                theme="outline"
                size="large"
                width="300"
                text="continue_with"
                shape="pill"
              />

              <p className="text-xs text-gray-400 mt-6 text-center">
                New users will be automatically registered
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-400">Why sign in?</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                'Track your orders in real-time',
                'Save addresses for faster checkout',
                'Get exclusive offers & discounts',
                'Easy returns & order history'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-amber-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-amber-600 hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Continue as Guest */}
          <div className="text-center mt-6">
            <Link
              href="/products"
              className="inline-flex items-center text-gray-600 hover:text-amber-600 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue browsing as guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
