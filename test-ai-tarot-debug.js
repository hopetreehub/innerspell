const { chromium } = require('playwright');

async function testAITarotDebug() {
    console.log('🔍 Starting AI Tarot Debug Test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 에러 모니터링
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', msg.text());
            errors.push(msg.text());
        }
    });
    
    page.on('pageerror', error => {
        console.log('💥 Page Error:', error.message);
        errors.push(`Page Error: ${error.message}`);
    });
    
    try {
        // 1. 메인 페이지 접속
        console.log('1️⃣ Loading main page...');
        await page.goto('https://innerspell.vercel.app', { waitUntil: 'networkidle' });
        await page.screenshot({ path: 'debug-01-main.png' });
        
        // 2. 타로 읽기 페이지로 이동
        console.log('2️⃣ Navigating to tarot reading...');
        await page.click('text=타로 읽기');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'debug-02-tarot-page.png' });
        
        // 3. 카드 3장 선택
        console.log('3️⃣ Selecting 3 cards...');
        const cards = await page.locator('.card-item').all();
        if (cards.length >= 3) {
            await cards[0].click();
            await page.waitForTimeout(500);
            await cards[1].click();
            await page.waitForTimeout(500);
            await cards[2].click();
            await page.waitForTimeout(500);
        }
        await page.screenshot({ path: 'debug-03-cards-selected.png' });
        
        // 4. AI 해석 버튼 클릭
        console.log('4️⃣ Clicking AI interpretation button...');
        const aiButton = page.locator('text=AI 해석 받기');
        await aiButton.click();
        
        // 5. 에러 발생 대기 및 모니터링
        console.log('5️⃣ Monitoring for errors...');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'debug-04-after-ai-click.png' });
        
        // 6. 네트워크 요청 확인
        console.log('6️⃣ Checking network requests...');
        const requests = [];
        page.on('request', request => {
            if (request.url().includes('api/')) {
                requests.push({
                    url: request.url(),
                    method: request.method()
                });
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('api/') && response.status() >= 400) {
                console.log('❌ API Error:', response.status(), response.url());
                errors.push(`API Error: ${response.status()} ${response.url()}`);
            }
        });
        
        // 추가 대기
        await page.waitForTimeout(10000);
        await page.screenshot({ path: 'debug-05-final.png' });
        
        console.log('\n📊 Debug Results:');
        console.log('Errors found:', errors.length);
        errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
        
        console.log('\nAPI Requests:', requests.length);
        requests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.method} ${req.url}`);
        });
        
    } catch (error) {
        console.log('💥 Test Error:', error.message);
        await page.screenshot({ path: 'debug-error.png' });
    } finally {
        await browser.close();
    }
    
    return errors;
}

testAITarotDebug().catch(console.error);