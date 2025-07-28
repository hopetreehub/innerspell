const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🛠️ Firebase Console 수동 관리자 계정 생성 가이드');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. Firebase Authentication 사용자 페이지로 직접 이동
        console.log('\n1️⃣ Firebase Authentication 사용자 페이지 접속...');
        await page.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/users', {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        await page.screenshot({ 
            path: `manual-admin-01-users-page-${timestamp}.png`,
            fullPage: true
        });
        
        console.log('⏳ Firebase Console 로그인 대기 중...');
        await page.waitForTimeout(10000);
        
        // 2. 설정 확인을 위해 Sign-in method로 이동
        console.log('\n2️⃣ Sign-in method 설정 확인...');
        await page.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/providers', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.screenshot({ 
            path: `manual-admin-02-signin-methods-${timestamp}.png`,
            fullPage: true
        });
        
        // 이메일/비밀번호 활성화 상태 확인
        const emailPasswordEnabled = await page.locator('text="Email/Password"').isVisible({ timeout: 10000 }).catch(() => false);
        
        if (emailPasswordEnabled) {
            console.log('✅ 이메일/비밀번호 제공자 발견됨');
            
            // 활성화 버튼 클릭 시도
            const configureButton = page.locator('button:has-text("Configure"), button:has-text("설정"), [aria-label*="Email"]');
            if (await configureButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                console.log('🔧 이메일/비밀번호 설정 확인...');
                await configureButton.first().click();
                await page.waitForTimeout(3000);
                
                await page.screenshot({ 
                    path: `manual-admin-03-email-config-${timestamp}.png`,
                    fullPage: true
                });
                
                // Enable 체크박스 확인
                const enableCheckbox = page.locator('input[type="checkbox"]').first();
                if (await enableCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
                    const isChecked = await enableCheckbox.isChecked();
                    if (!isChecked) {
                        await enableCheckbox.check();
                        console.log('✅ 이메일/비밀번호 로그인 활성화');
                        
                        // Save 버튼 클릭
                        const saveButton = page.locator('button:has-text("Save"), button:has-text("저장")');
                        if (await saveButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                            await saveButton.first().click();
                            console.log('✅ 설정 저장됨');
                            await page.waitForTimeout(3000);
                        }
                    } else {
                        console.log('✅ 이메일/비밀번호 로그인이 이미 활성화됨');
                    }
                }
            }
        }
        
        // 3. 다시 사용자 페이지로 이동하여 계정 생성
        console.log('\n3️⃣ 사용자 페이지로 돌아가서 계정 생성...');
        await page.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/users', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(5000);
        
        await page.screenshot({ 
            path: `manual-admin-04-back-to-users-${timestamp}.png`,
            fullPage: true
        });
        
        console.log('\n🎯 수동 계정 생성 안내:');
        console.log('=====================================');
        console.log('1. "Add user" 또는 "사용자 추가" 버튼을 클릭하세요');
        console.log('2. 이메일: admin@innerspell.com');
        console.log('3. 비밀번호: admin123');
        console.log('4. "Add user" 버튼을 클릭하여 계정을 생성하세요');
        console.log('5. 생성된 계정의 UID를 복사하세요');
        console.log('=====================================');
        
        // UI 요소들을 강조 표시하기 위한 JavaScript 실행
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                if (button.innerText.includes('Add user') || 
                    button.innerText.includes('사용자 추가') ||
                    button.innerText.includes('Add User')) {
                    button.style.border = '3px solid red';
                    button.style.backgroundColor = 'yellow';
                    button.scrollIntoView();
                }
            });
        });
        
        await page.screenshot({ 
            path: `manual-admin-05-highlighted-${timestamp}.png`,
            fullPage: true
        });
        
        console.log('\n⏳ Firebase Console이 열려있습니다');
        console.log('📋 위 안내에 따라 수동으로 계정을 생성하세요');
        console.log('🆔 계정 생성 후 UID를 알려주시면 권한 설정을 완료하겠습니다');
        
        // 4. 로컬 테스트 준비
        console.log('\n4️⃣ 로컬 서버 확인...');
        const testPage = await context.newPage();
        
        try {
            await testPage.goto('http://localhost:4000/sign-in', {
                waitUntil: 'networkidle',
                timeout: 10000
            });
            
            console.log('✅ 로컬 서버 (포트 4000) 정상 작동 중');
            
            await testPage.screenshot({ 
                path: `manual-admin-06-local-signin-${timestamp}.png`,
                fullPage: true
            });
            
        } catch (error) {
            console.log('⚠️ 로컬 서버 확인 실패 - 서버가 실행 중인지 확인하세요');
        } finally {
            await testPage.close();
        }
        
    } catch (error) {
        console.error('❌ Firebase Console 접속 중 오류:', error.message);
        await page.screenshot({ 
            path: `manual-admin-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        console.log('\n⏳ Firebase Console을 5분간 열어둡니다...');
        console.log('🔧 수동으로 계정을 생성한 후 UID를 알려주세요');
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 브라우저 종료');
        }, 300000); // 5분
    }
})();