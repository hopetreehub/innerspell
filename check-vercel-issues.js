const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== Vercel 프로덕션 환경 문제 진단 ===\n');
  
  const prodUrl = 'https://test-studio-firebase-r4mwp9dui-johns-projects-bf5e60f3.vercel.app';
  
  // 네트워크 에러 모니터링
  page.on('response', async response => {
    const url = response.url();
    if (response.status() >= 400) {
      console.log(`❌ [${response.status()}] ${url}`);
      if (url.includes('/api/')) {
        try {
          const body = await response.text();
          console.log('에러 응답:', body.substring(0, 200));
        } catch (e) {}
      }
    }
  });
  
  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[콘솔 에러] ${msg.text()}`);
    }
  });
  
  try {
    // 1. 블로그 페이지 테스트
    console.log('1. 블로그 페이지 확인...');
    await page.goto(`${prodUrl}/blog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 블로그 포스트 확인
    const posts = await page.$$('.blog-post, article, [data-testid*="post"]');
    console.log(`  - 블로그 포스트 수: ${posts.length}`);
    
    // 에러 메시지 확인
    const errorText = await page.evaluate(() => {
      const errors = [];
      document.querySelectorAll('.error, .text-red-500, [role="alert"]').forEach(el => {
        if (el.textContent) errors.push(el.textContent.trim());
      });
      return errors;
    });
    
    if (errorText.length > 0) {
      console.log('  - 에러 메시지:', errorText);
    }
    
    await page.screenshot({ path: 'vercel-blog-error.png' });
    
    // 2. 타로 리딩 페이지 테스트
    console.log('\n2. 타로 리딩 저장 기능 확인...');
    await page.goto(`${prodUrl}/reading`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 로그인 상태 확인
    const loginStatus = await page.evaluate(() => {
      return document.body.textContent.includes('로그인') || 
             document.body.textContent.includes('Sign In');
    });
    
    console.log(`  - 로그인 상태: ${loginStatus ? '로그아웃됨' : '로그인됨'}`);
    
    // 간단한 타로 리딩 테스트
    await page.fill('textarea', '테스트 질문');
    await page.click('button:text("카드 섞기")');
    await page.waitForTimeout(2000);
    await page.click('button:text("카드 펼치기")');
    await page.waitForTimeout(2000);
    
    // 카드 선택
    const cards = await page.$$('div[role="button"][aria-label*="카드"]');
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: 'vercel-tarot-state.png' });
    
    // 3. API 엔드포인트 직접 테스트
    console.log('\n3. API 엔드포인트 테스트...');
    
    // 블로그 API
    const blogResponse = await page.evaluate(async (url) => {
      try {
        const res = await fetch(`${url}/api/blog/posts`);
        return { status: res.status, ok: res.ok };
      } catch (e) {
        return { error: e.message };
      }
    }, prodUrl);
    
    console.log('  - 블로그 API:', blogResponse);
    
  } catch (error) {
    console.error('\n테스트 중 오류:', error.message);
  }
  
  console.log('\n\n분석 완료. 10초 후 브라우저가 닫힙니다...');
  await page.waitForTimeout(10000);
  await browser.close();
})();