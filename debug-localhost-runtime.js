const { chromium } = require('playwright');
const fs = require('fs').promises;

async function debugLocalhostRuntime() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 모든 콘솔 로그 캡처 (에러 중심)
    const criticalLogs = [];
    page.on('console', msg => {
        const logEntry = {
            type: msg.type(),
            text: msg.text(),
            time: new Date().toISOString(),
            location: msg.location()
        };
        
        // 에러나 중요한 로그만 수집
        if (msg.type() === 'error' || 
            msg.text().toLowerCase().includes('error') ||
            msg.text().toLowerCase().includes('fail') ||
            msg.text().toLowerCase().includes('not found') ||
            msg.text().toLowerCase().includes('firebase') ||
            msg.text().toLowerCase().includes('ai') ||
            msg.text().toLowerCase().includes('claude')) {
            criticalLogs.push(logEntry);
            console.log(`🚨 [${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });
    
    // API 요청/응답 상세 추적
    const apiTracker = [];
    
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
            apiTracker.push(requestData);
            console.log(`🌐 [API REQUEST] ${request.method()} ${request.url()}`);
            
            if (request.postData()) {
                console.log(`📤 [REQUEST BODY] ${request.postData()}`);
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
                console.log(`📥 [API RESPONSE] ${response.status()} ${response.url()}`);
                console.log(`📋 [RESPONSE BODY] ${body}`);
                
                // 에러 상태 코드 특별 처리
                if (response.status() >= 400) {
                    console.log(`❌ [ERROR RESPONSE] Status: ${response.status()}, Body: ${body}`);
                }
            } catch (e) {
                responseData.bodyError = e.message;
                console.log(`⚠️ [RESPONSE READ ERROR] ${e.message}`);
            }
            
            apiTracker.push(responseData);
        }
    });
    
    // 페이지 에러 캡처
    const pageErrors = [];
    page.on('pageerror', error => {
        const errorData = {
            message: error.message,
            stack: error.stack,
            time: new Date().toISOString()
        };
        pageErrors.push(errorData);
        console.error('💥 [PAGE ERROR]', error.message);
        console.error('📍 [STACK TRACE]', error.stack);
    });
    
    try {
        console.log('🚀 [DEBUG START] 로컬호스트 실시간 디버깅 시작');
        console.log('='.repeat(60));
        
        // 로컬 서버 접속
        const localUrl = 'http://localhost:4000';
        console.log(`🌍 [NAVIGATE] ${localUrl} 접속 중...`);
        
        await page.goto(localUrl, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // 완전 로드 대기
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'debug-screenshots/local-01-homepage.png' });
        
        console.log('📸 [SCREENSHOT] 홈페이지 캡처 완료');
        
        // Firebase 초기화 상태 실시간 확인
        const firebaseCheck = await page.evaluate(() => {
            const fbStatus = {
                firebaseObject: typeof window.firebase,
                firebaseApp: window.firebase?.apps?.length || 0,
                firestoreAvailable: typeof window.firebase?.firestore,
                authAvailable: typeof window.firebase?.auth,
                currentUser: window.firebase?.auth?.()?.currentUser,
                firebaseConfig: !!window.firebaseConfig,
                windowKeys: Object.keys(window).filter(key => 
                    key.toLowerCase().includes('firebase') || 
                    key.toLowerCase().includes('fire') ||
                    key.toLowerCase().includes('config')
                ),
                timestamp: new Date().toISOString()
            };
            
            // 콘솔에 Firebase 상태 출력
            console.log('🔥 Firebase Status Check:', fbStatus);
            
            return fbStatus;
        });
        
        console.log('🔥 [FIREBASE STATUS]', JSON.stringify(firebaseCheck, null, 2));
        
        // DOM 상태 확인
        const domCheck = await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                hasNavigation: !!document.querySelector('nav'),
                buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent?.trim(),
                    className: btn.className,
                    disabled: btn.disabled,
                    id: btn.id,
                    type: btn.type
                })),
                links: Array.from(document.querySelectorAll('a')).map(link => ({
                    text: link.textContent?.trim(),
                    href: link.href
                })),
                errorElements: Array.from(document.querySelectorAll('[class*="error"], .text-red-500')).map(el => ({
                    text: el.textContent?.trim(),
                    className: el.className
                }))
            };
        });
        
        console.log('🏠 [DOM CHECK]', JSON.stringify(domCheck, null, 2));
        
        // 타로 읽기 시작
        console.log('🎴 [TAROT START] 타로 읽기 버튼 찾기...');
        const startButton = domCheck.buttons.find(btn => 
            btn.text && (
                btn.text.includes('타로') || 
                btn.text.includes('시작') || 
                btn.text.includes('읽기') ||
                btn.text.includes('start')
            )
        );
        
        if (startButton) {
            console.log(`✅ [FOUND BUTTON] "${startButton.text}" 버튼 발견`);
            await page.click(`button:has-text("${startButton.text}")`);
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'debug-screenshots/local-02-after-start.png' });
            console.log('📸 [SCREENSHOT] 시작 후 페이지 캡처');
        } else {
            console.log('⚠️ [NO BUTTON] 시작 버튼을 찾을 수 없음. 직접 /reading 페이지로 이동');
            await page.goto(`${localUrl}/reading`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'debug-screenshots/local-02-reading-direct.png' });
            console.log('📸 [SCREENSHOT] 읽기 페이지 직접 이동');
        }
        
        // Reading 페이지 상태 확인
        const readingPageCheck = await page.evaluate(() => {
            return {
                currentUrl: window.location.href,
                hasTextarea: !!document.querySelector('textarea'),
                textareaInfo: {
                    placeholder: document.querySelector('textarea')?.placeholder,
                    value: document.querySelector('textarea')?.value,
                    rows: document.querySelector('textarea')?.rows
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
                        btn.text.includes('submit') ||
                        btn.type === 'submit'
                    )
                ),
                hasForm: !!document.querySelector('form'),
                allErrors: Array.from(document.querySelectorAll('[class*="error"], .text-red-500, [role="alert"]')).map(el => ({
                    text: el.textContent?.trim(),
                    className: el.className
                })).filter(el => el.text)
            };
        });
        
        console.log('📝 [READING PAGE]', JSON.stringify(readingPageCheck, null, 2));
        
        if (readingPageCheck.hasTextarea) {
            console.log('✍️ [INPUT] 질문 입력 중...');
            const testQuestion = '오늘의 운세는 어떨까요? AI가 타로카드를 읽어주세요.';
            await page.fill('textarea', testQuestion);
            await page.waitForTimeout(1000);
            
            console.log(`💬 [QUESTION] "${testQuestion}" 입력 완료`);
            await page.screenshot({ path: 'debug-screenshots/local-03-question-input.png' });
            
            if (readingPageCheck.submitButtons.length > 0) {
                const submitBtn = readingPageCheck.submitButtons[0];
                console.log(`🎯 [SUBMIT] "${submitBtn.text}" 버튼 클릭 준비`);
                
                // AI API 요청 가로채기 설정
                const aiApiInterceptions = [];
                
                await page.route('**/api/ai-reading', async (route) => {
                    console.log('🎯 [API INTERCEPT] AI 읽기 API 요청 감지!');
                    
                    const request = route.request();
                    const interceptData = {
                        intercepted: true,
                        url: request.url(),
                        method: request.method(),
                        headers: request.headers(),
                        body: request.postData(),
                        time: new Date().toISOString()
                    };
                    
                    console.log('📤 [INTERCEPTED REQUEST]');
                    console.log('  URL:', request.url());
                    console.log('  Method:', request.method());
                    console.log('  Headers:', JSON.stringify(request.headers(), null, 2));
                    console.log('  Body:', request.postData());
                    
                    try {
                        const response = await route.fetch();
                        const responseBody = await response.text();
                        
                        interceptData.responseStatus = response.status();
                        interceptData.responseHeaders = response.headers();
                        interceptData.responseBody = responseBody;
                        
                        console.log('📥 [INTERCEPTED RESPONSE]');
                        console.log('  Status:', response.status());
                        console.log('  Headers:', JSON.stringify(response.headers(), null, 2));
                        console.log('  Body:', responseBody);
                        
                        // 에러 상태 특별 처리
                        if (response.status() >= 400) {
                            console.log('❌ [API ERROR DETECTED]');
                            console.log('  Status Code:', response.status());
                            console.log('  Error Body:', responseBody);
                            
                            // JSON 파싱 시도
                            try {
                                const errorJson = JSON.parse(responseBody);
                                console.log('  Parsed Error:', JSON.stringify(errorJson, null, 2));
                            } catch (e) {
                                console.log('  Raw Error Text:', responseBody);
                            }
                        }
                        
                        aiApiInterceptions.push(interceptData);
                        await route.fulfill({ response });
                        
                    } catch (error) {
                        interceptData.error = error.message;
                        console.log('💥 [INTERCEPT ERROR]', error.message);
                        aiApiInterceptions.push(interceptData);
                        await route.abort();
                    }
                });
                
                // 제출 버튼 클릭
                console.log('🚀 [SUBMIT CLICK] 제출 버튼 클릭!');
                await page.click(`button:has-text("${submitBtn.text}")`);
                
                // API 응답 대기 (충분한 시간)
                console.log('⏳ [WAITING] API 응답 대기 중... (20초)');
                await page.waitForTimeout(20000);
                
                await page.screenshot({ path: 'debug-screenshots/local-04-after-submit.png' });
                console.log('📸 [SCREENSHOT] 제출 후 상태 캡처');
                
                // 결과 상태 상세 확인
                const finalResultCheck = await page.evaluate(() => {
                    return {
                        currentUrl: window.location.href,
                        visibleErrors: Array.from(document.querySelectorAll('[class*="error"], .text-red-500, [role="alert"], .toast')).map(el => ({
                            text: el.textContent?.trim(),
                            className: el.className,
                            isVisible: !el.hidden && el.offsetParent !== null
                        })).filter(el => el.text && el.isVisible),
                        loadingStates: Array.from(document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="pending"]')).map(el => ({
                            className: el.className,
                            text: el.textContent?.trim(),
                            isVisible: !el.hidden && el.offsetParent !== null
                        })).filter(el => el.isVisible),
                        aiResults: Array.from(document.querySelectorAll('[class*="ai"], [class*="reading"], [class*="interpretation"], [class*="result"]')).map(el => ({
                            className: el.className,
                            text: el.textContent?.trim()?.substring(0, 300),
                            isVisible: !el.hidden && el.offsetParent !== null
                        })).filter(el => el.text && el.isVisible),
                        pageContent: document.body.textContent?.trim().substring(0, 2000)
                    };
                });
                
                console.log('📊 [FINAL RESULT]', JSON.stringify(finalResultCheck, null, 2));
                
                // Firestore 실시간 상태 확인
                console.log('🔍 [FIRESTORE CHECK] aiProviders 컬렉션 상태 확인...');
                const firestoreDebug = await page.evaluate(async () => {
                    try {
                        if (!window.firebase?.firestore) {
                            return { error: 'Firestore not initialized' };
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
                        
                        // 인증 상태
                        const auth = window.firebase.auth?.();
                        const user = auth?.currentUser;
                        
                        return {
                            firestoreConnected: true,
                            providersCount: providers.length,
                            providers: providers,
                            userAuthenticated: !!user,
                            userId: user?.uid,
                            userEmail: user?.email,
                            timestamp: new Date().toISOString()
                        };
                    } catch (error) {
                        return {
                            error: error.message,
                            stack: error.stack,
                            firebaseAuth: typeof window.firebase?.auth,
                            firebaseFirestore: typeof window.firebase?.firestore
                        };
                    }
                });
                
                console.log('🔥 [FIRESTORE DEBUG]', JSON.stringify(firestoreDebug, null, 2));
                
                // 최종 종합 보고서 생성
                const comprehensiveReport = {
                    timestamp: new Date().toISOString(),
                    debugSession: 'localhost-runtime',
                    serverUrl: localUrl,
                    firebaseStatus: firebaseCheck,
                    domState: domCheck,
                    readingPageState: readingPageCheck,
                    finalResultState: finalResultCheck,
                    firestoreDebugResult: firestoreDebug,
                    aiApiInterceptions: aiApiInterceptions,
                    criticalLogs: criticalLogs,
                    apiTracker: apiTracker,
                    pageErrors: pageErrors,
                    screenshots: [
                        'local-01-homepage.png',
                        'local-02-after-start.png',
                        'local-03-question-input.png',
                        'local-04-after-submit.png'
                    ]
                };
                
                await fs.writeFile(
                    'debug-localhost-comprehensive-report.json',
                    JSON.stringify(comprehensiveReport, null, 2)
                );
                
                console.log('\n' + '='.repeat(80));
                console.log('🎯 [DEBUG COMPLETE] 로컬호스트 실시간 디버깅 완료!');
                console.log('='.repeat(80));
                console.log('📊 종합 리포트: debug-localhost-comprehensive-report.json');
                console.log('📸 스크린샷: debug-screenshots/local-*.png');
                console.log('\n🔍 주요 발견사항:');
                console.log(`  🔥 Firebase 초기화: ${firebaseCheck.firebaseObject !== 'undefined' ? '✅' : '❌'}`);
                console.log(`  📦 Firestore 사용 가능: ${firebaseCheck.firestoreAvailable !== 'undefined' ? '✅' : '❌'}`);
                console.log(`  🔐 사용자 인증: ${firestoreDebug.userAuthenticated ? '✅' : '❌'} (${firestoreDebug.userId || 'N/A'})`);
                console.log(`  📚 aiProviders 컬렉션: ${firestoreDebug.providersCount || 0}개`);
                console.log(`  🌐 API 호출: ${aiApiInterceptions.length}회`);
                console.log(`  ❌ 페이지 에러: ${pageErrors.length}개`);
                console.log(`  🚨 중요 로그: ${criticalLogs.length}개`);
                
                if (aiApiInterceptions.length > 0) {
                    console.log('\n🔥 API 인터셉션 결과:');
                    aiApiInterceptions.forEach((call, index) => {
                        console.log(`  ${index + 1}. ${call.method} ${call.url}`);
                        console.log(`     Status: ${call.responseStatus} ${call.responseStatus >= 400 ? '❌' : '✅'}`);
                        if (call.error) {
                            console.log(`     Error: ${call.error} ❌`);
                        }
                    });
                }
                
                if (finalResultCheck.visibleErrors.length > 0) {
                    console.log('\n🚨 감지된 에러:');
                    finalResultCheck.visibleErrors.forEach((error, index) => {
                        console.log(`  ${index + 1}. ${error.text}`);
                    });
                }
                
                console.log('\n🌐 브라우저를 열어둡니다. 수동 검사 후 Ctrl+C로 종료하세요.');
            }
        }
        
    } catch (error) {
        console.error('💥 [FATAL ERROR]', error);
        await page.screenshot({ path: 'debug-screenshots/local-fatal-error.png' });
    }
}

debugLocalhostRuntime();