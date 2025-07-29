const { chromium } = require('playwright');

async function auditInnerSpellUX() {
    console.log('🔍 InnerSpell UX/UI 종합 점검 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // 천천히 실행하여 관찰
    });
    
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    const baseUrl = 'https://test-studio-firebase.vercel.app';
    
    try {
        console.log('\n📍 1. 메인 페이지 첫 방문자 경험 분석');
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);
        
        // 메인 페이지 스크린샷
        await page.screenshot({ 
            path: 'screenshots/01-main-page-first-visit.png', 
            fullPage: true 
        });
        console.log('✅ 메인 페이지 스크린샷 저장됨');
        
        // 네비게이션 가시성 확인
        const nav = await page.locator('nav').first();
        const isNavVisible = await nav.isVisible();
        console.log(`📌 네비게이션 가시성: ${isNavVisible ? '✅' : '❌'}`);
        
        // CTA 버튼 확인
        const ctaButtons = await page.locator('button, .btn, a[class*="button"]').all();
        console.log(`📌 CTA 버튼 개수: ${ctaButtons.length}개`);
        
        console.log('\n📍 2. 타로 리딩 플로우 테스트');
        // 타로 리딩 페이지로 이동
        const tarotLink = page.locator('a[href*="tarot"], a:has-text("타로"), a:has-text("Tarot")').first();
        if (await tarotLink.count() > 0) {
            await tarotLink.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: 'screenshots/02-tarot-reading-page.png', 
                fullPage: true 
            });
            console.log('✅ 타로 리딩 페이지 접근 성공');
        } else {
            console.log('❌ 타로 리딩 링크를 찾을 수 없음');
        }
        
        console.log('\n📍 3. 블로그 탐색 경험');
        await page.goto(`${baseUrl}/blog`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: 'screenshots/03-blog-main.png', 
            fullPage: true 
        });
        
        // 블로그 포스트 개수 확인
        const blogPosts = await page.locator('article, .post, [class*="post"]').all();
        console.log(`📌 블로그 포스트 개수: ${blogPosts.length}개`);
        
        console.log('\n📍 4. 모바일 반응형 테스트');
        // 모바일 뷰포트로 변경
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: 'screenshots/04-mobile-main.png', 
            fullPage: true 
        });
        console.log('✅ 모바일 뷰 스크린샷 저장됨');
        
        // 햄버거 메뉴 확인
        const mobileMenu = await page.locator('[class*="mobile"], [class*="hamburger"], button[aria-label*="menu"]').first();
        if (await mobileMenu.count() > 0) {
            console.log('✅ 모바일 메뉴 버튼 발견');
            await mobileMenu.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ 
                path: 'screenshots/05-mobile-menu-open.png', 
                fullPage: true 
            });
        }
        
        console.log('\n📍 5. 접근성 기본 점검');
        // 태블릿 뷰포트로 변경
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: 'screenshots/06-tablet-view.png', 
            fullPage: true 
        });
        
        // 키보드 네비게이션 테스트
        console.log('⌨️ 키보드 네비게이션 테스트 중...');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        await page.keyboard.press('Tab');
        await page.screenshot({ 
            path: 'screenshots/07-keyboard-navigation.png', 
            fullPage: true 
        });
        
        console.log('\n📍 6. 다크모드 테스트');
        // 다크모드 토글 찾기 및 테스트
        const darkModeToggle = await page.locator('[class*="dark"], [class*="theme"], button:has-text("Dark"), button:has-text("다크")').first();
        if (await darkModeToggle.count() > 0) {
            await darkModeToggle.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ 
                path: 'screenshots/08-dark-mode.png', 
                fullPage: true 
            });
            console.log('✅ 다크모드 전환 성공');
        } else {
            console.log('❌ 다크모드 토글을 찾을 수 없음');
        }
        
        console.log('\n🎯 UX 점검 완료! 스크린샷들을 분석합니다...');
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error.message);
        await page.screenshot({ 
            path: 'screenshots/error-screenshot.png', 
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
}

auditInnerSpellUX().catch(console.error);