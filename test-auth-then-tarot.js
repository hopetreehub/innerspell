const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAuthAndTarotReading() {
    console.log('🎭 Testing tarot reading with authentication...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1500,
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    try {
        console.log('📋 Step 1: Navigating to homepage...');
        
        const vercelUrl = 'https://test-studio-firebase.vercel.app';
        
        await page.goto(vercelUrl, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'auth-test-1-home.png'),
            fullPage: true 
        });
        
        console.log('📋 Step 2: Checking if already signed in or need to sign in...');
        
        // Check if there's a sign-in button or if already logged in
        const isSignedIn = await page.locator('text=로그아웃').isVisible({ timeout: 3000 }).catch(() => false);
        
        if (!isSignedIn) {
            console.log('🔐 Need to sign in...');
            
            // Look for sign-in button
            const signInButton = await page.locator('button:has-text("회원가입"), button:has-text("로그인"), a:has-text("회원가입"), a:has-text("로그인")').first();
            
            if (await signInButton.isVisible()) {
                await signInButton.click();
                console.log('✅ Clicked sign in button');
                
                await page.waitForTimeout(2000);
                await page.screenshot({ 
                    path: path.join(screenshotsDir, 'auth-test-2-signin.png'),
                    fullPage: true 
                });
                
                // Try to find Google login button
                const googleButton = await page.locator('button:has-text("Google"), [aria-label*="Google"], .google-login, [data-testid*="google"]').first();
                
                if (await googleButton.isVisible({ timeout: 5000 })) {
                    console.log('📧 Found Google login button, attempting to click...');
                    await googleButton.click();
                    await page.waitForTimeout(3000);
                } else {
                    console.log('⚠️  No Google login found, proceeding without auth...');
                }
            }
        } else {
            console.log('✅ Already signed in');
        }
        
        console.log('📋 Step 3: Navigating to reading page...');
        
        await page.goto(`${vercelUrl}/reading`, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'auth-test-3-reading.png'),
            fullPage: true 
        });
        
        console.log('📋 Step 4: Setting up tarot reading...');
        
        // Fill question
        const questionInput = await page.locator('textarea, input[type="text"]').first();
        await questionInput.waitFor({ state: 'visible', timeout: 10000 });
        
        const testQuestion = '내 연애 운세는 어떤가요?';
        await questionInput.fill(testQuestion);
        
        console.log(`✅ Filled question: "${testQuestion}"`);
        
        // Ensure Trinity View is selected
        const trinityButton = await page.locator('button:has-text("삼위일체")').first();
        if (await trinityButton.isVisible()) {
            await trinityButton.click();
            console.log('✅ Trinity View selected');
        }
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'auth-test-4-setup.png'),
            fullPage: true 
        });
        
        console.log('📋 Step 5: Starting reading and monitoring network requests...');
        
        // Monitor network requests
        page.on('response', response => {
            if (response.url().includes('/reading') && response.request().method() === 'POST') {
                console.log(`📡 Reading API call: ${response.status()} ${response.url()}`);
            }
        });
        
        // Start the reading
        const submitButton = await page.locator('button[type="submit"]').first();
        await submitButton.click();
        
        console.log('✅ Reading started! Monitoring for results...');
        
        // Wait for either success or error
        let readingComplete = false;
        const maxWaitTime = 60000; // 1 minute
        const startTime = Date.now();
        
        while (!readingComplete && (Date.now() - startTime) < maxWaitTime) {
            // Check for any cards, interpretation, or error messages
            const hasCards = await page.locator('.card, .tarot-card, [data-testid*="card"]').count() > 0;
            const hasInterpretation = await page.locator('.interpretation, .reading-result, .analysis').count() > 0;
            const hasError = await page.locator('[role="alert"], .error, .alert-destructive').count() > 0;
            
            if (hasCards || hasInterpretation || hasError) {
                readingComplete = true;
                console.log(`✅ Reading completed! Cards: ${hasCards}, Interpretation: ${hasInterpretation}, Error: ${hasError}`);
                
                await page.screenshot({ 
                    path: path.join(screenshotsDir, 'auth-test-5-result.png'),
                    fullPage: true 
                });
                
                if (hasInterpretation) {
                    const interpretationText = await page.locator('.interpretation, .reading-result, .analysis').first().textContent();
                    console.log('📝 Interpretation preview:', interpretationText?.substring(0, 300) + '...');
                }
            } else {
                await page.waitForTimeout(3000);
                console.log('⏳ Still waiting for reading results...');
            }
        }
        
        if (!readingComplete) {
            console.log('⚠️  Reading did not complete within 1 minute');
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'auth-test-timeout.png'),
                fullPage: true 
            });
        }
        
        console.log('🔍 Keeping browser open for manual inspection (30 seconds)...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'auth-test-error.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
        console.log('🏁 Test completed');
    }
}

// Run the test
testAuthAndTarotReading().catch(console.error);