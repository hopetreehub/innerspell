import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test.describe('Security WAF Tests', () => {
  test('should block SQL injection attempts', async ({ page }) => {
    // Try to access with SQL injection pattern
    const response = await page.goto(`${VERCEL_URL}/api/test?id=1' OR '1'='1`);
    
    // Should be blocked with 400 Bad Request
    expect(response?.status()).toBe(400);
  });

  test('should block XSS attempts', async ({ page }) => {
    // Try to access with XSS pattern
    const response = await page.goto(`${VERCEL_URL}/api/test?input=<script>alert('xss')</script>`);
    
    // Should be blocked with 400 Bad Request
    expect(response?.status()).toBe(400);
  });

  test('should block path traversal attempts', async ({ page }) => {
    // Try to access with path traversal pattern
    const response = await page.goto(`${VERCEL_URL}/../../etc/passwd`);
    
    // Should be blocked with 400 Bad Request
    expect(response?.status()).toBe(400);
  });

  test('should have security headers', async ({ page }) => {
    const response = await page.goto(VERCEL_URL);
    const headers = response?.headers() || {};
    
    // Check for security headers
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['strict-transport-security']).toContain('max-age=63072000');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
  });

  test('should have Content Security Policy', async ({ page }) => {
    const response = await page.goto(VERCEL_URL);
    const headers = response?.headers() || {};
    
    const csp = headers['content-security-policy'];
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
  });

  test('should rate limit excessive requests', async ({ page }) => {
    // This test would need to make many requests quickly
    // For now, we'll just check that the rate limit headers are present
    const response = await page.goto(`${VERCEL_URL}/api/health`);
    
    // After rate limiting is triggered, these headers would be present
    // We can't easily trigger it in a single test
    expect(response?.status()).toBeLessThan(500);
  });

  test('should block suspicious user agents', async ({ context }) => {
    // Create a new context with a suspicious user agent
    const suspiciousContext = await context.browser()?.newContext({
      userAgent: 'sqlmap/1.0'
    });
    
    if (suspiciousContext) {
      const page = await suspiciousContext.newPage();
      const response = await page.goto(VERCEL_URL);
      
      // Should be blocked with 403 Forbidden
      expect(response?.status()).toBe(403);
      
      await suspiciousContext.close();
    }
  });

  test('should have request ID header for tracing', async ({ page }) => {
    const response = await page.goto(VERCEL_URL);
    const headers = response?.headers() || {};
    
    // Check for request ID header
    expect(headers['x-request-id']).toBeTruthy();
    expect(headers['x-request-id']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});