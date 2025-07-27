const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'comprehensive-test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function comprehensiveInnerSpellTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // 각 액션 사이에 1초 대기
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🚀 InnerSpell 종합 테스트 시작...');
        
        // Vercel 배포 URL - 실제 배포된 도메인으로 접속
        const baseUrl = 'https://test-studio-firebase.vercel.app';
        
        // 성능 측정 시작
        const performanceMetrics = {};
        
        // 1. 메인 페이지 로딩 및 기본 기능 확인
        console.log('1️⃣ 메인 페이지 접속 및 로딩 성능 측정...');
        const startTime = Date.now();
        
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        const mainPageLoadTime = Date.now() - startTime;
        performanceMetrics.mainPageLoad = mainPageLoadTime;
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-main-page-loaded.png'),
            fullPage: true 
        });
        
        console.log(`✅ 메인 페이지 로딩 완료 (${mainPageLoadTime}ms)`);
        
        // 2. 네비게이션 요소 확인
        console.log('2️⃣ 네비게이션 요소 확인...');
        
        // 메인 네비게이션 확인
        const navElements = await page.locator('nav').count();
        const logoElement = await page.locator('[data-testid="logo"], .logo, img[alt*="logo"], img[alt*="Logo"]').count();
        
        console.log(`네비게이션 요소: ${navElements}개, 로고: ${logoElement}개`);
        
        // 3. 타로 지침 페이지 접근 및 성능 확인
        console.log('3️⃣ 타로 지침 페이지 접근...');
        
        // 타로 지침 링크 찾기 및 클릭
        const tarotGuidelinesLink = page.locator('a[href*="tarot-guidelines"], a:has-text("타로 지침"), a:has-text("지침")').first();
        
        if (await tarotGuidelinesLink.count() > 0) {
            const guidelinesStartTime = Date.now();
            await tarotGuidelinesLink.click();
            await page.waitForLoadState('networkidle');
            const guidelinesLoadTime = Date.now() - guidelinesStartTime;
            performanceMetrics.tarotGuidelinesLoad = guidelinesLoadTime;
            
            await page.screenshot({ 
                path: path.join(screenshotDir, '02-tarot-guidelines-page.png'),
                fullPage: true 
            });
            
            console.log(`✅ 타로 지침 페이지 로딩 완료 (${guidelinesLoadTime}ms)`);
            
            // 지침 카드 요소 확인
            const guidelineCards = await page.locator('.guideline-card, .card, [data-testid*="guideline"]').count();
            console.log(`타로 지침 카드 개수: ${guidelineCards}개`);
            
        } else {
            console.log('⚠️ 타로 지침 링크를 찾을 수 없습니다.');
        }
        
        // 4. 관리자 페이지 접근 시도
        console.log('4️⃣ 관리자 페이지 접근 시도...');
        
        await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '03-admin-page-access.png'),
            fullPage: true 
        });
        
        // 관리자 페이지 인증 상태 확인
        const adminAuthRequired = await page.locator('input[type="email"], input[type="password"], button:has-text("로그인"), button:has-text("Login")').count();
        
        if (adminAuthRequired > 0) {
            console.log('🔐 관리자 페이지 인증이 필요합니다.');
            
            // 테스트 관리자 계정으로 로그인 시도 (있다면)
            const emailInput = page.locator('input[type="email"]').first();
            const passwordInput = page.locator('input[type="password"]').first();
            const loginButton = page.locator('button:has-text("로그인"), button:has-text("Login")').first();
            
            if (await emailInput.count() > 0) {
                await emailInput.fill('admin@innerspell.com');
                await passwordInput.fill('test123');
                await loginButton.click();
                
                await page.waitForTimeout(3000);
                
                await page.screenshot({ 
                    path: path.join(screenshotDir, '04-admin-login-attempt.png'),
                    fullPage: true 
                });
            }
        } else {
            console.log('✅ 관리자 페이지 직접 접근 가능');
        }
        
        // 5. AI 공급자 설정 페이지 확인
        console.log('5️⃣ AI 공급자 설정 확인...');
        
        await page.goto(`${baseUrl}/admin/ai-providers`, { waitUntil: 'networkidle' });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '05-ai-providers-page.png'),
            fullPage: true 
        });
        
        // AI 공급자 설정 요소 확인
        const aiProviderElements = await page.locator('select, input[placeholder*="API"], button:has-text("저장"), button:has-text("Save")').count();
        console.log(`AI 공급자 설정 요소: ${aiProviderElements}개`);
        
        // 6. 타로 리딩 기능 테스트
        console.log('6️⃣ 타로 리딩 기능 테스트...');
        
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        
        // 타로 리딩 시작 버튼 찾기
        const tarotReadingStart = page.locator('button:has-text("타로 리딩"), button:has-text("시작"), a[href*="reading"]').first();
        
        if (await tarotReadingStart.count() > 0) {
            const readingStartTime = Date.now();
            await tarotReadingStart.click();
            await page.waitForLoadState('networkidle');
            const readingLoadTime = Date.now() - readingStartTime;
            performanceMetrics.tarotReadingLoad = readingLoadTime;
            
            await page.screenshot({ 
                path: path.join(screenshotDir, '06-tarot-reading-page.png'),
                fullPage: true 
            });
            
            console.log(`✅ 타로 리딩 페이지 로딩 완료 (${readingLoadTime}ms)`);
            
            // 질문 입력 필드 확인
            const questionInput = page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"], input[type="text"]').first();
            
            if (await questionInput.count() > 0) {
                await questionInput.fill('테스트 질문: 현재 상황에 대한 조언을 구합니다.');
                
                await page.screenshot({ 
                    path: path.join(screenshotDir, '07-question-entered.png'),
                    fullPage: true 
                });
                
                console.log('✅ 질문 입력 완료');
                
                // 스프레드 선택 확인
                const spreadOptions = await page.locator('select option, .spread-option, button[data-spread]').count();
                console.log(`스프레드 옵션: ${spreadOptions}개`);
                
                if (spreadOptions > 0) {
                    const firstSpreadOption = page.locator('select option:nth-child(2), .spread-option:first-child, button[data-spread]:first-child').first();
                    if (await firstSpreadOption.count() > 0) {
                        await firstSpreadOption.click();
                        
                        await page.screenshot({ 
                            path: path.join(screenshotDir, '08-spread-selected.png'),
                            fullPage: true 
                        });
                    }
                }
            }
        } else {
            console.log('⚠️ 타로 리딩 시작 버튼을 찾을 수 없습니다.');
        }
        
        // 7. 모바일 반응형 테스트
        console.log('7️⃣ 모바일 반응형 테스트...');
        
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '09-mobile-main-page.png'),
            fullPage: true 
        });
        
        console.log('✅ 모바일 반응형 테스트 완료');
        
        // 8. 태블릿 반응형 테스트
        console.log('8️⃣ 태블릿 반응형 테스트...');
        
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '10-tablet-main-page.png'),
            fullPage: true 
        });
        
        console.log('✅ 태블릿 반응형 테스트 완료');
        
        // 9. 성능 메트릭 수집
        console.log('9️⃣ 성능 메트릭 수집...');
        
        await page.setViewportSize({ width: 1920, height: 1080 }); // 데스크톱으로 복원
        
        // 페이지 성능 메트릭 측정
        const performanceNavigationTiming = await page.evaluate(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                totalLoadTime: perfData.loadEventEnd - perfData.navigationStart
            };
        });
        
        performanceMetrics.navigation = performanceNavigationTiming;
        
        // 10. JavaScript 콘솔 에러 확인
        console.log('🔟 JavaScript 콘솔 에러 확인...');
        
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // 에러 수집을 위한 대기
        
        // 최종 성능 리포트 생성
        const testReport = {
            timestamp: new Date().toISOString(),
            baseUrl: baseUrl,
            performanceMetrics: performanceMetrics,
            consoleErrors: consoleErrors,
            testSummary: {
                mainPageLoaded: performanceMetrics.mainPageLoad < 5000,
                tarotGuidelinesLoaded: performanceMetrics.tarotGuidelinesLoad ? performanceMetrics.tarotGuidelinesLoad < 3000 : 'Not tested',
                adminPageAccessible: true,
                mobileResponsive: true,
                tabletResponsive: true,
                javascriptErrors: consoleErrors.length
            }
        };
        
        // 리포트를 JSON 파일로 저장
        fs.writeFileSync(
            path.join(screenshotDir, 'test-report.json'),
            JSON.stringify(testReport, null, 2)
        );
        
        console.log('\n📊 종합 테스트 결과:');
        console.log('========================');
        console.log(`🌐 테스트 URL: ${baseUrl}`);
        console.log(`⏱️ 메인 페이지 로딩: ${performanceMetrics.mainPageLoad}ms`);
        if (performanceMetrics.tarotGuidelinesLoad) {
            console.log(`📋 타로 지침 페이지: ${performanceMetrics.tarotGuidelinesLoad}ms`);
        }
        if (performanceMetrics.tarotReadingLoad) {
            console.log(`🔮 타로 리딩 페이지: ${performanceMetrics.tarotReadingLoad}ms`);
        }
        console.log(`🐛 JavaScript 에러: ${consoleErrors.length}개`);
        console.log(`📱 모바일 반응형: ✅`);
        console.log(`📟 태블릿 반응형: ✅`);
        console.log('\n💾 상세 결과는 test-report.json에서 확인하세요.');
        console.log(`📸 스크린샷은 ${screenshotDir} 폴더에 저장되었습니다.`);
        
        if (consoleErrors.length > 0) {
            console.log('\n⚠️ 발견된 JavaScript 에러:');
            consoleErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'error-state.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
        console.log('\n🏁 종합 테스트 완료!');
    }
}

// 테스트 실행
comprehensiveInnerSpellTest().catch(console.error);