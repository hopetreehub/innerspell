import { test, expect, Page } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

// Get Vercel deployment URL
const VERCEL_URL = process.env.VERCEL_URL || 'https://test-studio-firebase.vercel.app';
const ADMIN_EMAIL = 'admin@innerspell.com';
const ADMIN_PASSWORD = 'Admin@123';

test.describe('Blog Image Upload on Vercel', () => {
  let page: Page;
  let csrfToken: string | null = null;
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ browser }) => {
    // Create a new page with console error tracking
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // Track console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Track network failures
    page.on('requestfailed', request => {
      console.log('❌ Request failed:', request.url(), request.failure()?.errorText);
    });

    // Track all requests to /api/blog/upload
    page.on('request', request => {
      if (request.url().includes('/api/blog/upload')) {
        console.log('📤 Upload Request:', {
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });

    // Track all responses
    page.on('response', response => {
      if (response.url().includes('/api/blog/upload')) {
        console.log('📥 Upload Response:', {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers()
        });
      }
    });
  });

  test('Login and test blog image upload', async () => {
    console.log('🌐 Testing on Vercel URL:', VERCEL_URL);

    // Navigate to the login page
    await page.goto(`${VERCEL_URL}/sign-in`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/01-login-page.png' });

    // Fill in login credentials
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.screenshot({ path: 'test-results/02-credentials-entered.png' });

    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to admin page
    await page.waitForURL('**/admin', { timeout: 10000 });
    await page.screenshot({ path: 'test-results/03-admin-dashboard.png' });

    // Extract CSRF token from cookies
    const cookies = await page.context().cookies();
    const csrfCookie = cookies.find(c => c.name === 'csrf-token');
    csrfToken = csrfCookie?.value || null;
    console.log('🔐 CSRF Token found:', !!csrfToken, csrfToken?.substring(0, 10) + '...');

    // Navigate to blog management tab
    const blogTab = page.locator('button:has-text("블로그 관리")').first();
    await blogTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/04-blog-management-tab.png' });

    // Click on "새 포스트 작성" button
    const newPostButton = page.locator('button:has-text("새 포스트 작성")');
    await newPostButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/05-new-post-form.png' });

    // Fill in post details
    await page.fill('input[placeholder="포스트 제목"]', '테스트 포스트 - 이미지 업로드 검증');
    await page.fill('textarea[placeholder="포스트 내용을 입력하세요..."]', '이미지 업로드 기능을 테스트하는 포스트입니다.');
    await page.screenshot({ path: 'test-results/06-post-details-filled.png' });

    // Create a test image file
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    execSync(`convert -size 100x100 xc:blue "${testImagePath}"`, { stdio: 'ignore' });

    // Set up request interception to monitor the upload
    let uploadRequest: any = null;
    let uploadResponse: any = null;

    page.on('request', async request => {
      if (request.url().includes('/api/blog/upload')) {
        uploadRequest = {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        };
        console.log('🔍 Intercepted upload request:', uploadRequest);
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/blog/upload')) {
        uploadResponse = {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          body: await response.text().catch(() => 'Failed to read body')
        };
        console.log('🔍 Intercepted upload response:', uploadResponse);
      }
    });

    // Upload image
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles(testImagePath);
    
    // Wait for upload to complete
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/07-after-image-upload.png' });

    // Check if image preview appears
    const imagePreview = page.locator('img[alt="대표 이미지 미리보기"]');
    const isImageVisible = await imagePreview.isVisible().catch(() => false);
    
    console.log('📸 Image preview visible:', isImageVisible);

    // Check for any error messages
    const errorToast = page.locator('.sonner-toast-error');
    const hasError = await errorToast.isVisible().catch(() => false);
    
    if (hasError) {
      const errorText = await errorToast.textContent();
      console.log('❌ Error toast detected:', errorText);
      await page.screenshot({ path: 'test-results/08-error-toast.png' });
    }

    // Log all console errors
    if (consoleErrors.length > 0) {
      console.log('\n🚨 Console Errors Detected:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // Detailed analysis
    console.log('\n📊 Analysis Summary:');
    console.log('- CSRF Token present:', !!csrfToken);
    console.log('- Upload request made:', !!uploadRequest);
    console.log('- Upload response received:', !!uploadResponse);
    
    if (uploadResponse) {
      console.log('- Response status:', uploadResponse.status);
      console.log('- Response body:', uploadResponse.body);
      
      if (uploadResponse.status === 403) {
        console.log('\n⚠️  403 Forbidden Error Detected!');
        console.log('Possible causes:');
        console.log('1. CSRF token mismatch');
        console.log('2. Missing authentication');
        console.log('3. File write permissions on Vercel');
        console.log('4. Middleware blocking the request');
        
        // Check if CSRF token was sent
        if (uploadRequest?.headers) {
          const csrfHeader = uploadRequest.headers['x-csrf-token'];
          console.log('\nCSRF Header sent:', csrfHeader ? 'Yes' : 'No');
          if (csrfHeader) {
            console.log('CSRF Header value:', csrfHeader.substring(0, 10) + '...');
          }
        }
      }
    }

    // Clean up test image
    try {
      execSync(`rm -f "${testImagePath}"`);
    } catch (e) {
      // Ignore cleanup errors
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-results/09-final-state.png', fullPage: true });
  });

  test('Check Vercel file system limitations', async () => {
    // Navigate to admin page directly
    await page.goto(`${VERCEL_URL}/admin`, { waitUntil: 'networkidle' });
    
    // Execute code to check file system access
    const fileSystemCheck = await page.evaluate(async () => {
      try {
        // Try to fetch the upload endpoint with a test request
        const response = await fetch('/api/blog/upload', {
          method: 'POST',
          headers: {
            'x-csrf-token': document.cookie.split('; ').find(c => c.startsWith('csrf-token='))?.split('=')[1] || ''
          },
          body: new FormData()
        });
        
        return {
          status: response.status,
          statusText: response.statusText,
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });
    
    console.log('📁 File system check result:', fileSystemCheck);
    
    if (fileSystemCheck.status === 403 || fileSystemCheck.status === 500) {
      console.log('\n⚠️  Vercel File System Issue Detected!');
      console.log('Note: Vercel has a read-only file system in production.');
      console.log('Solution: Use external storage like:');
      console.log('- Vercel Blob Storage');
      console.log('- AWS S3');
      console.log('- Cloudinary');
      console.log('- Firebase Storage');
    }
  });
});

// Helper to capture network logs
test.describe('Network Analysis', () => {
  test('Detailed network trace for upload', async ({ page }) => {
    // Enable request interception
    await page.route('**/*', route => route.continue());
    
    const requests: any[] = [];
    const responses: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Perform login and navigate to blog management
    await page.goto(`${VERCEL_URL}/sign-in`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 10000 });
    
    // Generate network report
    console.log('\n📊 Network Trace Report:');
    console.log('Total API requests:', requests.length);
    console.log('Total API responses:', responses.length);
    
    // Find upload-related requests
    const uploadRequests = requests.filter(r => r.url.includes('/upload'));
    const uploadResponses = responses.filter(r => r.url.includes('/upload'));
    
    console.log('\nUpload-specific:');
    console.log('- Upload requests:', uploadRequests.length);
    console.log('- Upload responses:', uploadResponses.length);
    
    if (uploadResponses.length > 0) {
      uploadResponses.forEach((resp, idx) => {
        console.log(`\nUpload Response ${idx + 1}:`);
        console.log('- Status:', resp.status);
        console.log('- URL:', resp.url);
        console.log('- Headers:', JSON.stringify(resp.headers, null, 2));
      });
    }
  });
});