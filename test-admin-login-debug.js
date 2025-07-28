const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🔍 admin@innerspell.com 로그인 문제 디버깅 시작');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. 관리자 계정 생성/확인 API 호출 (Vercel에서)
        console.log('\n1️⃣ 관리자 계정 생성/확인 API 호출...');
        
        const createAdminResponse = await page.goto('https://test-studio-firebase-57107w4yv-johns-projects-bf5e60f3.vercel.app/api/create-admin');
        const createAdminStatus = createAdminResponse.status();
        console.log(`📊 관리자 생성 API 상태: ${createAdminStatus}`);
        
        if (createAdminStatus === 200) {
            const createAdminData = await createAdminResponse.json();
            console.log('✅ 관리자 계정 API 응답:', JSON.stringify(createAdminData, null, 2));
        } else {
            console.log(`❌ 관리자 생성 API 실패: ${createAdminStatus}`);
            const errorText = await createAdminResponse.text();
            console.log('에러 내용:', errorText.substring(0, 500));
        }
        
        // 2. 관리자 권한 확인 API 테스트
        console.log('\n2️⃣ 관리자 권한 확인 API 테스트...');
        
        const testAdminResponse = await page.goto('https://test-studio-firebase-57107w4yv-johns-projects-bf5e60f3.vercel.app/api/test-admin?email=admin@innerspell.com');
        const testAdminStatus = testAdminResponse.status();
        console.log(`📊 관리자 권한 확인 API 상태: ${testAdminStatus}`);
        
        if (testAdminStatus === 200) {
            const testAdminData = await testAdminResponse.json();
            console.log('🔍 관리자 권한 확인 결과:', JSON.stringify(testAdminData, null, 2));
        }
        
        // 3. Firebase 설정 상태 확인
        console.log('\n3️⃣ Firebase 상태 확인...');
        
        const firebaseStatusResponse = await page.goto('https://test-studio-firebase-57107w4yv-johns-projects-bf5e60f3.vercel.app/api/debug/firebase-status');
        const firebaseStatus = firebaseStatusResponse.status();
        console.log(`📊 Firebase 상태 API 상태: ${firebaseStatus}`);
        
        if (firebaseStatus === 200) {
            const firebaseData = await firebaseStatusResponse.json();
            console.log('🔥 Firebase 상태:', JSON.stringify(firebaseData, null, 2));
        }
        
        // 4. 실제 로그인 페이지에서 테스트
        console.log('\n4️⃣ 실제 로그인 페이지 테스트...');
        
        await page.goto('https://test-studio-firebase-57107w4yv-johns-projects-bf5e60f3.vercel.app/auth/signin');
        
        await page.screenshot({ 
            path: `admin-login-debug-signin-page-${timestamp}.png`,
            fullPage: true
        });
        
        // 이메일/비밀번호 입력 시도
        const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
        const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
        
        if (await emailInput.isVisible() && await passwordInput.isVisible()) {
            console.log('📝 로그인 폼 발견 - 자격 증명 입력 중...');
            
            await emailInput.fill('admin@innerspell.com');
            await passwordInput.fill('admin123');
            
            await page.screenshot({ 
                path: `admin-login-debug-credentials-filled-${timestamp}.png`,
                fullPage: true
            });
            
            // 로그인 버튼 클릭
            const loginButton = await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Sign In")').first();
            if (await loginButton.isVisible()) {
                console.log('🔘 로그인 버튼 클릭...');
                await loginButton.click();
                
                // 결과 대기
                await page.waitForTimeout(5000);
                
                await page.screenshot({ 
                    path: `admin-login-debug-after-login-${timestamp}.png`,
                    fullPage: true
                });
                
                // 현재 URL 확인
                const currentUrl = page.url();
                console.log(`📍 로그인 후 URL: ${currentUrl}`);
                
                // 에러 메시지 확인
                const errorMessage = await page.locator('.error, .alert-error, [role="alert"]').first().textContent().catch(() => null);
                if (errorMessage) {
                    console.log(`❌ 에러 메시지: ${errorMessage}`);
                } else {
                    console.log('✅ 에러 메시지 없음');
                }
                
                // 관리자 페이지 접근 시도
                console.log('\n5️⃣ 관리자 페이지 접근 시도...');
                await page.goto('https://test-studio-firebase-57107w4yv-johns-projects-bf5e60f3.vercel.app/admin');
                
                await page.screenshot({ 
                    path: `admin-login-debug-admin-page-${timestamp}.png`,
                    fullPage: true
                });
                
                const adminPageContent = await page.textContent('body');
                if (adminPageContent.includes('관리자') || adminPageContent.includes('Admin') || adminPageContent.includes('Dashboard')) {
                    console.log('🎉 관리자 페이지 접근 성공!');
                } else {
                    console.log('❌ 관리자 페이지 접근 실패');
                }
            }
        } else {
            console.log('❌ 로그인 폼을 찾을 수 없음');
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
        await page.screenshot({ 
            path: `admin-login-debug-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 디버깅 완료');
        }, 10000);
    }
})();