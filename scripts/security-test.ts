#!/usr/bin/env tsx

/**
 * API Security Penetration Testing Script
 * 
 * This script tests our API security implementation against common attacks
 * following OWASP API Security Top 10 guidelines.
 */

import https from 'https';
import { performance } from 'perf_hooks';

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';
const TEST_API_KEY = process.env.TEST_API_KEY;
const TEST_TOKEN = process.env.TEST_FIREBASE_TOKEN;

// Test results tracking
interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  description: string;
  details?: any;
  responseTime?: number;
}

const results: TestResult[] = [];

/**
 * Utility function to make HTTP requests
 */
async function makeRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ status: number; data: any; headers: Headers; responseTime: number }> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const responseTime = performance.now() - startTime;
    let data;
    
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    
    return {
      status: response.status,
      data,
      headers: response.headers,
      responseTime,
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    return {
      status: 0,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      headers: new Headers(),
      responseTime,
    };
  }
}

/**
 * Test 1: Authentication Security
 */
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Security...\n');
  
  // Test 1.1: Missing Authorization Header
  const noAuth = await makeRequest('/api/community/posts', {
    method: 'POST',
    body: JSON.stringify({
      category: 'free-discussion',
      title: 'Test',
      content: 'Test content that is long enough for validation.',
    }),
  });
  
  results.push({
    name: 'Missing Auth Header',
    category: 'Authentication',
    passed: noAuth.status === 401,
    description: 'Should reject requests without authorization',
    details: { status: noAuth.status, response: noAuth.data },
    responseTime: noAuth.responseTime,
  });
  
  // Test 1.2: Invalid Token
  const invalidAuth = await makeRequest('/api/community/posts', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer invalid-token-12345',
    },
    body: JSON.stringify({
      category: 'free-discussion',
      title: 'Test',
      content: 'Test content that is long enough for validation.',
    }),
  });
  
  results.push({
    name: 'Invalid Token',
    category: 'Authentication',
    passed: invalidAuth.status === 401,
    description: 'Should reject requests with invalid tokens',
    details: { status: invalidAuth.status, response: invalidAuth.data },
    responseTime: invalidAuth.responseTime,
  });
  
  // Test 1.3: Token Format Validation
  const malformedAuth = await makeRequest('/api/community/posts', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic not-bearer-token',
    },
    body: JSON.stringify({
      category: 'free-discussion',
      title: 'Test',
      content: 'Test content that is long enough for validation.',
    }),
  });
  
  results.push({
    name: 'Malformed Auth Header',
    category: 'Authentication',
    passed: malformedAuth.status === 401,
    description: 'Should reject non-Bearer authorization formats',
    details: { status: malformedAuth.status, response: malformedAuth.data },
    responseTime: malformedAuth.responseTime,
  });
}

/**
 * Test 2: Input Validation Security
 */
async function testInputValidation() {
  console.log('\n🛡️ Testing Input Validation Security...\n');
  
  const maliciousInputs = [
    {
      name: 'XSS Script Tag',
      payload: {
        category: 'free-discussion',
        title: '<script>alert("XSS")</script>',
        content: 'This should be sanitized properly and should be long enough.',
      },
    },
    {
      name: 'SQL Injection',
      payload: {
        category: 'free-discussion',
        title: "'; DROP TABLE posts; --",
        content: 'SQL injection attempt that should be blocked and is long enough.',
      },
    },
    {
      name: 'Path Traversal',
      payload: {
        category: 'free-discussion',
        title: '../../../etc/passwd',
        content: 'Path traversal attempt that should be sanitized and is long enough.',
      },
    },
    {
      name: 'NoSQL Injection',
      payload: {
        category: 'free-discussion',
        title: { $ne: null },
        content: 'NoSQL injection attempt and long enough content for validation.',
      },
    },
    {
      name: 'XXE Attack',
      payload: {
        category: 'free-discussion',
        title: '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
        content: 'XXE attack attempt that should be blocked and is long enough.',
      },
    },
  ];
  
  for (const test of maliciousInputs) {
    const response = await makeRequest('/api/community/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN || 'mock-token'}`,
      },
      body: JSON.stringify(test.payload),
    });
    
    // Check if malicious content was sanitized or blocked
    const passed = response.status === 400 || response.status === 401 || 
                   (response.status === 422 && response.data.error?.includes('validation'));
    
    results.push({
      name: test.name,
      category: 'Input Validation',
      passed,
      description: 'Should sanitize or reject malicious input',
      details: { 
        status: response.status, 
        response: response.data,
        payload: test.payload,
      },
      responseTime: response.responseTime,
    });
  }
  
  // Test oversized payload
  const oversizedPayload = {
    category: 'free-discussion',
    title: 'Oversized payload test',
    content: 'A'.repeat(100000), // 100KB content
  };
  
  const oversizedResponse = await makeRequest('/api/community/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN || 'mock-token'}`,
    },
    body: JSON.stringify(oversizedPayload),
  });
  
  results.push({
    name: 'Oversized Payload',
    category: 'Input Validation',
    passed: oversizedResponse.status === 413 || oversizedResponse.status === 400,
    description: 'Should reject oversized payloads',
    details: { status: oversizedResponse.status, response: oversizedResponse.data },
    responseTime: oversizedResponse.responseTime,
  });
}

/**
 * Test 3: Rate Limiting Security
 */
async function testRateLimiting() {
  console.log('\n🚦 Testing Rate Limiting Security...\n');
  
  const startTime = Date.now();
  const requests = [];
  
  // Make rapid requests to trigger rate limiting
  for (let i = 0; i < 15; i++) {
    const request = makeRequest('/api/auth/test', {
      method: 'POST',
      body: JSON.stringify({ test: i }),
    });
    requests.push(request);
  }
  
  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r.status === 429);
  const successful = responses.filter(r => r.status !== 429);
  
  results.push({
    name: 'Rate Limiting Enforcement',
    category: 'Rate Limiting',
    passed: rateLimited.length > 0,
    description: 'Should enforce rate limits on rapid requests',
    details: {
      totalRequests: responses.length,
      rateLimitedCount: rateLimited.length,
      successfulCount: successful.length,
      timespan: Date.now() - startTime,
    },
    responseTime: responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length,
  });
  
  // Test rate limit headers
  const firstResponse = responses[0];
  const hasRateLimitHeaders = firstResponse.headers.has('X-RateLimit-Limit') &&
                              firstResponse.headers.has('X-RateLimit-Remaining');
  
  results.push({
    name: 'Rate Limit Headers',
    category: 'Rate Limiting',
    passed: hasRateLimitHeaders,
    description: 'Should include rate limit headers in responses',
    details: {
      limit: firstResponse.headers.get('X-RateLimit-Limit'),
      remaining: firstResponse.headers.get('X-RateLimit-Remaining'),
      reset: firstResponse.headers.get('X-RateLimit-Reset'),
    },
    responseTime: firstResponse.responseTime,
  });
}

/**
 * Test 4: Security Headers
 */
async function testSecurityHeaders() {
  console.log('\n🔒 Testing Security Headers...\n');
  
  const response = await makeRequest('/api/health');
  
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'Referrer-Policy',
  ];
  
  for (const header of requiredHeaders) {
    const hasHeader = response.headers.has(header);
    
    results.push({
      name: `${header} Header`,
      category: 'Security Headers',
      passed: hasHeader,
      description: `Should include ${header} security header`,
      details: {
        value: response.headers.get(header),
        present: hasHeader,
      },
      responseTime: response.responseTime,
    });
  }
  
  // Test CORS headers for cross-origin requests
  const corsResponse = await makeRequest('/api/health', {
    headers: {
      'Origin': 'https://malicious-site.com',
    },
  });
  
  const hasCorsAllowOrigin = corsResponse.headers.has('Access-Control-Allow-Origin');
  const allowedOrigin = corsResponse.headers.get('Access-Control-Allow-Origin');
  
  results.push({
    name: 'CORS Protection',
    category: 'Security Headers',
    passed: !hasCorsAllowOrigin || allowedOrigin !== 'https://malicious-site.com',
    description: 'Should not allow arbitrary origins',
    details: {
      allowedOrigin,
      requestOrigin: 'https://malicious-site.com',
    },
    responseTime: corsResponse.responseTime,
  });
}

/**
 * Test 5: Error Handling Security
 */
async function testErrorHandling() {
  console.log('\n💥 Testing Error Handling Security...\n');
  
  // Test 404 endpoint
  const notFoundResponse = await makeRequest('/api/nonexistent-endpoint');
  
  results.push({
    name: '404 Error Handling',
    category: 'Error Handling',
    passed: notFoundResponse.status === 404,
    description: 'Should return 404 for non-existent endpoints',
    details: { status: notFoundResponse.status, response: notFoundResponse.data },
    responseTime: notFoundResponse.responseTime,
  });
  
  // Test method not allowed
  const methodNotAllowedResponse = await makeRequest('/api/community/posts', {
    method: 'TRACE',
  });
  
  results.push({
    name: 'Method Not Allowed',
    category: 'Error Handling',
    passed: methodNotAllowedResponse.status === 405,
    description: 'Should reject unsupported HTTP methods',
    details: { status: methodNotAllowedResponse.status, response: methodNotAllowedResponse.data },
    responseTime: methodNotAllowedResponse.responseTime,
  });
  
  // Test that error messages don't leak sensitive information
  const errorResponse = await makeRequest('/api/community/posts', {
    method: 'POST',
    body: 'invalid-json',
  });
  
  const errorMessage = JSON.stringify(errorResponse.data).toLowerCase();
  const leaksInfo = errorMessage.includes('stack') || 
                   errorMessage.includes('internal') ||
                   errorMessage.includes('database') ||
                   errorMessage.includes('firebase') ||
                   errorMessage.includes('secret');
  
  results.push({
    name: 'Error Information Disclosure',
    category: 'Error Handling',
    passed: !leaksInfo,
    description: 'Should not leak sensitive information in error messages',
    details: { 
      status: errorResponse.status, 
      response: errorResponse.data,
      leaksInfo,
    },
    responseTime: errorResponse.responseTime,
  });
}

/**
 * Test 6: CSRF Protection
 */
async function testCSRFProtection() {
  console.log('\n🛡️ Testing CSRF Protection...\n');
  
  // Test POST without CSRF token
  const noCsrfResponse = await makeRequest('/api/community/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN || 'mock-token'}`,
    },
    body: JSON.stringify({
      category: 'free-discussion',
      title: 'CSRF Test',
      content: 'Testing CSRF protection with a long enough content.',
    }),
  });
  
  // Note: CSRF protection might not be enabled on all endpoints
  results.push({
    name: 'CSRF Token Validation',
    category: 'CSRF Protection',
    passed: noCsrfResponse.status === 403 || noCsrfResponse.status === 401,
    description: 'Should require CSRF token for state-changing operations',
    details: { 
      status: noCsrfResponse.status, 
      response: noCsrfResponse.data,
      note: 'CSRF protection may not be enabled on all endpoints',
    },
    responseTime: noCsrfResponse.responseTime,
  });
}

/**
 * Generate security report
 */
function generateReport() {
  console.log('\n📊 SECURITY TEST REPORT\n');
  console.log('='.repeat(50));
  
  const categories = [...new Set(results.map(r => r.category))];
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.passed).length;
    const total = categoryResults.length;
    
    console.log(`\n${category}: ${passed}/${total} tests passed`);
    console.log('-'.repeat(30));
    
    for (const result of categoryResults) {
      const status = result.passed ? '✅' : '❌';
      const time = result.responseTime ? `(${result.responseTime.toFixed(2)}ms)` : '';
      console.log(`${status} ${result.name} ${time}`);
      
      if (!result.passed) {
        console.log(`   ${result.description}`);
        if (result.details) {
          console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      }
    }
  }
  
  // Overall summary
  const totalPassed = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const passRate = (totalPassed / totalTests * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(50));
  console.log(`OVERALL SECURITY SCORE: ${totalPassed}/${totalTests} (${passRate}%)`);
  
  if (passRate === '100.0') {
    console.log('🎉 All security tests passed!');
  } else if (parseFloat(passRate) >= 80) {
    console.log('⚠️  Good security posture, but some improvements needed');
  } else {
    console.log('🚨 Critical security issues found - immediate attention required');
  }
  
  console.log('\n📝 Recommendations:');
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length === 0) {
    console.log('- Continue regular security testing');
    console.log('- Consider adding more advanced security tests');
    console.log('- Monitor for new security vulnerabilities');
  } else {
    failedTests.forEach(test => {
      console.log(`- Fix: ${test.name} - ${test.description}`);
    });
  }
}

/**
 * Main test runner
 */
async function runSecurityTests() {
  console.log('🔒 Starting API Security Penetration Tests...');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  try {
    await testAuthentication();
    await testInputValidation();
    await testRateLimiting();
    await testSecurityHeaders();
    await testErrorHandling();
    await testCSRFProtection();
    
    generateReport();
    
    // Exit with appropriate code
    const allPassed = results.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Security test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runSecurityTests();
}

export { runSecurityTests, generateReport, results };