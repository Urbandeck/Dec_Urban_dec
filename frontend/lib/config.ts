import { ENV_CONFIG } from './env-config';

// Application Configuration
export const config = {
  // API Configuration
  apiUrl: ENV_CONFIG.API_URL,

  // Admin Configuration
  adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@digitalframes.shop',

  // Razorpay Configuration
  razorpayKeyId: ENV_CONFIG.RAZORPAY_KEY_ID,

  // Application Info
  appName: 'Digital Frames Shop',
  companyName: 'UrbanDeck',
  supportEmail: 'support@digitalframes.shop',

  // Feature Flags
  features: {
    enableTestMode: process.env.NODE_ENV === 'development',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  }
};

export default config;