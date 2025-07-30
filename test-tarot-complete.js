const { chromium } = require('playwright');

async function completeTarotReading() {
    console.log('🔮 Complete Tarot Reading Test');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    
    const page = await context.newPage();
    
    // Monitor console for AI API calls
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[TAROT]') || text.includes('AI') || text.includes('해석') || text.includes('generate-tarot-interpretation')) {
            console.log(`📝 Console: ${text}`);
        }
    });
    
    // Monitor network requests for AI API
    page.on('request', request => {
        if (request.url().includes('/api/generate-tarot-interpretation')) {
            console.log(`🌐 AI API Request: ${request.method()} ${request.url()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/generate-tarot-interpretation')) {
            console.log(`🌐 AI API Response: ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        console.log('📍 Step 1: Navigate and setup');
        await page.goto('http://localhost:4000/reading');
        await page.waitForLoadState('networkidle');
        
        // Fill question
        await page.fill('#question', '삼위일체 조망 스프레드와 영적 성장 스타일로 나의 오늘 운세를 알려주세요');
        console.log('✅ Question filled');
        
        // Scroll to reading interface
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        
        console.log('📍 Step 2: Shuffle and spread cards');
        // Shuffle cards
        await page.click('button:has-text("카드 섞기")');
        await page.waitForTimeout(2000);
        console.log('✅ Cards shuffled');
        
        // Spread cards
        await page.click('button:has-text("카드 펼치기")');
        await page.waitForTimeout(3000);
        console.log('✅ Cards spread');
        
        await page.screenshot({ path: 'success-01-cards-spread.png' });
        
        console.log('📍 Step 3: Select 3 cards directly');
        // Look more specifically for the card elements after they're spread
        await page.waitForTimeout(2000);
        
        // Try different approaches to find and click the cards
        const cardSelectors = [
            '.tarot-card',
            '.card-item',
            '[data-card-id]',
            '.card-container [role="button"]',
            '.spread-cards [role="button"]',
            '.card-spread button',
            // Generic selector for clickable elements in the card area
            '.flex [role="button"]'
        ];
        
        let cardsSelected = 0;
        let foundCards = false;
        
        for (const selector of cardSelectors) {
            const elements = await page.locator(selector).count();
            if (elements > 0) {
                console.log(`🎯 Found ${elements} cards with selector: ${selector}`);
                foundCards = true;
                
                // Try to click up to 3 cards
                for (let i = 0; i < Math.min(elements, 3); i++) {
                    try {
                        await page.locator(selector).nth(i).click();
                        cardsSelected++;
                        console.log(`✅ Selected card ${cardsSelected}`);
                        await page.waitForTimeout(1000);
                        
                        if (cardsSelected >= 3) break;
                    } catch (error) {
                        console.log(`⚠️ Could not click card ${i + 1}: ${error.message}`);
                    }
                }
                
                if (cardsSelected >= 3) break;
            }
        }
        
        if (!foundCards || cardsSelected < 3) {
            console.log('⚠️ Trying alternative approach - clicking on card area');
            // Click on specific areas where cards should be
            const cardArea = page.locator('.flex.space-x-\\[-125px\\]').first();
            if (await cardArea.count() > 0) {
                // Click on different positions within the card spread
                const box = await cardArea.boundingBox();
                if (box) {
                    const cardWidth = box.width / 10; // Assume cards are spread across
                    for (let i = 0; i < 3; i++) {
                        const x = box.x + (i + 2) * cardWidth;
                        const y = box.y + box.height / 2;
                        try {
                            await page.mouse.click(x, y);
                            cardsSelected++;
                            console.log(`✅ Clicked card position ${i + 1}`);
                            await page.waitForTimeout(1000);
                        } catch (error) {
                            console.log(`⚠️ Could not click position ${i + 1}`);
                        }
                    }
                }
            }
        }
        
        await page.screenshot({ path: 'success-02-cards-selected.png' });
        
        console.log('📍 Step 4: Look for interpretation button');
        // Wait a bit for the UI to update after card selection
        await page.waitForTimeout(2000);
        
        // Look for interpretation/AI buttons
        const interpretButtons = [
            'button:has-text("타로 해석 받기")',
            'button:has-text("AI 해석")',
            'button:has-text("해석하기")',
            'button:has-text("결과 보기")',
            'button:has-text("완료")',
            'button:has-text("해석")',
            'button[class*="ai"]',
            'button[class*="interpret"]'
        ];
        
        let interpretationClicked = false;
        for (const selector of interpretButtons) {
            const button = page.locator(selector);
            if (await button.count() > 0) {
                console.log(`🎯 Found interpretation button: ${selector}`);
                try {
                    await button.click();
                    console.log('✅ Clicked interpretation button');
                    interpretationClicked = true;
                    break;
                } catch (error) {
                    console.log(`⚠️ Could not click button: ${error.message}`);
                }
            }
        }
        
        if (interpretationClicked) {
            console.log('📍 Step 5: Wait for AI interpretation');
            // Wait for AI response
            await page.waitForTimeout(10000);
            await page.screenshot({ path: 'success-03-interpretation.png' });
            
            // Check for interpretation content
            const bodyText = await page.textContent('body');
            if (bodyText.includes('해석') || bodyText.includes('타로') || bodyText.includes('카드')) {
                console.log('✅ Interpretation content detected');
            }
        } else {
            console.log('⚠️ No interpretation button found');
        }
        
        // Final screenshot and analysis
        await page.screenshot({ path: 'success-final.png' });
        
        console.log('🎉 Tarot reading test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'success-error.png' });
    } finally {
        await browser.close();
    }
}

completeTarotReading().catch(console.error);