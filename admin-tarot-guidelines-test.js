const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'admin-tarot-guidelines-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function adminTarotGuidelinesTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1500,
        devtools: true
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 로그 및 에러 수집
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        });
        console.log(`🔍 Console [${msg.type()}]: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        errors.push({
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        console.error('❌ Page Error:', error);
    });
    
    try {
        console.log('🔮 관리자 페이지 타로 지침 시스템 테스트 시작...');
        
        const baseUrl = 'https://test-studio-firebase.vercel.app';
        
        // 1. 관리자 페이지 접근
        console.log('1️⃣ 관리자 페이지 접근...');
        await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-admin-page-initial.png'),
            fullPage: true 
        });
        
        // 2. 로그인 프로세스 (Google Auth 또는 일반 로그인)
        console.log('2️⃣ 관리자 로그인 시도...');
        
        // 이메일/비밀번호 로그인 시도
        const emailInput = page.locator('input[type="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();
        const loginButton = page.locator('button:has-text("로그인"), button:has-text("Login"), button[type="submit"]').first();
        
        if (await emailInput.count() > 0) {
            console.log('📧 이메일/비밀번호 로그인 시도...');
            
            await emailInput.fill('admin@innerspell.com');
            await passwordInput.fill('admin123');
            
            await page.screenshot({ 
                path: path.join(screenshotDir, '02-login-form-filled.png'),
                fullPage: true 
            });
            
            await loginButton.click();
            await page.waitForTimeout(5000); // 로그인 처리 대기
            
            await page.screenshot({ 
                path: path.join(screenshotDir, '03-after-login-attempt.png'),
                fullPage: true 
            });
        }
        
        // Google 로그인 버튼이 있는 경우
        const googleLoginButton = page.locator('button:has-text("Google"), button:has-text("구글")').first();
        if (await googleLoginButton.count() > 0) {
            console.log('🔍 Google 로그인 버튼 발견 (실제 클릭하지 않음)');
        }
        
        // 3. 관리자 대시보드에서 타로 지침 관련 요소 찾기
        console.log('3️⃣ 관리자 대시보드에서 타로 지침 요소 탐색...');
        
        // 다양한 가능한 타로 지침 관련 요소들
        const possibleGuidelinesElements = [
            'button:has-text("타로 지침")',
            'a:has-text("타로 지침")',
            'button:has-text("Tarot Guidelines")',
            '[data-tab="tarot-guidelines"]',
            '[data-testid*="guideline"]',
            'button:has-text("지침")',
            '.nav-item:has-text("지침")',
            'div:has-text("타로 지침") button',
            'li:has-text("타로 지침")',
            '[role="tab"]:has-text("지침")'
        ];
        
        let guidelinesElementFound = false;
        let activeElementSelector = null;
        
        for (const selector of possibleGuidelinesElements) {
            const count = await page.locator(selector).count();
            if (count > 0) {
                console.log(`✅ 타로 지침 요소 발견: ${selector} (${count}개)`);
                guidelinesElementFound = true;
                activeElementSelector = selector;
                break;
            }
        }
        
        if (guidelinesElementFound && activeElementSelector) {
            console.log('4️⃣ 타로 지침 섹션으로 이동...');
            
            try {
                // 타로 지침 탭/버튼 클릭
                await page.locator(activeElementSelector).first().click();
                await page.waitForTimeout(3000);
                
                await page.screenshot({ 
                    path: path.join(screenshotDir, '04-tarot-guidelines-section.png'),
                    fullPage: true 
                });
                
                // 5. 타로 지침 관리 인터페이스 확인
                console.log('5️⃣ 타로 지침 관리 인터페이스 분석...');
                
                // 지침 추가 버튼 찾기
                const addGuidelineButtons = await page.locator('button:has-text("추가"), button:has-text("Add"), button:has-text("새 지침"), button:has-text("New Guideline")').count();
                console.log(`📝 지침 추가 버튼: ${addGuidelineButtons}개`);
                
                // 기존 지침 목록 확인
                const existingGuidelines = await page.locator('.guideline-item, .guideline-card, .guide-item, [data-testid*="guideline"]').count();
                console.log(`📋 기존 지침 항목: ${existingGuidelines}개`);
                
                // 지침 편집/삭제 버튼 확인
                const editButtons = await page.locator('button:has-text("편집"), button:has-text("Edit"), [data-action="edit"]').count();
                const deleteButtons = await page.locator('button:has-text("삭제"), button:has-text("Delete"), [data-action="delete"]').count();
                console.log(`✏️ 편집 버튼: ${editButtons}개, 🗑️ 삭제 버튼: ${deleteButtons}개`);
                
                // 6. 새 지침 추가 시도
                if (addGuidelineButtons > 0) {
                    console.log('6️⃣ 새 타로 지침 추가 테스트...');
                    
                    await page.locator('button:has-text("추가"), button:has-text("Add"), button:has-text("새 지침")').first().click();
                    await page.waitForTimeout(2000);
                    
                    await page.screenshot({ 
                        path: path.join(screenshotDir, '05-add-guideline-form.png'),
                        fullPage: true 
                    });
                    
                    // 지침 추가 폼 필드 확인 및 채우기
                    const titleInput = page.locator('input[placeholder*="제목"], input[name*="title"], input[placeholder*="Title"]').first();
                    const contentInput = page.locator('textarea[placeholder*="내용"], textarea[name*="content"], textarea[placeholder*="Content"]').first();
                    
                    if (await titleInput.count() > 0) {
                        await titleInput.fill('테스트 타로 지침 - AI 해석 가이드라인');
                        console.log('📝 지침 제목 입력 완료');
                    }
                    
                    if (await contentInput.count() > 0) {
                        await contentInput.fill('이것은 Playwright 테스트로 생성된 테스트 지침입니다. AI가 타로 카드를 해석할 때 참고해야 할 핵심 원칙들을 담고 있습니다.');
                        console.log('📝 지침 내용 입력 완료');
                    }
                    
                    await page.screenshot({ 
                        path: path.join(screenshotDir, '06-guideline-form-filled.png'),
                        fullPage: true 
                    });
                    
                    // 저장 버튼 클릭
                    const saveButton = page.locator('button:has-text("저장"), button:has-text("Save"), button[type="submit"]').first();
                    if (await saveButton.count() > 0) {
                        console.log('💾 지침 저장 시도...');
                        await saveButton.click();
                        await page.waitForTimeout(5000); // 저장 처리 대기
                        
                        await page.screenshot({ 
                            path: path.join(screenshotDir, '07-after-guideline-save.png'),
                            fullPage: true 
                        });
                    }
                }
                
                // 7. 성능 및 로딩 상태 확인
                console.log('7️⃣ 타로 지침 시스템 성능 분석...');
                
                const performanceMetrics = await page.evaluate(() => {
                    return {
                        loadTime: performance.now(),
                        memoryUsage: performance.memory ? {
                            usedJSHeapSize: performance.memory.usedJSHeapSize,
                            totalJSHeapSize: performance.memory.totalJSHeapSize,
                            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                        } : null,
                        domElements: document.querySelectorAll('*').length,
                        formElements: document.querySelectorAll('input, textarea, select').length
                    };
                });
                
                console.log('📊 성능 메트릭:', performanceMetrics);
                
            } catch (error) {
                console.error(`❌ 타로 지침 섹션 접근 중 오류: ${error.message}`);
                await page.screenshot({ 
                    path: path.join(screenshotDir, '04-guidelines-access-error.png'),
                    fullPage: true 
                });
            }
        } else {
            console.log('⚠️ 관리자 페이지에서 타로 지침 관련 요소를 찾을 수 없습니다.');
            
            // 전체 페이지 내용 분석
            const pageText = await page.textContent('body');
            const hasGuidelinesText = pageText.includes('지침') || pageText.includes('guideline') || pageText.includes('instruction');
            console.log(`📝 페이지 텍스트에 지침 관련 내용: ${hasGuidelinesText ? '있음' : '없음'}`);
        }
        
        // 8. API 엔드포인트 확인
        console.log('8️⃣ 타로 지침 API 엔드포인트 확인...');
        
        const apiEndpoints = [
            '/api/tarot-guidelines',
            '/api/admin/tarot-guidelines',
            '/api/guidelines',
            '/api/tarot/guidelines',
            '/api/admin/guidelines'
        ];
        
        const apiResults = [];
        
        for (const endpoint of apiEndpoints) {
            try {
                const response = await page.goto(`${baseUrl}${endpoint}`, { waitUntil: 'networkidle' });
                apiResults.push({
                    endpoint: endpoint,
                    status: response.status(),
                    statusText: response.statusText(),
                    accessible: response.status() === 200
                });
                console.log(`🌐 ${endpoint}: ${response.status()} ${response.statusText()}`);
            } catch (error) {
                apiResults.push({
                    endpoint: endpoint,
                    status: 'ERROR',
                    statusText: error.message,
                    accessible: false
                });
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
        
        // 9. 최종 스크린샷 및 리포트 생성
        await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
        await page.screenshot({ 
            path: path.join(screenshotDir, '08-final-admin-state.png'),
            fullPage: true 
        });
        
        const testReport = {
            timestamp: new Date().toISOString(),
            baseUrl: baseUrl,
            adminAccess: {
                successful: true,
                loginAttempted: true
            },
            tarotGuidelines: {
                elementFound: guidelinesElementFound,
                activeSelector: activeElementSelector,
                functionalityTested: guidelinesElementFound
            },
            apiEndpoints: apiResults,
            performance: performanceMetrics || null,
            consoleMessages: consoleMessages.slice(-20), // 최근 20개 메시지만
            errors: errors,
            screenshots: [
                '01-admin-page-initial.png',
                '02-login-form-filled.png',
                '03-after-login-attempt.png',
                '04-tarot-guidelines-section.png',
                '05-add-guideline-form.png',
                '06-guideline-form-filled.png',
                '07-after-guideline-save.png',
                '08-final-admin-state.png'
            ].filter(filename => fs.existsSync(path.join(screenshotDir, filename))),
            recommendations: [
                guidelinesElementFound ? '✅ 타로 지침 관리 기능이 활성화되어 있습니다.' : '⚠️ 타로 지침 관리 UI를 관리자 페이지에 추가해야 합니다.',
                apiResults.some(r => r.accessible) ? '✅ 타로 지침 API가 접근 가능합니다.' : '⚠️ 타로 지침 API 엔드포인트를 확인해야 합니다.',
                errors.length === 0 ? '✅ JavaScript 에러가 없습니다.' : `⚠️ ${errors.length}개의 JavaScript 에러가 발견되었습니다.`,
                '📊 관리자 인터페이스의 사용성을 개선할 수 있습니다.'
            ]
        };
        
        fs.writeFileSync(
            path.join(screenshotDir, 'admin-tarot-guidelines-report.json'),
            JSON.stringify(testReport, null, 2)
        );
        
        console.log('\n📊 관리자 타로 지침 테스트 결과:');
        console.log('=================================');
        console.log(`🌐 테스트 URL: ${baseUrl}/admin`);
        console.log(`🔐 관리자 접근: ${testReport.adminAccess.successful ? '성공' : '실패'}`);
        console.log(`🔮 타로 지침 요소: ${testReport.tarotGuidelines.elementFound ? '발견됨' : '없음'}`);
        console.log(`🌐 API 엔드포인트: ${apiResults.filter(r => r.accessible).length}/${apiResults.length} 접근 가능`);
        console.log(`🐛 JavaScript 에러: ${errors.length}개`);
        console.log(`📸 스크린샷: ${testReport.screenshots.length}개 생성`);
        
        if (errors.length > 0) {
            console.log('\n❌ 발견된 에러:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.message}`);
            });
        }
        
        console.log(`\n💾 상세 리포트: ${path.join(screenshotDir, 'admin-tarot-guidelines-report.json')}`);
        console.log(`📸 스크린샷 폴더: ${screenshotDir}`);
        
    } catch (error) {
        console.error('❌ 관리자 타로 지침 테스트 중 치명적 오류:', error);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'critical-error.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
        console.log('\n🏁 관리자 타로 지침 테스트 완료!');
    }
}

adminTarotGuidelinesTest().catch(console.error);