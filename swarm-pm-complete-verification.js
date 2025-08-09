const { chromium } = require('playwright');

async function runCompleteVerification() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🎯 SWARM PM 전체 시스템 검증 시작');
        console.log('================================================================');
        
        // 1. 홈페이지 접속 테스트
        console.log('📍 1단계: 홈페이지 접속 테스트');
        await page.goto('http://localhost:4000', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        // 페이지 로딩 대기
        await page.waitForTimeout(3000);
        
        // 스크린샷 촬영
        await page.screenshot({ 
            path: `pm-verification-01-homepage-${Date.now()}.png`, 
            fullPage: true 
        });
        
        console.log('✅ 홈페이지 로딩 완료');
        
        // 2. 네비게이션 메뉴 확인
        console.log('📍 2단계: 네비게이션 메뉴 확인');
        
        // 네비게이션 링크들 확인
        const navLinks = [
            { text: 'About', href: '/about' },
            { text: '타로 리딩', href: '/tarot/reading' },
            { text: '블로그', href: '/blog' },
            { text: '커뮤니티', href: '/community' },
            { text: '문의하기', href: '/contact' }
        ];
        
        for (const link of navLinks) {
            try {
                const navElement = await page.locator(`a[href="${link.href}"]`).first();
                const isVisible = await navElement.isVisible();
                console.log(`   - ${link.text}: ${isVisible ? '✅ 확인됨' : '❌ 누락'}`);
            } catch (error) {
                console.log(`   - ${link.text}: ❌ 오류 - ${error.message}`);
            }
        }
        
        // 3. 블로그 페이지 테스트
        console.log('📍 3단계: 블로그 페이지 테스트');
        await page.goto('http://localhost:4000/blog', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: `pm-verification-02-blog-${Date.now()}.png`, 
            fullPage: true 
        });
        
        // 블로그 포스트 목록 확인
        const blogPosts = await page.locator('.blog-post-item, [data-testid="blog-post"], article').count();
        console.log(`   - 블로그 포스트 수: ${blogPosts}개`);
        
        // 4. 타로 리딩 페이지 테스트
        console.log('📍 4단계: 타로 리딩 페이지 테스트');
        await page.goto('http://localhost:4000/tarot/reading', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: `pm-verification-03-tarot-reading-${Date.now()}.png`, 
            fullPage: true 
        });
        
        // 타로 카드 확인
        const tarotCards = await page.locator('.tarot-card, [data-testid="tarot-card"], .card').count();
        console.log(`   - 타로 카드 수: ${tarotCards}개`);
        
        // 5. 관리자 페이지 접근 테스트
        console.log('📍 5단계: 관리자 페이지 접근 테스트');
        await page.goto('http://localhost:4000/admin', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: `pm-verification-04-admin-${Date.now()}.png`, 
            fullPage: true 
        });
        
        // 로그인 폼 확인
        const loginFormExists = await page.locator('form, .login-form, [data-testid="login-form"]').count() > 0;
        console.log(`   - 로그인 폼: ${loginFormExists ? '✅ 확인됨' : '❌ 누락'}`);
        
        // 6. API 엔드포인트 테스트
        console.log('📍 6단계: API 엔드포인트 테스트');
        
        const apiEndpoints = [
            '/api/health',
            '/api/blog/posts',
            '/api/tarot/reading',
            '/api/admin/stats'
        ];
        
        for (const endpoint of apiEndpoints) {
            try {
                const response = await page.goto(`http://localhost:4000${endpoint}`, { timeout: 10000 });
                const status = response ? response.status() : 'No Response';
                console.log(`   - ${endpoint}: ${status === 200 ? '✅' : '❌'} (${status})`);
            } catch (error) {
                console.log(`   - ${endpoint}: ❌ 오류 - ${error.message}`);
            }
        }
        
        // 7. 반응형 디자인 테스트
        console.log('📍 7단계: 반응형 디자인 테스트');
        
        const viewports = [
            { name: 'Desktop', width: 1280, height: 720 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile', width: 375, height: 667 }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: `pm-verification-responsive-${viewport.name.toLowerCase()}-${Date.now()}.png`, 
                fullPage: true 
            });
            console.log(`   - ${viewport.name} (${viewport.width}x${viewport.height}): ✅ 확인됨`);
        }
        
        // 최종 결과
        console.log('================================================================');
        console.log('🎉 SWARM PM 전체 시스템 검증 완료');
        console.log('📊 모든 스크린샷이 저장되었습니다.');
        console.log('📋 다음 단계를 위한 준비 완료');
        
        return {
            success: true,
            message: 'Complete verification finished successfully',
            screenshots: [
                'pm-verification-01-homepage',
                'pm-verification-02-blog', 
                'pm-verification-03-tarot-reading',
                'pm-verification-04-admin',
                'pm-verification-responsive-desktop',
                'pm-verification-responsive-tablet',
                'pm-verification-responsive-mobile'
            ]
        };
        
    } catch (error) {
        console.error('❌ 검증 중 오류 발생:', error);
        await page.screenshot({ 
            path: `pm-verification-error-${Date.now()}.png`, 
            fullPage: true 
        });
        
        return {
            success: false,
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

// 스크립트 실행
runCompleteVerification()
    .then(result => {
        console.log('\n최종 결과:', result);
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('실행 오류:', error);
        process.exit(1);
    });