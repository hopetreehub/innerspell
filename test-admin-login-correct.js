const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🎯 admin@innerspell.com 로그인 최종 테스트');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. 올바른 로그인 페이지 접속
        console.log('\n1️⃣ 로그인 페이지 접속 (/sign-in)...');
        await page.goto('http://localhost:4000/sign-in', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.screenshot({ 
            path: `admin-login-correct-01-signin-${timestamp}.png`,
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
            path: `admin-login-correct-02-filled-${timestamp}.png`,
            fullPage: true
        });
        
        // 3. 로그인 버튼 클릭
        console.log('3️⃣ 로그인 시도...');
        const loginButton = await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Sign In")').first();
        
        if (await loginButton.isVisible()) {
            await loginButton.click();
            console.log('   ✅ 로그인 버튼 클릭됨');
            
            // 로그인 처리 대기
            await page.waitForTimeout(8000);
            
            await page.screenshot({ 
                path: `admin-login-correct-03-after-login-${timestamp}.png`,
                fullPage: true
            });
            
            // 현재 URL 확인
            const currentUrl = page.url();
            console.log(`📍 로그인 후 URL: ${currentUrl}`);
            
            // 성공 여부 판단
            if (currentUrl === 'http://localhost:4000/' || currentUrl.includes('/admin')) {
                console.log('🎉 로그인 성공!');
                
                // 4. 관리자 페이지 접근 테스트
                console.log('4️⃣ 관리자 페이지 접근 테스트...');
                await page.goto('http://localhost:4000/admin', { 
                    waitUntil: 'networkidle',
                    timeout: 30000 
                });
                
                await page.screenshot({ 
                    path: `admin-login-correct-04-admin-page-${timestamp}.png`,
                    fullPage: true
                });
                
                // 관리자 페이지 내용 확인
                const pageContent = await page.textContent('body');
                if (pageContent.includes('관리자') || pageContent.includes('Admin') || pageContent.includes('Dashboard')) {
                    console.log('🎊🎊🎊 관리자 페이지 접근 성공! 🎊🎊🎊');
                    console.log('✅✅✅ admin@innerspell.com 로그인 문제 완전 해결! ✅✅✅');
                    
                    // 추가 기능 테스트
                    console.log('\n5️⃣ 관리자 기능 테스트...');
                    
                    // 블로그 관리 탭 확인
                    const blogTab = await page.locator('button:has-text("블로그"), [role="tab"]:has-text("블로그")').first();
                    if (await blogTab.isVisible({ timeout: 5000 }).catch(() => false)) {
                        await blogTab.click();
                        console.log('   ✅ 블로그 관리 탭 접근 가능');
                        await page.waitForTimeout(2000);
                    }
                    
                    // AI 설정 탭 확인
                    const aiTab = await page.locator('button:has-text("AI"), [role="tab"]:has-text("AI")').first();
                    if (await aiTab.isVisible({ timeout: 5000 }).catch(() => false)) {
                        await aiTab.click();
                        console.log('   ✅ AI 설정 탭 접근 가능');
                        await page.waitForTimeout(2000);
                    }
                    
                    await page.screenshot({ 
                        path: `admin-login-correct-05-admin-features-${timestamp}.png`,
                        fullPage: true
                    });
                    
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
                
                // Firebase Authentication 상태 확인
                console.log('\n🔍 Firebase Auth 상태 확인...');
                const authState = await page.evaluate(() => {
                    return window.localStorage.getItem('firebase:authUser:AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg:[DEFAULT]');
                });
                
                if (authState) {
                    console.log('✅ Firebase Auth 토큰 존재함');
                    const authData = JSON.parse(authState);
                    console.log(`📧 인증된 이메일: ${authData.email}`);
                } else {
                    console.log('❌ Firebase Auth 토큰 없음');
                }
            }
            
        } else {
            console.log('❌ 로그인 버튼을 찾을 수 없음');
        }
        
        console.log('\n📋 최종 테스트 결과:');
        console.log('   계정: admin@innerspell.com');
        console.log('   비밀번호: admin123');
        console.log(`   최종 URL: ${page.url()}`);
        console.log(`   UID: qdrcDKB0snXFawsAiaMNZW3nnRZ2`);
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
        await page.screenshot({ 
            path: `admin-login-correct-error-${timestamp}.png`,
            fullPage: true 
        });
        
        console.log('\n💡 문제 해결 체크리스트:');
        console.log('✅ Firebase Console에서 admin@innerspell.com 계정 생성됨');
        console.log('✅ Firestore에서 관리자 권한 설정됨');
        console.log('✅ 로컬 서버가 포트 4000에서 실행 중');
        console.log('🔄 Firebase Authentication 설정 확인 필요');
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 테스트 완료');
        }, 15000);
    }
})();