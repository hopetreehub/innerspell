const { chromium } = require('playwright');

async function testAITarotSimple() {
    console.log('🔍 Starting Simple AI Tarot Test...');
    
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
        await page.goto('https://innerspell.vercel.app', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'simple-01-main.png' });
        
        // 2. 페이지 내용 확인
        const title = await page.title();
        console.log('Page title:', title);
        
        // 3. 타로 읽기 링크 찾기
        const tarotLink = await page.locator('a').filter({ hasText: '타로' }).first();
        if (await tarotLink.count() > 0) {
            console.log('2️⃣ Found tarot link, clicking...');
            await tarotLink.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'simple-02-tarot-page.png' });
        } else {
            console.log('2️⃣ No tarot link found, checking page structure...');
            const links = await page.locator('a').all();
            console.log('Available links:', links.length);
            for (let i = 0; i < Math.min(links.length, 5); i++) {
                const text = await links[i].textContent();
                console.log(`Link ${i}: ${text}`);
            }
        }
        
        // 4. 현재 URL 확인
        console.log('Current URL:', page.url());
        
        // 5. getActiveAIModels 에러 특별 확인
        console.log('3️⃣ Checking for getActiveAIModels error...');
        
        // 브라우저 콘솔에서 직접 확인
        const hasGetActiveAIModelsError = await page.evaluate(() => {
            return window.console && window.console._logs ? 
                window.console._logs.some(log => log.includes('getActiveAIModels')) : false;
        });
        
        console.log('Has getActiveAIModels error:', hasGetActiveAIModelsError);
        
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'simple-03-final.png' });
        
        console.log('\n📊 Simple Test Results:');
        console.log('Total errors found:', errors.length);
        errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
        
        // getActiveAIModels 관련 에러 특별 검사
        const getActiveAIModelsErrors = errors.filter(error => 
            error.includes('getActiveAIModels') || 
            error.includes('AI models') ||
            error.includes('AI provider')
        );
        
        console.log('\n🎯 getActiveAIModels related errors:', getActiveAIModelsErrors.length);
        getActiveAIModelsErrors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
        
    } catch (error) {
        console.log('💥 Test Error:', error.message);
        await page.screenshot({ path: 'simple-error.png' });
    } finally {
        await browser.close();
    }
    
    return errors;
}

testAITarotSimple().catch(console.error);