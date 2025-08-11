const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false
  });
  
  const page = await browser.newPage();
  
  // API 호출 모니터링
  page.on('request', request => {
    if (request.url().includes('api/generate-tarot')) {
      console.log('\n🎯 타로 API 호출 감지!');
      console.log('URL:', request.url());
      console.log('Method:', request.method());
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('api/generate-tarot')) {
      console.log('\n📥 타로 API 응답:', response.status());
      if (response.status() >= 400) {
        const body = await response.text();
        console.log('에러 응답:', body);
      }
    }
  });
  
  try {
    console.log('타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000);
    
    // 간단한 플로우
    console.log('타로 리딩 시작...');
    await page.fill('textarea', '간단한 테스트');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    // 카드 펼치기
    const spreadButton = await page.$('button:has-text("카드 펼치기")');
    if (spreadButton) {
      await spreadButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 카드 선택
    const cards = await page.$$('div[role="button"]');
    console.log(`카드 ${cards.length}개 발견`);
    
    let selected = 0;
    for (const card of cards) {
      const label = await card.getAttribute('aria-label');
      if (label && label.includes('카드')) {
        await card.click({ force: true });
        selected++;
        if (selected >= 3) break;
        await page.waitForTimeout(500);
      }
    }
    
    console.log(`${selected}장 선택됨`);
    
    // AI 해석 받기
    console.log('\nAI 해석 받기 클릭...');
    await page.click('button:has-text("AI 해석 받기")');
    
    // 20초 대기
    console.log('API 응답 대기 중...');
    await page.waitForTimeout(20000);
    
    // 스크린샷
    await page.screenshot({ path: 'error-reproduction.png', fullPage: true });
    console.log('\n스크린샷 저장: error-reproduction.png');
    
    console.log('브라우저를 닫으려면 Ctrl+C를 누르세요.');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await browser.close();
  }
})();