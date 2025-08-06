const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 페이지 목록
const pages = [
  { name: 'home', url: 'http://localhost:4000/', title: '홈페이지' },
  { name: 'tarot-main', url: 'http://localhost:4000/tarot', title: '타로 메인' },
  { name: 'tarot-cards', url: 'http://localhost:4000/tarot/card', title: '타로 카드 리스트' },
  { name: 'tarot-yesno', url: 'http://localhost:4000/tarot/yes-no', title: '타로 예/아니오' },
  { name: 'dream', url: 'http://localhost:4000/dream', title: '꿈 해몽' },
  { name: 'dream-dictionary', url: 'http://localhost:4000/dream/dictionary', title: '꿈 사전' },
  { name: 'admin', url: 'http://localhost:4000/admin', title: '관리자' },
  { name: 'login', url: 'http://localhost:4000/login', title: '로그인' },
  { name: 'register', url: 'http://localhost:4000/register', title: '회원가입' }
];

async function reviewWebsite() {
  const browser = await chromium.launch({ headless: false });
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
  });
  
  // 페이지 에러 수집
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });
  
  // 네트워크 요청 실패 수집
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure(),
      method: request.method()
    });
  });

  const report = {
    timestamp: new Date().toISOString(),
    pages: []
  };

  for (const pageInfo of pages) {
    console.log(`\nReviewing ${pageInfo.title}...`);
    
    const pageReport = {
      ...pageInfo,
      loadTime: null,
      consoleLogs: [],
      errors: [],
      failedRequests: [],
      performance: {},
      screenshot: null
    };
    
    // 로그 초기화
    consoleLogs.length = 0;
    pageErrors.length = 0;
    failedRequests.length = 0;
    
    try {
      // 페이지 로딩 시간 측정
      const startTime = Date.now();
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
      pageReport.loadTime = Date.now() - startTime;
      
      // 페이지 로딩 완료 대기
      await page.waitForTimeout(2000);
      
      // 성능 메트릭 수집
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
          loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          resourceCount: performance.getEntriesByType('resource').length
        };
      });
      
      pageReport.performance = performanceMetrics;
      
      // DOM 정보 수집
      const domInfo = await page.evaluate(() => {
        return {
          title: document.title,
          metaDescription: document.querySelector('meta[name="description"]')?.content,
          h1Count: document.querySelectorAll('h1').length,
          imagesWithoutAlt: document.querySelectorAll('img:not([alt])').length,
          brokenLinks: Array.from(document.querySelectorAll('a[href=""]')).length,
          formCount: document.querySelectorAll('form').length,
          inputsWithoutLabel: document.querySelectorAll('input:not([aria-label]):not([id])').length
        };
      });
      
      pageReport.domInfo = domInfo;
      
      // 스크린샷 캡처
      const screenshotPath = `screenshots/${pageInfo.name}-${Date.now()}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      pageReport.screenshot = screenshotPath;
      
      // 수집된 로그 저장
      pageReport.consoleLogs = [...consoleLogs];
      pageReport.errors = [...pageErrors];
      pageReport.failedRequests = [...failedRequests];
      
    } catch (error) {
      pageReport.loadError = {
        message: error.message,
        stack: error.stack
      };
    }
    
    report.pages.push(pageReport);
  }
  
  // 모바일 뷰포트 테스트
  console.log('\nTesting mobile viewport...');
  await context.close();
  
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  
  const mobilePage = await mobileContext.newPage();
  
  // 홈페이지 모바일 뷰 테스트
  await mobilePage.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ 
    path: 'screenshots/home-mobile.png',
    fullPage: true 
  });
  
  await mobileContext.close();
  await browser.close();
  
  // 보고서 저장
  await fs.writeFile('website-review-report.json', JSON.stringify(report, null, 2));
  
  return report;
}

// 스크린샷 디렉토리 생성
async function ensureScreenshotDir() {
  try {
    await fs.mkdir('screenshots', { recursive: true });
  } catch (error) {
    // 디렉토리가 이미 존재하면 무시
  }
}

(async () => {
  try {
    await ensureScreenshotDir();
    const report = await reviewWebsite();
    
    // 주요 발견사항 출력
    console.log('\n=== Website Review Summary ===\n');
    
    for (const page of report.pages) {
      console.log(`\n📄 ${page.title} (${page.url})`);
      console.log(`   ⏱️  Load time: ${page.loadTime}ms`);
      console.log(`   🎨 First Contentful Paint: ${page.performance?.firstContentfulPaint?.toFixed(2)}ms`);
      console.log(`   📊 Resources loaded: ${page.performance?.resourceCount}`);
      
      if (page.consoleLogs.length > 0) {
        console.log(`   ⚠️  Console logs: ${page.consoleLogs.length}`);
      }
      
      if (page.errors.length > 0) {
        console.log(`   ❌ Page errors: ${page.errors.length}`);
      }
      
      if (page.failedRequests.length > 0) {
        console.log(`   🔴 Failed requests: ${page.failedRequests.length}`);
        page.failedRequests.forEach(req => {
          console.log(`      - ${req.url}`);
        });
      }
      
      if (page.domInfo?.imagesWithoutAlt > 0) {
        console.log(`   ♿ Images without alt text: ${page.domInfo.imagesWithoutAlt}`);
      }
    }
    
    console.log('\n✅ Review completed! Check website-review-report.json for detailed results.');
    
  } catch (error) {
    console.error('Error during review:', error);
  }
})();