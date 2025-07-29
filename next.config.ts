
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
  // 실험적 기능들로 성능 최적화
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', 'framer-motion', 'react-icons'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // 압축 설정
  compress: true,
  // 파워 데이터 압축
  poweredByHeader: false,
  // 리액트 스트릭트 모드
  reactStrictMode: true,
  // SWC 미니파이어는 Next.js 15에서 기본값이므로 제거
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
    // 이미지 최적화 설정 - WebP 우선 적용
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일 캐시
    // 이미지 품질 최적화
    quality: 85,
    // 로더 최적화
    loader: 'default',
    // 이미지 압축 최적화
    unoptimized: false,
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
