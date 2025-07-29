const { chromium } = require('playwright');

async function finalUXEvaluation() {
    console.log('🎯 InnerSpell 최종 UX 평가 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    
    const page = await context.newPage();
    const baseUrl = 'https://test-studio-firebase.vercel.app';
    
    try {
        console.log('\n📊 1. 페이지 로딩 성능 측정');
        const startTime = Date.now();
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const loadTime = Date.now() - startTime;
        console.log(`⚡ 페이지 로딩 시간: ${loadTime}ms`);
        
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: 'screenshots/final-performance-test.png', 
            fullPage: true 
        });
        
        console.log('\n🎨 2. 브랜딩 및 시각적 일관성 평가');
        
        // 색상 일관성 확인
        const primaryColors = await page.$$eval('*', elements => {
            const colors = new Set();
            elements.forEach(el => {
                const styles = window.getComputedStyle(el);
                if (styles.color.includes('rgb')) colors.add(styles.color);
                if (styles.backgroundColor.includes('rgb')) colors.add(styles.backgroundColor);
            });
            return Array.from(colors).slice(0, 10);
        });
        console.log(`🎨 주요 색상 팔레트: ${primaryColors.length}개 색상 사용`);
        
        // 폰트 일관성 확인
        const fonts = await page.$$eval('*', elements => {
            const fontFamilies = new Set();
            elements.forEach(el => {
                const fontFamily = window.getComputedStyle(el).fontFamily;
                if (fontFamily && fontFamily !== 'initial') {
                    fontFamilies.add(fontFamily);
                }
            });
            return Array.from(fontFamilies).slice(0, 5);
        });
        console.log(`📝 사용된 폰트: ${fonts.length}개`);
        
        console.log('\n🧭 3. 네비게이션 사용성 테스트');
        
        // 네비게이션 링크 확인
        const navLinks = await page.locator('nav a, header a').all();
        console.log(`🔗 네비게이션 링크 개수: ${navLinks.length}개`);
        
        // 주요 CTA 버튼 확인
        const ctaButtons = await page.locator('button[class*="primary"], .btn-primary, button:has-text("시작"), button:has-text("Start")').all();
        console.log(`🎯 주요 CTA 버튼: ${ctaButtons.length}개`);
        
        console.log('\n📱 4. 핵심 사용자 여정 테스트');
        
        // 타로 리딩 시작 플로우
        try {
            const tarotStartButton = page.locator('button:has-text("타로 읽기 시작"), a:has-text("타로 읽기 시작")').first();
            if (await tarotStartButton.count() > 0) {
                await tarotStartButton.click();
                await page.waitForTimeout(2000);
                await page.screenshot({ 
                    path: 'screenshots/final-tarot-flow-start.png', 
                    fullPage: true 
                });
                console.log('✅ 타로 리딩 시작 플로우 성공');
                
                // 타로 페이지에서 카드 선택 테스트
                const cardButtons = await page.locator('button:has-text("카드"), .card-button').all();
                if (cardButtons.length > 0) {
                    await cardButtons[0].click();
                    await page.waitForTimeout(2000);
                    await page.screenshot({ 
                        path: 'screenshots/final-card-selection.png', 
                        fullPage: true 
                    });
                    console.log('✅ 카드 선택 인터랙션 성공');
                }
            }
        } catch (error) {
            console.log('❌ 타로 리딩 플로우 테스트 중 오류:', error.message);
        }
        
        console.log('\n🔍 5. 전환율 최적화 요소 분석');
        
        // 폼 요소 확인
        const forms = await page.locator('form').all();
        const inputs = await page.locator('input, textarea, select').all();
        console.log(`📝 폼: ${forms.length}개, 입력 필드: ${inputs.length}개`);
        
        // 소셜 프루프 요소 확인
        const testimonials = await page.locator('[class*="testimonial"], [class*="review"]').all();
        console.log(`💬 추천사/리뷰: ${testimonials.length}개`);
        
        // 신뢰도 지표 확인
        const trustSignals = await page.locator('[class*="badge"], [class*="certification"], [class*="trust"]').all();
        console.log(`🏆 신뢰도 지표: ${trustSignals.length}개`);
        
        console.log('\n⚡ 6. 로딩 상태 및 에러 처리 확인');
        
        // 로딩 스피너 확인
        const loadingElements = await page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]').all();
        console.log(`⏳ 로딩 인디케이터: ${loadingElements.length}개`);
        
        console.log('\n🎭 7. 다크모드 및 테마 전환 테스트');
        
        // 다크모드 토글 찾기
        const themeToggle = await page.locator('[class*="theme"], [class*="dark"], button[aria-label*="theme"]').first();
        if (await themeToggle.count() > 0) {
            await themeToggle.click();
            await page.waitForTimeout(1500);
            await page.screenshot({ 
                path: 'screenshots/final-dark-mode-test.png', 
                fullPage: true 
            });
            console.log('✅ 다크모드 전환 성공');
            
            // 다시 라이트모드로
            await themeToggle.click();
            await page.waitForTimeout(1000);
        } else {
            console.log('❌ 테마 전환 기능을 찾을 수 없음');
        }
        
        console.log('\n📊 8. 최종 스크린샷 및 레포트 생성');
        await page.screenshot({ 
            path: 'screenshots/final-complete-evaluation.png', 
            fullPage: true 
        });
        
        // 페이지 구조 분석
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        const images = await page.locator('img').all();
        const links = await page.locator('a').all();
        
        console.log(`\n📈 페이지 구조 분석:`);
        console.log(`- 제목 요소: ${headings.length}개`);
        console.log(`- 이미지: ${images.length}개`);
        console.log(`- 링크: ${links.length}개`);
        
        // 메타 정보 확인
        const title = await page.title();
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        console.log(`\n🔍 SEO 메타 정보:`);
        console.log(`- 제목: ${title}`);
        console.log(`- 설명: ${description ? description.substring(0, 100) + '...' : '없음'}`);
        
    } catch (error) {
        console.error('❌ 최종 평가 중 오류 발생:', error.message);
        await page.screenshot({ 
            path: 'screenshots/final-evaluation-error.png', 
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
    
    console.log('\n🎯 InnerSpell UX 최종 평가 완료!');
}

finalUXEvaluation().catch(console.error);