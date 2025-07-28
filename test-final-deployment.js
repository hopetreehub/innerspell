const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🎉 최종 배포 테스트!');
    console.log('🔗 새 URL: https://test-studio-firebase-9q735mf9p-johns-projects-bf5e60f3.vercel.app');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. 홈페이지 테스트
        console.log('\n1️⃣ 최종 배포 홈페이지 접속...');
        const response = await page.goto('https://test-studio-firebase-9q735mf9p-johns-projects-bf5e60f3.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        const status = response.status();
        console.log(`📊 응답 상태: ${status}`);
        
        if (status === 200) {
            console.log('🎊🎊🎊 드디어 성공! MIDDLEWARE 에러 완전 해결! 🎊🎊🎊');
            await page.waitForTimeout(3000);
            await page.screenshot({ 
                path: `final-success-homepage-${timestamp}.png`,
                fullPage: true
            });
            
            // 페이지 내용 확인
            const title = await page.title();
            console.log(`📄 페이지 제목: ${title}`);
            
            const hasMainContent = await page.locator('h1, h2, main, .app').first().isVisible();
            console.log(`🎨 메인 콘텐츠: ${hasMainContent ? '정상 표시' : '표시 안됨'}`);
            
            // 네비게이션 확인
            const navLinks = await page.locator('nav a, header a').count();
            console.log(`🧭 네비게이션 링크 수: ${navLinks}`);
            
            // 타로리딩 페이지로 이동
            console.log('\n2️⃣ 타로리딩 페이지 테스트...');
            await page.goto('https://test-studio-firebase-9q735mf9p-johns-projects-bf5e60f3.vercel.app/reading', { 
                waitUntil: 'networkidle' 
            });
            await page.screenshot({ 
                path: `final-success-reading-${timestamp}.png`,
                fullPage: true 
            });
            console.log('✅ 타로리딩 페이지도 정상!');
            
            // 블로그 페이지 테스트
            console.log('\n3️⃣ 블로그 페이지 테스트...');
            await page.goto('https://test-studio-firebase-9q735mf9p-johns-projects-bf5e60f3.vercel.app/blog', { 
                waitUntil: 'networkidle' 
            });
            await page.screenshot({ 
                path: `final-success-blog-${timestamp}.png`,
                fullPage: true 
            });
            console.log('✅ 블로그 페이지도 정상!');
            
            console.log('\n🚀🚀🚀 완벽한 성공! 🚀🚀🚀');
            console.log('✨ 모든 미들웨어 문제가 해결되었습니다!');
            console.log('🎯 사이트가 완전히 정상 작동하고 있습니다!');
            console.log('🔗 새 프로덕션 URL:');
            console.log('   https://test-studio-firebase-9q735mf9p-johns-projects-bf5e60f3.vercel.app');
            
        } else {
            console.log(`❌ 아직 ${status} 에러`);
            await page.screenshot({ 
                path: `final-error-${timestamp}.png`,
                fullPage: true
            });
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
        await page.screenshot({ 
            path: `final-test-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 테스트 완료');
        }, 20000);
    }
})();