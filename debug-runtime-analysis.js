const { chromium } = require('playwright');
const fs = require('fs').promises;

async function debugRuntimeAnalysis() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 모든 콘솔 로그 캡처
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push({
            type: msg.type(),
            text: msg.text(),
            time: new Date().toISOString(),
            location: msg.location()
        });
    });
    
    // 모든 네트워크 요청 캡처
    const networkRequests = [];
    page.on('request', request => {
        networkRequests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            time: new Date().toISOString()
        });
    });
    
    // 모든 네트워크 응답 캡처
    const networkResponses = [];
    page.on('response', response => {
        networkResponses.push({
            url: response.url(),
            status: response.status(),
            headers: response.headers(),
            time: new Date().toISOString()
        });
    });
    
    // 에러 캡처
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push({
            message: error.message,
            stack: error.stack,
            time: new Date().toISOString()
        });
    });
    
    try {
        console.log('[DEBUG] Vercel 배포 사이트 접속...');
        await page.goto('https://tarot-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        // 초기 상태 캡처
        await page.screenshot({ path: 'debug-screenshots/01-initial-load.png' });
        
        // Runtime에서 Firebase 상태 확인
        const firebaseState = await page.evaluate(() => {
            return {
                firebaseInitialized: typeof window.firebase !== 'undefined',
                firestoreAvailable: typeof window.firebase?.firestore !== 'undefined',
                authState: window.firebase?.auth?.()?.currentUser,
                timestamp: new Date().toISOString()
            };
        });
        console.log('[FIREBASE STATE]', firebaseState);
        
        // 타로 읽기 시작
        console.log('[DEBUG] 타로 읽기 버튼 클릭...');
        await page.click('button:has-text("타로 읽기 시작")');
        await page.waitForTimeout(2000);
        
        // 질문 입력 후 상태 확인
        console.log('[DEBUG] 질문 입력...');
        await page.fill('textarea', '오늘의 운세는 어떨까요?');
        
        // 질문 입력 후 런타임 상태 캡처
        const afterQuestionState = await page.evaluate(() => {
            // 현재 DOM 상태
            const questionTextarea = document.querySelector('textarea');
            const submitButton = document.querySelector('button:has-text("카드 뽑기")');
            
            return {
                questionValue: questionTextarea?.value,
                submitButtonEnabled: submitButton && !submitButton.disabled,
                submitButtonText: submitButton?.textContent,
                timestamp: new Date().toISOString()
            };
        });
        console.log('[AFTER QUESTION STATE]', afterQuestionState);
        
        // Network Inspector 설정 - API 요청 추적
        await page.route('**/api/**', async route => {
            const request = route.request();
            console.log(`[API REQUEST] ${request.method()} ${request.url()}`);
            console.log('[REQUEST HEADERS]', request.headers());
            console.log('[REQUEST BODY]', request.postData());
            
            const response = await route.fetch();
            const body = await response.text();
            
            console.log(`[API RESPONSE] ${response.status()}`);
            console.log('[RESPONSE BODY]', body);
            
            await route.fulfill({ response });
        });
        
        await page.screenshot({ path: 'debug-screenshots/02-before-submit.png' });
        
        // 카드 뽑기 버튼 클릭
        console.log('[DEBUG] 카드 뽑기 버튼 클릭...');
        await page.click('button:has-text("카드 뽑기")');
        
        // API 호출 대기 및 로그
        await page.waitForTimeout(5000);
        
        // 런타임 에러 체크
        const runtimeErrors = await page.evaluate(() => {
            const errors = [];
            
            // 모든 에러 요소 찾기
            const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .text-red-500');
            errorElements.forEach(el => {
                errors.push({
                    text: el.textContent,
                    className: el.className,
                    html: el.outerHTML
                });
            });
            
            // Toast나 Alert 메시지 확인
            const toasts = document.querySelectorAll('[role="alert"], .toast, .notification');
            toasts.forEach(toast => {
                errors.push({
                    type: 'toast',
                    text: toast.textContent,
                    html: toast.outerHTML
                });
            });
            
            return errors;
        });
        
        console.log('[RUNTIME ERRORS]', runtimeErrors);
        
        // 최종 상태 스크린샷
        await page.screenshot({ path: 'debug-screenshots/03-after-api-call.png' });
        
        // aiProviders 컬렉션 실시간 상태 확인
        const aiProvidersState = await page.evaluate(async () => {
            try {
                const db = window.firebase?.firestore?.();
                if (!db) return { error: 'Firestore not initialized' };
                
                const snapshot = await db.collection('aiProviders').get();
                const providers = [];
                snapshot.forEach(doc => {
                    providers.push({
                        id: doc.id,
                        data: doc.data()
                    });
                });
                
                return {
                    count: providers.length,
                    providers: providers,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                return {
                    error: error.message,
                    stack: error.stack
                };
            }
        });
        
        console.log('[AI PROVIDERS STATE]', aiProvidersState);
        
        // API 폴백 로직 추적
        const fallbackTrace = await page.evaluate(() => {
            // Window 객체에서 사용 가능한 AI 관련 변수 확인
            return {
                windowKeys: Object.keys(window).filter(key => 
                    key.toLowerCase().includes('ai') || 
                    key.toLowerCase().includes('model') ||
                    key.toLowerCase().includes('claude')
                ),
                localStorageKeys: Object.keys(localStorage),
                sessionStorageKeys: Object.keys(sessionStorage)
            };
        });
        
        console.log('[FALLBACK TRACE]', fallbackTrace);
        
        // 디버그 결과 저장
        const debugReport = {
            timestamp: new Date().toISOString(),
            consoleLogs,
            networkRequests: networkRequests.filter(req => req.url.includes('api')),
            networkResponses: networkResponses.filter(res => res.url.includes('api')),
            pageErrors,
            firebaseState,
            afterQuestionState,
            runtimeErrors,
            aiProvidersState,
            fallbackTrace
        };
        
        await fs.writeFile(
            'debug-runtime-report.json',
            JSON.stringify(debugReport, null, 2)
        );
        
        console.log('\n[DEBUG COMPLETE] Report saved to debug-runtime-report.json');
        
        // 브라우저는 열어둠 (수동 검사용)
        console.log('\n[INFO] Browser left open for manual inspection. Press Ctrl+C to close.');
        
    } catch (error) {
        console.error('[DEBUG ERROR]', error);
        await page.screenshot({ path: 'debug-screenshots/error-state.png' });
    }
}

debugRuntimeAnalysis();