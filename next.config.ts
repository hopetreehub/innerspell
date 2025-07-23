
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
