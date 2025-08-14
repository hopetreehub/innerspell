import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Get Vercel deployment URL
const VERCEL_URL = process.env.VERCEL_URL || 'https://test-studio-firebase.vercel.app';
const ADMIN_EMAIL = 'admin@innerspell.com';
const ADMIN_PASSWORD = 'Admin@123';

test.describe('Blog Upload 403 Error Investigation', () => {
  test('Investigate CSRF token and 403 error', async ({ page }) => {
    console.log('🌐 Testing on Vercel URL:', VERCEL_URL);

    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Track all API requests and responses
    const apiLogs: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        const log = {
          type: 'request',
          timestamp: new Date().toISOString(),
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        };
        apiLogs.push(log);
        
        if (request.url().includes('/api/blog/upload')) {
          console.log('\n📤 Upload Request Details:');
          console.log('- URL:', request.url());
          console.log('- Method:', request.method());
          console.log('- Headers:', JSON.stringify(request.headers(), null, 2));
        }
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        const log = {
          type: 'response',
          timestamp: new Date().toISOString(),
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        };
        
        // Try to get response body for error responses
        if (response.status() >= 400) {
          try {
            log.body = await response.text();
          } catch (e) {
            log.body = 'Unable to read body';
          }
        }
        
        apiLogs.push(log);
        
        if (response.url().includes('/api/blog/upload')) {
          console.log('\n📥 Upload Response Details:');
          console.log('- URL:', response.url());
          console.log('- Status:', response.status());
          console.log('- Headers:', JSON.stringify(response.headers(), null, 2));
          if (log.body) {
            console.log('- Body:', log.body);
          }
        }
      }
    });

    // Step 1: Navigate to sign-in page
    console.log('\n1️⃣ Navigating to sign-in page...');
    await page.goto(`${VERCEL_URL}/sign-in`);
    await page.waitForLoadState('networkidle');
    
    // Check initial CSRF token
    let cookies = await page.context().cookies();
    let csrfToken = cookies.find(c => c.name === 'csrf-token')?.value;
    console.log('- Initial CSRF token:', csrfToken ? `${csrfToken.substring(0, 10)}...` : 'NOT FOUND');

    // Step 2: Login
    console.log('\n2️⃣ Logging in...');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin
    await page.waitForURL('**/admin', { timeout: 10000 });
    console.log('- Login successful, redirected to admin');

    // Check CSRF token after login
    cookies = await page.context().cookies();
    csrfToken = cookies.find(c => c.name === 'csrf-token')?.value;
    console.log('- CSRF token after login:', csrfToken ? `${csrfToken.substring(0, 10)}...` : 'NOT FOUND');

    // Step 3: Navigate to blog management
    console.log('\n3️⃣ Navigating to blog management...');
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(2000);

    // Step 4: Open new post form
    console.log('\n4️⃣ Opening new post form...');
    await page.click('button:has-text("새 포스트 작성")');
    await page.waitForTimeout(1000);

    // Step 5: Create a test image
    console.log('\n5️⃣ Creating test image...');
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, buffer);

    // Step 6: Attempt to upload image
    console.log('\n6️⃣ Attempting image upload...');
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles(testImagePath);

    // Wait for upload to complete
    await page.waitForTimeout(3000);

    // Step 7: Check for error toast
    const errorToast = page.locator('.sonner-toast-error');
    const hasError = await errorToast.isVisible().catch(() => false);
    
    if (hasError) {
      const errorText = await errorToast.textContent();
      console.log('\n❌ Error toast detected:', errorText);
    }

    // Step 8: Analyze the results
    console.log('\n📊 Analysis Results:');
    console.log('=====================================');
    
    // Find upload requests/responses
    const uploadRequests = apiLogs.filter(l => l.url.includes('/api/blog/upload') && l.type === 'request');
    const uploadResponses = apiLogs.filter(l => l.url.includes('/api/blog/upload') && l.type === 'response');
    
    console.log(`\nUpload attempts: ${uploadRequests.length}`);
    console.log(`Upload responses: ${uploadResponses.length}`);
    
    // Analyze CSRF token in requests
    uploadRequests.forEach((req, idx) => {
      console.log(`\nUpload Request #${idx + 1}:`);
      const csrfHeader = req.headers['x-csrf-token'];
      console.log('- CSRF token in header:', csrfHeader || 'MISSING');
      console.log('- Content-Type:', req.headers['content-type']);
    });
    
    // Analyze responses
    uploadResponses.forEach((resp, idx) => {
      console.log(`\nUpload Response #${idx + 1}:`);
      console.log('- Status:', resp.status);
      console.log('- Body:', resp.body);
      
      if (resp.status === 403) {
        console.log('\n🔍 403 Error Analysis:');
        if (resp.body?.includes('CSRF')) {
          console.log('- Cause: CSRF token validation failed');
          console.log('- Current CSRF token:', csrfToken ? `${csrfToken.substring(0, 10)}...` : 'NOT FOUND');
        } else {
          console.log('- Cause: Unknown (not CSRF related)');
        }
      }
    });

    // Step 9: Test direct API call with proper headers
    console.log('\n7️⃣ Testing direct API call...');
    const directApiTest = await page.evaluate(async () => {
      const formData = new FormData();
      const blob = new Blob(['test'], { type: 'image/png' });
      formData.append('file', blob, 'test.png');
      
      // Get CSRF token from cookie
      const csrfToken = document.cookie.split('; ').find(c => c.startsWith('csrf-token='))?.split('=')[1];
      
      try {
        const response = await fetch('/api/blog/upload', {
          method: 'POST',
          headers: {
            'x-csrf-token': csrfToken || ''
          },
          body: formData
        });
        
        return {
          status: response.status,
          statusText: response.statusText,
          body: await response.text(),
          csrfTokenUsed: csrfToken || 'none'
        };
      } catch (error: any) {
        return { error: error.message };
      }
    });
    
    console.log('Direct API test result:', JSON.stringify(directApiTest, null, 2));

    // Step 10: Check Vercel environment
    console.log('\n🌐 Vercel Environment Check:');
    console.log('- Deployment URL:', VERCEL_URL);
    console.log('- Is production:', VERCEL_URL.includes('vercel.app'));
    
    // Cleanup
    fs.unlinkSync(testImagePath);

    // Final diagnosis
    console.log('\n🩺 Final Diagnosis:');
    console.log('=====================================');
    
    if (uploadResponses.some(r => r.status === 403)) {
      console.log('❌ 403 Forbidden Error Confirmed');
      console.log('\nPossible causes:');
      console.log('1. CSRF token mismatch - token not being sent or validated incorrectly');
      console.log('2. Vercel read-only filesystem - cannot write to /public/uploads');
      console.log('3. Middleware blocking the request');
      
      console.log('\n💡 Recommended Solutions:');
      console.log('1. Use external storage (Vercel Blob, S3, Cloudinary, Firebase Storage)');
      console.log('2. Check middleware CSRF validation logic');
      console.log('3. Ensure CSRF token is properly set and sent with requests');
    } else if (uploadResponses.some(r => r.status === 500)) {
      console.log('❌ 500 Internal Server Error');
      console.log('Likely cause: Filesystem write error on Vercel');
      console.log('Solution: Use external storage service');
    } else {
      console.log('✅ No 403 errors detected');
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-results/blog-upload-analysis.png', fullPage: true });
  });

  test('Check Vercel filesystem limitations', async ({ page }) => {
    console.log('\n🔍 Checking Vercel Filesystem Limitations...');
    
    // Navigate to the API directly
    const response = await page.request.post(`${VERCEL_URL}/api/blog/upload`, {
      headers: {
        'x-csrf-token': 'test-token',
        'x-api-secret': process.env.BLOG_API_SECRET_KEY || ''
      },
      multipart: {
        file: {
          name: 'test.png',
          mimeType: 'image/png',
          buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
        }
      }
    });

    console.log('Direct API Response:');
    console.log('- Status:', response.status());
    console.log('- Status Text:', response.statusText());
    console.log('- Body:', await response.text());
    
    if (response.status() === 500) {
      console.log('\n⚠️ Vercel Filesystem Error Confirmed!');
      console.log('The /public directory is read-only on Vercel.');
      console.log('You must use external storage for file uploads.');
    }
  });
});