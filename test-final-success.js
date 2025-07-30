const { chromium } = require('playwright');

async function testFinalSuccess() {
    console.log('🎉 Final Success Test for AI Tarot');
    console.log('📅 Date:', new Date().toISOString());
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Monitor console
    let hasError = false;
    let aiResponseReceived = false;
    
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            console.log('❌ Error:', text);
            if (text.includes('generateTarotInterpretation') && text.includes('undefined')) {
                hasError = true;
            }
        } else if (text.includes('[TAROT]')) {
            console.log('📝 Log:', text);
            if (text.includes('V2')) {
                console.log('✅ Using V2 implementation!');
            }
        }
    });
    
    try {
        console.log('\n1️⃣ Loading Vercel deployment...');
        await page.goto('https://test-studio-firebase.vercel.app/reading', { 
            waitUntil: 'domcontentloaded',
            timeout: 20000 
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'success-01-loaded.png' });
        
        // Fill question
        console.log('\n2️⃣ Entering question...');
        await page.fill('textarea[placeholder*="질문"]', '오늘의 운세를 알려주세요');
        
        // Shuffle cards
        console.log('\n3️⃣ Shuffling cards...');
        const shuffleButton = page.locator('button:has-text("카드 섞기")');
        await shuffleButton.click();
        await page.waitForTimeout(3000);
        
        // Reveal cards
        console.log('\n4️⃣ Revealing cards...');
        const revealButton = page.locator('button:has-text("카드 펼치기")');
        await revealButton.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'success-02-revealed.png' });
        
        // Select cards more carefully
        console.log('\n5️⃣ Selecting 3 cards...');
        // Use more specific selector for card container
        const cardContainer = page.locator('.flex.space-x-\\[-125px\\]').first();
        const cards = cardContainer.locator('[role="button"]');
        
        console.log('Found cards:', await cards.count());
        
        // Click first 3 cards
        for (let i = 0; i < 3; i++) {
            try {
                await cards.nth(i).click({ force: true });
                console.log(`✅ Selected card ${i + 1}`);
                await page.waitForTimeout(500);
            } catch (e) {
                console.log(`⚠️ Could not select card ${i + 1}`);
            }
        }
        
        await page.screenshot({ path: 'success-03-selected.png' });
        
        // Request AI interpretation
        console.log('\n6️⃣ Requesting AI interpretation...');
        const aiButton = page.locator('button').filter({ hasText: 'AI 해석' });
        
        if (await aiButton.count() > 0) {
            await aiButton.click();
            console.log('✅ Clicked AI button');
            
            // Wait for dialog
            await page.waitForTimeout(10000);
            
            const dialog = page.locator('[role="dialog"]');
            if (await dialog.count() > 0) {
                const content = await dialog.textContent();
                if (content && content.includes('AI 타로 해석')) {
                    aiResponseReceived = true;
                    console.log('\n✅ AI Response received!');
                    console.log('Content preview:', content.substring(0, 300) + '...');
                    
                    await page.screenshot({ path: 'success-04-ai-response.png' });
                }
            }
        }
        
        // Final results
        console.log('\n' + '='.repeat(50));
        console.log('🎉 FINAL TEST RESULTS');
        console.log('='.repeat(50));
        console.log('Undefined Error:', hasError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('AI Response:', aiResponseReceived ? '✅ RECEIVED' : '❌ NOT RECEIVED');
        console.log('Overall:', !hasError && aiResponseReceived ? '✅ SUCCESS!' : '❌ FAILED');
        
        if (!hasError && aiResponseReceived) {
            console.log('\n🎊 CONGRATULATIONS! The AI tarot interpretation is working perfectly!');
        }
        
    } catch (error) {
        console.log('\n💥 Test error:', error.message);
        await page.screenshot({ path: 'success-error.png' });
    } finally {
        await browser.close();
        console.log('\n✅ Test completed');
    }
}

testFinalSuccess().catch(console.error);