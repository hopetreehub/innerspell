import { NextRequest, NextResponse } from 'next/server';
import { createCommunityPost, createReadingSharePost } from '@/actions/communityActions';
import { secureEndpoint, SecurityConfig } from '@/lib/api/secure-wrapper';
import { AuthLevel } from '@/lib/api/auth-middleware';
import { apiSchemas } from '@/lib/api/input-validation';
import { rateLimitTiers } from '@/lib/api/rate-limit-enhanced';
import type { SecureContext } from '@/lib/api/secure-wrapper';

/**
 * Example of secure community post endpoint with all security layers
 */

// Security configuration for this endpoint
const securityConfig: SecurityConfig = {
  // Authentication required
  requireAuth: true,
  
  // Also accept API key as alternative auth
  requireApiKey: false,
  apiKeyHeader: 'x-api-key',
  
  // Rate limiting - use write tier
  rateLimit: 'write',
  
  // Input validation schema
  validateInput: apiSchemas.createCommunityPost,
  
  // CORS settings
  corsOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000',
    'https://innerspell.vercel.app',
  ],
  
  // Enable CSRF protection
  enableCSRF: true,
  
  // Max request size: 1MB
  maxRequestSize: 1024 * 1024,
  
  // Custom validation
  customValidation: async (req: NextRequest) => {
    // Example: Check if user is banned
    const bannedIPs = process.env.BANNED_IPS?.split(',') || [];
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0];
    
    if (clientIP && bannedIPs.includes(clientIP)) {
      return { valid: false, error: 'Access denied' };
    }
    
    return { valid: true };
  },
};

/**
 * POST /api/community/posts - Create a new community post
 * 
 * Security features:
 * - Firebase authentication required
 * - Rate limited to 10 posts per minute
 * - Input validation and sanitization
 * - CSRF protection
 * - Request size limited to 1MB
 * - Comprehensive audit logging
 */
export const POST = secureEndpoint(
  async (req: NextRequest, context: SecureContext) => {
    try {
      // The request body is already validated and sanitized by secure wrapper
      const postData = await req.json();
      
      // Create author object from authenticated user
      const author = {
        uid: context.user!.uid,
        displayName: postData.authorName || context.user!.email?.split('@')[0] || 'Anonymous',
        photoURL: postData.authorPhotoURL || '',
        email: context.user!.email,
      };
      
      // Log the action for audit trail
      console.log(`[AUDIT] User ${context.user!.uid} creating post in category: ${postData.category}`, {
        requestId: context.requestId,
        clientIp: context.clientIp,
        timestamp: new Date().toISOString(),
      });
      
      let result;
      
      // Process based on category
      switch(postData.category) {
        case 'reading-share':
          result = await createReadingSharePost(postData, author);
          break;
        
        case 'free-discussion':
        case 'q-and-a':
        case 'deck-review':
        case 'study-group':
          result = await createCommunityPost(postData, author, postData.category);
          break;
        
        default:
          // This should not happen due to Zod validation
          return NextResponse.json(
            { 
              success: false, 
              error: 'Invalid category',
              requestId: context.requestId,
            },
            { status: 400 }
          );
      }
      
      if (result.success && result.postId) {
        // Log successful creation
        console.log(`[AUDIT] Post created successfully`, {
          postId: result.postId,
          userId: context.user!.uid,
          category: postData.category,
          requestId: context.requestId,
        });
        
        return NextResponse.json(
          { 
            success: true, 
            postId: result.postId,
            message: `Community post created successfully in '${postData.category}'.`,
            requestId: context.requestId,
          },
          { status: 201 }
        );
      } else {
        // Log failure
        console.error(`[AUDIT] Post creation failed`, {
          userId: context.user!.uid,
          error: result.error,
          requestId: context.requestId,
        });
        
        return NextResponse.json(
          { 
            success: false, 
            error: result.error || 'Failed to create post',
            requestId: context.requestId,
          },
          { status: 500 }
        );
      }
    } catch (error) {
      // This should rarely happen as most errors are caught by secure wrapper
      console.error(`[ERROR] Unexpected error in post creation`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: context.requestId,
        userId: context.user?.uid,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'An unexpected error occurred',
          requestId: context.requestId,
        },
        { status: 500 }
      );
    }
  },
  securityConfig
);

/**
 * Example of API key authenticated endpoint
 */
const apiKeyConfig: SecurityConfig = {
  requireAuth: false,
  requireApiKey: true,
  rateLimit: 'public',
  validateInput: apiSchemas.createCommunityPost,
  maxRequestSize: 1024 * 1024,
};

export const POST_WITH_API_KEY = secureEndpoint(
  async (req: NextRequest, context: SecureContext) => {
    // Similar implementation but using API key instead of user auth
    const postData = await req.json();
    
    const author = {
      uid: 'api-bot-user',
      displayName: postData.authorName || 'API Bot',
      photoURL: postData.authorPhotoURL || '',
    };
    
    // ... rest of implementation
    
    return NextResponse.json({ success: true });
  },
  apiKeyConfig
);

/**
 * Example of public endpoint with rate limiting only
 */
const publicConfig: SecurityConfig = {
  requireAuth: false,
  rateLimit: 'search',
  corsOrigins: ['*'], // Allow all origins for public search
};

export const GET = secureEndpoint(
  async (req: NextRequest, context: SecureContext) => {
    // Public search endpoint
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    
    // Log search query for analytics
    console.log(`[ANALYTICS] Search query`, {
      query,
      clientIp: context.clientIp,
      requestId: context.requestId,
    });
    
    // ... search implementation
    
    return NextResponse.json({ 
      results: [],
      query,
      requestId: context.requestId,
    });
  },
  publicConfig
);