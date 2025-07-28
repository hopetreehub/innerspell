const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🔍 Firebase Auth 디버깅 - 상세 분석');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. 로그인 페이지 접속
        console.log('\n1️⃣ 로그인 페이지 접속...');
        await page.goto('http://localhost:4000/sign-in', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // 콘솔 메시지 수집
        page.on('console', (msg) => {
            if (msg.text().includes('🔥') || msg.text().includes('Firebase') || msg.text().includes('Auth')) {
                console.log(`BROWSER: ${msg.text()}`);
            }
        });
        
        // 네트워크 요청 모니터링
        page.on('request', (request) => {
            if (request.url().includes('firebase') || request.url().includes('googleapis')) {
                console.log(`REQUEST: ${request.method()} ${request.url()}`);
            }
        });
        
        page.on('response', (response) => {
            if (response.url().includes('firebase') || response.url().includes('googleapis')) {
                console.log(`RESPONSE: ${response.status()} ${response.url()}`);
            }
        });
        
        await page.screenshot({ 
            path: `debug-auth-01-signin-page-${timestamp}.png`,
            fullPage: true
        });
        
        // 2. Firebase 설정 확인
        console.log('\n2️⃣ Firebase 클라이언트 설정 확인...');
        const firebaseConfig = await page.evaluate(() => {
            return {
                hasAuth: !!window.firebase?.auth,
                config: {
                    apiKey: window.process?.env?.NEXT_PUBLIC_FIREBASE_API_KEY || 'undefined',
                    authDomain: window.process?.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'undefined',
                    projectId: window.process?.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'undefined'
                },
                localStorage: Object.keys(localStorage).filter(key => key.includes('firebase')),
                authState: localStorage.getItem('firebase:authUser:AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg:[DEFAULT]')
            };
        });
        
        console.log('Firebase 설정 상태:', firebaseConfig);
        
        // 3. 로그인 시도
        console.log('\n3️⃣ 관리자 로그인 시도...');
        
        const emailInput = await page.locator('input[type="email"]').first();
        const passwordInput = await page.locator('input[type="password"]').first();
        const loginButton = await page.locator('button[type="submit"]').first();
        
        if (await emailInput.isVisible()) {
            await emailInput.fill('admin@innerspell.com');
            console.log('✅ 이메일 입력');
        }
        
        if (await passwordInput.isVisible()) {
            await passwordInput.fill('admin123');
            console.log('✅ 비밀번호 입력');
        }
        
        await page.screenshot({ 
            path: `debug-auth-02-form-filled-${timestamp}.png`,
            fullPage: true
        });
        
        // 로그인 버튼 클릭 전 Firebase 상태 확인
        const preLoginState = await page.evaluate(() => {
            return {
                authUser: localStorage.getItem('firebase:authUser:AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg:[DEFAULT]'),
                allLocalStorage: Object.fromEntries(Object.entries(localStorage))
            };
        });
        console.log('로그인 전 상태:', preLoginState);
        
        if (await loginButton.isVisible()) {
            console.log('🔄 로그인 버튼 클릭...');
            await loginButton.click();
            
            // 로그인 과정 모니터링
            console.log('⏳ Firebase Auth 응답 대기 중...');
            await page.waitForTimeout(10000);
            
            await page.screenshot({ 
                path: `debug-auth-03-after-login-${timestamp}.png`,
                fullPage: true
            });
            
            // 로그인 후 상태 확인
            const postLoginState = await page.evaluate(() => {
                return {
                    currentUrl: window.location.href,
                    authUser: localStorage.getItem('firebase:authUser:AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg:[DEFAULT]'),
                    allFirebaseKeys: Object.keys(localStorage).filter(key => key.includes('firebase')),
                    allLocalStorage: Object.fromEntries(Object.entries(localStorage))
                };
            });
            
            console.log('\n📊 로그인 후 상태 분석:');
            console.log('현재 URL:', postLoginState.currentUrl);
            console.log('Firebase Auth 토큰:', postLoginState.authUser ? '존재함' : '없음');
            console.log('Firebase localStorage 키들:', postLoginState.allFirebaseKeys);
            
            if (postLoginState.authUser) {
                try {
                    const authData = JSON.parse(postLoginState.authUser);
                    console.log('🎉 인증 성공!');
                    console.log('사용자 이메일:', authData.email);
                    console.log('사용자 UID:', authData.uid);
                } catch (e) {
                    console.log('⚠️ Firebase Auth 데이터 파싱 실패');
                }
            } else {
                console.log('❌ Firebase Auth 토큰 없음 - 로그인 실패');
            }
            
            // 4. 에러 메시지 확인
            console.log('\n4️⃣ 에러 메시지 확인...');
            const errorElements = await page.locator('.text-destructive, [role="alert"], .error').all();
            
            for (const element of errorElements) {
                const errorText = await element.textContent();
                if (errorText && errorText.trim()) {
                    console.log('🚨 페이지 에러:', errorText);
                }
            }
            
            // 5. 개발자 도구 콘솔 에러 확인
            console.log('\n5️⃣ JavaScript 에러 확인...');
            const jsErrors = [];
            page.on('pageerror', (error) => {
                jsErrors.push(error.message);
                console.log('🚨 JavaScript 에러:', error.message);
            });
            
            // 6. Firebase 연결 테스트
            console.log('\n6️⃣ Firebase 연결 직접 테스트...');
            const firebaseTest = await page.evaluate(async () => {
                try {
                    // Firebase SDK가 로드되었는지 확인
                    if (typeof window.firebase === 'undefined') {
                        return { success: false, error: 'Firebase SDK not loaded' };
                    }
                    
                    // Auth 인스턴스 확인
                    const authInstance = window.firebase.auth?.();
                    if (!authInstance) {
                        return { success: false, error: 'Firebase Auth not initialized' };
                    }
                    
                    return { 
                        success: true, 
                        authReady: true,
                        currentUser: authInstance.currentUser ? {
                            email: authInstance.currentUser.email,
                            uid: authInstance.currentUser.uid
                        } : null
                    };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });
            
            console.log('Firebase 연결 테스트 결과:', firebaseTest);
            
            // 7. 최종 상태 스크린샷
            await page.screenshot({ 
                path: `debug-auth-04-final-state-${timestamp}.png`,
                fullPage: true
            });
            
        } else {
            console.log('❌ 로그인 버튼을 찾을 수 없음');
        }
        
        console.log('\n📋 Firebase Auth 디버깅 완료');
        console.log('🔧 결과 요약:');
        console.log('   - 로그인 페이지 접근: ✅');
        console.log('   - Firebase 설정: 확인 필요');
        console.log('   - 로그인 시도: 완료');
        console.log('   - Auth 토큰 생성: 확인 필요');
        
    } catch (error) {
        console.error('❌ 디버깅 중 오류:', error.message);
        await page.screenshot({ 
            path: `debug-auth-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        console.log('\n⏳ 브라우저를 3분간 열어둡니다...');
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 디버깅 완료');
        }, 180000);
    }
})();