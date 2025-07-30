const { chromium } = require('playwright');

async function testCompleteFlow() {
    console.log('🎯 Complete AI Tarot Flow Test');
    console.log('📅 Date:', new Date().toISOString());
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Monitor console for AI errors
    let aiError = null;
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error' && text.includes('generateTarotInterpretation')) {
            console.log('❌ AI Error detected:', text);
            aiError = text;
        } else if (text.includes('[TAROT]')) {
            console.log('📝 Tarot Log:', text);
        }
    });
    
    try {
        // 1. Go directly to reading page
        console.log('\n1️⃣ Loading reading page...');
        await page.goto('https://test-studio-firebase.vercel.app/reading', { 
            waitUntil: 'domcontentloaded',
            timeout: 20000 
        });
        
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'flow-01-reading.png' });
        
        // 2. Enter question
        console.log('\n2️⃣ Entering question...');
        const questionInput = page.locator('textarea[placeholder*="질문"]');
        await questionInput.fill('오늘 나의 운세는 어떨까요?');
        
        // 3. Quick card selection flow
        console.log('\n3️⃣ Quick card selection...');
        
        // Shuffle
        await page.click('button:has-text("카드 섞기")');
        await page.waitForTimeout(3000);
        
        // Reveal
        await page.click('button:has-text("카드 펼치기")');
        await page.waitForTimeout(1000);
        
        // Select 3 cards quickly
        const cards = page.locator('[class*="cursor-pointer"]');
        for (let i = 0; i < 3; i++) {
            await cards.nth(i).click();
            await page.waitForTimeout(300);
        }
        
        await page.screenshot({ path: 'flow-02-selected.png' });
        
        // 4. Request AI interpretation
        console.log('\n4️⃣ Requesting AI interpretation...');
        const aiButton = page.locator('button:has-text("AI 해석")');
        
        if (await aiButton.count() > 0) {
            await aiButton.click();
            console.log('✅ Clicked AI button');
            
            // Wait for response
            await page.waitForTimeout(10000);
            
            // Check for dialog
            const dialog = page.locator('[role="dialog"]');
            if (await dialog.count() > 0) {
                const content = await dialog.textContent();
                console.log('\n✅ AI Response received!');
                console.log('Length:', content.length);
                console.log('Preview:', content.substring(0, 300) + '...');
                
                await page.screenshot({ path: 'flow-03-ai-response.png' });
            } else {
                console.log('❌ No dialog found');
            }
        } else {
            console.log('❌ AI button not found');
        }
        
        // Results
        console.log('\n📊 RESULTS:');
        console.log('AI Error:', aiError || 'None');
        console.log('Test Status:', aiError ? '❌ FAILED' : '✅ SUCCESS');
        
    } catch (error) {
        console.log('\n💥 Test error:', error.message);
        await page.screenshot({ path: 'flow-error.png' });
    } finally {
        await browser.close();
        console.log('\n✅ Test completed');
    }
}

testCompleteFlow().catch(console.error);