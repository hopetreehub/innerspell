const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🔥 Firebase Console을 통한 관리자 계정 생성');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        console.log('\n📋 단계별 가이드:');
        console.log('1. Firebase Authentication 페이지로 이동');
        console.log('2. "사용자 추가" 버튼 클릭');
        console.log('3. admin@innerspell.com / admin123 입력');
        console.log('4. 사용자 UID 복사');
        console.log('5. setup-admin-role.js 실행');
        
        // Firebase Authentication 페이지 접속
        console.log('\n🔗 Firebase Authentication 페이지 접속...');
        await page.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/users', {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        await page.screenshot({ 
            path: `firebase-console-01-auth-page-${timestamp}.png`,
            fullPage: true
        });
        
        // 로그인 필요 여부 확인
        const needsAuth = await page.locator('input[type="email"], button:has-text("Sign in")').first().isVisible().catch(() => false);
        
        if (needsAuth) {
            console.log('🔐 Google 계정 로그인이 필요합니다');
            console.log('   브라우저에서 Firebase Console에 로그인해주세요');
            
            // 로그인 완료까지 대기
            console.log('⏳ 로그인 완료까지 60초 대기...');
            await page.waitForTimeout(60000);
            
            await page.screenshot({ 
                path: `firebase-console-02-after-login-${timestamp}.png`,
                fullPage: true
            });
        }
        
        // "사용자 추가" 버튼 찾기
        console.log('\n👤 사용자 추가 버튼 찾는 중...');
        
        const addUserButton = page.locator('button:has-text("사용자 추가"), button:has-text("Add user"), [data-testid="add-user"]');
        
        if (await addUserButton.first().isVisible({ timeout: 10000 }).catch(() => false)) {
            console.log('✅ 사용자 추가 버튼 발견');
            await addUserButton.first().click();
            
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: `firebase-console-03-add-user-dialog-${timestamp}.png`,
                fullPage: true
            });
            
            // 이메일 입력
            const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
            if (await emailField.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                await emailField.first().fill('admin@innerspell.com');
                console.log('📧 이메일 입력: admin@innerspell.com');
            }
            
            // 비밀번호 입력
            const passwordField = page.locator('input[type="password"], input[name="password"], input[placeholder*="password"]');
            if (await passwordField.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                await passwordField.first().fill('admin123');
                console.log('🔐 비밀번호 입력: admin123');
            }
            
            await page.screenshot({ 
                path: `firebase-console-04-form-filled-${timestamp}.png`,
                fullPage: true
            });
            
            // 사용자 추가 확인 버튼
            const confirmButton = page.locator('button:has-text("추가"), button:has-text("Add"), button[type="submit"]');
            if (await confirmButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                await confirmButton.first().click();
                console.log('✅ 사용자 추가 버튼 클릭');
                
                await page.waitForTimeout(3000);
                await page.screenshot({ 
                    path: `firebase-console-05-user-created-${timestamp}.png`,
                    fullPage: true
                });
                
                console.log('\n🎉 관리자 계정 생성 완료!');
                console.log('📋 다음 단계:');
                console.log('1. 생성된 사용자의 UID 복사');
                console.log('2. node setup-admin-role.js [UID] 실행');
                console.log('3. node test-admin-login-manual.js 실행하여 테스트');
            }
            
        } else {
            console.log('⚠️ 사용자 추가 버튼을 찾을 수 없습니다');
            console.log('💡 브라우저에서 수동으로 진행해주세요:');
            console.log('   1. 현재 페이지에서 "사용자 추가" 또는 "Add user" 버튼 클릭');
            console.log('   2. Email: admin@innerspell.com');
            console.log('   3. Password: admin123');
            console.log('   4. 사용자 추가 완료');
        }
        
        console.log('\n📞 도움말:');
        console.log('- Firebase Console 페이지가 열려있습니다');
        console.log('- 수동으로 admin@innerspell.com 계정을 생성해주세요');
        console.log('- 생성 후 이 창을 닫고 setup-admin-role.js를 실행하세요');
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        await page.screenshot({ 
            path: `firebase-console-error-${timestamp}.png`,
            fullPage: true 
        });
        
        console.log('\n🔄 수동 진행 방법:');
        console.log('1. https://console.firebase.google.com/project/innerspell-an7ce/authentication/users');
        console.log('2. Google 계정으로 로그인');
        console.log('3. "사용자 추가" 버튼 클릭');
        console.log('4. Email: admin@innerspell.com, Password: admin123');
        console.log('5. 생성된 UID로 setup-admin-role.js 실행');
    } finally {
        console.log('\n⏳ 작업 완료를 위해 2분간 브라우저를 열어둡니다...');
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 브라우저 종료');
        }, 120000); // 2분
    }
})();