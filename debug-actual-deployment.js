const { chromium } = require('playwright');
const fs = require('fs').promises;

async function debugActualDeployment() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 모든 콘솔 로그 캡처
    const logs = [];
    page.on('console', msg => {
        const logEntry = {
            type: msg.type(),
            text: msg.text(),
            time: new Date().toISOString(),
            location: msg.location()
        };
        logs.push(logEntry);
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    // 네트워크 요청/응답 캡처
    const networkActivity = [];
    page.on('request', request => {
        const requestData = {
            type: 'request',
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            time: new Date().toISOString()
        };
        networkActivity.push(requestData);
        if (request.url().includes('api') || request.url().includes('firebase')) {
            console.log(`[API REQUEST] ${request.method()} ${request.url()}`);
        }
    });
    
    page.on('response', async response => {
        const responseData = {
            type: 'response',
            url: response.url(),
            status: response.status(),
            headers: response.headers(),
            time: new Date().toISOString()
        };
        
        if (response.url().includes('api') || response.url().includes('firebase')) {
            try {
                const body = await response.text();
                responseData.body = body;
                console.log(`[API RESPONSE] ${response.status()} ${response.url()}`);
                console.log(`[RESPONSE BODY] ${body.substring(0, 500)}`);
            } catch (e) {
                responseData.bodyError = e.message;
            }
        }
        networkActivity.push(responseData);
    });
    
    // 에러 캡처
    const errors = [];
    page.on('pageerror', error => {
        const errorData = {
            message: error.message,
            stack: error.stack,
            time: new Date().toISOString()
        };
        errors.push(errorData);
        console.error('[PAGE ERROR]', error.message);
    });
    
    try {
        // 최신 배포 URL 사용
        const deploymentUrl = 'https://test-studio-firebase-8cihtnbvb-johns-projects-bf5e60f3.vercel.app';
        console.log(`[DEBUG] 최신 배포 접속: ${deploymentUrl}`);
        
        await page.goto(deploymentUrl, { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        // 완전 로드 대기
        await page.waitForTimeout(5000);
        
        await page.screenshot({ path: 'debug-screenshots/actual-01-loaded.png' });
        
        // Firebase 초기화 상태 실시간 확인
        const firebaseStatus = await page.evaluate(() => {
            return {
                firebaseLoaded: typeof window.firebase !== 'undefined',
                firestoreLoaded: typeof window.firebase?.firestore !== 'undefined',
                authLoaded: typeof window.firebase?.auth !== 'undefined',
                configPresent: !!window.firebaseConfig,
                windowKeys: Object.keys(window).filter(key => 
                    key.toLowerCase().includes('firebase') || 
                    key.toLowerCase().includes('fire')
                ),
                timestamp: new Date().toISOString()
            };
        });
        
        console.log('[FIREBASE STATUS]', firebaseStatus);
        
        // DOM 상태 분석
        const domState = await page.evaluate(() => {
            return {
                title: document.title,
                hasMainContent: !!document.querySelector('main'),
                buttonCount: document.querySelectorAll('button').length,
                buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent?.trim(),
                    className: btn.className,
                    disabled: btn.disabled,
                    id: btn.id
                })),
                errorMessages: Array.from(document.querySelectorAll('[class*="error"], .text-red-500')).map(el => el.textContent),
                formElements: Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
                    type: el.type || el.tagName.toLowerCase(),
                    placeholder: el.placeholder,
                    value: el.value,
                    name: el.name
                }))
            };
        });
        
        console.log('[DOM STATE]', domState);
        
        // 타로 읽기 시작 버튼 찾기
        let startButtonFound = false;
        for (const btn of domState.buttons) {
            if (btn.text && (btn.text.includes('타로') || btn.text.includes('시작') || btn.text.includes('읽기'))) {
                console.log(`[DEBUG] 시작 버튼 발견: "${btn.text}"`);
                try {
                    await page.click(`button:has-text("${btn.text}")`);
                    startButtonFound = true;
                    await page.waitForTimeout(3000);
                    await page.screenshot({ path: 'debug-screenshots/actual-02-after-start.png' });
                    break;
                } catch (clickError) {
                    console.log(`[DEBUG] 버튼 클릭 실패: ${clickError.message}`);
                }
            }
        }
        
        if (!startButtonFound) {
            // 다른 방법으로 네비게이션 시도
            console.log('[DEBUG] 직접 reading 페이지로 이동 시도');
            await page.goto(`${deploymentUrl}/reading`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'debug-screenshots/actual-02-direct-reading.png' });
        }
        
        // 질문 입력 폼 찾기
        const questionForm = await page.evaluate(() => {
            const textarea = document.querySelector('textarea');
            const submitButton = document.querySelector('button[type="submit"], button:has-text("카드"), button:has-text("뽑기")');
            
            return {
                hasTextarea: !!textarea,
                textareaPlaceholder: textarea?.placeholder,
                hasSubmitButton: !!submitButton,
                submitButtonText: submitButton?.textContent?.trim(),
                submitButtonDisabled: submitButton?.disabled
            };
        });
        
        console.log('[QUESTION FORM]', questionForm);
        
        if (questionForm.hasTextarea) {
            console.log('[DEBUG] 질문 입력...');
            await page.fill('textarea', '오늘의 운세는 어떨까요?');
            await page.waitForTimeout(1000);
            
            await page.screenshot({ path: 'debug-screenshots/actual-03-question-input.png' });
            
            if (questionForm.hasSubmitButton) {
                console.log('[DEBUG] 카드 뽑기 버튼 클릭...');
                
                // API 요청을 가로채서 상세 로깅
                await page.route('**/api/ai-reading', async (route) => {
                    const request = route.request();
                    console.log('[AI API REQUEST INTERCEPTED]');
                    console.log('URL:', request.url());
                    console.log('Method:', request.method());
                    console.log('Headers:', request.headers());
                    console.log('Body:', request.postData());
                    
                    const response = await route.fetch();
                    const responseBody = await response.text();
                    
                    console.log('[AI API RESPONSE INTERCEPTED]');
                    console.log('Status:', response.status());
                    console.log('Body:', responseBody);
                    
                    await route.fulfill({ response });
                });
                
                // 버튼 클릭
                await page.click('button[type="submit"], button:has-text("카드"), button:has-text("뽑기")');
                
                // API 응답 대기
                console.log('[DEBUG] API 응답 대기 중...');
                await page.waitForTimeout(10000);
                
                await page.screenshot({ path: 'debug-screenshots/actual-04-after-submit.png' });
                
                // 결과 상태 확인
                const resultState = await page.evaluate(() => {
                    return {
                        currentUrl: window.location.href,
                        errorMessages: Array.from(document.querySelectorAll('[class*="error"], .text-red-500, [role="alert"]')).map(el => ({
                            text: el.textContent,
                            className: el.className
                        })),
                        loadingIndicators: Array.from(document.querySelectorAll('[class*="loading"], [class*="spinner"]')).length,
                        cardResults: Array.from(document.querySelectorAll('[class*="card"], .tarot-card')).length,
                        aiResponse: document.querySelector('[class*="ai"], [class*="reading"], [class*="interpretation"]')?.textContent
                    };
                });
                
                console.log('[RESULT STATE]', resultState);
                
                // aiProviders 컬렉션 상태 실시간 확인
                const firestoreDebug = await page.evaluate(async () => {
                    try {
                        if (!window.firebase?.firestore || !window.firebase?.auth) {
                            return { error: 'Firebase not initialized' };
                        }
                        
                        const db = window.firebase.firestore();
                        const auth = window.firebase.auth();
                        
                        // 현재 사용자 확인
                        const user = auth.currentUser;
                        
                        // aiProviders 컬렉션 조회
                        const providersSnapshot = await db.collection('aiProviders').get();
                        const providers = [];
                        providersSnapshot.forEach(doc => {
                            providers.push({
                                id: doc.id,
                                data: doc.data()
                            });
                        });
                        
                        return {
                            userSignedIn: !!user,
                            userId: user?.uid,
                            providersCount: providers.length,
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
                
                console.log('[FIRESTORE DEBUG]', firestoreDebug);
            }
        }
        
        // 최종 디버그 리포트 생성
        const debugReport = {
            timestamp: new Date().toISOString(),
            deploymentUrl,
            firebaseStatus,
            domState,
            questionForm,
            logs: logs.filter(log => log.type === 'error' || log.text.includes('error') || log.text.includes('Error')),
            networkActivity: networkActivity.filter(activity => 
                activity.url.includes('api') || 
                activity.url.includes('firebase') || 
                activity.status >= 400
            ),
            errors
        };
        
        await fs.writeFile(
            'debug-actual-deployment-report.json',
            JSON.stringify(debugReport, null, 2)
        );
        
        console.log('\n[DEBUG COMPLETE] 실제 배포에서 디버깅 완료');
        console.log('리포트 저장: debug-actual-deployment-report.json');
        console.log('스크린샷 저장: debug-screenshots/actual-*.png');
        
        // 브라우저 열어둠 (수동 검사용)
        console.log('\n[INFO] 브라우저를 열어둡니다. 수동 검사 후 Ctrl+C로 종료하세요.');
        
    } catch (error) {
        console.error('[DEBUG ERROR]', error);
        await page.screenshot({ path: 'debug-screenshots/actual-error.png' });
    }
}

debugActualDeployment();