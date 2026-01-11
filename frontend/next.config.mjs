/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'urbandec.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.urbandec.in',
        pathname: '/**',
      },
    ],
    // Allow using local images without optimization in development
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
