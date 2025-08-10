const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== 타로 히스토리 페이지 상세 확인 ===\n');
    
    // 1. 먼저 홈페이지가 정상인지 확인
    console.log('1. 홈페이지 접속 시도...');
    await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const homeTitle = await page.title();
    console.log('홈페이지 타이틀:', homeTitle);
    
    // 2. 타로 히스토리 페이지로 이동
    console.log('\n2. 타로 히스토리 페이지로 이동...');
    const response = await page.goto('http://localhost:4000/tarot/history', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('HTTP 상태 코드:', response?.status());
    console.log('URL:', page.url());
    
    // 3. 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 4. 페이지 제목 확인
    const title = await page.title();
    console.log('\n페이지 제목:', title);
    
    // 5. 페이지 내용 확인
    const bodyText = await page.locator('body').textContent();
    console.log('\n페이지 내용 포함 여부:');
    console.log('- "타로" 텍스트:', bodyText.includes('타로'));
    console.log('- "히스토리" 텍스트:', bodyText.includes('히스토리'));
    console.log('- "기록" 텍스트:', bodyText.includes('기록'));
    console.log('- "로그인" 텍스트:', bodyText.includes('로그인'));
    
    // 6. 주요 요소 확인
    console.log('\n주요 요소 존재 여부:');
    
    // h1 태그 확인
    const h1Exists = await page.locator('h1').count() > 0;
    if (h1Exists) {
      const h1Text = await page.locator('h1').first().textContent();
      console.log('- h1 태그:', h1Text);
    }
    
    // 카드 컴포넌트 확인
    const cardExists = await page.locator('[class*="card"]').count() > 0;
    console.log('- Card 컴포넌트 존재:', cardExists);
    
    // 로그인 버튼 확인
    const loginButton = await page.locator('a[href="/sign-in"], button:has-text("로그인")').count() > 0;
    console.log('- 로그인 버튼 존재:', loginButton);
    
    // 7. 에러 상태 확인
    const errorExists = await page.locator('text=/404|error/i').count() > 0;
    console.log('\n에러 표시 여부:', errorExists);
    
    // 8. 스크린샷 촬영
    await page.screenshot({ path: 'tarot-history-detailed.png', fullPage: true });
    console.log('\n스크린샷 저장: tarot-history-detailed.png');
    
    // 9. 콘솔 에러 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('콘솔 에러:', msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('\n에러 발생:', error.message);
    await page.screenshot({ path: 'tarot-history-error-detailed.png', fullPage: true });
    console.log('에러 스크린샷 저장: tarot-history-error-detailed.png');
  } finally {
    await browser.close();
  }
})();