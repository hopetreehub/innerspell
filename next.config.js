/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack 설정
  webpack: (config, { isServer, dev }) => {
    // 🚨 긴급 수정: Chunk loading 문제 해결
    if (!isServer && dev) {
      // Development에서 chunk splitting 비활성화
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 0,
          maxSize: 0,
          cacheGroups: {
            vendor: false,
            default: false,
          },
        },
      };
    }
    
    // 클라이언트 사이드에서 Node.js 모듈 사용 시 fallback 제공
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        // 🚨 Genkit/OpenTelemetry 모듈 해결
        '@opentelemetry/exporter-jaeger': false,
        'handlebars': false,
      };
    }
    return config;
  },
  // 보안 헤더 설정
  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com; frame-src 'none'; object-src 'none'; base-uri 'self';"
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  },

  // 이미지 최적화 설정
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['firebasestorage.googleapis.com'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 번들 분석 (npm run analyze로 실행 시)
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundleAnalyzer: {
        enabled: true,
      },
    },
  }),

  // 프로덕션 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 실험적 기능
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // 스태틱 내보내기 설정 (필요시 주석 해제)
  // output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,

  // 환경 변수 검증
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      // 필요한 리다이렉트가 있으면 여기에 추가
    ];
  },

  // 리라이트 설정
  async rewrites() {
    return [
      // 필요한 리라이트가 있으면 여기에 추가
    ];
  },
};

module.exports = nextConfig;