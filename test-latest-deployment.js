const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🔍 최신 배포 검사!');
    console.log('🔗 URL: https://test-studio-firebase-fweo3nfnz-johns-projects-bf5e60f3.vercel.app');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 홈페이지 테스트
        console.log('\n🏠 홈페이지 접속 시도...');
        const response = await page.goto('https://test-studio-firebase-fweo3nfnz-johns-projects-bf5e60f3.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        const status = response.status();
        console.log(`📊 HTTP 상태: ${status}`);
        
        if (status === 401) {
            console.log('🔒 401 Unauthorized 에러 발생');
            console.log('📸 에러 페이지 스크린샷 촬영...');
            
            await page.screenshot({ 
                path: `error-401-latest-${timestamp}.png`,
                fullPage: true
            });
            
            // 페이지 내용 확인
            const bodyText = await page.textContent('body');
            console.log('📄 에러 페이지 내용:');
            console.log(bodyText.substring(0, 500) + '...');
            
            // 헤더 정보 확인
            const headers = response.headers();
            console.log('\n🔍 응답 헤더:');
            Object.entries(headers).forEach(([key, value]) => {
                if (key.includes('vercel') || key.includes('auth') || key.includes('set-cookie')) {
                    console.log(`  ${key}: ${value}`);
                }
            });
            
        } else if (status === 200) {
            console.log('🎉 성공! 사이트가 정상 작동합니다!');
            await page.screenshot({ 
                path: `success-latest-${timestamp}.png`,
                fullPage: true
            });
        } else {
            console.log(`⚠️ 예상치 못한 상태: ${status}`);
            await page.screenshot({ 
                path: `status-${status}-latest-${timestamp}.png`,
                fullPage: true
            });
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
        await page.screenshot({ 
            path: `test-error-latest-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 테스트 완료');
        }, 15000);
    }
})();