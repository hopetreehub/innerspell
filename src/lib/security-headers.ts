/**
 * Security Headers Configuration
 * Comprehensive security headers for production deployment
 */

export interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Content Security Policy directives
 */
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js inline scripts
    "'unsafe-eval'", // Required for some Next.js features in development
    'https://apis.google.com',
    'https://www.gstatic.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Chakra UI and inline styles
    'https://fonts.googleapis.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://placehold.co',
    'https://res.cloudinary.com',
    'https://blog.innerspell.com',
    'https://i.pravatar.cc',
    'https://lh3.googleusercontent.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'connect-src': [
    "'self'",
    'https://*.firebaseio.com',
    'https://*.googleapis.com',
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://firestore.googleapis.com',
    'wss://*.firebaseio.com',
    'https://www.google-analytics.com'
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'frame-src': [
    "'self'",
    'https://*.firebaseapp.com',
    'https://accounts.google.com'
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'manifest-src': ["'self'"],
  'worker-src': ["'self'", 'blob:']
};

/**
 * Generate Content Security Policy string
 */
export function generateCSP(isDevelopment: boolean = false): string {
  const directives = { ...cspDirectives };
  
  // Relax CSP for development
  if (isDevelopment) {
    directives['script-src'].push("'unsafe-eval'");
    directives['connect-src'].push('http://localhost:*');
    directives['connect-src'].push('ws://localhost:*');
  }
  
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Get all security headers
 */
export function getSecurityHeaders(isDevelopment: boolean = false): SecurityHeaders {
  const headers: SecurityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': generateCSP(isDevelopment),
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // XSS Protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()'
    ].join(', '),
    
    // DNS Prefetch Control
    'X-DNS-Prefetch-Control': 'on',
    
    // Download Options (IE specific)
    'X-Download-Options': 'noopen',
    
    // Permitted Cross-Domain Policies
    'X-Permitted-Cross-Domain-Policies': 'none'
  };
  
  // Add HSTS for production
  if (!isDevelopment) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }
  
  return headers;
}

/**
 * Get CORS headers for API endpoints
 */
export function getCORSHeaders(allowedOrigins: string[] = []): SecurityHeaders {
  const defaultOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'https://innerspell.com',
    'https://innerspell.com',
    'https://www.innerspell.com'
  ];
  
  const origins = [...new Set([...defaultOrigins, ...allowedOrigins])];
  
  return {
    'Access-Control-Allow-Origin': origins.join(', '),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400' // 24 hours
  };
}

/**
 * Apply security headers to Next.js config
 */
export function applySecurityHeaders(nextConfig: any): any {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const securityHeaders = getSecurityHeaders(isDevelopment);
  
  const headers = Object.entries(securityHeaders).map(([key, value]) => ({
    key,
    value
  }));
  
  return {
    ...nextConfig,
    async headers() {
      const existingHeaders = nextConfig.headers ? await nextConfig.headers() : [];
      
      return [
        ...existingHeaders,
        {
          source: '/(.*)',
          headers
        },
        {
          // Stricter headers for admin routes
          source: '/admin/:path*',
          headers: [
            ...headers,
            {
              key: 'X-Robots-Tag',
              value: 'noindex, nofollow, noarchive'
            }
          ]
        },
        {
          // API routes with CORS
          source: '/api/:path*',
          headers: [
            ...headers,
            ...Object.entries(getCORSHeaders()).map(([key, value]) => ({
              key,
              value
            }))
          ]
        }
      ];
    }
  };
}