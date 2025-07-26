const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔍 무한 로딩 문제 확인 중...');
  
  try {
    // 콘솔 로그 캡처
    page.on('console', msg => {
      console.log(`[브라우저 콘솔] ${msg.type()}: ${msg.text()}`);
    });
    
    // 에러 캡처
    page.on('pageerror', err => {
      console.error(`[페이지 에러] ${err.message}`);
    });
    
    // 홈페이지 접속
    console.log('\n1. 홈페이지 로딩 테스트...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 로딩 상태 확인
    const isLoadingVisible = await page.isVisible('.animate-spin, [class*="spinner"], [class*="loading"]');
    console.log(`홈페이지 로딩 상태: ${isLoadingVisible ? '로딩 중' : '완료'}`);
    
    await page.waitForTimeout(3000);
    
    // 스크린샷
    await page.screenshot({ path: 'homepage-loading-check.png' });
    
    // 블로그 페이지 테스트
    console.log('\n2. 블로그 페이지 로딩 테스트...');
    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 블로그 로딩 상태 확인
    const blogLoadingVisible = await page.isVisible('.animate-spin, [class*="spinner"], [class*="loading"]');
    console.log(`블로그 페이지 로딩 상태: ${blogLoadingVisible ? '로딩 중' : '완료'}`);
    
    await page.waitForTimeout(3000);
    
    // 블로그 컨텐츠 확인
    const blogCards = await page.$$('article, [class*="card"]');
    console.log(`발견된 블로그 카드: ${blogCards.length}개`);
    
    // 스크린샷
    await page.screenshot({ path: 'blog-loading-check.png' });
    
    // Auth 상태 확인
    console.log('\n3. Auth 상태 확인...');
    const authLoading = await page.evaluate(() => {
      return window.localStorage.getItem('auth-loading') || 'not-set';
    });
    console.log(`Auth 로딩 상태: ${authLoading}`);
    
    // 네트워크 요청 확인
    console.log('\n4. 네트워크 요청 확인...');
    page.on('request', request => {
      if (request.url().includes('firebase') || request.url().includes('api')) {
        console.log(`[요청] ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('firebase') || response.url().includes('api')) {
        console.log(`[응답] ${response.status()} ${response.url()}`);
      }
    });
    
    // 페이지 새로고침으로 네트워크 요청 확인
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: `infinite-loading-check-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('\n📊 무한 로딩 검사 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    await page.screenshot({ path: 'infinite-loading-error.png' });
  } finally {
    await browser.close();
  }
})();