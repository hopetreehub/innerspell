
import type {NextConfig} from 'next';

// Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // EMERGENCY CACHE BUSTING CONFIGURATION
  async headers() {
    return [
      {
        // Apply aggressive no-cache headers to admin and auth routes
        source: '/(admin|api/auth|api/dev-auth|sign-in|sign-up)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'X-Cache-Control',
            value: 'no-cache',
          },
          {
            key: 'Vary',
            value: 'Cookie, Authorization, X-Requested-With, Accept, Accept-Encoding, Accept-Language',
          },
        ],
      },
      {
        // Force cache invalidation for all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  // Generate unique build ID for cache busting
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blog.innerspell.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on the client
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}), // Ensure fallback object exists
        child_process: false,
        fs: false,
        os: false,
        net: false,
        tls: false,
      };
    }
    
    // Ignore handlebars require.extensions warnings
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    
    // Handle missing @genkit-ai/firebase module
    config.resolve.alias = {
      ...config.resolve.alias,
      '@genkit-ai/firebase': false,
    };
    
    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/handlebars/ },
      { message: /Can't resolve '@genkit-ai\/firebase'/ },
    ];
    
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
