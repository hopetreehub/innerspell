const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🧪 직접 블로그 가시성 테스트 시작...\n');
  
  try {
    // 1. 먼저 API 상태 확인
    console.log('1️⃣ API 상태 확인...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:4000/api/blog/posts');
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (apiResponse.success) {
      console.log(`📡 API 응답 성공: ${apiResponse.data.posts?.length || 0}개 블로그 글 발견`);
      if (apiResponse.data.posts && apiResponse.data.posts.length > 0) {
        apiResponse.data.posts.forEach((post, index) => {
          console.log(`   ${index + 1}. ${post.title} (발행: ${post.published})`);
        });
      }
    } else {
      console.log('❌ API 호출 실패:', apiResponse.error);
    }
    
    // 2. 블로그 페이지 직접 접속
    console.log('\n2️⃣ 블로그 페이지 직접 접속...');
    await page.goto('http://localhost:4000/blog', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    // 로딩 완료 대기
    console.log('⏳ 페이지 로딩 완료 대기...');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'direct-test-01-blog-page.png', fullPage: true });
    
    // 3. 실제 콘텐츠 확인
    console.log('3️⃣ 페이지 콘텐츠 분석...');
    
    // 모든 텍스트 콘텐츠 확인
    const pageText = await page.textContent('body');
    const hasOurBlogPost = pageText.includes('CSRF 수정 완료');
    
    console.log(`📄 페이지에 우리 블로그 글 포함: ${hasOurBlogPost ? '✅ 있음' : '❌ 없음'}`);
    
    // 구체적인 요소들 확인
    const blogElements = await page.$$eval('h1, h2, h3, h4, article, .card, [class*="post"]', elements => 
      elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 100) || '',
        classes: el.className,
        id: el.id
      })).filter(el => el.text.length > 10)
    );
    
    console.log(`🔍 발견된 주요 요소들 (${blogElements.length}개):`);
    blogElements.slice(0, 15).forEach((element, index) => {
      console.log(`   ${index + 1}. [${element.tag}] ${element.text}...`);
      if (element.text.includes('CSRF') || element.text.includes('수정')) {
        console.log('      ⭐ 우리 블로그 글과 관련된 요소 발견!');
      }
    });
    
    // 4. 특정 블로그 글 검색 시도
    console.log('\n4️⃣ 특정 블로그 글 검색...');
    
    const searchTargets = [
      'CSRF 수정 완료',
      '블로그 시스템 복구',
      'CSRF',
      '수정 완료'
    ];
    
    for (const target of searchTargets) {
      const element = await page.$(`text="${target}"`);
      if (element) {
        console.log(`✅ "${target}" 텍스트 발견!`);
        
        // 해당 요소의 부모 확인
        const parentInfo = await element.evaluate(el => ({
          tagName: el.parentElement?.tagName,
          className: el.parentElement?.className,
          textContent: el.parentElement?.textContent?.substring(0, 200)
        }));
        
        console.log(`   부모 요소: [${parentInfo.tagName}] ${parentInfo.className}`);
        console.log(`   전체 텍스트: ${parentInfo.textContent}...`);
        break;
      } else {
        console.log(`❌ "${target}" 텍스트 없음`);
      }
    }
    
    // 5. 개발자 도구에서 네트워크 요청 확인
    console.log('\n5️⃣ 네트워크 요청 모니터링...');
    
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/blog')) {
        requests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    // 페이지 새로고침하여 네트워크 요청 캐치
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log(`📡 캐치된 블로그 관련 요청들 (${requests.length}개):`);
    requests.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.method} ${req.url}`);
    });
    
    // 6. 브라우저 콘솔에서 직접 API 호출 테스트
    console.log('\n6️⃣ 브라우저에서 직접 API 테스트...');
    
    const browserApiTest = await page.evaluate(async () => {
      try {
        console.log('브라우저에서 API 호출 시작...');
        const response = await fetch('/api/blog/posts');
        console.log('API 응답 상태:', response.status);
        
        const data = await response.json();
        console.log('API 응답 데이터:', data);
        
        return {
          success: true,
          status: response.status,
          postsCount: data.posts?.length || 0,
          posts: data.posts?.map(p => ({ id: p.id, title: p.title, published: p.published })) || []
        };
      } catch (error) {
        console.error('브라우저 API 오류:', error);
        return { success: false, error: error.message };
      }
    });
    
    console.log('🔍 브라우저 API 테스트 결과:');
    console.log(`   성공: ${browserApiTest.success}`);
    if (browserApiTest.success) {
      console.log(`   상태 코드: ${browserApiTest.status}`);
      console.log(`   글 개수: ${browserApiTest.postsCount}`);
      
      if (browserApiTest.posts && browserApiTest.posts.length > 0) {
        console.log('   발견된 글들:');
        browserApiTest.posts.forEach((post, index) => {
          console.log(`     ${index + 1}. ${post.title} (ID: ${post.id}, 발행: ${post.published})`);
        });
      } else {
        console.log('   📝 API에서 반환된 글이 없음');
      }
    } else {
      console.log(`   오류: ${browserApiTest.error}`);
    }
    
    // 7. 최종 스크린샷
    await page.screenshot({ path: 'direct-test-02-final.png', fullPage: true });
    
    // 8. 결론
    console.log('\n📊 최종 테스트 결과:');
    console.log(`   API 작동: ${apiResponse.success ? '✅' : '❌'}`);
    console.log(`   브라우저 API: ${browserApiTest.success ? '✅' : '❌'}`);
    console.log(`   페이지에 글 표시: ${hasOurBlogPost ? '✅' : '❌'}`);
    
    if (!hasOurBlogPost && browserApiTest.success && browserApiTest.postsCount > 0) {
      console.log('\n🚨 문제 분석:');
      console.log('   - API는 정상 작동하지만 프론트엔드에 표시되지 않음');
      console.log('   - 컴포넌트가 API 데이터를 제대로 렌더링하지 못하는 것으로 보임');
      console.log('   - 추가 디버깅이 필요함');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'direct-test-error.png', fullPage: true });
  } finally {
    console.log('\n🧪 직접 테스트 완료!');
    console.log('브라우저를 5초 후 자동 종료합니다...');
    
    setTimeout(async () => {
      await browser.close();
    }, 5000);
  }
})();