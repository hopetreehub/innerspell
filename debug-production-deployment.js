const { chromium } = require('playwright');
const fs = require('fs').promises;

async function debugProductionDeployment() {
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
    
    // 네트워크 요청/응답 캡처 - 특히 API 호출
    const apiCalls = [];
    page.on('request', request => {
        if (request.url().includes('api') || request.url().includes('firebase')) {
            const requestData = {
                type: 'request',
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                postData: request.postData(),
                time: new Date().toISOString()
            };
            apiCalls.push(requestData);
            console.log(`[API REQUEST] ${request.method()} ${request.url()}`);
            if (request.postData()) {
                console.log(`[REQUEST BODY] ${request.postData()}`);
            }
        }
    });
    
    page.on('response', async response => {
        if (response.url().includes('api') || response.url().includes('firebase')) {
            const responseData = {
                type: 'response',
                url: response.url(),
                status: response.status(),
                headers: response.headers(),
                time: new Date().toISOString()
            };
            
            try {
                const body = await response.text();
                responseData.body = body;
                console.log(`[API RESPONSE] ${response.status()} ${response.url()}`);
                console.log(`[RESPONSE BODY] ${body}`);
            } catch (e) {
                responseData.bodyError = e.message;
            }
            
            apiCalls.push(responseData);
        }
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
        console.error('[STACK]', error.stack);
    });
    
    try {
        // 새로운 프로덕션 배포 URL
        const deploymentUrl = 'https://test-studio-firebase-euozk1zju-johns-projects-bf5e60f3.vercel.app';
        console.log(`[DEBUG] 프로덕션 배포 접속: ${deploymentUrl}`);
        
        await page.goto(deploymentUrl, { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        // 완전 로드 대기
        await page.waitForTimeout(5000);
        
        await page.screenshot({ path: 'debug-screenshots/prod-01-homepage.png' });
        
        // Firebase 초기화 상태 확인
        const firebaseStatus = await page.evaluate(() => {
            return {
                firebaseLoaded: typeof window.firebase !== 'undefined',
                firestoreLoaded: typeof window.firebase?.firestore !== 'undefined',
                authLoaded: typeof window.firebase?.auth !== 'undefined',
                authUser: window.firebase?.auth?.()?.currentUser,
                windowKeys: Object.keys(window).filter(key => 
                    key.toLowerCase().includes('firebase') || 
                    key.toLowerCase().includes('fire') ||
                    key.toLowerCase().includes('auth')
                ),
                timestamp: new Date().toISOString()
            };
        });
        
        console.log('[FIREBASE STATUS]', JSON.stringify(firebaseStatus, null, 2));
        
        // DOM 상태와 버튼 찾기
        const pageState = await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent?.trim(),
                    className: btn.className,
                    disabled: btn.disabled,
                    id: btn.id,
                    type: btn.type
                })),
                links: Array.from(document.querySelectorAll('a')).map(link => ({
                    text: link.textContent?.trim(),
                    href: link.href,
                    className: link.className
                })),
                errors: Array.from(document.querySelectorAll('[class*="error"], .text-red-500')).map(el => el.textContent)
            };
        });
        
        console.log('[PAGE STATE]', JSON.stringify(pageState, null, 2));
        
        // 타로 읽기 시작하기
        console.log('[DEBUG] 타로 읽기 시작 버튼 찾기...');
        const startButton = pageState.buttons.find(btn => 
            btn.text && (btn.text.includes('타로') || btn.text.includes('시작') || btn.text.includes('읽기'))
        );
        
        if (startButton) {
            console.log(`[DEBUG] 시작 버튼 발견: "${startButton.text}"`);
            await page.click(`button:has-text("${startButton.text}")`);
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'debug-screenshots/prod-02-after-start.png' });
        } else {
            // 직접 reading 페이지로 이동
            console.log('[DEBUG] 직접 /reading 페이지로 이동');
            await page.goto(`${deploymentUrl}/reading`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'debug-screenshots/prod-02-reading-page.png' });
        }
        
        // Reading 페이지에서 상태 확인
        const readingPageState = await page.evaluate(() => {
            return {
                url: window.location.href,
                hasTextarea: !!document.querySelector('textarea'),
                textarea: {
                    placeholder: document.querySelector('textarea')?.placeholder,
                    value: document.querySelector('textarea')?.value
                },
                submitButtons: Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent?.trim(),
                    type: btn.type,
                    disabled: btn.disabled,
                    className: btn.className
                })).filter(btn => 
                    btn.text && (
                        btn.text.includes('카드') || 
                        btn.text.includes('뽑기') || 
                        btn.text.includes('제출') ||
                        btn.type === 'submit'
                    )
                ),
                errors: Array.from(document.querySelectorAll('[class*="error"], .text-red-500, [role="alert"]')).map(el => el.textContent)
            };
        });
        
        console.log('[READING PAGE STATE]', JSON.stringify(readingPageState, null, 2));
        
        if (readingPageState.hasTextarea) {
            console.log('[DEBUG] 질문 입력...');
            await page.fill('textarea', '오늘의 운세는 어떨까요? AI 읽기를 부탁드립니다.');
            await page.waitForTimeout(1000);
            
            await page.screenshot({ path: 'debug-screenshots/prod-03-question-filled.png' });
            
            // API 요청을 가로채서 상세 분석
            const apiInterceptions = [];
            
            await page.route('**/api/ai-reading', async (route) => {
                const request = route.request();
                const requestData = {
                    intercepted: true,
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers(),
                    body: request.postData(),
                    time: new Date().toISOString()
                };
                
                console.log('\n[AI API INTERCEPTED - REQUEST]');
                console.log('URL:', request.url());
                console.log('Method:', request.method());
                console.log('Headers:', JSON.stringify(request.headers(), null, 2));
                console.log('Body:', request.postData());
                
                try {
                    const response = await route.fetch();
                    const responseBody = await response.text();
                    
                    requestData.responseStatus = response.status();
                    requestData.responseBody = responseBody;
                    
                    console.log('\n[AI API INTERCEPTED - RESPONSE]');
                    console.log('Status:', response.status());
                    console.log('Headers:', JSON.stringify(response.headers(), null, 2));
                    console.log('Body:', responseBody);
                    
                    apiInterceptions.push(requestData);
                    
                    await route.fulfill({ response });
                } catch (error) {
                    requestData.error = error.message;
                    console.log('\n[AI API INTERCEPTED - ERROR]', error.message);
                    apiInterceptions.push(requestData);
                    await route.abort();
                }
            });
            
            // 제출 버튼 클릭
            if (readingPageState.submitButtons.length > 0) {
                const submitBtn = readingPageState.submitButtons[0];
                console.log(`[DEBUG] 제출 버튼 클릭: "${submitBtn.text}"`);
                
                await page.click(`button:has-text("${submitBtn.text}")`);
                
                // API 응답 대기
                console.log('[DEBUG] API 응답 대기 중 (15초)...');
                await page.waitForTimeout(15000);
                
                await page.screenshot({ path: 'debug-screenshots/prod-04-after-submit.png' });
                
                // 결과 상태 확인
                const resultState = await page.evaluate(() => {
                    return {
                        currentUrl: window.location.href,
                        errorMessages: Array.from(document.querySelectorAll('[class*="error"], .text-red-500, [role="alert"], .toast')).map(el => ({
                            text: el.textContent?.trim(),
                            className: el.className,
                            id: el.id
                        })).filter(el => el.text),
                        loadingStates: Array.from(document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="pending"]')).map(el => ({
                            className: el.className,
                            text: el.textContent?.trim()
                        })),
                        aiResults: Array.from(document.querySelectorAll('[class*="ai"], [class*="reading"], [class*="interpretation"], [class*="result"]')).map(el => ({
                            className: el.className,
                            text: el.textContent?.trim()?.substring(0, 200)
                        })).filter(el => el.text),
                        allVisibleText: document.body.textContent?.trim().substring(0, 1000)
                    };
                });
                
                console.log('\n[RESULT STATE]', JSON.stringify(resultState, null, 2));
                
                // Firestore 상태 실시간 확인
                const firestoreDebug = await page.evaluate(async () => {
                    try {
                        if (!window.firebase?.firestore) {
                            return { error: 'Firestore not available' };
                        }
                        
                        const db = window.firebase.firestore();
                        
                        // aiProviders 컬렉션 조회
                        const providersSnapshot = await db.collection('aiProviders').get();
                        const providers = [];
                        providersSnapshot.forEach(doc => {
                            providers.push({
                                id: doc.id,
                                data: doc.data()
                            });
                        });
                        
                        // 사용자 인증 상태
                        const auth = window.firebase.auth?.();
                        const user = auth?.currentUser;
                        
                        return {
                            providersCount: providers.length,
                            providers: providers,
                            userAuthenticated: !!user,
                            userId: user?.uid,
                            timestamp: new Date().toISOString()
                        };
                    } catch (error) {
                        return {
                            error: error.message,
                            stack: error.stack
                        };
                    }
                });
                
                console.log('\n[FIRESTORE DEBUG]', JSON.stringify(firestoreDebug, null, 2));
                
                // 클라이언트 사이드 환경 변수와 설정 확인
                const clientConfig = await page.evaluate(() => {
                    return {
                        environmentVars: {
                            NODE_ENV: process?.env?.NODE_ENV,
                            // 클라이언트에서 접근 가능한 환경 변수들만
                        },
                        windowVars: Object.keys(window).filter(key => 
                            key.includes('NEXT') || 
                            key.includes('REACT') || 
                            key.includes('CLAUDE') ||
                            key.includes('API')
                        ),
                        localStorage: Object.keys(localStorage || {}),
                        sessionStorage: Object.keys(sessionStorage || {}),
                        cookieKeys: document.cookie.split(';').map(c => c.split('=')[0].trim())
                    };
                });
                
                console.log('\n[CLIENT CONFIG]', JSON.stringify(clientConfig, null, 2));
            }
            
            // 최종 디버그 리포트 생성
            const finalDebugReport = {
                timestamp: new Date().toISOString(),
                deploymentUrl,
                firebaseStatus,
                pageState,
                readingPageState,
                apiInterceptions,
                firestoreDebug,
                clientConfig,
                allLogs: logs.filter(log => 
                    log.type === 'error' || 
                    log.text.toLowerCase().includes('error') || 
                    log.text.toLowerCase().includes('fail') ||
                    log.text.toLowerCase().includes('not found')
                ),
                allApiCalls: apiCalls,
                allErrors: errors
            };
            
            await fs.writeFile(
                'debug-production-final-report.json',
                JSON.stringify(finalDebugReport, null, 2)
            );
            
            console.log('\n======================================');
            console.log('[DEBUG COMPLETE] 프로덕션 환경 디버깅 완료');
            console.log('======================================');
            console.log('📊 최종 리포트: debug-production-final-report.json');
            console.log('📸 스크린샷: debug-screenshots/prod-*.png');
            console.log('\n🔍 주요 발견사항:');
            console.log(`- Firebase 초기화: ${firebaseStatus.firebaseLoaded ? '✅' : '❌'}`);
            console.log(`- Firestore 사용 가능: ${firebaseStatus.firestoreLoaded ? '✅' : '❌'}`);
            if (firestoreDebug && !firestoreDebug.error) {
                console.log(`- aiProviders 컬렉션 개수: ${firestoreDebug.providersCount}`);
            }
            console.log(`- API 호출 횟수: ${apiInterceptions.length}`);
            console.log(`- 에러 개수: ${errors.length}`);
            
            if (apiInterceptions.length > 0) {
                console.log('\n🚨 API 인터셉션 결과:');
                apiInterceptions.forEach((call, index) => {
                    console.log(`${index + 1}. ${call.method} ${call.url} - Status: ${call.responseStatus}`);
                    if (call.error) {
                        console.log(`   ❌ Error: ${call.error}`);
                    }
                });
            }
            
            console.log('\n🌐 브라우저를 열어둡니다. 수동 검사 후 Ctrl+C로 종료하세요.');
        }
        
    } catch (error) {
        console.error('[DEBUG ERROR]', error);
        await page.screenshot({ path: 'debug-screenshots/prod-error.png' });
    }
}

debugProductionDeployment();