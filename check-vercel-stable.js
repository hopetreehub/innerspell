const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🚀 Vercel 배포 사이트 안정적 확인 시작...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. 홈페이지 확인
        console.log('\n1️⃣ 홈페이지 접속 중...');
        await page.goto('https://test-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        await page.waitForTimeout(5000);  // 충분한 대기 시간
        await page.screenshot({ 
            path: `vercel-stable-01-homepage-${timestamp}.png`,
            fullPage: true
        });
        console.log('✅ 홈페이지 로드 완료');
        
        // 네비게이션 메뉴 확인
        const navLinks = await page.locator('nav a, header a').all();
        console.log(`✅ 네비게이션 링크 개수: ${navLinks.length}`);
        
        // 2. 타로리딩 페이지 직접 URL로 이동
        console.log('\n2️⃣ 타로리딩 페이지로 직접 이동...');
        await page.goto('https://test-studio-firebase.vercel.app/reading', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: `vercel-stable-02-reading-${timestamp}.png`,
            fullPage: true 
        });
        console.log('✅ 타로리딩 페이지 로드 완료');
        
        // 3. 질문 입력 및 스프레드 확인
        console.log('\n3️⃣ 질문 입력 중...');
        const questionInput = await page.locator('input[type="text"], textarea').first();
        if (await questionInput.isVisible()) {
            await questionInput.fill('오늘의 운세를 알려주세요');
            await page.screenshot({ 
                path: `vercel-stable-03-question-${timestamp}.png`,
                fullPage: true 
            });
            console.log('✅ 질문 입력 완료');
        }
        
        // 4. 스프레드 옵션 확인
        console.log('\n4️⃣ 스프레드 옵션 확인 중...');
        // 여러 가능한 셀렉터 시도
        const selectorsToTry = [
            'select',
            'button[role="combobox"]',
            '[data-testid*="spread"]',
            'div[role="listbox"]'
        ];
        
        for (const selector of selectorsToTry) {
            const element = await page.locator(selector).first();
            if (await element.isVisible()) {
                console.log(`✅ 스프레드 셀렉터 찾음: ${selector}`);
                await element.click();
                await page.waitForTimeout(1500);
                await page.screenshot({ 
                    path: `vercel-stable-04-spread-options-${timestamp}.png`,
                    fullPage: true 
                });
                break;
            }
        }
        
        // 5. 블로그 페이지 확인
        console.log('\n5️⃣ 블로그 페이지 확인...');
        await page.goto('https://test-studio-firebase.vercel.app/blog', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: `vercel-stable-05-blog-${timestamp}.png`,
            fullPage: true 
        });
        console.log('✅ 블로그 페이지 확인 완료');
        
        // 6. 모바일 뷰 확인
        console.log('\n6️⃣ 모바일 뷰 확인...');
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('https://test-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle' 
        });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: `vercel-stable-06-mobile-${timestamp}.png`,
            fullPage: true 
        });
        console.log('✅ 모바일 뷰 확인 완료');
        
        // 7. API 상태 확인
        console.log('\n7️⃣ API 상태 확인...');
        await page.goto('https://test-studio-firebase.vercel.app/api/health');
        await page.waitForTimeout(1000);
        const apiContent = await page.textContent('body');
        console.log('API 응답:', apiContent);
        
        console.log('\n✅ 모든 확인 완료!');
        console.log(`📸 스크린샷 저장 위치: vercel-stable-*-${timestamp}.png`);
        
    } catch (error) {
        console.error('❌ 에러 발생:', error);
        await page.screenshot({ 
            path: `vercel-stable-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        // 브라우저는 열어둔 채로 유지 (30초 후 자동 종료)
        setTimeout(async () => {
            await browser.close();
            console.log('🔒 브라우저 종료됨');
        }, 30000);
    }
})();