# API Security Implementation Guide

## Overview

This guide demonstrates how to implement comprehensive API security for the InnerSpell application following Zero Trust principles and OWASP API Security Top 10 guidelines.

## 🏗️ Architecture

Our security implementation uses a layered defense approach:

```
┌─────────────────────────────────────────────────────────────┐
│                     Edge Security                           │
│  • Vercel Edge Functions  • Rate Limiting  • DDoS Protection │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                 Middleware Security                         │
│  • CORS  • Security Headers  • Request Validation          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                Secure Endpoint Wrapper                     │
│  • Authentication  • Authorization  • Input Validation     │
│  • CSRF Protection  • Audit Logging                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  Business Logic                            │
│  • Clean, validated data  • Authenticated context          │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Implementation

### 1. Basic Secure Endpoint

```typescript
import { secureEndpoint } from '@/lib/api/secure-wrapper';
import { apiSchemas } from '@/lib/api/input-validation';

export const POST = secureEndpoint(
  async (req, context) => {
    // Your business logic here
    const data = await req.json();
    
    // User is already authenticated and data is validated
    console.log('User:', context.user);
    console.log('Request ID:', context.requestId);
    
    return new Response(JSON.stringify({ success: true }));
  },
  {
    requireAuth: true,
    rateLimit: 'write',
    validateInput: apiSchemas.createCommunityPost,
  }
);
```

### 2. Public Endpoint with Rate Limiting

```typescript
export const GET = secureEndpoint(
  async (req, context) => {
    // Public search endpoint
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    return new Response(JSON.stringify({ 
      results: [], 
      query,
      requestId: context.requestId,
    }));
  },
  {
    requireAuth: false,
    rateLimit: 'search',
    corsOrigins: ['*'],
  }
);
```

### 3. Admin-Only Endpoint

```typescript
export const DELETE = secureEndpoint(
  async (req, context) => {
    // Admin-only deletion
    // User role is already verified by secure wrapper
    
    return new Response(JSON.stringify({ deleted: true }));
  },
  {
    requireAuth: true,
    allowedRoles: ['admin'],
    rateLimit: 'admin',
    enableCSRF: true,
  }
);
```

### 4. API Key Authenticated Service

```typescript
export const POST = secureEndpoint(
  async (req, context) => {
    // Service-to-service communication
    console.log('API Key used:', context.apiKey);
    
    return new Response(JSON.stringify({ processed: true }));
  },
  {
    requireAuth: false,
    requireApiKey: true,
    rateLimit: 'api',
  }
);
```

### 5. Maximum Security Endpoint

```typescript
export const POST = secureEndpoint(
  async (req, context) => {
    // Ultra-secure endpoint with all protections
    return new Response(JSON.stringify({ secure: true }));
  },
  {
    requireAuth: true,
    allowedRoles: ['admin'],
    rateLimit: 'auth',
    validateInput: apiSchemas.sensitiveOperation,
    enableCSRF: true,
    maxRequestSize: 100 * 1024, // 100KB
    corsOrigins: ['https://innerspell.com'],
    customValidation: async (req) => {
      // Additional security checks
      const userAgent = req.headers.get('user-agent');
      if (!userAgent || userAgent.includes('bot')) {
        return { valid: false, error: 'Invalid client' };
      }
      return { valid: true };
    },
  }
);
```

## 🔐 Authentication Patterns

### 1. Firebase Authentication

```typescript
import { authenticate, AuthLevel } from '@/lib/api/auth-middleware';

// In your handler
const authResult = await authenticate(req, AuthLevel.REQUIRED);
if (!authResult.authenticated) {
  return new Response('Unauthorized', { status: 401 });
}

console.log('User:', authResult.user);
```

### 2. Role-Based Access Control

```typescript
// Set user roles (admin only)
import { setUserClaims } from '@/lib/api/auth-middleware';

await setUserClaims(adminUid, targetUid, {
  roles: ['moderator'],
  permissions: ['posts:write', 'comments:moderate'],
});
```

### 3. Token Revocation

```typescript
import { revokeUserTokens } from '@/lib/api/auth-middleware';

// Revoke all tokens for a user (e.g., on password change)
await revokeUserTokens(userId);
```

## 🛡️ Input Validation

### 1. Using Predefined Schemas

```typescript
import { apiSchemas, validateRequest } from '@/lib/api/input-validation';

const data = await req.json();
const result = await validateRequest(data, apiSchemas.createBlogPost);

if (!result.success) {
  return new Response(JSON.stringify({ errors: result.errors }), {
    status: 400,
  });
}

// Use result.data - it's validated and sanitized
```

### 2. Custom Validation Schema

```typescript
import { z } from 'zod';
import { commonSchemas } from '@/lib/api/input-validation';

const customSchema = z.object({
  name: commonSchemas.safeString.min(2).max(50),
  email: commonSchemas.email,
  website: commonSchemas.url.optional(),
  age: z.number().int().min(13).max(120),
});

export const POST = secureEndpoint(
  async (req, context) => {
    // Data is already validated by secure wrapper
    const data = await req.json();
    return new Response(JSON.stringify({ created: true }));
  },
  {
    validateInput: customSchema,
  }
);
```

### 3. Manual Sanitization

```typescript
import { sanitizeHtml, sanitizeObject } from '@/lib/api/input-validation';

// Sanitize individual strings
const cleanTitle = sanitizeHtml(userInput.title);

// Sanitize entire objects
const cleanData = sanitizeObject(userInput);
```

## 🚦 Rate Limiting Configuration

### 1. Using Predefined Tiers

```typescript
import { withRateLimit } from '@/lib/api/rate-limit-enhanced';

// In your API route
const rateLimitResult = await withRateLimit('ai')(req, userId);
if (!rateLimitResult.allowed) {
  return rateLimitResult; // Returns 429 response
}
```

### 2. Custom Rate Limiting

```typescript
import { EnhancedRateLimiter, RateLimitStrategy } from '@/lib/api/rate-limit-enhanced';

const customLimiter = new EnhancedRateLimiter({
  name: 'custom',
  windowMs: 60 * 1000,
  maxRequests: 10,
  strategy: RateLimitStrategy.TOKEN_BUCKET,
  costPerRequest: 2,
  refillRate: 0.1,
});

const result = await customLimiter.check(req, identifier);
```

### 3. Rate Limit by User ID

```typescript
// Rate limit per user instead of IP
export const POST = secureEndpoint(
  async (req, context) => {
    const limiter = createRateLimiter('write');
    const result = await limiter.check(req, context.user?.uid);
    
    if (!result.allowed) {
      return new Response(JSON.stringify({
        error: 'User rate limit exceeded',
        retryAfter: result.retryAfter,
      }), { status: 429 });
    }
    
    // Continue with business logic
  },
  { requireAuth: true }
);
```

## 🔒 Security Best Practices

### 1. Error Handling

```typescript
// ❌ Bad - leaks sensitive information
catch (error) {
  return new Response(JSON.stringify({ 
    error: error.message,
    stack: error.stack,
  }), { status: 500 });
}

// ✅ Good - generic error message
catch (error) {
  console.error('[API Error]', { 
    requestId: context.requestId,
    error: error.message,
  });
  
  return new Response(JSON.stringify({
    error: 'Internal server error',
    requestId: context.requestId,
  }), { status: 500 });
}
```

### 2. Audit Logging

```typescript
// Log all security-relevant events
console.log('[AUDIT]', {
  action: 'user_login',
  userId: context.user?.uid,
  ip: context.clientIp,
  userAgent: req.headers.get('user-agent'),
  timestamp: new Date().toISOString(),
  requestId: context.requestId,
});
```

### 3. CSRF Protection

```typescript
import { generateCSRFToken } from '@/lib/api/secure-wrapper';

// Generate CSRF token for client
export const GET = secureEndpoint(
  async (req, context) => {
    const csrfToken = await generateCSRFToken(context.user!.uid);
    
    return new Response(JSON.stringify({ 
      csrfToken,
      expiresIn: 4 * 60 * 60 * 1000, // 4 hours
    }));
  },
  { requireAuth: true }
);

// Validate CSRF token (handled automatically by secure wrapper)
export const POST = secureEndpoint(
  async (req, context) => {
    // CSRF token already validated
    return new Response(JSON.stringify({ success: true }));
  },
  {
    requireAuth: true,
    enableCSRF: true,
  }
);
```

## 🧪 Testing Security

### 1. Run Security Tests

```bash
# Run the complete security test suite
npm run test:security

# Test specific endpoint
curl -X POST http://localhost:4000/api/community/posts \
  -H "Content-Type: application/json" \
  -d '{"category": "free-discussion", "title": "<script>alert(\"XSS\")</script>"}'
```

### 2. Manual Security Testing

```typescript
// Test rate limiting
for (let i = 0; i < 20; i++) {
  const response = await fetch('/api/test');
  console.log(`Request ${i}: ${response.status}`);
}

// Test input validation
const maliciousData = {
  title: '<script>alert("XSS")</script>',
  content: '"; DROP TABLE users; --',
};

const response = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(maliciousData),
});
```

### 3. Security Monitoring

```typescript
// Add to your monitoring service
function logSecurityEvent(event: string, details: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service (Sentry, DataDog, etc.)
    console.log('[SECURITY EVENT]', {
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

// Usage
logSecurityEvent('rate_limit_exceeded', {
  ip: context.clientIp,
  endpoint: req.url,
  attempts: 25,
});
```

## 📊 Security Metrics

### Key Performance Indicators

- **Authentication Success Rate**: >95%
- **False Positive Rate**: <1%
- **Mean Time to Detect**: <5 minutes
- **Mean Time to Respond**: <15 minutes
- **API Uptime**: >99.9%

### Monitoring Dashboards

```typescript
// Example metrics collection
export const securityMetrics = {
  authenticationAttempts: 0,
  authenticationFailures: 0,
  rateLimitViolations: 0,
  inputValidationFailures: 0,
  blockedIPs: new Set(),
  
  incrementAuthAttempt() {
    this.authenticationAttempts++;
  },
  
  incrementAuthFailure() {
    this.authenticationFailures++;
  },
  
  getAuthSuccessRate() {
    return (this.authenticationAttempts - this.authenticationFailures) / 
           this.authenticationAttempts * 100;
  },
};
```

## 🚀 Deployment Checklist

- [ ] All API endpoints use `secureEndpoint` wrapper
- [ ] Rate limiting configured for all endpoint types
- [ ] Input validation schemas defined for all inputs
- [ ] Security headers enabled in middleware
- [ ] CORS configured for production domains
- [ ] Error messages sanitized (no stack traces)
- [ ] Audit logging implemented
- [ ] Security tests passing
- [ ] Environment variables properly configured
- [ ] Firebase security rules updated

## 🔄 Maintenance

### Weekly Tasks
- [ ] Review security logs for anomalies
- [ ] Update rate limit thresholds based on usage
- [ ] Check for new security vulnerabilities

### Monthly Tasks
- [ ] Run full penetration test suite
- [ ] Review and update security policies
- [ ] Audit user permissions and roles

### Quarterly Tasks
- [ ] Security architecture review
- [ ] Update to latest security dependencies
- [ ] External security audit

---

**Remember**: Security is not a one-time implementation but an ongoing process. Regularly review and update your security measures to address new threats and vulnerabilities.