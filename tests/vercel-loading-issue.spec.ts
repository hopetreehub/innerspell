import { test, expect } from '@playwright/test';

test.describe('Vercel 배포 사이트 무한 로딩 문제 분석', () => {
  test.setTimeout(120000); // 2분으로 타임아웃 설정
  test('메인 페이지 로딩 상태 및 에러 확인', async ({ page }) => {
    // 콘솔 에러 수집
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 네트워크 요청 실패 수집
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // 페이지 접속
    console.log('Vercel 배포 사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 30초 동안 관찰
    console.log('30초 동안 페이지 로딩 상태 관찰 중...');
    await page.waitForTimeout(30000);

    // 스크린샷 캡처
    const timestamp = new Date().toISOString();
    await page.screenshot({ 
      path: `vercel-main-page-${timestamp}.png`,
      fullPage: true 
    });

    // 페이지 상태 확인
    const pageTitle = await page.title();
    const bodyText = await page.locator('body').textContent();
    
    // 주요 요소 존재 여부 확인
    const hasHeader = await page.locator('header').isVisible().catch(() => false);
    const hasMain = await page.locator('main').isVisible().catch(() => false);
    const hasFooter = await page.locator('footer').isVisible().catch(() => false);

    // 로딩 인디케이터 확인
    const loadingIndicator = await page.locator('[class*="loading"], [class*="spinner"], [class*="loader"]').isVisible().catch(() => false);

    console.log('\n=== 메인 페이지 분석 결과 ===');
    console.log(`페이지 제목: ${pageTitle}`);
    console.log(`Header 표시: ${hasHeader}`);
    console.log(`Main 콘텐츠 표시: ${hasMain}`);
    console.log(`Footer 표시: ${hasFooter}`);
    console.log(`로딩 인디케이터: ${loadingIndicator}`);
    console.log(`\n콘솔 에러 (${consoleErrors.length}개):`);
    consoleErrors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    console.log(`\n네트워크 실패 (${failedRequests.length}개):`);
    failedRequests.forEach((req, i) => console.log(`${i + 1}. ${req}`));
    console.log(`\n페이지 텍스트 내용 (처음 500자):\n${bodyText?.substring(0, 500)}...`);
  });

  test('블로그 페이지 로딩 상태 및 에러 확인', async ({ page }) => {
    // 콘솔 에러 수집
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 네트워크 요청 실패 수집
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // 블로그 페이지 접속
    console.log('\n블로그 페이지 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/blog', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 30초 동안 관찰
    console.log('30초 동안 페이지 로딩 상태 관찰 중...');
    await page.waitForTimeout(30000);

    // 스크린샷 캡처
    const timestamp = new Date().toISOString();
    await page.screenshot({ 
      path: `vercel-blog-page-${timestamp}.png`,
      fullPage: true 
    });

    // 페이지 상태 확인
    const pageTitle = await page.title();
    const bodyText = await page.locator('body').textContent();
    
    // 블로그 포스트 확인
    const blogPosts = await page.locator('article, [class*="post"], [class*="blog-item"]').count();
    
    // 로딩 인디케이터 확인
    const loadingIndicator = await page.locator('[class*="loading"], [class*="spinner"], [class*="loader"]').isVisible().catch(() => false);

    console.log('\n=== 블로그 페이지 분석 결과 ===');
    console.log(`페이지 제목: ${pageTitle}`);
    console.log(`블로그 포스트 개수: ${blogPosts}`);
    console.log(`로딩 인디케이터: ${loadingIndicator}`);
    console.log(`\n콘솔 에러 (${consoleErrors.length}개):`);
    consoleErrors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    console.log(`\n네트워크 실패 (${failedRequests.length}개):`);
    failedRequests.forEach((req, i) => console.log(`${i + 1}. ${req}`));
    console.log(`\n페이지 텍스트 내용 (처음 500자):\n${bodyText?.substring(0, 500)}...`);
  });

  test('React Hydration 및 재렌더링 문제 확인', async ({ page }) => {
    // React 관련 에러 수집
    const reactErrors: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && (text.includes('React') || text.includes('hydration') || text.includes('render'))) {
        reactErrors.push(text);
      }
    });

    // 페이지 접속
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // React DevTools 확인을 위한 스크립트 실행
    const reactInfo = await page.evaluate(() => {
      const reactRoot = document.querySelector('#__next') || document.querySelector('#root');
      const hasReactInternals = reactRoot && Object.keys(reactRoot).some(key => key.includes('__react'));
      
      // 재렌더링 감지
      let renderCount = 0;
      const observer = new MutationObserver(() => {
        renderCount++;
      });
      
      if (reactRoot) {
        observer.observe(reactRoot, { childList: true, subtree: true });
      }
      
      // 5초 동안 관찰
      return new Promise(resolve => {
        setTimeout(() => {
          observer.disconnect();
          resolve({
            hasReactRoot: !!reactRoot,
            hasReactInternals,
            renderCount,
            rootHTML: reactRoot ? reactRoot.innerHTML.substring(0, 200) : 'No React root found'
          });
        }, 5000);
      });
    });

    console.log('\n=== React 상태 분석 결과 ===');
    console.log(`React Root 존재: ${reactInfo.hasReactRoot}`);
    console.log(`React Internals: ${reactInfo.hasReactInternals}`);
    console.log(`5초 동안 렌더링 횟수: ${reactInfo.renderCount}`);
    console.log(`\nReact 관련 에러 (${reactErrors.length}개):`);
    reactErrors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
  });

  test('네트워크 요청 상세 분석', async ({ page }) => {
    const requests: { url: string; status?: number; type: string; duration: number }[] = [];
    
    page.on('requestfinished', async request => {
      const response = await request.response();
      const timing = request.timing();
      requests.push({
        url: request.url(),
        status: response?.status(),
        type: request.resourceType(),
        duration: timing.responseEnd - timing.requestStart
      });
    });

    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // API 요청 분석
    const apiRequests = requests.filter(r => r.url.includes('/api/'));
    const slowRequests = requests.filter(r => r.duration > 3000);
    const failedRequests = requests.filter(r => !r.status || r.status >= 400);

    console.log('\n=== 네트워크 요청 분석 ===');
    console.log(`총 요청 수: ${requests.length}`);
    console.log(`API 요청 수: ${apiRequests.length}`);
    console.log(`느린 요청 (>3초): ${slowRequests.length}`);
    console.log(`실패한 요청: ${failedRequests.length}`);
    
    if (apiRequests.length > 0) {
      console.log('\nAPI 요청 상세:');
      apiRequests.forEach(req => {
        console.log(`- ${req.url} (${req.status}, ${req.duration}ms)`);
      });
    }
    
    if (failedRequests.length > 0) {
      console.log('\n실패한 요청 상세:');
      failedRequests.forEach(req => {
        console.log(`- ${req.url} (${req.status}, ${req.type})`);
      });
    }
  });
});