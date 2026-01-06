/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Experimental features for optimization
  experimental: {
    // Enable CSS optimization
    optimizeCss: true,
    // Enable optimized package imports
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'react-icons'],
  },

  // Compiler options for production optimization
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Strict mode for better development experience
  // Temporarily disabled to debug render loop
  reactStrictMode: false,

  // Disable X-Powered-By header for security
  poweredByHeader: false,

  // Enable gzip compression
  compress: true,

  // Production source maps (disabled for smaller bundle)
  productionBrowserSourceMaps: false,

  // Optimize module resolution
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
};

export default nextConfig;
