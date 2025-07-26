import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action = 'invalidate' } = await request.json();
    
    // Generate cache-busting timestamp
    const timestamp = Date.now();
    const cacheBustId = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create response with aggressive cache-busting headers
    const response = NextResponse.json({
      success: true,
      timestamp,
      cacheBustId,
      action,
      message: 'Cache invalidation triggered'
    });
    
    // EMERGENCY CACHE INVALIDATION HEADERS
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"${cacheBustId}"`);
    response.headers.set('X-Cache-Bust', cacheBustId);
    response.headers.set('X-Timestamp', timestamp.toString());
    
    // Vary header to prevent caching across different request types
    response.headers.set('Vary', 'Cookie, Authorization, X-Requested-With, Accept, Accept-Encoding, Accept-Language, User-Agent');
    
    return response;
  } catch (error) {
    console.error('Cache bust error:', error);
    
    const errorResponse = NextResponse.json(
      { error: 'Cache invalidation failed' },
      { status: 500 }
    );
    
    // Even error responses should not be cached
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
  }
}

export async function GET(request: NextRequest) {
  // Return current cache-busting information
  const timestamp = Date.now();
  const cacheBustId = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  
  const response = NextResponse.json({
    timestamp,
    cacheBustId,
    message: 'Cache status check',
    headers: {
      'user-agent': request.headers.get('user-agent'),
      'cache-control': request.headers.get('cache-control'),
      'pragma': request.headers.get('pragma'),
    }
  });
  
  // No caching for status checks
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', cacheBustId);
  
  return response;
}