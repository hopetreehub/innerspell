const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 메시지 수집
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // 페이지 에러 수집
  page.on('pageerror', error => {
    console.error('페이지 에러:', error);
  });
  
  // 요청 로깅
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`API 요청: ${request.method()} ${request.url()}`);
    }
  });
  
  // 응답 로깅
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`API 응답: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('블로그 페이지 접속 중...');
    
    // 블로그 페이지 접속
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(5000);
    
    // React/Next.js 디버깅 정보 수집
    const debugInfo = await page.evaluate(() => {
      const info = {
        title: document.title,
        url: window.location.href,
        hasReact: !!window.React,
        hasNext: !!window.__NEXT_DATA__,
        nextData: window.__NEXT_DATA__ ? {
          props: window.__NEXT_DATA__.props,
          page: window.__NEXT_DATA__.page,
          query: window.__NEXT_DATA__.query
        } : null,
        blogElements: {
          articles: document.querySelectorAll('article').length,
          blogPosts: document.querySelectorAll('.blog-post, [class*="post"]').length,
          cards: document.querySelectorAll('.card, [class*="card"]').length,
          mainContent: document.querySelector('main')?.innerHTML?.substring(0, 500)
        },
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          acc[key] = localStorage.getItem(key);
          return acc;
        }, {})
      };
      return info;
    });
    
    console.log('\n=== 디버깅 정보 ===');
    console.log(JSON.stringify(debugInfo, null, 2));
    
    // 네트워크 상태 확인
    const networkError = await page.evaluate(() => {
      return window.navigator.onLine ? '온라인' : '오프라인';
    });
    console.log(`\n네트워크 상태: ${networkError}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: `blog-debug-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    // 개발자 도구 열기 (수동 디버깅용)
    await page.evaluate(() => {
      console.log('=== 블로그 페이지 디버깅 정보 ===');
      console.log('현재 URL:', window.location.href);
      console.log('DOM 로드 상태:', document.readyState);
      console.log('블로그 포스트 요소 수:', document.querySelectorAll('article, .blog-post').length);
    });
    
    console.log('\n브라우저를 30초 동안 열어둡니다. 개발자 도구로 직접 확인하세요...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('에러 발생:', error);
    await page.screenshot({ 
      path: `blog-error-debug-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
  } finally {
    console.log('\n=== 콘솔 로그 요약 ===');
    consoleLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });
    
    await browser.close();
  }
})();