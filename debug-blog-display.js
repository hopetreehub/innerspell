const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 개발자 도구 열기
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 로그 수집
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // 네트워크 요청 모니터링
  const apiCalls = [];
  page.on('response', async response => {
    if (response.url().includes('/api/blog/posts')) {
      const request = response.request();
      apiCalls.push({
        url: response.url(),
        status: response.status(),
        method: request.method(),
        responseData: await response.text().catch(() => 'Cannot read response')
      });
    }
  });

  try {
    console.log('📍 블로그 표시 문제 디버깅...\n');

    // 1. 블로그 페이지 로드
    console.log('1️⃣ 블로그 페이지 로드 중...');
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // 충분한 대기 시간

    await page.screenshot({ path: 'debug-blog-01-loaded.png' });

    // 2. 콘솔 로그 분석
    console.log('\n2️⃣ 콘솔 로그 분석:');
    consoleLogs.forEach((log, i) => {
      if (log.text.includes('API') || log.text.includes('포스트') || log.text.includes('로드')) {
        console.log(`   [${log.type}] ${log.text}`);
      }
    });

    // 3. API 호출 분석
    console.log('\n3️⃣ API 호출 분석:');
    apiCalls.forEach(call => {
      console.log(`   ${call.method} ${call.url} - Status: ${call.status}`);
      if (call.status === 200) {
        try {
          const data = JSON.parse(call.responseData);
          console.log(`   → 반환된 포스트 수: ${data.posts?.length || 0}`);
        } catch (e) {
          console.log(`   → 응답 파싱 실패`);
        }
      }
    });

    // 4. DOM 상태 확인
    console.log('\n4️⃣ DOM 상태 확인:');
    
    // 로딩 상태 확인
    const isLoading = await page.locator('.animate-pulse').isVisible();
    console.log(`   로딩 애니메이션 표시: ${isLoading}`);

    // article 요소 확인
    const articleCount = await page.locator('article').count();
    console.log(`   article 요소 개수: ${articleCount}`);

    // 에러 메시지 확인
    const errorMessage = await page.locator('text=/error|오류|failed/i').first().isVisible().catch(() => false);
    console.log(`   에러 메시지 표시: ${errorMessage}`);

    // 5. React 컴포넌트 상태 확인 (개발자 도구에서)
    const componentState = await page.evaluate(() => {
      // React DevTools가 있다면 상태 확인
      const reactFiber = document.querySelector('#__next')?._reactRootContainer?._internalRoot?.current;
      if (reactFiber) {
        // 컴포넌트 트리를 탐색하여 BlogMainWithPagination 찾기
        let node = reactFiber;
        while (node) {
          if (node.memoizedState && node.type?.name === 'BlogMainWithPagination') {
            return {
              hasState: true,
              postsLength: node.memoizedState?.posts?.length || 0,
              isLoading: node.memoizedState?.isLoading,
              isMounted: node.memoizedState?.isMounted
            };
          }
          node = node.child || node.sibling;
        }
      }
      return { hasState: false };
    });

    console.log('\n5️⃣ React 컴포넌트 상태:');
    console.log(`   상태 확인 가능: ${componentState.hasState}`);
    if (componentState.hasState) {
      console.log(`   posts 배열 길이: ${componentState.postsLength}`);
      console.log(`   isLoading: ${componentState.isLoading}`);
      console.log(`   isMounted: ${componentState.isMounted}`);
    }

    // 6. 수동으로 API 호출해보기
    console.log('\n6️⃣ 수동 API 호출 테스트:');
    const manualApiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/blog/posts?published=true');
        const data = await response.json();
        return { 
          success: true, 
          status: response.status,
          postsCount: data.posts?.length || 0,
          firstPost: data.posts?.[0]?.title
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    console.log(`   API 호출 성공: ${manualApiResponse.success}`);
    if (manualApiResponse.success) {
      console.log(`   응답 상태: ${manualApiResponse.status}`);
      console.log(`   포스트 수: ${manualApiResponse.postsCount}`);
      console.log(`   첫 포스트 제목: ${manualApiResponse.firstPost}`);
    }

    // 7. 페이지 새로고침 후 재확인
    console.log('\n7️⃣ 페이지 새로고침...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const articlesAfterReload = await page.locator('article').count();
    console.log(`   새로고침 후 article 개수: ${articlesAfterReload}`);
    
    await page.screenshot({ path: 'debug-blog-02-after-reload.png' });

    console.log('\n🎯 디버깅 완료! 스크린샷과 로그를 확인하세요.');

  } catch (error) {
    console.error('❌ 디버깅 중 에러:', error);
    await page.screenshot({ path: 'debug-blog-error.png' });
  } finally {
    // 브라우저는 열어둡니다 (개발자 도구 확인용)
    console.log('\n💡 브라우저를 열어두었습니다. 개발자 도구에서 추가 확인이 가능합니다.');
    console.log('   완료하려면 브라우저를 수동으로 닫아주세요.');
  }
})();