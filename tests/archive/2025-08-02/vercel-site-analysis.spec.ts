import { test, expect } from '@playwright/test';

test.describe('Vercel 사이트 상세 분석', () => {
  test.setTimeout(60000);

  test('메인 페이지 콘솔 로그 및 에러 수집', async ({ page }) => {
    // 모든 콘솔 메시지 수집
    const consoleLogs: { type: string; text: string; location?: string }[] = [];
    
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()?.url
      });
    });

    // 에러 이벤트 수집
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // 네트워크 요청 추적
    const apiRequests: { url: string; status?: number; error?: string }[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    page.on('requestfailed', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          error: request.failure()?.errorText
        });
      }
    });

    // 페이지 방문
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 추가 대기
    await page.waitForTimeout(5000);

    // 스크린샷
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `vercel-main-analysis-${timestamp}.png`,
      fullPage: true 
    });

    // JavaScript 실행으로 추가 정보 수집
    const pageInfo = await page.evaluate(() => {
      const root = document.querySelector('#__next') || document.querySelector('#root');
      const scripts = Array.from(document.querySelectorAll('script')).map(s => ({
        src: s.src,
        innerHTML: s.innerHTML.substring(0, 100)
      }));
      
      return {
        title: document.title,
        readyState: document.readyState,
        bodyHTML: document.body.innerHTML.substring(0, 500),
        rootExists: !!root,
        rootClassName: root?.className || '',
        scriptCount: scripts.length,
        scripts: scripts.slice(0, 5),
        hasNextData: !!document.getElementById('__NEXT_DATA__'),
        nextDataContent: document.getElementById('__NEXT_DATA__')?.innerHTML.substring(0, 200)
      };
    });

    // 결과 출력
    console.log('\n=== 메인 페이지 분석 결과 ===');
    console.log(`페이지 제목: ${pageInfo.title}`);
    console.log(`Ready State: ${pageInfo.readyState}`);
    console.log(`React Root 존재: ${pageInfo.rootExists}`);
    console.log(`React Root 클래스: ${pageInfo.rootClassName}`);
    console.log(`스크립트 개수: ${pageInfo.scriptCount}`);
    console.log(`Next.js Data: ${pageInfo.hasNextData}`);
    
    console.log(`\n콘솔 로그 (${consoleLogs.length}개):`);
    consoleLogs.forEach((log, i) => {
      console.log(`${i + 1}. [${log.type}] ${log.text}`);
      if (log.location) console.log(`   위치: ${log.location}`);
    });
    
    console.log(`\n페이지 에러 (${pageErrors.length}개):`);
    pageErrors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    
    console.log(`\nAPI 요청 (${apiRequests.length}개):`);
    apiRequests.forEach((req, i) => {
      if (req.error) {
        console.log(`${i + 1}. FAILED: ${req.url} - ${req.error}`);
      } else {
        console.log(`${i + 1}. ${req.url} - Status: ${req.status}`);
      }
    });

    console.log(`\n스크립트 정보:`);
    pageInfo.scripts.forEach((script, i) => {
      console.log(`${i + 1}. ${script.src || 'Inline script'}`);
    });

    console.log(`\nNext.js Data 내용 (처음 200자):\n${pageInfo.nextDataContent}`);
  });

  test('블로그 페이지 상세 분석', async ({ page }) => {
    // 모든 콘솔 메시지 수집
    const consoleLogs: { type: string; text: string }[] = [];
    
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    // 페이지 방문
    await page.goto('https://test-studio-firebase.vercel.app/blog', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    // 스크린샷
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `vercel-blog-analysis-${timestamp}.png`,
      fullPage: true 
    });

    // 블로그 포스트 분석
    const blogInfo = await page.evaluate(() => {
      const posts = document.querySelectorAll('article, [class*="post"], [class*="blog-item"], .prose');
      const links = Array.from(document.querySelectorAll('a[href*="/blog/"]')).map(a => ({
        href: (a as HTMLAnchorElement).href,
        text: a.textContent
      }));
      
      return {
        postCount: posts.length,
        hasContent: document.body.textContent?.includes('블로그') || document.body.textContent?.includes('Blog'),
        links: links.slice(0, 10),
        bodyText: document.body.textContent?.substring(0, 500)
      };
    });

    console.log('\n=== 블로그 페이지 분석 결과 ===');
    console.log(`포스트 개수: ${blogInfo.postCount}`);
    console.log(`블로그 콘텐츠 있음: ${blogInfo.hasContent}`);
    console.log(`\n블로그 링크 (${blogInfo.links.length}개):`);
    blogInfo.links.forEach((link, i) => {
      console.log(`${i + 1}. ${link.text} -> ${link.href}`);
    });
    
    console.log(`\n콘솔 로그 (${consoleLogs.length}개):`);
    consoleLogs.forEach((log, i) => {
      console.log(`${i + 1}. [${log.type}] ${log.text}`);
    });
  });

  test('성능 메트릭 수집', async ({ page }) => {
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'networkidle'
    });

    // 성능 메트릭 수집
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });

    console.log('\n=== 성능 메트릭 ===');
    console.log(`DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`Load Complete: ${metrics.loadComplete}ms`);
    console.log(`First Paint: ${metrics.firstPaint}ms`);
    console.log(`First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
    console.log(`Total Load Time: ${metrics.totalLoadTime}ms`);
  });
});