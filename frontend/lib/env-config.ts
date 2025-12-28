/**
 * Centralized environment configuration
 * All environment variables and API endpoints should be defined here
 */

export const ENV_CONFIG = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',

  // Razorpay Configuration (Use environment variables in production)
  RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',

  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Urbandec',
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Premium Digital Frames Shop',

  // Feature Flags
  ENABLE_CUSTOM_PRODUCTS: process.env.NEXT_PUBLIC_ENABLE_CUSTOM_PRODUCTS === 'true',
  ENABLE_VIDEO_FRAMES: process.env.NEXT_PUBLIC_ENABLE_VIDEO_FRAMES === 'true',

  // Development Mode
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${ENV_CONFIG.API_URL}/api/auth/login`,
    REGISTER: `${ENV_CONFIG.API_URL}/api/auth/register`,
    LOGOUT: `${ENV_CONFIG.API_URL}/api/auth/logout`,
    ME: `${ENV_CONFIG.API_URL}/api/auth/me`,
    FORGOT_PASSWORD: `${ENV_CONFIG.API_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${ENV_CONFIG.API_URL}/api/auth/reset-password`,
  },

  // Products
  PRODUCTS: {
    LIST: `${ENV_CONFIG.API_URL}/api/products`,
    GET: (slug: string) => `${ENV_CONFIG.API_URL}/api/products/${slug}`,
    CREATE: `${ENV_CONFIG.API_URL}/api/products`,
    UPDATE: (id: number) => `${ENV_CONFIG.API_URL}/api/products/${id}`,
    DELETE: (id: number) => `${ENV_CONFIG.API_URL}/api/products/${id}`,
    SEARCH: `${ENV_CONFIG.API_URL}/api/products/search`,
  },

  // Orders
  ORDERS: {
    LIST: `${ENV_CONFIG.API_URL}/api/orders`,
    CREATE: `${ENV_CONFIG.API_URL}/api/orders`,
    GET: (id: string) => `${ENV_CONFIG.API_URL}/api/orders/${id}`,
    UPDATE_STATUS: (id: string) => `${ENV_CONFIG.API_URL}/api/orders/${id}/status`,
    MY_ORDERS: `${ENV_CONFIG.API_URL}/api/orders/my-orders`,
  },

  // Custom Products
  CUSTOM_PRODUCTS: {
    LIST: `${ENV_CONFIG.API_URL}/api/custom-products`,
    UPLOAD: `${ENV_CONFIG.API_URL}/api/custom-products/upload`,
    GET: (id: string) => `${ENV_CONFIG.API_URL}/api/custom-products/${id}`,
    DELETE: (id: string) => `${ENV_CONFIG.API_URL}/api/custom-products/${id}`,
  },

  // Video Frames
  VIDEO_FRAMES: {
    LIST: `${ENV_CONFIG.API_URL}/api/video-frames`,
    UPLOAD: `${ENV_CONFIG.API_URL}/api/video-frames/upload`,
    GET: (id: string) => `${ENV_CONFIG.API_URL}/api/video-frames/${id}`,
    DELETE: (id: string) => `${ENV_CONFIG.API_URL}/api/video-frames/${id}`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: `${ENV_CONFIG.API_URL}/api/analytics/dashboard`,
    SALES: `${ENV_CONFIG.API_URL}/api/analytics/sales`,
    CUSTOMERS: `${ENV_CONFIG.API_URL}/api/analytics/customers`,
    PRODUCTS: `${ENV_CONFIG.API_URL}/api/analytics/products`,
  },

  // Health
  HEALTH: `${ENV_CONFIG.API_URL}/api/health`,
} as const;

// Validation to ensure required environment variables are set in production
if (ENV_CONFIG.IS_PRODUCTION) {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingEnvVars.length > 0) {
    console.error(
      `Missing required environment variables in production: ${missingEnvVars.join(', ')}`
    );
  }
}

export default ENV_CONFIG;