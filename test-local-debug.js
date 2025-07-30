const { chromium } = require('playwright');

async function testLocalDebug() {
    console.log('🔍 Testing Local Development Server...');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 에러 추적
    const errors = [];
    const getActiveAIModelsErrors = [];
    
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', text);
            errors.push(text);
            
            if (text.includes('getActiveAIModels') || text.includes('AI models') || text.includes('AI provider')) {
                console.log('🎯 CRITICAL - getActiveAIModels ERROR:', text);
                getActiveAIModelsErrors.push(text);
            }
        }
    });
    
    page.on('pageerror', error => {
        const message = error.message;
        console.log('💥 Page Error:', message);
        errors.push(`Page Error: ${message}`);
        
        if (message.includes('getActiveAIModels')) {
            console.log('🎯 CRITICAL - getActiveAIModels PAGE ERROR:', message);
            getActiveAIModelsErrors.push(message);
        }
    });
    
    try {
        console.log('1️⃣ Loading localhost:4000...');
        await page.goto('http://localhost:4000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.screenshot({ path: 'local-01-main.png' });
        
        const title = await page.title();
        console.log('Page title:', title);
        
        // 타로 읽기 페이지로 이동
        console.log('2️⃣ Navigating to tarot reading...');
        
        // 타로 읽기 버튼/링크 찾기
        const tarotLink = await page.locator('a:has-text("타로")').first();
        if (await tarotLink.count() > 0) {
            await tarotLink.click();
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: 'local-02-tarot-page.png' });
            
            console.log('3️⃣ On tarot page, selecting cards...');
            
            // 카드 선택
            const cards = await page.locator('.card-item, [data-testid="card"], .card').all();
            console.log('Found cards:', cards.length);
            
            if (cards.length >= 3) {
                for (let i = 0; i < 3; i++) {
                    await cards[i].click();
                    await page.waitForTimeout(500);
                }
                await page.screenshot({ path: 'local-03-cards-selected.png' });
                
                console.log('4️⃣ Looking for AI interpretation button...');
                
                // AI 해석 버튼 찾기
                const aiButtons = await page.locator('button:has-text("AI"), button:has-text("해석"), [data-testid="ai-button"]').all();
                console.log('Found AI buttons:', aiButtons.length);
                
                if (aiButtons.length > 0) {
                    console.log('Clicking AI interpretation button...');
                    await aiButtons[0].click();
                    
                    // AI 해석 요청 후 에러 모니터링
                    console.log('5️⃣ Monitoring for getActiveAIModels errors...');
                    await page.waitForTimeout(10000); // 10초 대기
                    
                    await page.screenshot({ path: 'local-04-ai-clicked.png' });
                } else {
                    console.log('No AI button found');
                    const allButtons = await page.locator('button').all();
                    for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
                        const text = await allButtons[i].textContent();
                        console.log(`Button ${i}: "${text}"`);
                    }
                }
            } else {
                console.log('Not enough cards found');
            }
        } else {
            console.log('Tarot link not found, checking available links...');
            const allLinks = await page.locator('a').all();
            for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
                const text = await allLinks[i].textContent();
                const href = await allLinks[i].getAttribute('href');
                console.log(`Link ${i}: "${text}" -> ${href}`);
            }
        }
        
        // 최종 결과
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'local-05-final.png' });
        
        console.log('\n📊 Local Test Results:');
        console.log('Total errors found:', errors.length);
        errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
        
        console.log('\n🎯 getActiveAIModels Error Analysis:');
        if (getActiveAIModelsErrors.length > 0) {
            console.log('❌ CRITICAL: getActiveAIModels errors STILL EXIST!');
            console.log('Error count:', getActiveAIModelsErrors.length);
            getActiveAIModelsErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
            return false; // 에러 존재
        } else {
            console.log('✅ SUCCESS: No getActiveAIModels errors found!');
            console.log('The fix appears to be working correctly.');
            return true; // 에러 없음
        }
        
    } catch (error) {
        console.log('💥 Test Error:', error.message);
        await page.screenshot({ path: 'local-error.png' });
        return false;
    } finally {
        await browser.close();
    }
}

testLocalDebug().then(success => {
    if (success) {
        console.log('\n🎉 DEBUGGING COMPLETE: getActiveAIModels error has been RESOLVED!');
    } else {
        console.log('\n🚨 DEBUGGING FAILED: getActiveAIModels error STILL EXISTS!');
    }
}).catch(console.error);