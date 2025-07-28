const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🎯 최종 admin@innerspell.com 로그인 확인 - 크로미움 직접 테스트');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. Vercel 배포 사이트 접속
        console.log('\n1️⃣ Vercel 배포 사이트 접속...');
        const vercelUrl = 'https://test-studio-firebase.vercel.app';
        console.log(`🌐 접속 URL: ${vercelUrl}/sign-in`);
        
        await page.goto(`${vercelUrl}/sign-in`, { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        await page.screenshot({ 
            path: `final-verification-01-signin-page-${timestamp}.png`,
            fullPage: true
        });
        
        console.log('✅ 로그인 페이지 로드 완료');
        
        // 콘솔 메시지 모니터링
        page.on('console', (msg) => {
            const text = msg.text();
            if (text.includes('🔥') || text.includes('🎉') || text.includes('Firebase') || text.includes('Auth') || text.includes('admin')) {
                console.log(`BROWSER: ${text}`);
            }
        });
        
        // 네트워크 요청 모니터링
        page.on('response', (response) => {
            if (response.url().includes('firebase') || response.url().includes('googleapis')) {
                console.log(`API: ${response.status()} ${response.url()}`);
            }
        });
        
        // 2. 페이지 로딩 대기 및 폼 요소 확인
        console.log('\n2️⃣ 폼 요소 확인 및 관리자 정보 입력...');
        await page.waitForTimeout(3000);
        
        // 이메일 입력 필드 찾기
        const emailSelectors = [
            'input[type="email"]',
            'input[name="email"]',
            'input[placeholder*="email" i]',
            'input[placeholder*="이메일"]'
        ];
        
        let emailInput = null;
        for (const selector of emailSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
                emailInput = element;
                console.log(`✅ 이메일 입력 필드 발견: ${selector}`);
                break;
            }
        }
        
        if (emailInput) {
            await emailInput.clear();
            await emailInput.fill('admin@innerspell.com');
            console.log('📧 이메일 입력: admin@innerspell.com');
        } else {
            console.log('❌ 이메일 입력 필드를 찾을 수 없음');
            return;
        }
        
        // 비밀번호 입력 필드 찾기
        const passwordSelectors = [
            'input[type="password"]',
            'input[name="password"]',
            'input[placeholder*="password" i]',
            'input[placeholder*="비밀번호"]'
        ];
        
        let passwordInput = null;
        for (const selector of passwordSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
                passwordInput = element;
                console.log(`✅ 비밀번호 입력 필드 발견: ${selector}`);
                break;
            }
        }
        
        if (passwordInput) {
            await passwordInput.clear();
            await passwordInput.fill('admin123');
            console.log('🔐 비밀번호 입력: admin123');
        } else {
            console.log('❌ 비밀번호 입력 필드를 찾을 수 없음');
            return;
        }
        
        await page.screenshot({ 
            path: `final-verification-02-form-filled-${timestamp}.png`,
            fullPage: true
        });
        
        // 3. 로그인 버튼 클릭
        console.log('\n3️⃣ 로그인 시도...');
        
        const loginSelectors = [
            'button[type="submit"]',
            'button:has-text("로그인")',
            'button:has-text("Sign In")',
            '[data-testid="login-button"]'
        ];
        
        let loginButton = null;
        for (const selector of loginSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
                loginButton = element;
                console.log(`✅ 로그인 버튼 발견: ${selector}`);
                break;
            }
        }
        
        if (loginButton) {
            console.log('🔄 로그인 버튼 클릭...');
            await loginButton.click();
            
            // 로그인 처리 대기
            console.log('⏳ Firebase 인증 및 리다이렉션 대기 중...');
            await page.waitForTimeout(8000); // 8초 대기
            
            await page.screenshot({ 
                path: `final-verification-03-after-login-${timestamp}.png`,
                fullPage: true
            });
            
            // 현재 URL 확인
            const currentUrl = page.url();
            console.log(`📍 로그인 후 현재 URL: ${currentUrl}`);
            
            // 4. 로그인 성공 여부 판단
            console.log('\n4️⃣ 로그인 결과 분석...');
            
            if (currentUrl.includes('/admin')) {
                console.log('🎉🎊🎉 관리자 페이지 리다이렉션 성공! 🎉🎊🎉');
                
                // 관리자 페이지 내용 확인
                await page.waitForTimeout(3000);
                
                const pageTitle = await page.title();
                console.log(`📋 페이지 제목: ${pageTitle}`);
                
                const pageContent = await page.textContent('body');
                
                if (pageContent.includes('관리자') || pageContent.includes('Admin') || pageContent.includes('Dashboard')) {
                    console.log('✅ 관리자 대시보드 콘텐츠 확인됨');
                    
                    // 관리자 기능들 확인
                    const adminElements = [
                        'button:has-text("블로그")',
                        'button:has-text("AI")',
                        'button:has-text("사용자")',
                        '[role="tab"]',
                        '.admin', 
                        '[data-testid*="admin"]'
                    ];
                    
                    let foundElements = 0;
                    for (const selector of adminElements) {
                        const elements = await page.locator(selector).all();
                        if (elements.length > 0) {
                            foundElements++;
                            console.log(`   ✅ 관리자 요소 발견: ${selector} (${elements.length}개)`);
                        }
                    }
                    
                    if (foundElements > 0) {
                        console.log('🎊 관리자 인터페이스 정상 로드됨');
                    }
                    
                } else {
                    console.log('⚠️ 관리자 페이지 콘텐츠 확인 필요');
                    console.log('페이지 내용 미리보기:', pageContent.substring(0, 300));
                }
                
            } else if (currentUrl === `${vercelUrl}/` || currentUrl === vercelUrl) {
                console.log('🎉 메인 페이지로 리다이렉션됨');
                console.log('📋 관리자 페이지로 수동 이동 테스트...');
                
                // 관리자 페이지로 직접 이동
                await page.goto(`${vercelUrl}/admin`, { 
                    waitUntil: 'networkidle',
                    timeout: 30000 
                });
                
                await page.waitForTimeout(3000);
                
                const adminUrl = page.url();
                if (adminUrl.includes('/admin')) {
                    console.log('✅ 관리자 페이지 접근 성공');
                } else {
                    console.log('❌ 관리자 페이지 접근 실패');
                }
                
            } else if (currentUrl.includes('/sign-in')) {
                console.log('❌ 로그인 페이지에 그대로 남아있음 - 로그인 실패');
                
                // 에러 메시지 확인
                const errorSelectors = [
                    '.text-destructive',
                    '[role="alert"]',
                    '.error',
                    '.alert-error',
                    '[data-testid*="error"]'
                ];
                
                for (const selector of errorSelectors) {
                    const errorElements = await page.locator(selector).all();
                    for (const element of errorElements) {
                        const errorText = await element.textContent();
                        if (errorText && errorText.trim()) {
                            console.log(`🚨 에러 메시지: ${errorText}`);
                        }
                    }
                }
                
                // Firebase 인증 상태 확인
                const authState = await page.evaluate(() => {
                    const keys = Object.keys(localStorage).filter(key => key.includes('firebase'));
                    const authKey = keys.find(key => key.includes('authUser'));
                    return {
                        firebaseKeys: keys,
                        authUser: authKey ? localStorage.getItem(authKey) : null
                    };
                });
                
                console.log('🔍 Firebase 인증 상태:', authState.authUser ? '토큰 존재' : '토큰 없음');
                
            } else {
                console.log(`🤔 예상치 못한 페이지로 리다이렉션: ${currentUrl}`);
            }
            
            await page.screenshot({ 
                path: `final-verification-04-final-state-${timestamp}.png`,
                fullPage: true
            });
            
        } else {
            console.log('❌ 로그인 버튼을 찾을 수 없음');
        }
        
        // 5. 최종 결과 보고
        console.log('\n📋 최종 로그인 확인 결과');
        console.log('='.repeat(50));
        console.log(`🌐 테스트 URL: ${vercelUrl}`);
        console.log(`📧 계정: admin@innerspell.com`);
        console.log(`🔐 비밀번호: admin123`);
        console.log(`📍 최종 URL: ${page.url()}`);
        console.log(`🆔 UID: qdrcDKB0snXFawsAiaMNZW3nnRZ2`);
        console.log(`⏰ 테스트 시간: ${new Date().toLocaleString()}`);
        
        const finalUrl = page.url();
        if (finalUrl.includes('/admin')) {
            console.log('🎊🎊🎊 로그인 및 관리자 페이지 접근 완전 성공! 🎊🎊🎊');
            console.log('✅✅✅ admin@innerspell.com 로그인 문제 해결 확인! ✅✅✅');
        } else if (finalUrl === `${vercelUrl}/` || finalUrl === vercelUrl) {
            console.log('🎉 로그인 성공 - 메인 페이지 접근됨');
            console.log('🔧 관리자 페이지는 수동 접근 필요');
        } else {
            console.log('❌ 로그인 실패 또는 리다이렉션 문제');
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error.message);
        await page.screenshot({ 
            path: `final-verification-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        console.log('\n⏳ 결과 확인을 위해 브라우저를 3분간 열어둡니다...');
        console.log('🔍 수동으로 추가 테스트를 진행하세요.');
        
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 최종 검증 완료');
        }, 180000); // 3분
    }
})();