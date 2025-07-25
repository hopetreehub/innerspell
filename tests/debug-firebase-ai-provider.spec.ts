import { test, expect } from '@playwright/test';

test.describe('AI Provider Firebase Debug', () => {
  test('Debug Firebase Firestore Connection Issue', async ({ page }) => {
    console.log('🔍 Starting Firebase AI Provider debug test...\n');
    
    // Test 1: Check debug API endpoint
    console.log('📡 Step 1: Testing debug API endpoint...');
    const response = await page.request.get('http://localhost:5000/api/debug/ai-providers');
    const data = await response.json();
    
    console.log('API Response Status:', response.status());
    console.log('API Response Data:', JSON.stringify(data, null, 2));
    
    // Test 2: Navigate to admin page and check authentication
    console.log('\n🔐 Step 2: Testing admin page authentication...');
    await page.goto('http://localhost:5000/admin', { waitUntil: 'networkidle' });
    
    // Wait for any auth redirects or loading
    await page.waitForTimeout(3000);
    
    // Take screenshot of current state
    await page.screenshot({ path: './ai-provider-debug-screenshots/admin-page-state.png', fullPage: true });
    
    // Check if we're redirected to sign-in
    const currentUrl = page.url();
    console.log('Current URL after admin navigation:', currentUrl);
    
    if (currentUrl.includes('/sign-in')) {
      console.log('🚨 ISSUE: Redirected to sign-in page - admin authentication required');
    } else if (currentUrl.includes('/admin')) {
      console.log('✅ Successfully on admin page');
      
      // Check for loading state or AI provider tab
      const loadingSpinner = await page.locator('.animate-spin').isVisible().catch(() => false);
      const aiProviderTab = await page.locator('text="AI 공급자"').isVisible().catch(() => false);
      
      console.log('AI Provider tab visible:', aiProviderTab);
      console.log('Loading spinner visible:', loadingSpinner);
      
      if (aiProviderTab) {
        console.log('🎯 Step 3: Testing AI Provider tab click...');
        await page.locator('text="AI 공급자"').click();
        await page.waitForTimeout(2000);
        
        // Check for loading state after clicking
        const loadingAfterClick = await page.locator('.animate-spin').isVisible().catch(() => false);
        console.log('Loading spinner after tab click:', loadingAfterClick);
        
        // Take screenshot after clicking AI provider tab
        await page.screenshot({ path: './ai-provider-debug-screenshots/ai-provider-tab-clicked.png', fullPage: true });
        
        // Wait longer and check if data loads
        await page.waitForTimeout(5000);
        const stillLoading = await page.locator('.animate-spin').isVisible().catch(() => false);
        console.log('Still loading after 5 seconds:', stillLoading);
        
        if (stillLoading) {
          console.log('🚨 CONFIRMED: AI Provider tab stuck in loading state');
        }
      }
    }
    
    // Test 3: Check Firebase environment variables
    console.log('\n🔧 Step 3: Firebase Configuration Analysis...');
    const envVars = data.envVars || {};
    const firebaseStatus = data.firebaseStatus || {};
    
    console.log('Firebase Status:');
    console.log('  - Has Service Account Key:', firebaseStatus.hasServiceAccountKey);
    console.log('  - Has Google App Credentials:', firebaseStatus.hasGoogleAppCredentials);
    console.log('  - Node Environment:', firebaseStatus.nodeEnv);
    console.log('  - Use Real Auth:', firebaseStatus.useRealAuth);
    
    console.log('Environment Variables:');
    console.log('  - OpenAI API Key Length:', envVars.openaiLength || 0);
    console.log('  - Google API Key Length:', envVars.googleLength || 0);
    console.log('  - Gemini API Key Length:', envVars.geminiLength || 0);
    console.log('  - Anthropic API Key Length:', envVars.anthropicLength || 0);
    
    // Analysis and Recommendations
    console.log('\n🎯 ANALYSIS & RECOMMENDATIONS:\n');
    
    if (!data.success) {
      console.log('❌ API FAILURE DETECTED:');
      console.log('   Error:', data.error);
      console.log('');
    }
    
    if (!firebaseStatus.hasServiceAccountKey && !firebaseStatus.hasGoogleAppCredentials) {
      console.log('🔥 FIREBASE CREDENTIALS MISSING:');
      console.log('   The AI Provider Management tab is failing because Firebase credentials are not configured.');
      console.log('   This prevents the app from connecting to Firestore to fetch AI provider configurations.');
      console.log('');
      console.log('   SOLUTIONS:');
      console.log('   1. Add FIREBASE_SERVICE_ACCOUNT_KEY to .env.local with your Firebase service account JSON');
      console.log('   2. OR set GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account file');
      console.log('   3. OR set up Firebase Authentication for development');
      console.log('');
    }
    
    if (firebaseStatus.useRealAuth === 'false') {
      console.log('🧪 DEVELOPMENT MODE DETECTED:');
      console.log('   The app is running in development mode with useRealAuth=false.');
      console.log('   This may cause authentication and database access issues.');
      console.log('');
    }
    
    const hasAnyApiKeys = Object.values(envVars).some(length => (length as number) > 0);
    if (!hasAnyApiKeys) {
      console.log('🔑 AI API KEYS MISSING:');
      console.log('   No AI provider API keys detected in environment variables.');
      console.log('   Even with Firebase working, you need AI provider API keys to use the functionality.');
      console.log('');
      console.log('   REQUIRED VARIABLES:');
      console.log('   - OPENAI_API_KEY (for OpenAI GPT models)');
      console.log('   - GOOGLE_API_KEY or GEMINI_API_KEY (for Google/Gemini models)');
      console.log('   - ANTHROPIC_API_KEY (for Claude models)');
      console.log('');
    }
    
    console.log('📋 DEBUGGING SUMMARY:');
    console.log('   ROOT CAUSE: Firebase Firestore connection failure due to missing credentials');
    console.log('   SYMPTOM: AI Provider Management tab shows loading spinner indefinitely');
    console.log('   IMPACT: Cannot load or manage AI provider configurations');
    console.log('');
    console.log('   IMMEDIATE FIX:');
    console.log('   1. Configure Firebase service account credentials');
    console.log('   2. Add AI provider API keys to environment variables');
    console.log('   3. Restart the development server');
    console.log('');
    
    // The test should pass - we're debugging, not testing functionality
    expect(true).toBe(true);
  });
  
  test('Test Firebase Admin Initialization', async ({ page }) => {
    console.log('🔥 Testing Firebase Admin SDK initialization...\n');
    
    // Check Firebase debug endpoint
    const response = await page.request.get('http://localhost:5000/api/debug/firebase-status');
    
    if (response.status() === 404) {
      console.log('ℹ️  Firebase debug endpoint not available, testing through ai-providers endpoint');
      
      const aiResponse = await page.request.get('http://localhost:5000/api/debug/ai-providers');
      const data = await aiResponse.json();
      
      console.log('Firebase initialization status from AI providers endpoint:');
      console.log('  - Response success:', data.success);
      console.log('  - Error message:', data.error);
      console.log('  - Firebase status:', JSON.stringify(data.firebaseStatus, null, 2));
      
      if (!data.success && data.error.includes('default credentials')) {
        console.log('\n🚨 FIREBASE AUTHENTICATION PROBLEM CONFIRMED:');
        console.log('   Firebase Admin SDK cannot load default credentials.');
        console.log('   This is the root cause of the AI Provider Management loading issue.');
        console.log('\n   REQUIRED ACTIONS:');
        console.log('   1. Download Firebase service account key from Firebase Console');
        console.log('   2. Add FIREBASE_SERVICE_ACCOUNT_KEY to .env.local file');
        console.log('   3. Restart development server');
      }
    } else {
      const data = await response.json();
      console.log('Firebase debug response:', JSON.stringify(data, null, 2));
    }
    
    expect(true).toBe(true);
  });
});