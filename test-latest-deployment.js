const { chromium } = require('playwright');

async function testLatestDeployment() {
    console.log('🔍 Testing Latest Successful Deployment...');
    
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
    const getActiveAIModelsErrors = [];
    
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', text);
            errors.push(text);
            
            // getActiveAIModels 관련 에러 특별 추적
            if (text.includes('getActiveAIModels')) {
                console.log('🎯 FOUND getActiveAIModels ERROR:', text);
                getActiveAIModelsErrors.push(text);
            }
        }
    });
    
    page.on('pageerror', error => {
        const message = error.message;
        console.log('💥 Page Error:', message);
        errors.push(`Page Error: ${message}`);
        
        if (message.includes('getActiveAIModels')) {
            console.log('🎯 FOUND getActiveAIModels PAGE ERROR:', message);
            getActiveAIModelsErrors.push(message);
        }
    });
    
    // 네트워크 에러 모니터링
    page.on('response', response => {
        if (response.status() >= 400) {
            const error = `Network Error: ${response.status()} ${response.url()}`;
            console.log('🌐', error);
            errors.push(error);
        }
    });
    
    try {
        // 최근 성공한 배포 URL 사용
        const deploymentUrl = 'https://test-studio-firebase-dqvy87e81-johns-projects-bf5e60f3.vercel.app';
        
        console.log('1️⃣ Loading deployment:', deploymentUrl);
        await page.goto(deploymentUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'deploy-01-main.png' });
        
        const title = await page.title();
        console.log('Page title:', title);
        console.log('Current URL:', page.url());
        
        // 타로 읽기 찾기 및 클릭
        console.log('2️⃣ Looking for tarot reading link...');
        
        // 다양한 방법으로 타로 링크 찾기
        let tarotFound = false;
        
        // 방법 1: 텍스트로 찾기
        const tarotByText = page.locator('a:has-text("타로")');
        if (await tarotByText.count() > 0) {
            console.log('Found tarot link by text');
            await tarotByText.first().click();
            tarotFound = true;
        } else {
            // 방법 2: href로 찾기
            const tarotByHref = page.locator('a[href*="reading"]');
            if (await tarotByHref.count() > 0) {
                console.log('Found tarot link by href');
                await tarotByHref.first().click();
                tarotFound = true;
            } else {
                // 방법 3: 모든 링크 확인
                console.log('Checking all available links...');
                const allLinks = await page.locator('a').all();
                for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
                    const text = await allLinks[i].textContent();
                    const href = await allLinks[i].getAttribute('href');
                    console.log(`Link ${i}: "${text}" -> ${href}`);
                    
                    if (text && (text.includes('타로') || text.includes('읽기') || text.includes('reading'))) {
                        console.log('Found tarot link:', text);
                        await allLinks[i].click();
                        tarotFound = true;
                        break;
                    }
                }
            }
        }
        
        if (tarotFound) {
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'deploy-02-tarot-page.png' });
            
            // AI 해석 버튼 찾기
            console.log('3️⃣ Looking for AI interpretation...');
            
            const aiButton = page.locator('button:has-text("AI")');
            if (await aiButton.count() > 0) {
                console.log('Found AI button, clicking...');
                await aiButton.click();
                await page.waitForTimeout(5000);
                await page.screenshot({ path: 'deploy-03-ai-clicked.png' });
            } else {
                console.log('No AI button found, checking available buttons...');
                const buttons = await page.locator('button').all();
                for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                    const text = await buttons[i].textContent();
                    console.log(`Button ${i}: "${text}"`);
                }
            }
        } else {
            console.log('No tarot link found');
        }
        
        // 최종 대기 및 에러 수집
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'deploy-04-final.png' });
        
        console.log('\n📊 Deployment Test Results:');
        console.log('Total errors found:', errors.length);
        errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
        
        console.log('\n🎯 getActiveAIModels Errors:', getActiveAIModelsErrors.length);
        if (getActiveAIModelsErrors.length > 0) {
            console.log('❌ CRITICAL: getActiveAIModels errors still exist!');
            getActiveAIModelsErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        } else {
            console.log('✅ No getActiveAIModels errors found!');
        }
        
    } catch (error) {
        console.log('💥 Test Error:', error.message);
        await page.screenshot({ path: 'deploy-error.png' });
    } finally {
        await browser.close();
    }
    
    return { totalErrors: errors.length, getActiveAIModelsErrors };
}

testLatestDeployment().catch(console.error);