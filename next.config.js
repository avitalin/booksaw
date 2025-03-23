/** @type {import('next').NextConfig} */
module.exports = {
  // Image optimization config
  images: {
    domains: ['your-domain.com'], // Add your image domains
    loader: 'default',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Netlify specific configuration
  output: 'standalone',
} 