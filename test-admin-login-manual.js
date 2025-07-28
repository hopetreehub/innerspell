const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🔍 수동 생성된 관리자 계정 로그인 테스트');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. 로그인 페이지 접속
        console.log('\n1️⃣ 로그인 페이지 접속...');
        await page.goto('http://localhost:4000/auth/signin', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.screenshot({ 
            path: `manual-admin-login-01-signin-${timestamp}.png`,
            fullPage: true
        });
        
        // 2. 관리자 계정 정보 입력
        console.log('2️⃣ 관리자 계정 정보 입력...');
        
        // 이메일 입력
        const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
        if (await emailInput.isVisible()) {
            await emailInput.fill('admin@innerspell.com');
            console.log('   ✅ 이메일 입력: admin@innerspell.com');
        }
        
        // 비밀번호 입력
        const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
        if (await passwordInput.isVisible()) {
            await passwordInput.fill('admin123');
            console.log('   ✅ 비밀번호 입력: admin123');
        }
        
        await page.screenshot({ 
            path: `manual-admin-login-02-filled-${timestamp}.png`,
            fullPage: true
        });
        
        // 3. 로그인 버튼 클릭
        console.log('3️⃣ 로그인 시도...');
        const loginButton = await page.locator('button[type="submit"], button:has-text("로그인")').first();
        
        if (await loginButton.isVisible()) {
            await loginButton.click();
            console.log('   ✅ 로그인 버튼 클릭됨');
            
            // 로그인 처리 대기
            await page.waitForTimeout(5000);
            
            await page.screenshot({ 
                path: `manual-admin-login-03-after-login-${timestamp}.png`,
                fullPage: true
            });
            
            // 현재 URL 확인
            const currentUrl = page.url();
            console.log(`📍 로그인 후 URL: ${currentUrl}`);
            
            // 성공 여부 판단
            if (currentUrl.includes('/admin') || currentUrl === 'http://localhost:4000/') {
                console.log('🎉 로그인 성공!');
                
                // 4. 관리자 페이지 접근 테스트
                console.log('4️⃣ 관리자 페이지 접근 테스트...');
                await page.goto('http://localhost:4000/admin', { 
                    waitUntil: 'networkidle',
                    timeout: 30000 
                });
                
                await page.screenshot({ 
                    path: `manual-admin-login-04-admin-page-${timestamp}.png`,
                    fullPage: true
                });
                
                // 관리자 페이지 내용 확인
                const pageContent = await page.textContent('body');
                if (pageContent.includes('관리자') || pageContent.includes('Admin') || pageContent.includes('Dashboard')) {
                    console.log('🎊 관리자 페이지 접근 성공!');
                    console.log('✅ admin@innerspell.com 로그인 문제 완전 해결!');
                } else {
                    console.log('⚠️ 관리자 페이지 접근됨, 하지만 콘텐츠 확인 필요');
                }
                
            } else {
                console.log('❌ 로그인 실패 - 페이지 리디렉션 안됨');
                
                // 에러 메시지 확인
                const errorElements = await page.locator('.error, .alert-error, [role="alert"]').all();
                for (const element of errorElements) {
                    const errorText = await element.textContent();
                    if (errorText) {
                        console.log(`⚠️ 에러 메시지: ${errorText}`);
                    }
                }
            }
            
        } else {
            console.log('❌ 로그인 버튼을 찾을 수 없음');
        }
        
        console.log('\n📋 테스트 결과 요약:');
        console.log('   계정: admin@innerspell.com');
        console.log('   비밀번호: admin123');
        console.log(`   최종 URL: ${page.url()}`);
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
        await page.screenshot({ 
            path: `manual-admin-login-error-${timestamp}.png`,
            fullPage: true 
        });
        
        console.log('\n💡 문제 해결 방법:');
        console.log('1. Firebase Console에서 admin@innerspell.com 계정 생성 확인');
        console.log('2. 계정 생성 후 setup-admin-role.js 실행');
        console.log('3. 로컬 서버가 포트 4000에서 실행 중인지 확인');
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 테스트 완료');
        }, 10000);
    }
})();