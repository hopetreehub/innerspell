const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    console.log('🧠 SuperClaude 전문가 페르소나 - 종합 Firebase 분석');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. Firebase Console 프로젝트 설정 확인
        console.log('\n🔥 1️⃣ Firebase Console 프로젝트 설정 분석');
        const consolePage = await context.newPage();
        
        await consolePage.goto('https://console.firebase.google.com/project/innerspell-an7ce/settings/general', {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        await consolePage.screenshot({ 
            path: `analysis-01-project-settings-${timestamp}.png`,
            fullPage: true
        });
        
        console.log('⏳ Firebase Console 로딩 대기...');
        await consolePage.waitForTimeout(10000);
        
        // 2. Authentication 설정 상세 확인
        console.log('\n🔐 2️⃣ Authentication 설정 상세 분석');
        await consolePage.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/providers', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await consolePage.screenshot({ 
            path: `analysis-02-auth-providers-${timestamp}.png`,
            fullPage: true
        });
        
        await consolePage.waitForTimeout(5000);
        
        // Sign-in methods 상세 확인
        const authMethods = await consolePage.evaluate(() => {
            const providers = [];
            const elements = document.querySelectorAll('[data-testid], .provider, .method');
            elements.forEach(el => {
                const text = el.textContent;
                if (text && (text.includes('Email') || text.includes('Google') || text.includes('이메일'))) {
                    providers.push({
                        text: text.trim(),
                        enabled: text.includes('Enabled') || text.includes('활성화'),
                        disabled: text.includes('Disabled') || text.includes('비활성화')
                    });
                }
            });
            return providers;
        });
        
        console.log('📋 Authentication Providers:', authMethods);
        
        // 3. 사용자 목록 확인
        console.log('\n👥 3️⃣ 사용자 목록 상세 분석');
        await consolePage.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/users', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await consolePage.screenshot({ 
            path: `analysis-03-users-list-${timestamp}.png`,
            fullPage: true
        });
        
        await consolePage.waitForTimeout(5000);
        
        // 사용자 목록에서 admin@innerspell.com 검색
        const usersList = await consolePage.evaluate(() => {
            const users = [];
            const userElements = document.querySelectorAll('tr, .user-row, [data-testid*="user"]');
            userElements.forEach(el => {
                const text = el.textContent;
                if (text && text.includes('@')) {
                    users.push(text.trim());
                }
            });
            return users;
        });
        
        console.log('📧 사용자 목록:', usersList);
        const adminExists = usersList.some(user => user.includes('admin@innerspell.com'));
        console.log(`🎯 admin@innerspell.com 존재 여부: ${adminExists ? '✅ 존재' : '❌ 없음'}`);
        
        // 4. Vercel 배포 환경에서 Firebase 설정 확인
        console.log('\n🌐 4️⃣ Vercel 환경 Firebase 설정 분석');
        const vercelPage = await context.newPage();
        
        // Console 메시지 수집
        const consoleMessages = [];
        vercelPage.on('console', (msg) => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString()
            });
        });
        
        // Network 요청 수집
        const networkRequests = [];
        vercelPage.on('request', (request) => {
            if (request.url().includes('firebase') || request.url().includes('googleapis')) {
                networkRequests.push({
                    method: request.method(),
                    url: request.url(),
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        const networkResponses = [];
        vercelPage.on('response', (response) => {
            if (response.url().includes('firebase') || response.url().includes('googleapis')) {
                networkResponses.push({
                    status: response.status(),
                    url: response.url(),
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        await vercelPage.goto('https://test-studio-firebase.vercel.app/sign-in', {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        await vercelPage.screenshot({ 
            path: `analysis-04-vercel-signin-${timestamp}.png`,
            fullPage: true
        });
        
        // Vercel 환경에서 Firebase 설정 상태 확인
        const vercelFirebaseConfig = await vercelPage.evaluate(() => {
            try {
                return {
                    windowFirebase: typeof window.firebase !== 'undefined',
                    firebaseConfig: {
                        apiKey: window.process?.env?.NEXT_PUBLIC_FIREBASE_API_KEY || 'not found',
                        authDomain: window.process?.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'not found',
                        projectId: window.process?.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not found'
                    },
                    localStorage: Object.keys(localStorage).filter(key => key.includes('firebase')),
                    documentReady: document.readyState,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('🔧 Vercel Firebase 설정:', vercelFirebaseConfig);
        
        // 5. Google 로그인 테스트
        console.log('\n🚀 5️⃣ Google 로그인 시도 분석');
        await vercelPage.waitForTimeout(3000);
        
        const googleButton = vercelPage.locator('button:has-text("Google"), button:has-text("google")');
        if (await googleButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('✅ Google 로그인 버튼 발견');
            
            await googleButton.click();
            console.log('🔄 Google 로그인 버튼 클릭됨');
            
            await vercelPage.waitForTimeout(5000);
            
            await vercelPage.screenshot({ 
                path: `analysis-05-google-login-attempt-${timestamp}.png`,
                fullPage: true
            });
            
            const currentUrl = vercelPage.url();
            console.log(`📍 Google 로그인 후 URL: ${currentUrl}`);
            
        } else {
            console.log('❌ Google 로그인 버튼을 찾을 수 없음');
        }
        
        // 6. 로컬 환경과 비교 분석
        console.log('\n🏠 6️⃣ 로컬 환경 비교 분석');
        const localPage = await context.newPage();
        
        try {
            await localPage.goto('http://localhost:4000/sign-in', {
                waitUntil: 'networkidle',
                timeout: 10000
            });
            
            const localFirebaseConfig = await localPage.evaluate(() => {
                try {
                    return {
                        windowFirebase: typeof window.firebase !== 'undefined',
                        localStorage: Object.keys(localStorage).filter(key => key.includes('firebase')),
                        documentReady: document.readyState,
                        url: window.location.href
                    };
                } catch (error) {
                    return { error: error.message };
                }
            });
            
            console.log('🏠 로컬 Firebase 설정:', localFirebaseConfig);
            
            await localPage.screenshot({ 
                path: `analysis-06-local-signin-${timestamp}.png`,
                fullPage: true
            });
            
        } catch (error) {
            console.log('⚠️ 로컬 서버 접근 실패:', error.message);
        }
        
        // 7. 종합 분석 결과
        console.log('\n📊 7️⃣ SuperClaude 전문가 종합 분석 결과');
        console.log('='.repeat(80));
        
        // 수집된 데이터 분석
        const firebaseRequests = networkRequests.filter(req => req.url.includes('identitytoolkit'));
        const firebaseResponses = networkResponses.filter(res => res.url.includes('identitytoolkit'));
        
        console.log('\n🔍 핵심 발견사항:');
        console.log(`   📧 Firebase Console 사용자: ${adminExists ? '존재함' : '존재하지 않음'}`);
        console.log(`   🌐 Vercel Firebase 초기화: ${vercelFirebaseConfig.windowFirebase ? '성공' : '실패'}`);
        console.log(`   📡 Firebase API 요청 수: ${firebaseRequests.length}개`);
        console.log(`   ✅ Firebase API 응답 수: ${firebaseResponses.length}개`);
        console.log(`   💾 브라우저 콘솔 메시지: ${consoleMessages.length}개`);
        
        console.log('\n🚨 문제점 진단:');
        
        if (!adminExists) {
            console.log('   ❌ CRITICAL: Firebase Console에 admin@innerspell.com 계정 없음');
            console.log('   📝 원인: API 계정 생성이 실제로는 실패했거나 삭제됨');
        }
        
        if (firebaseRequests.length === 0) {
            console.log('   ❌ CRITICAL: Firebase Authentication API 호출 없음');
            console.log('   📝 원인: 클라이언트에서 Firebase 연결 실패');
        }
        
        if (consoleMessages.some(msg => msg.text.includes('error') || msg.text.includes('Error'))) {
            console.log('   ⚠️ WARNING: 브라우저 콘솔에서 에러 발견됨');
        }
        
        console.log('\n💡 해결 방안 우선순위:');
        console.log('   1️⃣ Firebase Console에서 수동으로 admin@innerspell.com 계정 생성');
        console.log('   2️⃣ 생성된 계정 UID로 관리자 권한 재설정');
        console.log('   3️⃣ Vercel 환경변수에 올바른 Firebase 설정 확인');
        console.log('   4️⃣ Google OAuth 설정 별도 점검 필요');
        
        // 상세 로그 출력
        console.log('\n📝 상세 로그:');
        console.log('Firebase 요청들:', firebaseRequests);
        console.log('Firebase 응답들:', firebaseResponses);
        console.log('브라우저 콘솔 메시지 (에러만):', 
            consoleMessages.filter(msg => 
                msg.text.includes('error') || 
                msg.text.includes('Error') || 
                msg.text.includes('❌') ||
                msg.text.includes('Failed')
            )
        );
        
    } catch (error) {
        console.error('❌ 종합 분석 중 오류:', error.message);
        
        const errorPage = await context.newPage();
        await errorPage.screenshot({ 
            path: `analysis-error-${timestamp}.png`,
            fullPage: true 
        });
        
    } finally {
        console.log('\n⏳ 분석 결과 확인을 위해 브라우저를 5분간 열어둡니다...');
        console.log('🔍 각 탭에서 추가 수동 분석을 수행하세요.');
        
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 종합 분석 완료');
        }, 300000); // 5분
    }
})();