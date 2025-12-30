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
  },

  // Experimental features for stability
  experimental: {
    // Enable CSS optimization
    optimizeCss: true,
  },

  // Compiler options for production optimization
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Strict mode for better development experience
  reactStrictMode: true,

  // Disable X-Powered-By header for security
  poweredByHeader: false,

  // Enable gzip compression
  compress: true,
};

export default nextConfig;
