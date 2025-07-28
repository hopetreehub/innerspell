import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cache control for auth paths
  const { pathname } = request.nextUrl;
  const isAuthPath = pathname.startsWith('/admin') || 
                     pathname.startsWith('/api/auth') || 
                     pathname.startsWith('/api/dev-auth') || 
                     pathname.startsWith('/sign-in') || 
                     pathname.startsWith('/sign-up');
  
  if (isAuthPath) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  // Basic CSP for production
  if (process.env.NODE_ENV === 'production') {
    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.firebaseapp.com https://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com https://api.openai.com https://*.googleapis.com",
      "frame-src 'self' https://innerspell-an7ce.firebaseapp.com https://*.firebaseapp.com"
    ].join("; ");
    
    response.headers.set('Content-Security-Policy', cspPolicy);
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/health).*)',
  ],
};