const { chromium } = require('playwright');

async function quickCheck() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🔍 SWARM PM 빠른 상태 확인 시작');
        
        // 1. 홈페이지 확인
        console.log('📍 홈페이지 로딩 중...');
        await page.goto('http://localhost:4000', { 
            waitUntil: 'domcontentloaded',
            timeout: 45000 
        });
        
        await page.waitForTimeout(5000);
        await page.screenshot({ 
            path: `swarm-pm-homepage-${Date.now()}.png`, 
            fullPage: true 
        });
        console.log('✅ 홈페이지 스크린샷 촬영 완료');
        
        // 2. 블로그 페이지 확인
        console.log('📍 블로그 페이지 이동...');
        await page.goto('http://localhost:4000/blog', { 
            waitUntil: 'domcontentloaded',
            timeout: 45000 
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: `swarm-pm-blog-${Date.now()}.png`, 
            fullPage: true 
        });
        console.log('✅ 블로그 페이지 스크린샷 촬영 완료');
        
        // 3. 관리자 페이지 확인
        console.log('📍 관리자 페이지 이동...');
        await page.goto('http://localhost:4000/admin', { 
            waitUntil: 'domcontentloaded',
            timeout: 45000 
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: `swarm-pm-admin-${Date.now()}.png`, 
            fullPage: true 
        });
        console.log('✅ 관리자 페이지 스크린샷 촬영 완료');
        
        console.log('🎉 빠른 확인 완료!');
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        await page.screenshot({ 
            path: `swarm-pm-error-${Date.now()}.png`, 
            fullPage: true 
        });
        
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

quickCheck()
    .then(result => {
        console.log('결과:', result);
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('실행 오류:', error);
        process.exit(1);
    });