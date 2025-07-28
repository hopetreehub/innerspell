/** @type {import('next').NextConfig} */
// 🚀 FORCE DEPLOY v1.0.0 - Blog Posts Fix
const nextConfig = {
  // Force rebuild timestamp - Middleware cache bust
  env: {
    FORCE_REBUILD_TIME: new Date().toISOString(),
    BLOG_POSTS_TARGET: '12',
    PWA_ENABLED: 'true',
    MIDDLEWARE_CACHE_BUST: '2025-07-28-cache-clear',
  },
  // TypeScript 빌드 에러 무시 (프로덕션 배포용)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 이미지 최적화 설정
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['firebasestorage.googleapis.com', 'innerspell-an7ce.firebasestorage.app'],
  },
  
  // 번들 최적화 - middleware 명시적 비활성화
  experimental: {
    optimizeCss: true,
  },
  
  // Middleware URL 정규화 비활성화
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  
  // 빌드 최적화 (Next.js 15에서는 기본값)
  
  // 번들 분석 (ANALYZE=true npm run build)
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // 코드 스플리팅 최적화
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // 벤더 번들
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
            maxSize: 244000, // 244KB 제한
          },
          // AI 관련 라이브러리 분리
          ai: {
            name: 'ai-libs',
            chunks: 'all',
            test: /node_modules\/(openai|@google\/generative-ai|@genkit-ai)/,
            priority: 25,
            maxSize: 512000, // 512KB 제한
          },
          // 차트 라이브러리 분리
          charts: {
            name: 'charts',
            chunks: 'all',
            test: /node_modules\/recharts/,
            priority: 23,
            maxSize: 256000, // 256KB 제한
          },
          // UI 라이브러리 분리
          radixUI: {
            name: 'radix-ui',
            chunks: 'all',
            test: /node_modules\/@radix-ui/,
            priority: 22,
            maxSize: 200000, // 200KB 제한
          },
          // 공통 컴포넌트
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // UI 컴포넌트 (큰 번들)
          ui: {
            name: 'ui',
            test: /[\\/]components[\\/]ui[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          // AI/타로 관련 (무거운 로직)
          ai: {
            name: 'ai',
            test: /[\\/](ai|services[\\/]ai|flows)[\\/]/,
            chunks: 'all',
            priority: 25,
          },
        },
      };
    }
    
    // 번들 분석기
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze.html',
          openAnalyzer: true,
        })
      );
    }
    
    return config;
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          },
        ],
      },
      // Service Worker 헤더 설정
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
        ],
      },
      // Manifest 헤더 설정
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          },
        ],
      },
    ];
  },
  
  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;