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
        // Set user in store
        setUser(response.data.user);
        toast.success('Signed in successfully!');

        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectUrl);
        } else {
          router.push('/');
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.message || 'Sign in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="max-w-md w-full animate-slide-up">
        <div className="bg-white rounded-lg shadow-lg p-8 hover-lift">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 animate-fade-in">Welcome Back</h1>
            <p className="text-gray-600 mt-2 animate-fade-in stagger-2">Sign in to your account to continue</p>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Sign in failed')}
              useOneTap
              theme="outline"
              size="large"
              width="350"
              text="continue_with"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
