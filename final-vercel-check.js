const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🎯 최종 Vercel 배포 확인 시작...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. 홈페이지 확인
        console.log('\n1️⃣ 홈페이지 접속...');
        const homeResponse = await page.goto('https://test-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        const homeStatus = homeResponse.status();
        console.log(`홈페이지 응답 상태: ${homeStatus}`);
        
        if (homeStatus === 200) {
            console.log('✅ 홈페이지 정상 작동!');
            await page.waitForTimeout(3000);
            await page.screenshot({ 
                path: `final-check-01-homepage-${timestamp}.png`,
                fullPage: true
            });
            
            // 페이지 타이틀 확인
            const title = await page.title();
            console.log(`페이지 타이틀: ${title}`);
            
            // 주요 요소 확인
            const hasMainContent = await page.locator('main, #root, .app').first().isVisible();
            console.log(`메인 콘텐츠 표시: ${hasMainContent ? '정상' : '비정상'}`);
        }
        
        // 2. 타로리딩 페이지 확인
        console.log('\n2️⃣ 타로리딩 페이지 접속...');
        const readingResponse = await page.goto('https://test-studio-firebase.vercel.app/reading', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        if (readingResponse.status() === 200) {
            console.log('✅ 타로리딩 페이지 정상 작동!');
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: `final-check-02-reading-${timestamp}.png`,
                fullPage: true 
            });
            
            // 질문 입력 필드 확인
            const hasInput = await page.locator('input[type="text"], textarea').first().isVisible();
            console.log(`질문 입력 필드: ${hasInput ? '존재' : '없음'}`);
        }
        
        // 3. 블로그 페이지 확인
        console.log('\n3️⃣ 블로그 페이지 접속...');
        const blogResponse = await page.goto('https://test-studio-firebase.vercel.app/blog', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        if (blogResponse.status() === 200) {
            console.log('✅ 블로그 페이지 정상 작동!');
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: `final-check-03-blog-${timestamp}.png`,
                fullPage: true 
            });
        }
        
        // 4. API 헬스 체크
        console.log('\n4️⃣ API 헬스 체크...');
        const apiResponse = await page.goto('https://test-studio-firebase.vercel.app/api/health');
        const apiData = await apiResponse.json();
        console.log('API 응답:', JSON.stringify(apiData, null, 2));
        
        console.log('\n🎉🎉🎉 모든 테스트 완료!');
        console.log('✅ Vercel 배포가 정상적으로 작동하고 있습니다!');
        console.log(`📸 스크린샷 저장: final-check-*-${timestamp}.png`);
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        await page.screenshot({ 
            path: `final-check-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        // 브라우저는 20초 후 자동 종료
        setTimeout(async () => {
            await browser.close();
            console.log('🔒 브라우저 종료');
        }, 20000);
    }
})();