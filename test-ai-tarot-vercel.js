const { chromium } = require('playwright');

async function testAITarotOnVercel() {
    console.log('🎯 Testing AI Tarot on Vercel Deployment');
    console.log('📅 Date:', new Date().toISOString());
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 에러 모니터링
    const errors = [];
    let getActiveAIModelsError = false;
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            console.log('❌ Console Error:', text);
            errors.push(text);
            
            if (text.includes('getActiveAIModels')) {
                getActiveAIModelsError = true;
                console.log('🚨 CRITICAL: getActiveAIModels error detected!');
            }
        }
    });
    
    try {
        // Step 1: 메인 페이지 로드
        console.log('\n1️⃣ Loading Vercel deployment...');
        await page.goto('https://test-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.screenshot({ path: 'ai-test-01-main.png' });
        console.log('✅ Main page loaded');
        
        // Step 2: 타로 읽기 페이지로 이동
        console.log('\n2️⃣ Navigating to tarot reading...');
        await page.click('a[href="/reading"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'ai-test-02-reading.png' });
        console.log('✅ Tarot reading page loaded');
        
        // Step 3: 카드 선택 (3장)
        console.log('\n3️⃣ Selecting tarot cards...');
        const cards = page.locator('[class*="card"], .card-container > div').filter({ hasNotText: 'AI' });
        const cardCount = await cards.count();
        console.log(`Found ${cardCount} cards`);
        
        if (cardCount >= 3) {
            // 첫 3장 선택
            for (let i = 0; i < 3; i++) {
                await cards.nth(i).click();
                console.log(`Selected card ${i + 1}`);
                await page.waitForTimeout(500);
            }
        } else {
            // 클릭 가능한 요소 찾기
            const clickables = await page.locator('[onclick], [data-card], .clickable').all();
            console.log(`Found ${clickables.length} clickable elements`);
            for (let i = 0; i < Math.min(3, clickables.length); i++) {
                await clickables[i].click();
                await page.waitForTimeout(500);
            }
        }
        
        await page.screenshot({ path: 'ai-test-03-cards-selected.png' });
        
        // Step 4: AI 해석 버튼 찾기 및 클릭
        console.log('\n4️⃣ Looking for AI interpretation button...');
        
        // 다양한 선택자로 AI 버튼 찾기
        const aiButtonSelectors = [
            'button:has-text("AI")',
            'button:has-text("해석")',
            'button:has-text("인공지능")',
            '[class*="ai-button"]',
            '[data-testid*="ai"]'
        ];
        
        let aiButton = null;
        for (const selector of aiButtonSelectors) {
            const found = page.locator(selector).first();
            if (await found.count() > 0) {
                aiButton = found;
                console.log(`Found AI button with selector: ${selector}`);
                break;
            }
        }
        
        if (aiButton) {
            const buttonText = await aiButton.textContent();
            console.log(`AI Button text: "${buttonText}"`);
            
            await aiButton.click();
            console.log('✅ Clicked AI interpretation button');
            
            // AI 응답 대기
            console.log('Waiting for AI response...');
            await page.waitForTimeout(10000); // 10초 대기
            
            await page.screenshot({ path: 'ai-test-04-ai-response.png' });
            
            // AI 응답 확인
            const aiContent = await page.locator('[class*="ai"], [class*="interpretation"], [data-ai-content]').textContent().catch(() => null);
            if (aiContent) {
                console.log('✅ AI interpretation received!');
                console.log('Response preview:', aiContent.substring(0, 200) + '...');
            } else {
                console.log('⚠️ No AI response content found');
            }
        } else {
            console.log('❌ AI button not found');
            
            // 모든 버튼 리스트
            const allButtons = await page.locator('button').all();
            console.log(`\nAll buttons on page (${allButtons.length}):`);
            for (let i = 0; i < Math.min(10, allButtons.length); i++) {
                const text = await allButtons[i].textContent();
                console.log(`  ${i + 1}. "${text}"`);
            }
        }
        
        // Step 5: 최종 결과
        console.log('\n📊 TEST RESULTS:');
        console.log('================');
        console.log('Total errors:', errors.length);
        console.log('getActiveAIModels error:', getActiveAIModelsError ? '❌ YES' : '✅ NO');
        
        if (errors.length > 0) {
            console.log('\nError details:');
            errors.forEach((err, i) => {
                console.log(`${i + 1}. ${err}`);
            });
        }
        
    } catch (error) {
        console.log('💥 Test failed:', error.message);
        await page.screenshot({ path: 'ai-test-error.png' });
    } finally {
        await browser.close();
        console.log('\n✅ Test completed');
    }
}

testAITarotOnVercel().catch(console.error);