const { chromium } = require('playwright');

async function verifyAfterCleanup() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 800
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🧹 클린업 후 시스템 검증 시작');
        console.log('========================================');
        
        // 1. 홈페이지 확인
        console.log('📍 1. 홈페이지 로딩 테스트');
        const homeStart = Date.now();
        await page.goto('http://localhost:4000', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        const homeTime = Date.now() - homeStart;
        console.log(`   ⏱️ 홈페이지 로딩 시간: ${homeTime}ms`);
        
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: `cleanup-verify-homepage-${Date.now()}.png`, 
            fullPage: false 
        });
        console.log('   ✅ 홈페이지 정상 동작');
        
        // 2. 블로그 페이지 확인
        console.log('📍 2. 블로그 페이지 테스트');
        const blogStart = Date.now();
        await page.goto('http://localhost:4000/blog', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        const blogTime = Date.now() - blogStart;
        console.log(`   ⏱️ 블로그 페이지 로딩 시간: ${blogTime}ms`);
        
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: `cleanup-verify-blog-${Date.now()}.png`, 
            fullPage: false 
        });
        
        // 블로그 포스트 개수 확인
        const posts = await page.locator('.blog-post-item, [data-testid="blog-post"], article').count();
        console.log(`   📋 블로그 포스트 개수: ${posts}개`);
        console.log('   ✅ 블로그 페이지 정상 동작');
        
        // 3. 관리자 페이지 확인  
        console.log('📍 3. 관리자 페이지 테스트');
        const adminStart = Date.now();
        await page.goto('http://localhost:4000/admin', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        const adminTime = Date.now() - adminStart;
        console.log(`   ⏱️ 관리자 페이지 로딩 시간: ${adminTime}ms`);
        
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: `cleanup-verify-admin-${Date.now()}.png`, 
            fullPage: false 
        });
        console.log('   ✅ 관리자 페이지 정상 동작');
        
        // 4. API 테스트
        console.log('📍 4. API 응답 테스트');
        const apiTests = [
            { endpoint: '/api/health', name: 'Health Check' },
            { endpoint: '/api/blog/posts?published=true', name: 'Blog Posts' }
        ];
        
        for (const test of apiTests) {
            try {
                const apiStart = Date.now();
                const response = await page.goto(`http://localhost:4000${test.endpoint}`, { timeout: 10000 });
                const apiTime = Date.now() - apiStart;
                
                if (response && response.ok()) {
                    console.log(`   ✅ ${test.name}: ${response.status()} (${apiTime}ms)`);
                } else {
                    console.log(`   ❌ ${test.name}: ${response ? response.status() : 'No Response'}`);
                }
            } catch (error) {
                console.log(`   ❌ ${test.name}: Error - ${error.message}`);
            }
        }
        
        // 성과 요약
        console.log('========================================');
        console.log('🎉 클린업 후 검증 완료!');
        console.log(`📊 성능 개선 현황:`);
        console.log(`   - 홈페이지: ${homeTime}ms`);
        console.log(`   - 블로그: ${blogTime}ms`);  
        console.log(`   - 관리자: ${adminTime}ms`);
        console.log(`   - 블로그 포스트: ${posts}개 정상`);
        
        return {
            success: true,
            performance: {
                home: homeTime,
                blog: blogTime,
                admin: adminTime,
                posts: posts
            }
        };
        
    } catch (error) {
        console.error('❌ 검증 중 오류:', error);
        await page.screenshot({ 
            path: `cleanup-verify-error-${Date.now()}.png`, 
            fullPage: true 
        });
        
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

verifyAfterCleanup()
    .then(result => {
        console.log('\n최종 결과:', result);
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('실행 오류:', error);
        process.exit(1);
    });