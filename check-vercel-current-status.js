const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🚀 Vercel 배포 사이트 현재 상태 확인 시작...');
    const timestamp = new Date().toISOString();
    
    try {
        // 1. 홈페이지 확인
        console.log('\n1️⃣ 홈페이지 접속 중...');
        await page.goto('https://test-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: `vercel-current-01-homepage-${timestamp}.png`,
            fullPage: true
        });
        console.log('✅ 홈페이지 로드 완료');
        
        // 2. 타로리딩 페이지 확인
        console.log('\n2️⃣ 타로리딩 페이지로 이동...');
        await page.click('a[href="/reading"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: `vercel-current-02-reading-${timestamp}.png`,
            fullPage: true 
        });
        console.log('✅ 타로리딩 페이지 로드 완료');
        
        // 3. 스프레드 옵션 확인 - 삼위일체 조망 확인
        console.log('\n3️⃣ 스프레드 옵션 확인 중...');
        const spreadSelect = await page.locator('select, button[role="combobox"]').first();
        if (await spreadSelect.isVisible()) {
            await spreadSelect.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ 
                path: `vercel-current-03-spread-options-${timestamp}.png`,
                fullPage: true 
            });
            
            // 삼위일체 조망 옵션 확인
            const trinityOption = await page.locator('text=/삼위일체.*조망/i').isVisible();
            if (trinityOption) {
                console.log('✅ 삼위일체 조망 옵션 확인됨!');
            } else {
                console.log('⚠️  삼위일체 조망 옵션이 보이지 않음');
            }
        }
        
        // 4. 관리자 페이지 접근 시도
        console.log('\n4️⃣ 관리자 페이지 접근 확인...');
        await page.goto('https://test-studio-firebase.vercel.app/admin', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: `vercel-current-04-admin-${timestamp}.png`,
            fullPage: true 
        });
        console.log('✅ 관리자 페이지 상태 확인 완료');
        
        // 5. API 헬스 체크
        console.log('\n5️⃣ API 헬스 체크...');
        const apiResponse = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/health');
                return {
                    status: response.status,
                    data: await response.json()
                };
            } catch (error) {
                return { error: error.message };
            }
        });
        console.log('API 헬스 체크 결과:', JSON.stringify(apiResponse, null, 2));
        
        console.log('\n✅ 모든 확인 완료!');
        console.log(`📸 스크린샷 저장 위치: vercel-current-*-${timestamp}.png`);
        
    } catch (error) {
        console.error('❌ 에러 발생:', error);
        await page.screenshot({ 
            path: `vercel-current-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
})();