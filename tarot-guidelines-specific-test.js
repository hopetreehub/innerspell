const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'tarot-guidelines-test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function tarotGuidelinesSpecificTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🔮 타로 지침 페이지 전용 테스트 시작...');
        
        const baseUrl = 'https://test-studio-firebase.vercel.app';
        
        // 1. 메인 페이지에서 타로 지침 링크 찾기
        console.log('1️⃣ 메인 페이지에서 타로 지침 링크 탐색...');
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-main-page-full.png'),
            fullPage: true 
        });
        
        // 다양한 방법으로 타로 지침 링크 찾기
        const possibleSelectors = [
            'a[href*="tarot-guidelines"]',
            'a[href*="guidelines"]',
            'a:has-text("타로 지침")',
            'a:has-text("지침")',
            'a:has-text("Tarot Guidelines")',
            'nav a:has-text("지침")',
            '.nav-link:has-text("지침")',
            'button:has-text("지침")'
        ];
        
        let linkFound = false;
        for (const selector of possibleSelectors) {
            const elements = await page.locator(selector).count();
            if (elements > 0) {
                console.log(`✅ 찾은 링크: ${selector} (${elements}개)`);
                linkFound = true;
                
                try {
                    await page.locator(selector).first().click();
                    await page.waitForLoadState('networkidle');
                    
                    await page.screenshot({ 
                        path: path.join(screenshotDir, '02-after-click-guidelines.png'),
                        fullPage: true 
                    });
                    
                    break;
                } catch (error) {
                    console.log(`❌ ${selector} 클릭 실패: ${error.message}`);
                    continue;
                }
            }
        }
        
        if (!linkFound) {
            console.log('⚠️ 메인 페이지에서 타로 지침 링크를 찾을 수 없습니다.');
        }
        
        // 2. 직접 URL로 타로 지침 페이지 접근
        console.log('2️⃣ 직접 URL로 타로 지침 페이지 접근...');
        
        const guidelineUrls = [
            `${baseUrl}/tarot-guidelines`,
            `${baseUrl}/guidelines`,
            `${baseUrl}/admin/tarot-guidelines`,
            `${baseUrl}/tarot`,
            `${baseUrl}/reading/guidelines`
        ];
        
        for (const url of guidelineUrls) {
            try {
                console.log(`🔍 시도 중: ${url}`);
                const response = await page.goto(url, { waitUntil: 'networkidle' });
                
                if (response.status() === 200) {
                    console.log(`✅ 성공적으로 접근: ${url} (상태: ${response.status()})`);
                    
                    await page.screenshot({ 
                        path: path.join(screenshotDir, `03-direct-access-${url.split('/').pop()}.png`),
                        fullPage: true 
                    });
                    
                    // 페이지 내용 분석
                    const title = await page.title();
                    const hasGuidelineContent = await page.locator('.guideline, .card, .guide-item, h2:has-text("지침"), h3:has-text("지침")').count();
                    
                    console.log(`📄 페이지 제목: ${title}`);
                    console.log(`📋 지침 관련 요소: ${hasGuidelineContent}개`);
                    
                    // 36개 지침이 모두 로딩되는지 확인
                    await page.waitForTimeout(3000); // 로딩 대기
                    
                    const guidelineCards = await page.locator('.guideline-card, .card, .guide-card, [data-testid*="guideline"]').count();
                    console.log(`🃏 타로 지침 카드: ${guidelineCards}개`);
                    
                    // 로딩 상태 확인
                    const loadingElements = await page.locator('.loading, .spinner, [data-loading="true"]').count();
                    console.log(`⏳ 로딩 요소: ${loadingElements}개`);
                    
                    if (guidelineCards > 0) {
                        await page.screenshot({ 
                            path: path.join(screenshotDir, '04-guidelines-loaded.png'),
                            fullPage: true 
                        });
                        
                        // 성능 측정
                        const performanceMetrics = await page.evaluate(() => {
                            return {
                                loadTime: performance.now(),
                                domElements: document.querySelectorAll('*').length,
                                images: document.querySelectorAll('img').length
                            };
                        });
                        
                        console.log(`📊 성능 메트릭:`, performanceMetrics);
                    }
                    
                    break;
                } else {
                    console.log(`❌ 접근 실패: ${url} (상태: ${response.status()})`);
                }
            } catch (error) {
                console.log(`❌ ${url} 접근 중 오류: ${error.message}`);
            }
        }
        
        // 3. 관리자 페이지에서 타로 지침 확인
        console.log('3️⃣ 관리자 페이지에서 타로 지침 확인...');
        
        try {
            await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
            
            // 관리자 로그인이 필요한 경우 시도
            const loginRequired = await page.locator('input[type="email"]').count() > 0;
            
            if (loginRequired) {
                console.log('🔐 관리자 로그인 시도...');
                
                await page.fill('input[type="email"]', 'admin@innerspell.com');
                await page.fill('input[type="password"]', 'test123');
                await page.click('button:has-text("로그인"), button:has-text("Login")');
                
                await page.waitForTimeout(3000);
                
                await page.screenshot({ 
                    path: path.join(screenshotDir, '05-admin-after-login.png'),
                    fullPage: true 
                });
            }
            
            // 관리자 페이지에서 타로 지침 탭 찾기
            const adminGuidelinesTab = await page.locator('a:has-text("타로 지침"), button:has-text("타로 지침"), [data-tab="tarot-guidelines"]').count();
            
            if (adminGuidelinesTab > 0) {
                await page.locator('a:has-text("타로 지침"), button:has-text("타로 지침"), [data-tab="tarot-guidelines"]').first().click();
                await page.waitForLoadState('networkidle');
                
                await page.screenshot({ 
                    path: path.join(screenshotDir, '06-admin-guidelines-tab.png'),
                    fullPage: true 
                });
                
                console.log('✅ 관리자 페이지에서 타로 지침 탭 접근 성공');
            } else {
                console.log('⚠️ 관리자 페이지에서 타로 지침 탭을 찾을 수 없습니다.');
            }
            
        } catch (error) {
            console.log(`❌ 관리자 페이지 접근 중 오류: ${error.message}`);
        }
        
        // 4. 페이지 소스에서 타로 지침 관련 요소 검색
        console.log('4️⃣ 페이지 소스 분석...');
        
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        
        const pageContent = await page.content();
        const hasGuidelinesInSource = pageContent.includes('tarot-guidelines') || 
                                     pageContent.includes('타로 지침') || 
                                     pageContent.includes('guidelines');
        
        console.log(`📝 페이지 소스에 지침 관련 내용: ${hasGuidelinesInSource ? '있음' : '없음'}`);
        
        // 5. 네트워크 탭에서 API 호출 확인
        console.log('5️⃣ 네트워크 요청 모니터링...');
        
        const apiCalls = [];
        page.on('response', response => {
            if (response.url().includes('guideline') || response.url().includes('tarot')) {
                apiCalls.push({
                    url: response.url(),
                    status: response.status(),
                    contentType: response.headers()['content-type']
                });
            }
        });
        
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        
        console.log(`🌐 타로/지침 관련 API 호출: ${apiCalls.length}개`);
        apiCalls.forEach((call, index) => {
            console.log(`  ${index + 1}. ${call.url} (${call.status})`);
        });
        
        // 결과 리포트 생성
        const testReport = {
            timestamp: new Date().toISOString(),
            baseUrl: baseUrl,
            results: {
                mainPageGuidelinesLinkFound: linkFound,
                directUrlsAttempted: guidelineUrls.length,
                adminPageAccessAttempted: true,
                sourceCodeAnalyzed: hasGuidelinesInSource,
                apiCallsDetected: apiCalls.length,
                apiCalls: apiCalls
            },
            recommendations: [
                linkFound ? '메인 페이지에서 타로 지침 링크를 찾았습니다.' : '메인 페이지에 타로 지침 링크를 추가하는 것을 고려해보세요.',
                apiCalls.length > 0 ? '타로 지침 관련 API가 정상적으로 호출되고 있습니다.' : '타로 지침 API 엔드포인트를 확인해보세요.',
                '관리자 페이지에서의 타로 지침 관리 기능을 검토해보세요.'
            ]
        };
        
        fs.writeFileSync(
            path.join(screenshotDir, 'tarot-guidelines-test-report.json'),
            JSON.stringify(testReport, null, 2)
        );
        
        console.log('\n📊 타로 지침 전용 테스트 완료!');
        console.log(`📸 스크린샷은 ${screenshotDir} 폴더에 저장되었습니다.`);
        
    } catch (error) {
        console.error('❌ 타로 지침 테스트 중 오류:', error);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'error-final.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
}

tarotGuidelinesSpecificTest().catch(console.error);