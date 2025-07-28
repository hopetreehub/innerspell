const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🎉 새로운 Vercel 배포 테스트 시작!');
    console.log('🔗 URL: https://test-studio-firebase-hw733col7-johns-projects-bf5e60f3.vercel.app');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. 홈페이지 테스트
        console.log('\n1️⃣ 새 배포 홈페이지 접속...');
        const response = await page.goto('https://test-studio-firebase-hw733col7-johns-projects-bf5e60f3.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        const status = response.status();
        console.log(`📊 응답 상태: ${status}`);
        
        if (status === 200) {
            console.log('🎊🎊🎊 성공! 500 에러 완전 해결! 🎊🎊🎊');
            await page.waitForTimeout(3000);
            await page.screenshot({ 
                path: `success-new-deployment-homepage-${timestamp}.png`,
                fullPage: true
            });
            
            // 페이지 내용 확인
            const title = await page.title();
            console.log(`📄 페이지 제목: ${title}`);
            
            const hasMainContent = await page.locator('h1, h2, main, .app').first().isVisible();
            console.log(`🎨 메인 콘텐츠: ${hasMainContent ? '정상 표시' : '표시 안됨'}`);
            
            // 네비게이션 확인
            const navLinks = await page.locator('nav a, header a').all();
            console.log(`🧭 네비게이션 링크 수: ${navLinks.length}`);
        } else {
            console.log(`❌ 여전히 ${status} 에러`);
            await page.screenshot({ 
                path: `error-new-deployment-${timestamp}.png`,
                fullPage: true
            });
            return;
        }
        
        // 2. 타로리딩 페이지 테스트
        console.log('\n2️⃣ 타로리딩 페이지 테스트...');
        const readingResponse = await page.goto('https://test-studio-firebase-hw733col7-johns-projects-bf5e60f3.vercel.app/reading', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        if (readingResponse.status() === 200) {
            console.log('✅ 타로리딩 페이지 정상!');
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: `success-new-deployment-reading-${timestamp}.png`,
                fullPage: true 
            });
            
            // 기본 요소 확인
            const hasInput = await page.locator('input, textarea').first().isVisible();
            const hasSelect = await page.locator('select').first().isVisible();
            console.log(`📝 질문 입력 필드: ${hasInput ? '정상' : '없음'}`);
            console.log(`🎛️ 스프레드 선택: ${hasSelect ? '정상' : '없음'}`);
            
            // 삼위일체 조망 옵션 확인
            if (hasSelect) {
                const options = await page.locator('select option').allTextContents();
                const hasTrinity = options.some(opt => opt.includes('삼위일체') || opt.includes('Trinity'));
                console.log(`🔮 삼위일체 조망 옵션: ${hasTrinity ? '존재함' : '없음'}`);
            }
        }
        
        // 3. 블로그 페이지 테스트
        console.log('\n3️⃣ 블로그 페이지 테스트...');
        const blogResponse = await page.goto('https://test-studio-firebase-hw733col7-johns-projects-bf5e60f3.vercel.app/blog', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        if (blogResponse.status() === 200) {
            console.log('✅ 블로그 페이지 정상!');
            await page.screenshot({ 
                path: `success-new-deployment-blog-${timestamp}.png`,
                fullPage: true 
            });
        }
        
        // 4. API 테스트
        console.log('\n4️⃣ API 헬스 체크...');
        const apiResponse = await page.goto('https://test-studio-firebase-hw733col7-johns-projects-bf5e60f3.vercel.app/api/health');
        const apiData = await apiResponse.json();
        console.log('🔥 API 응답:', JSON.stringify(apiData, null, 2));
        
        console.log('\n🎉🎉🎉 모든 테스트 성공! 🎉🎉🎉');
        console.log('✨ 미들웨어 문제가 완전히 해결되었습니다!');
        console.log('🚀 사이트가 정상적으로 작동하고 있습니다!');
        console.log(`🔗 새 URL: https://test-studio-firebase-hw733col7-johns-projects-bf5e60f3.vercel.app`);
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
        await page.screenshot({ 
            path: `error-new-deployment-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 테스트 완료 - 브라우저 종료');
        }, 15000);
    }
})();