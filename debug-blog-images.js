const { chromium } = require('playwright');

async function debugBlogImages() {
    console.log('🔍 SWARM PM - 블로그 이미지 동기화 문제 직접 조사');
    console.log('='.repeat(60));
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    const timestamp = Date.now();
    
    try {
        // 1. API 데이터 직접 확인
        console.log('📍 1. API 데이터 직접 확인');
        console.log('-'.repeat(40));
        
        const apiResponse = await page.goto('http://localhost:4000/api/blog/posts?published=true');
        const apiData = await apiResponse.json();
        
        console.log(`   📊 API 총 포스트 수: ${apiData.posts?.length || 0}개`);
        
        if (apiData.posts && apiData.posts.length > 0) {
            console.log('\\n   📋 API 데이터 상위 3개 포스트:');
            for (let i = 0; i < Math.min(3, apiData.posts.length); i++) {
                const post = apiData.posts[i];
                console.log(`      [${i + 1}] ${post.title}`);
                console.log(`          ID: ${post.id}`);
                console.log(`          이미지: ${post.image}`);
                console.log(`          카테고리: ${post.category}`);
                console.log('');
            }
        }
        
        // 2. 블로그 페이지에서 실제 렌더링 확인
        console.log('📍 2. 블로그 페이지 실제 렌더링 확인');
        console.log('-'.repeat(40));
        
        await page.goto('http://localhost:4000/blog', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(5000);
        
        // 블로그 페이지 스크린샷
        await page.screenshot({ 
            path: `debug-blog-page-${timestamp}.png`, 
            fullPage: true 
        });
        console.log(`   📸 전체 블로그 페이지: debug-blog-page-${timestamp}.png`);
        
        // 모든 이미지 요소 찾기
        const imageElements = await page.$$eval('img', imgs => 
            imgs.map(img => ({
                src: img.src,
                alt: img.alt,
                className: img.className,
                loading: img.loading,
                width: img.width,
                height: img.height
            }))
        );
        
        console.log(`\\n   🖼️ 블로그 페이지 총 이미지 수: ${imageElements.length}개`);
        
        // 포스트 관련 이미지만 필터링
        const postImages = imageElements.filter(img => 
            img.alt && !img.src.includes('favicon') && !img.src.includes('logo')
        );
        
        console.log(`   📋 포스트 관련 이미지 (상위 3개):`);
        for (let i = 0; i < Math.min(3, postImages.length); i++) {
            const img = postImages[i];
            console.log(`      [${i + 1}] ${img.src}`);
            console.log(`          Alt: ${img.alt}`);
            console.log(`          Loading: ${img.loading}`);
            console.log(`          크기: ${img.width}x${img.height}`);
            console.log('');
        }
        
        // 3. 관리자 페이지에서 블로그 데이터 확인
        console.log('📍 3. 관리자 페이지 블로그 데이터 확인');
        console.log('-'.repeat(40));
        
        await page.goto('http://localhost:4000/admin', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(3000);
        
        // 관리자 페이지 스크린샷
        await page.screenshot({ 
            path: `debug-admin-page-${timestamp}.png`, 
            fullPage: false 
        });
        console.log(`   📸 관리자 대시보드: debug-admin-page-${timestamp}.png`);
        
        // 블로그 관리 탭 찾기 및 클릭 시도
        const blogTab = await page.$('button[value="blog-management"]');
        if (blogTab) {
            console.log('   🔍 블로그 관리 탭 발견, 클릭 시도...');
            await blogTab.click();
            await page.waitForTimeout(5000);
            
            // 블로그 관리 화면 스크린샷
            await page.screenshot({ 
                path: `debug-blog-management-${timestamp}.png`, 
                fullPage: false 
            });
            console.log(`   📸 블로그 관리 화면: debug-blog-management-${timestamp}.png`);
            
        } else {
            console.log('   ❌ 블로그 관리 탭을 찾을 수 없음');
            
            // 사용 가능한 탭들 확인
            const availableTabs = await page.$$eval('button[value]', tabs => 
                tabs.map(tab => ({ value: tab.value, text: tab.textContent?.trim() }))
            );
            
            console.log('   📋 사용 가능한 탭들:');
            availableTabs.forEach(tab => {
                console.log(`      - ${tab.value}: ${tab.text}`);
            });
        }
        
        // 4. 캐시 무효화 테스트
        console.log('\\n📍 4. 캐시 무효화 및 재확인');
        console.log('-'.repeat(40));
        
        // 하드 리프레시 시뮬레이션
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('   🔄 페이지 하드 리프레시 완료');
        
        // 다시 블로그 페이지 확인
        await page.goto('http://localhost:4000/blog', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(3000);
        
        // 리프레시 후 스크린샷
        await page.screenshot({ 
            path: `debug-blog-after-refresh-${timestamp}.png`, 
            fullPage: false 
        });
        console.log(`   📸 리프레시 후 블로그: debug-blog-after-refresh-${timestamp}.png`);
        
        return {
            success: true,
            message: '블로그 이미지 동기화 조사 완료'
        };
        
    } catch (error) {
        console.error('❌ 디버그 조사 실패:', error);
        
        // 에러 스크린샷
        try {
            await page.screenshot({ 
                path: `debug-error-${timestamp}.png`, 
                fullPage: true 
            });
        } catch (screenshotError) {
            console.log('스크린샷 촬영 실패');
        }
        
        return { 
            success: false, 
            error: error.message 
        };
        
    } finally {
        await browser.close();
    }
}

// 테스트 실행
debugBlogImages()
    .then(result => {
        console.log('\\n' + '='.repeat(60));
        
        if (result.success) {
            console.log('🎯 블로그 이미지 디버그 조사 완료!');
            console.log('📊 스크린샷들을 확인하여 이미지 동기화 상태를 분석하세요.');
        } else {
            console.log('❌ 디버그 조사 실패');
            console.log(`🐛 오류: ${result.error}`);
        }
        
        console.log('='.repeat(60));
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('실행 오류:', error);
        process.exit(1);
    });