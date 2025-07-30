const { chromium } = require('playwright');

async function testCriticalFix() {
    console.log('🚨 Testing Critical Fix for AI Interpretation');
    console.log('📅 Date:', new Date().toISOString());
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Monitor for the specific undefined error
    let hasUndefinedError = false;
    let interpretationReceived = false;
    
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            console.log('❌ Error:', text);
            if (text.includes('generateTarotInterpretation') && text.includes('undefined')) {
                hasUndefinedError = true;
                console.log('🚨 CRITICAL: undefined error detected!');
            }
        } else if (text.includes('[TAROT]')) {
            console.log('📝 Log:', text);
        }
    });
    
    try {
        // Quick test flow
        console.log('\n1️⃣ Loading reading page...');
        await page.goto('https://test-studio-firebase.vercel.app/reading', { 
            waitUntil: 'domcontentloaded',
            timeout: 20000 
        });
        
        await page.waitForTimeout(2000);
        
        // Enter question
        console.log('2️⃣ Entering question...');
        await page.fill('textarea', '테스트 질문입니다');
        
        // Quick card selection
        console.log('3️⃣ Quick card selection...');
        await page.click('button:has-text("카드 섞기")');
        await page.waitForTimeout(3000);
        
        await page.click('button:has-text("카드 펼치기")');
        await page.waitForTimeout(1000);
        
        // Select 3 cards
        const cards = page.locator('[class*="cursor-pointer"]');
        for (let i = 0; i < 3; i++) {
            await cards.nth(i).click();
            await page.waitForTimeout(300);
        }
        
        // Click AI interpretation
        console.log('4️⃣ Requesting AI interpretation...');
        const aiButton = page.locator('button:has-text("AI 해석")');
        
        if (await aiButton.count() > 0) {
            await aiButton.click();
            console.log('✅ Clicked AI button');
            
            // Wait for response
            await page.waitForTimeout(5000);
            
            // Check for interpretation
            const dialog = page.locator('[role="dialog"]');
            if (await dialog.count() > 0) {
                const content = await dialog.textContent();
                if (content && content.length > 100) {
                    interpretationReceived = true;
                    console.log('\n✅ AI Interpretation received!');
                    console.log('Content preview:', content.substring(0, 200) + '...');
                }
            }
            
            await page.screenshot({ path: 'critical-fix-result.png' });
        }
        
        // Final results
        console.log('\n' + '='.repeat(50));
        console.log('🚨 CRITICAL FIX TEST RESULTS');
        console.log('='.repeat(50));
        console.log('Undefined Error:', hasUndefinedError ? '❌ STILL EXISTS' : '✅ FIXED');
        console.log('AI Interpretation:', interpretationReceived ? '✅ RECEIVED' : '❌ NOT RECEIVED');
        console.log('Overall Status:', !hasUndefinedError && interpretationReceived ? '✅ SUCCESS' : '❌ FAILED');
        
    } catch (error) {
        console.log('💥 Test error:', error.message);
        await page.screenshot({ path: 'critical-fix-error.png' });
    } finally {
        await browser.close();
    }
}

testCriticalFix().catch(console.error);