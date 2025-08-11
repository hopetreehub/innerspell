import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats } from '@/ai/services/ai-cache-service';
import { getRateLimitStats } from '@/ai/services/ai-rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params for testing
    const userId = request.nextUrl.searchParams.get('userId') || 'guest';
    
    // Get cache statistics
    const cacheStats = getCacheStats();
    
    // Get rate limit statistics
    const rateLimitStats = getRateLimitStats(userId, false);
    
    return NextResponse.json({
      success: true,
      optimization: {
        cache: {
          enabled: true,
          ...cacheStats,
          description: 'LRU cache with 24-hour TTL'
        },
        rateLimiting: {
          enabled: true,
          ...rateLimitStats,
          description: 'Rate limiting per user and globally'
        },
        retry: {
          enabled: true,
          maxRetries: 3,
          backoffStrategy: 'exponential',
          retryableErrors: ['429', '503', '504', 'overloaded']
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error getting optimization stats:', error);
    return NextResponse.json(
      { error: 'Failed to get optimization stats' },
      { status: 500 }
    );
  }
}