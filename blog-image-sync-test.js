const { chromium } = require('playwright');

async function blogImageSyncTest() {
    console.log('🔍 SWARM PM - 블로그 이미지 동기화 문제 조사');
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
        // 1. 관리자 대시보드에서 블로그 관리 확인
        console.log('📍 1. 관리자 대시보드 접속 및 블로그 관리 확인');
        console.log('-'.repeat(40));
        
        await page.goto('http://localhost:4000/admin', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(3000);
        
        // 블로그 관리 탭 클릭
        console.log('   🔍 블로그 관리 탭 클릭...');
        await page.click('[data-testid="tab-blog-management"], [value="blog-management"]');
        await page.waitForTimeout(5000);
        
        // 관리자 화면 스크린샷
        await page.screenshot({ 
            path: `admin-blog-management-${timestamp}.png`, 
            fullPage: false 
        });
        console.log(`   📸 관리자 블로그 관리 화면: admin-blog-management-${timestamp}.png`);
        
        // 블로그 포스트 목록에서 첫 번째 포스트 확인
        const firstPostTitle = await page.textContent('.blog-post-item:first-child .post-title, tr:first-child td:first-child, .post-card:first-child h3').catch(() => '제목 찾기 실패');
        const firstPostImage = await page.getAttribute('.blog-post-item:first-child img, tr:first-child img, .post-card:first-child img', 'src').catch(() => '이미지 찾기 실패');
        
        console.log(`   📄 첫 번째 포스트 제목: ${firstPostTitle}`);
        console.log(`   🖼️ 관리자에서 보이는 이미지: ${firstPostImage}`);
        
        // 2. 실제 블로그 페이지에서 확인
        console.log('\\n📍 2. 실제 블로그 페이지에서 이미지 확인');
        console.log('-'.repeat(40));
        
        await page.goto('http://localhost:4000/blog', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(3000);
        
        // 블로그 페이지 스크린샷
        await page.screenshot({ 
            path: `blog-page-images-${timestamp}.png`, 
            fullPage: false 
        });
        console.log(`   📸 블로그 페이지 화면: blog-page-images-${timestamp}.png`);
        
        // 블로그 페이지에서 첫 번째 포스트 확인
        const blogFirstPostTitle = await page.textContent('.blog-post:first-child h3, .card:first-child h3').catch(() => '제목 찾기 실패');
        const blogFirstPostImage = await page.getAttribute('.blog-post:first-child img, .card:first-child img', 'src').catch(() => '이미지 찾기 실패');
        
        console.log(`   📄 블로그 첫 번째 포스트 제목: ${blogFirstPostTitle}`);
        console.log(`   🖼️ 블로그에서 보이는 이미지: ${blogFirstPostImage}`);
        
        // 3. 데이터 소스 확인 - API 직접 호출
        console.log('\\n📍 3. API 데이터 소스 직접 확인');
        console.log('-'.repeat(40));
        
        const apiResponse = await page.goto('http://localhost:4000/api/blog/posts?published=true');
        const apiData = await apiResponse.json();
        
        console.log(`   📊 API 응답 포스트 수: ${apiData.posts?.length || 0}개`);
        
        if (apiData.posts && apiData.posts.length > 0) {
            const firstApiPost = apiData.posts[0];
            console.log(`   📄 API 첫 번째 포스트 제목: ${firstApiPost.title}`);
            console.log(`   🖼️ API 첫 번째 포스트 이미지: ${firstApiPost.image}`);
            console.log(`   📅 API 첫 번째 포스트 ID: ${firstApiPost.id}`);
        }
        
        // 4. 개별 포스트 상세 페이지 확인
        console.log('\\n📍 4. 개별 포스트 상세 페이지 이미지 확인');
        console.log('-'.repeat(40));
        
        if (apiData.posts && apiData.posts.length > 0) {
            const firstPostId = apiData.posts[0].id;
            console.log(`   🔗 첫 번째 포스트 상세 페이지 접속: ${firstPostId}`);
            
            await page.goto(`http://localhost:4000/blog/${firstPostId}`, { 
                waitUntil: 'networkidle',
                timeout: 30000
            });
            
            await page.waitForTimeout(3000);
            
            // 포스트 상세 페이지 스크린샷
            await page.screenshot({ 
                path: `blog-post-detail-${timestamp}.png`, 
                fullPage: false 
            });
            console.log(`   📸 포스트 상세 페이지: blog-post-detail-${timestamp}.png`);
            
            const detailPageImage = await page.getAttribute('img[alt*=""], .post-image img, .featured-image img', 'src').catch(() => '이미지 찾기 실패');
            console.log(`   🖼️ 상세 페이지 이미지: ${detailPageImage}`);
        }
        
        // 5. 캐시 상태 확인
        console.log('\\n📍 5. 캐시 및 revalidate 상태 확인');
        console.log('-'.repeat(40));
        
        // 브라우저 캐시 상태 확인
        const cacheEntries = await page.evaluate(() => {
            return {
                localStorage: Object.keys(localStorage).length,
                sessionStorage: Object.keys(sessionStorage).length,
                cacheStorage: 'serviceWorker' in navigator
            };
        });
        
        console.log(`   💾 로컬 스토리지 항목: ${cacheEntries.localStorage}개`);
        console.log(`   💾 세션 스토리지 항목: ${cacheEntries.sessionStorage}개`);
        console.log(`   💾 캐시 스토리지 지원: ${cacheEntries.cacheStorage ? '지원됨' : '지원 안됨'}`);
        
        // 6. 문제 분석 및 해결책 제시
        console.log('\\n🔍 문제 분석 결과');
        console.log('='.repeat(60));
        
        const imageMatches = firstPostImage === blogFirstPostImage;
        console.log(`📊 이미지 동기화 상태: ${imageMatches ? '✅ 동기화됨' : '❌ 불일치'}`);
        
        if (!imageMatches) {
            console.log('\\n🚨 이미지 동기화 문제 발견:');
            console.log(`   관리자: ${firstPostImage}`);
            console.log(`   블로그: ${blogFirstPostImage}`);
            console.log('\\n💡 가능한 원인:');
            console.log('   1. Next.js 정적 생성 캐시 (revalidate 설정)');
            console.log('   2. 브라우저 캐시');
            console.log('   3. API 응답 캐시');
            console.log('   4. 파일 스토리지와 실제 데이터 불일치');
        } else {
            console.log('✅ 이미지 동기화 정상 - 다른 원인 조사 필요');
        }
        
        return {
            success: true,
            adminImage: firstPostImage,
            blogImage: blogFirstPostImage,
            imageMatches: imageMatches,
            apiData: apiData.posts?.[0] || null,
            cacheInfo: cacheEntries
        };
        
    } catch (error) {
        console.error('❌ 블로그 이미지 동기화 조사 실패:', error);
        
        // 에러 스크린샷
        await page.screenshot({ 
            path: `blog-sync-error-${timestamp}.png`, 
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

// 테스트 실행
blogImageSyncTest()
    .then(result => {
        console.log('\\n' + '='.repeat(60));
        
        if (result.success) {
            console.log('🎯 블로그 이미지 동기화 조사 완료!');
            
            if (!result.imageMatches) {
                console.log('🚨 이미지 불일치 확인됨 - 해결 작업 필요');
                console.log('💡 권장 해결책:');
                console.log('   1. Next.js 캐시 초기화');
                console.log('   2. revalidate 강제 실행');
                console.log('   3. 브라우저 캐시 클리어');
            } else {
                console.log('✅ 이미지 동기화 정상');
            }
        } else {
            console.log('❌ 조사 실패');
            console.log(`🐛 오류: ${result.error}`);
        }
        
        console.log('='.repeat(60));
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('실행 오류:', error);
        process.exit(1);
    });