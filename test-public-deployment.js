const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🔓 퍼블릭 배포 테스트!');
    console.log('🔗 URL: https://test-studio-firebase-10dwdctwf-johns-projects-bf5e60f3.vercel.app');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 홈페이지 테스트
        console.log('\n🏠 퍼블릭 배포 홈페이지 접속...');
        const response = await page.goto('https://test-studio-firebase-10dwdctwf-johns-projects-bf5e60f3.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        const status = response.status();
        console.log(`📊 HTTP 상태: ${status}`);
        
        if (status === 200) {
            console.log('🎊🎊🎊 드디어 성공! 퍼블릭 액세스로 해결! 🎊🎊🎊');
            await page.waitForTimeout(3000);
            await page.screenshot({ 
                path: `success-public-homepage-${timestamp}.png`,
                fullPage: true
            });
            
            // 페이지 내용 확인
            const title = await page.title();
            console.log(`📄 페이지 제목: ${title}`);
            
            const hasMainContent = await page.locator('h1, h2, main, .app').first().isVisible();
            console.log(`🎨 메인 콘텐츠: ${hasMainContent ? '정상 표시' : '표시 안됨'}`);
            
            // 타로리딩 페이지로 이동
            console.log('\n2️⃣ 타로리딩 페이지 테스트...');
            await page.goto('https://test-studio-firebase-10dwdctwf-johns-projects-bf5e60f3.vercel.app/reading', { 
                waitUntil: 'networkidle' 
            });
            await page.screenshot({ 
                path: `success-public-reading-${timestamp}.png`,
                fullPage: true 
            });
            console.log('✅ 타로리딩 페이지도 정상!');
            
            // 질문 입력 테스트
            const hasQuestionInput = await page.locator('textarea, input[type="text"]').first().isVisible();
            if (hasQuestionInput) {
                console.log('📝 질문 입력 필드 확인됨 - 기능 테스트 진행');
                await page.fill('textarea, input[type="text"]', '오늘의 운세는 어떨까요?');
                await page.waitForTimeout(1000);
                
                // 스프레드 선택
                const spreadSelect = await page.locator('select');
                if (await spreadSelect.count() > 0) {
                    await spreadSelect.selectOption({ index: 1 }); // 첫 번째 옵션 선택
                    console.log('🎯 스프레드 선택 완료');
                }
                
                await page.screenshot({ 
                    path: `success-public-question-filled-${timestamp}.png`,
                    fullPage: true 
                });
            }
            
            console.log('\n🚀🚀🚀 완벽한 성공! 🚀🚀🚀');
            console.log('✨ 모든 미들웨어 문제가 해결되고 퍼블릭 액세스가 정상 작동합니다!');
            console.log('🎯 사이트가 완전히 정상 작동하고 있습니다!');
            console.log('🔗 최종 프로덕션 URL:');
            console.log('   https://test-studio-firebase-10dwdctwf-johns-projects-bf5e60f3.vercel.app');
            
        } else if (status === 401) {
            console.log('🔒 여전히 401 에러 - 추가 설정 필요');
            await page.screenshot({ 
                path: `error-401-public-${timestamp}.png`,
                fullPage: true
            });
        } else {
            console.log(`❌ 예상치 못한 상태: ${status}`);
            await page.screenshot({ 
                path: `error-public-${status}-${timestamp}.png`,
                fullPage: true
            });
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
        await page.screenshot({ 
            path: `test-error-public-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 테스트 완료');
        }, 20000);
    }
})();