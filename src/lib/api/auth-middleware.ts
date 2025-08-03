import { NextRequest } from 'next/server';
import { getAuth } from '@/lib/firebase/admin-lazy';
import { SecureContext } from './secure-wrapper';

// Token cache to reduce Firebase API calls
interface CachedToken {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  customClaims?: Record<string, any>;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedToken>();

// Clean expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokenCache.entries()) {
    if (value.expiresAt < now) {
      tokenCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Authentication levels for different security requirements
 */
export enum AuthLevel {
  NONE = 'none',           // No authentication required
  OPTIONAL = 'optional',   // Authentication optional, but parsed if present
  REQUIRED = 'required',   // Authentication required
  VERIFIED = 'verified',   // Email verification required
  ADMIN = 'admin',        // Admin role required
}

/**
 * Role-based permissions
 */
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

/**
 * Authentication result
 */
export interface AuthResult {
  authenticated: boolean;
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    roles?: string[];
    customClaims?: Record<string, any>;
  };
  error?: string;
}

/**
 * Main authentication middleware
 */
export async function authenticate(
  req: NextRequest,
  level: AuthLevel = AuthLevel.REQUIRED,
  requiredRoles?: UserRole[]
): Promise<AuthResult> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    // If no auth header and auth is optional or none, return unauthenticated
    if (!authHeader && (level === AuthLevel.NONE || level === AuthLevel.OPTIONAL)) {
      return { authenticated: false };
    }
    
    // If no auth header and auth is required, return error
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        error: 'Authorization header missing or invalid format',
      };
    }

    const token = authHeader.substring(7);
    
    // Check token cache first
    const cached = tokenCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      return validateAuthResult(cached, level, requiredRoles);
    }

    // Verify token with Firebase
    const auth = await getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user's custom claims (including roles)
    const user = await auth.getUser(decodedToken.uid);
    const customClaims = user.customClaims || {};
    
    // Cache the token (Firebase tokens expire after 1 hour)
    const tokenData: CachedToken = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      customClaims: {
        ...customClaims,
        roles: customClaims.roles || [UserRole.USER],
      },
      expiresAt: Date.now() + 55 * 60 * 1000, // Cache for 55 minutes
    };
    
    tokenCache.set(token, tokenData);
    
    return validateAuthResult(tokenData, level, requiredRoles);
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Firebase ID token has expired')) {
        return {
          authenticated: false,
          error: 'Token expired',
        };
      }
      
      if (error.message.includes('Decoding Firebase ID token failed')) {
        return {
          authenticated: false,
          error: 'Invalid token',
        };
      }
    }
    
    return {
      authenticated: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Validate authentication result against requirements
 */
function validateAuthResult(
  tokenData: CachedToken,
  level: AuthLevel,
  requiredRoles?: UserRole[]
): AuthResult {
  const user = {
    uid: tokenData.uid,
    email: tokenData.email,
    emailVerified: tokenData.emailVerified,
    roles: tokenData.customClaims?.roles || [UserRole.USER],
    customClaims: tokenData.customClaims,
  };

  // Check email verification if required
  if (level === AuthLevel.VERIFIED && !user.emailVerified) {
    return {
      authenticated: false,
      user,
      error: 'Email verification required',
    };
  }

  // Check admin role if required
  if (level === AuthLevel.ADMIN && !user.roles.includes(UserRole.ADMIN)) {
    return {
      authenticated: false,
      user,
      error: 'Admin access required',
    };
  }

  // Check specific roles if provided
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));
    if (!hasRequiredRole) {
      return {
        authenticated: false,
        user,
        error: `Required role(s): ${requiredRoles.join(', ')}`,
      };
    }
  }

  return {
    authenticated: true,
    user,
  };
}

/**
 * Helper to create authentication context from request
 */
export async function createAuthContext(
  req: NextRequest,
  level: AuthLevel = AuthLevel.REQUIRED
): Promise<SecureContext> {
  const authResult = await authenticate(req, level);
  
  const context: SecureContext = {
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clientIp: req.headers.get('x-forwarded-for')?.split(',')[0] || 
              req.headers.get('x-real-ip') || 
              undefined,
  };

  if (authResult.authenticated && authResult.user) {
    context.user = {
      uid: authResult.user.uid,
      email: authResult.user.email,
      emailVerified: authResult.user.emailVerified,
      customClaims: authResult.user.customClaims,
    };
  }

  return context;
}

/**
 * Set custom claims for a user (admin only)
 */
export async function setUserClaims(
  adminUid: string,
  targetUid: string,
  claims: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify admin has permission
    const auth = await getAuth();
    const adminUser = await auth.getUser(adminUid);
    const adminRoles = adminUser.customClaims?.roles || [];
    
    if (!adminRoles.includes(UserRole.ADMIN) && !adminRoles.includes(UserRole.SUPER_ADMIN)) {
      return {
        success: false,
        error: 'Insufficient permissions to set user claims',
      };
    }

    // Set claims for target user
    await auth.setCustomUserClaims(targetUid, claims);
    
    // Invalidate cache for this user
    for (const [token, cached] of tokenCache.entries()) {
      if (cached.uid === targetUid) {
        tokenCache.delete(token);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting user claims:', error);
    return {
      success: false,
      error: 'Failed to set user claims',
    };
  }
}

/**
 * Revoke all tokens for a user
 */
export async function revokeUserTokens(uid: string): Promise<void> {
  try {
    const auth = await getAuth();
    await auth.revokeRefreshTokens(uid);
    
    // Clear from cache
    for (const [token, cached] of tokenCache.entries()) {
      if (cached.uid === uid) {
        tokenCache.delete(token);
      }
    }
  } catch (error) {
    console.error('Error revoking user tokens:', error);
    throw error;
  }
}

/**
 * Middleware to require authentication for API routes
 */
export function requireAuth(level: AuthLevel = AuthLevel.REQUIRED) {
  return async (req: NextRequest) => {
    const authResult = await authenticate(req, level);
    
    if (!authResult.authenticated) {
      return new Response(
        JSON.stringify({
          error: authResult.error || 'Authentication required',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer',
          },
        }
      );
    }

    return null; // Continue to next middleware
  };
}