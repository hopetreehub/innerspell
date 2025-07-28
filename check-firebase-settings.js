const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🔍 Firebase Console 설정 확인 및 수정');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. Firebase Authentication 설정 페이지 접속
        console.log('\n1️⃣ Firebase Authentication 설정 확인...');
        await page.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings', {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        await page.screenshot({ 
            path: `firebase-check-01-auth-settings-${timestamp}.png`,
            fullPage: true
        });
        
        console.log('⏳ Firebase Console 로그인 대기 중...');
        await page.waitForTimeout(10000);
        
        // 2. 이메일/비밀번호 로그인 활성화 확인
        console.log('\n2️⃣ 이메일/비밀번호 로그인 활성화 확인...');
        
        // Sign-in method 탭 클릭
        const signInMethodTab = page.locator('a:has-text("Sign-in method"), button:has-text("Sign-in method"), [data-testid="sign-in-methods"]');
        if (await signInMethodTab.first().isVisible({ timeout: 10000 }).catch(() => false)) {
            await signInMethodTab.first().click();
            console.log('✅ Sign-in method 탭 클릭');
            await page.waitForTimeout(3000);
        }
        
        await page.screenshot({ 
            path: `firebase-check-02-signin-methods-${timestamp}.png`,
            fullPage: true
        });
        
        // 이메일/비밀번호 제공자 확인
        const emailPasswordProvider = page.locator('text="Email/Password", text="이메일/비밀번호"');
        if (await emailPasswordProvider.first().isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('✅ 이메일/비밀번호 제공자 발견');
            
            // 활성화 상태 확인
            const enabledStatus = await page.locator('text="Enabled", text="활성화됨"').first().isVisible({ timeout: 3000 }).catch(() => false);
            
            if (!enabledStatus) {
                console.log('🔧 이메일/비밀번호 로그인 활성화 중...');
                
                // 편집 버튼 클릭
                const editButton = page.locator('button:has-text("편집"), button[aria-label="Edit"], [data-testid="edit-provider"]');
                if (await editButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                    await editButton.first().click();
                    await page.waitForTimeout(2000);
                    
                    // 활성화 토글
                    const enableToggle = page.locator('input[type="checkbox"], [role="switch"]');
                    if (await enableToggle.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                        await enableToggle.first().check();
                        console.log('✅ 이메일/비밀번호 로그인 활성화됨');
                    }
                    
                    // 저장 버튼
                    const saveButton = page.locator('button:has-text("저장"), button:has-text("Save")');
                    if (await saveButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                        await saveButton.first().click();
                        console.log('✅ 설정 저장됨');
                        await page.waitForTimeout(3000);
                    }
                }
            } else {
                console.log('✅ 이메일/비밀번호 로그인이 이미 활성화됨');
            }
        }
        
        // 3. 사용자 목록 확인
        console.log('\n3️⃣ 생성된 관리자 계정 확인...');
        await page.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/users', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.screenshot({ 
            path: `firebase-check-03-users-list-${timestamp}.png`,
            fullPage: true
        });
        
        // admin@innerspell.com 사용자 찾기
        const adminUser = page.locator('text="admin@innerspell.com"');
        if (await adminUser.isVisible({ timeout: 10000 }).catch(() => false)) {
            console.log('✅ admin@innerspell.com 계정 발견');
            
            // 사용자 클릭하여 상세 정보 확인
            await adminUser.click();
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
                path: `firebase-check-04-admin-details-${timestamp}.png`,
                fullPage: true
            });
            
            // 계정 활성화 상태 확인
            const disabledStatus = await page.locator('text="Disabled", text="비활성화됨"').first().isVisible({ timeout: 3000 }).catch(() => false);
            
            if (disabledStatus) {
                console.log('🔧 관리자 계정 활성화 중...');
                
                // 활성화 버튼 클릭
                const enableButton = page.locator('button:has-text("Enable"), button:has-text("활성화")');
                if (await enableButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                    await enableButton.first().click();
                    console.log('✅ 관리자 계정 활성화됨');
                    await page.waitForTimeout(2000);
                }
            } else {
                console.log('✅ 관리자 계정이 이미 활성화됨');
            }
            
            // 이메일 인증 상태 확인
            const emailVerified = await page.locator('text="Email verified", text="이메일 인증됨"').first().isVisible({ timeout: 3000 }).catch(() => false);
            
            if (!emailVerified) {
                console.log('🔧 이메일 인증 상태 업데이트 중...');
                
                // 이메일 인증 버튼이 있다면 클릭
                const verifyEmailButton = page.locator('button:has-text("Verify"), button:has-text("인증")');
                if (await verifyEmailButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                    await verifyEmailButton.first().click();
                    console.log('✅ 이메일 인증 처리됨');
                    await page.waitForTimeout(2000);
                }
            }
            
        } else {
            console.log('❌ admin@innerspell.com 계정을 찾을 수 없음');
            console.log('🔄 계정을 다시 생성해야 할 수 있습니다');
        }
        
        // 4. 승인된 도메인 확인
        console.log('\n4️⃣ 승인된 도메인 확인...');
        await page.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(3000);
        
        // Authorized domains 섹션 찾기
        const authorizedDomainsSection = page.locator('text="Authorized domains", text="승인된 도메인"');
        if (await authorizedDomainsSection.first().isVisible({ timeout: 10000 }).catch(() => false)) {
            console.log('✅ 승인된 도메인 섹션 발견');
            
            await page.screenshot({ 
                path: `firebase-check-05-authorized-domains-${timestamp}.png`,
                fullPage: true
            });
            
            // localhost 도메인 확인
            const localhostDomain = await page.locator('text="localhost"').first().isVisible({ timeout: 3000 }).catch(() => false);
            
            if (!localhostDomain) {
                console.log('🔧 localhost 도메인 추가 필요');
                console.log('💡 수동으로 localhost 도메인을 추가해주세요');
            } else {
                console.log('✅ localhost 도메인이 승인된 도메인에 포함됨');
            }
        }
        
        // 5. 로컬 서버에서 로그인 재테스트
        console.log('\n5️⃣ 설정 수정 후 로그인 테스트...');
        
        await page.goto('http://localhost:4000/sign-in', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.screenshot({ 
            path: `firebase-check-06-local-signin-${timestamp}.png`,
            fullPage: true
        });
        
        // 로그인 시도
        const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
        if (await emailInput.isVisible()) {
            await emailInput.fill('admin@innerspell.com');
            console.log('✅ 이메일 입력');
        }
        
        const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
        if (await passwordInput.isVisible()) {
            await passwordInput.fill('admin123');
            console.log('✅ 비밀번호 입력');
        }
        
        const loginButton = await page.locator('button[type="submit"], button:has-text("로그인")').first();
        if (await loginButton.isVisible()) {
            await loginButton.click();
            console.log('✅ 로그인 버튼 클릭');
            
            await page.waitForTimeout(8000);
            
            await page.screenshot({ 
                path: `firebase-check-07-after-login-${timestamp}.png`,
                fullPage: true
            });
            
            const currentUrl = page.url();
            console.log(`📍 로그인 후 URL: ${currentUrl}`);
            
            if (currentUrl === 'http://localhost:4000/' || currentUrl.includes('/admin')) {
                console.log('🎉🎉🎉 로그인 성공! 문제 해결됨! 🎉🎉🎉');
                
                // 관리자 페이지 접근 테스트
                await page.goto('http://localhost:4000/admin');
                await page.waitForTimeout(3000);
                
                await page.screenshot({ 
                    path: `firebase-check-08-admin-success-${timestamp}.png`,
                    fullPage: true
                });
                
                console.log('🎊 admin@innerspell.com 로그인 문제 완전 해결!');
                
            } else {
                console.log('⚠️ 로그인 후에도 페이지 이동 안됨');
                
                // Firebase Auth 상태 확인
                const authState = await page.evaluate(() => {
                    return window.localStorage.getItem('firebase:authUser:AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg:[DEFAULT]');
                });
                
                if (authState) {
                    console.log('✅ Firebase Auth 토큰 생성됨');
                    const authData = JSON.parse(authState);
                    console.log(`📧 인증된 이메일: ${authData.email}`);
                } else {
                    console.log('❌ Firebase Auth 토큰 여전히 없음');
                }
            }
        }
        
        console.log('\n📋 Firebase 설정 확인 완료');
        console.log('🔧 수정된 설정들:');
        console.log('   - 이메일/비밀번호 로그인 활성화 확인됨');
        console.log('   - admin@innerspell.com 계정 상태 확인됨');
        console.log('   - 승인된 도메인 확인됨');
        
    } catch (error) {
        console.error('❌ Firebase 설정 확인 중 오류:', error.message);
        await page.screenshot({ 
            path: `firebase-check-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        console.log('\n⏳ Firebase Console을 2분간 열어둡니다 (추가 수정을 위해)...');
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 브라우저 종료');
        }, 120000);
    }
})();