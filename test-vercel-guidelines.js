const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testVercelGuidelines() {
    console.log('🔍 Starting Vercel deployment verification...');
    
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 }
    });
    const page = await context.newPage();
    
    try {
        // Create screenshots directory
        const screenshotDir = path.join(__dirname, 'vercel-test-screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        console.log('📱 Step 1: Accessing Vercel deployment...');
        await page.goto('https://test-studio-firebase.vercel.app/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(screenshotDir, '01-homepage.png'), fullPage: true });
        console.log('✅ Homepage loaded');
        
        console.log('📱 Step 2: Navigating to reading page...');
        await page.goto('https://test-studio-firebase.vercel.app/reading', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(screenshotDir, '02-reading-page.png'), fullPage: true });
        console.log('✅ Reading page loaded');
        
        console.log('📱 Step 3: Checking spread selection dropdown...');
        const spreadSelect = await page.locator('select').first();
        if (await spreadSelect.isVisible()) {
            await spreadSelect.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(screenshotDir, '03-spread-dropdown.png'), fullPage: true });
            
            // Check for Trinity View option
            const options = await page.locator('select option').allTextContents();
            console.log('Available spread options:', options);
            
            const trinityExists = options.some(option => option.includes('삼위일체 조망') || option.includes('Trinity View'));
            console.log(`🔍 Trinity View found: ${trinityExists}`);
            
            if (trinityExists) {
                await spreadSelect.selectOption({ label: '삼위일체 조망 (Trinity View)' });
                await page.waitForTimeout(1000);
                await page.screenshot({ path: path.join(screenshotDir, '04-trinity-selected.png'), fullPage: true });
                console.log('✅ Trinity View selected');
            }
        }
        
        console.log('📱 Step 4: Testing complete reading workflow...');
        // Enter question
        const questionInput = await page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"], input[type="text"]').first();
        if (await questionInput.isVisible()) {
            await questionInput.fill('새로운 가이드라인이 적용되었는지 테스트');
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(screenshotDir, '05-question-entered.png'), fullPage: true });
            console.log('✅ Question entered');
        }
        
        // Start reading
        const startButton = await page.locator('button').filter({ hasText: /시작|start/i }).first();
        if (await startButton.isVisible()) {
            await startButton.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: path.join(screenshotDir, '06-reading-started.png'), fullPage: true });
            console.log('✅ Reading started');
            
            // Wait for cards to appear and select them
            await page.waitForTimeout(5000);
            const cards = await page.locator('.card, [class*="card"]').all();
            console.log(`Found ${cards.length} cards`);
            
            if (cards.length > 0) {
                // Select first few cards
                for (let i = 0; i < Math.min(3, cards.length); i++) {
                    await cards[i].click();
                    await page.waitForTimeout(1000);
                }
                await page.screenshot({ path: path.join(screenshotDir, '07-cards-selected.png'), fullPage: true });
                console.log('✅ Cards selected');
                
                // Look for interpretation
                await page.waitForTimeout(10000); // Wait for interpretation
                await page.screenshot({ path: path.join(screenshotDir, '08-interpretation.png'), fullPage: true });
                
                // Check interpretation content
                const interpretationText = await page.textContent('body');
                const hasNewGuidelines = interpretationText.includes('삼위일체') || 
                                       interpretationText.includes('Trinity') ||
                                       interpretationText.includes('과거') ||
                                       interpretationText.includes('현재') ||
                                       interpretationText.includes('미래');
                console.log(`🔍 New guidelines detected in interpretation: ${hasNewGuidelines}`);
            }
        }
        
        console.log('📱 Step 5: Checking admin dashboard...');
        await page.goto('https://test-studio-firebase.vercel.app/admin', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(screenshotDir, '09-admin-page.png'), fullPage: true });
        
        // Check if login is required
        const isLoginPage = await page.textContent('body');
        if (isLoginPage.includes('로그인') || isLoginPage.includes('Login')) {
            console.log('🔒 Admin requires authentication');
            
            // Try mock authentication for testing
            await page.evaluate(() => {
                localStorage.setItem('adminAuth', 'true');
                sessionStorage.setItem('adminAuth', 'true');
            });
            
            await page.reload({ waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            await page.screenshot({ path: path.join(screenshotDir, '10-admin-after-auth.png'), fullPage: true });
        }
        
        // Look for Tarot Guidelines tab/section
        const pageContent = await page.textContent('body');
        const hasTarotGuidelines = pageContent.includes('타로 지침') || 
                                 pageContent.includes('Tarot Guidelines') ||
                                 pageContent.includes('Guidelines');
        console.log(`🔍 Tarot Guidelines section found: ${hasTarotGuidelines}`);
        
        if (hasTarotGuidelines) {
            // Try to click on guidelines tab
            const guidelinesButton = await page.locator('button, a, tab').filter({ hasText: /타로 지침|Guidelines/i }).first();
            if (await guidelinesButton.isVisible()) {
                await guidelinesButton.click();
                await page.waitForTimeout(3000);
                await page.screenshot({ path: path.join(screenshotDir, '11-guidelines-tab.png'), fullPage: true });
                console.log('✅ Guidelines tab accessed');
            }
        }
        
        console.log('📱 Step 6: Final verification screenshot...');
        await page.screenshot({ path: path.join(screenshotDir, '12-final-state.png'), fullPage: true });
        
        console.log('✅ Verification complete! Check screenshots in vercel-test-screenshots/');
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        await page.screenshot({ path: path.join(__dirname, 'vercel-test-screenshots', 'error.png'), fullPage: true });
    } finally {
        await browser.close();
    }
}

testVercelGuidelines().catch(console.error);