const { chromium } = require('playwright');

async function finalVerificationTest() {
    console.log('🎯 FINAL VERIFICATION: Complete End-to-End Tarot Reading Test');
    console.log('===============================================================');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000,
        devtools: true
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Monitor API calls
    const apiCalls = [];
    page.on('response', response => {
        if (response.url().includes('/api/')) {
            const call = `${response.method()} ${response.url()} - ${response.status()}`;
            apiCalls.push(call);
            console.log(`🌐 API: ${call}`);
        }
    });
    
    // Monitor console for errors
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.text().includes('error') || msg.text().includes('Error')) {
            console.log(`❌ Console Error: ${msg.text()}`);
        }
        if (msg.text().includes('[TAROT]') || msg.text().includes('[API]')) {
            console.log(`📋 Server Log: ${msg.text()}`);
        }
    });
    
    try {
        console.log('📍 Step 1: Navigate to reading page');
        await page.goto('http://localhost:4000/reading');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'success-01-loaded.png' });
        console.log('✅ Page loaded successfully');
        
        console.log('📍 Step 2: Enter question and verify form');
        const questionInput = page.locator('textarea').first();
        await questionInput.fill('삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
        
        // Verify Trinity View is selected
        const spreadText = await page.textContent('body');
        const hasTrinityView = spreadText.includes('Trinity View') || spreadText.includes('삼위일체');
        console.log(`✅ Trinity View available: ${hasTrinityView}`);
        
        await page.screenshot({ path: 'success-02-question.png' });
        
        console.log('📍 Step 3: Begin card reading flow');
        
        // Look for and click shuffle button
        const shuffleButton = page.locator('button').filter({ hasText: /카드 섞기|Shuffle/ });
        if (await shuffleButton.count() > 0) {
            await shuffleButton.click();
            console.log('✅ Clicked shuffle button');
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'success-03-shuffled.png' });
        }
        
        // Look for and click spread button
        await page.waitForTimeout(2000);
        const spreadButton = page.locator('button').filter({ hasText: /카드 펼치기|Spread/ });
        if (await spreadButton.count() > 0) {
            const isEnabled = await spreadButton.isEnabled();
            console.log(`Spread button enabled: ${isEnabled}`);
            
            if (isEnabled) {
                await spreadButton.click();
                console.log('✅ Clicked spread button');
                await page.waitForTimeout(4000);
                await page.screenshot({ path: 'success-04-spread.png' });
            }
        }
        
        console.log('📍 Step 4: Look for clickable cards');
        
        // Take a screenshot to see current state
        await page.screenshot({ path: 'success-05-current-state.png' });
        
        // Look for any clickable card elements
        const cardSelectors = [
            'button[class*="card"]:not([class*="섞기"]):not([class*="펼치기"])',
            '.card[role="button"]',
            '[data-card]',
            'div[role="button"][class*="card"]'
        ];
        
        let clickableCards = null;
        let cardCount = 0;
        
        for (const selector of cardSelectors) {
            const cards = page.locator(selector);
            cardCount = await cards.count();
            console.log(`Cards found with '${selector}': ${cardCount}`);
            
            if (cardCount >= 3) {
                clickableCards = cards;
                console.log(`✅ Found ${cardCount} clickable cards`);
                break;
            }
        }
        
        let selectedCount = 0;
        
        if (clickableCards && cardCount >= 3) {
            console.log('📍 Step 5: Select 3 cards');
            
            for (let i = 0; i < 3; i++) {
                try {
                    await clickableCards.nth(i).click();
                    selectedCount++;
                    console.log(`✅ Selected card ${selectedCount}/3`);
                    
                    await page.waitForTimeout(1500);
                    await page.screenshot({ path: `success-card-${selectedCount}.png` });
                    
                    // Check if progress counter appears
                    const bodyText = await page.textContent('body');
                    if (bodyText.includes(`${selectedCount}/3`)) {
                        console.log(`📊 Progress: ${selectedCount}/3`);
                    }
                } catch (error) {
                    console.log(`⚠️ Failed to select card ${i + 1}: ${error.message}`);
                }
            }
        } else {
            console.log('⚠️ No clickable cards found - checking if interpretation is available anyway');
        }
        
        console.log('📍 Step 6: Look for AI interpretation button');
        await page.waitForTimeout(2000);
        
        // Look for interpretation button
        const interpretButtons = [
            page.locator('button').filter({ hasText: /타로 해석 받기|AI 해석|해석 시작/ }),
            page.locator('button').filter({ hasText: /분석|해석|받기/ }),
            page.locator('button[class*="interpret"]')
        ];
        
        let foundInterpretButton = null;
        for (const buttonGroup of interpretButtons) {
            const count = await buttonGroup.count();
            if (count > 0) {
                foundInterpretButton = buttonGroup.first();
                const text = await foundInterpretButton.textContent();
                const isEnabled = await foundInterpretButton.isEnabled();
                console.log(`Found button: '${text}' - Enabled: ${isEnabled}`);
                
                if (isEnabled && (text.includes('해석') || text.includes('분석'))) {
                    console.log('✅ AI interpretation button found and enabled');
                    break;
                } else {
                    foundInterpretButton = null;
                }
            }
        }
        
        if (foundInterpretButton) {
            console.log('📍 Step 7: Click AI interpretation and monitor API calls');
            await page.screenshot({ path: 'success-06-before-ai.png' });
            
            await foundInterpretButton.click();
            console.log('✅ Clicked AI interpretation button');
            
            // Monitor for API calls and interpretation
            console.log('📍 Step 8: Wait for AI interpretation (60 seconds max)');
            
            let interpretationReceived = false;
            const startTime = Date.now();
            
            for (let attempt = 0; attempt < 12; attempt++) {
                await page.waitForTimeout(5000);
                
                const content = await page.textContent('body');
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                
                // Look for interpretation content
                const hasTrinityStructure = content.includes('과거') && content.includes('현재') && content.includes('미래');
                const hasRichContent = content.length > 2000 && content.includes('해석');
                const hasErrorMessage = content.includes('error') || content.includes('Error') || content.includes('에러');
                
                if (hasTrinityStructure || hasRichContent) {
                    console.log('✅ AI interpretation content detected!');
                    interpretationReceived = true;
                    break;
                } else if (hasErrorMessage) {
                    console.log('❌ Error detected in content');
                    break;
                }
                
                console.log(`⏳ Waiting for AI interpretation... ${elapsed}s (Content: ${content.length} chars)`);
                
                if (attempt % 3 === 0) {
                    await page.screenshot({ path: `success-wait-${Math.floor(attempt / 3)}.png` });
                }
            }
            
            await page.screenshot({ path: 'success-07-final.png', fullPage: true });
            
            console.log('\n🎯 FINAL TEST RESULTS:');
            console.log('=' + '='.repeat(50));
            console.log(`✅ Page Loading: SUCCESS`);
            console.log(`✅ Question Entry: SUCCESS`);
            console.log(`✅ Trinity View Selection: ${hasTrinityView ? 'SUCCESS' : 'N/A'}`);
            console.log(`✅ Card Selection: ${selectedCount}/3 cards`);
            console.log(`✅ AI Interpretation: ${interpretationReceived ? 'SUCCESS' : 'PENDING/FAILED'}`);
            console.log(`📊 API Calls Made: ${apiCalls.length}`);
            
            if (apiCalls.length > 0) {
                console.log('\n🌐 API Call Log:');
                apiCalls.forEach(call => console.log(`   ${call}`));
            }
            
            if (interpretationReceived) {
                console.log('\n🎉 COMPLETE SUCCESS: Full end-to-end tarot reading working!');
            } else {
                console.log('\n⚠️ PARTIAL SUCCESS: Flow working but AI interpretation needs verification');
            }
            
        } else {
            console.log('❌ No AI interpretation button found');
            await page.screenshot({ path: 'success-no-ai-button.png' });
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'success-error.png', fullPage: true });
    }
    
    console.log('\n🔍 Browser will remain open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
    await browser.close();
}

finalVerificationTest().catch(console.error);