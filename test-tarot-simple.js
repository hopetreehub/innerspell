const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('\\n=== 간단한 타로 해석 테스트 ===\\n');
    
    // 1. 페이지 접속
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력
    await page.locator('textarea').first().fill('테스트 질문입니다');
    console.log('질문 입력 완료');
    
    // 3. 카드 섞기
    const shuffleBtn = await page.locator('button:has-text("카드 섞기")');
    if (await shuffleBtn.isVisible()) {
      await shuffleBtn.click();
      await page.waitForTimeout(2000);
      console.log('카드 섞기 완료');
    }
    
    // 4. 카드 3장 클릭 (보이는 카드 중에서)
    const cards = await page.locator('.cursor-pointer').all();
    console.log('클릭 가능한 요소:', cards.length);
    
    if (cards.length >= 3) {
      for (let i = 0; i < 3 && i < cards.length; i++) {
        await cards[i].click();
        await page.waitForTimeout(1000);
        console.log(`카드 ${i + 1} 선택`);
      }
    }
    
    // 5. 해석 버튼 찾기
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);
    
    // 다양한 버튼 텍스트 시도
    const buttonTexts = ['해석 받기', 'AI 해석', '해석하기', '카드 읽기'];
    let interpretBtn = null;
    
    for (const text of buttonTexts) {
      const btn = page.locator(`button:has-text("${text}")`).first();
      if (await btn.isVisible()) {
        interpretBtn = btn;
        console.log(`"${text}" 버튼 발견`);
        break;
      }
    }
    
    if (interpretBtn) {
      await interpretBtn.click();
      console.log('해석 요청 전송');
      
      // 결과 대기
      await page.waitForTimeout(15000);
      
      // 전체 페이지 텍스트 확인
      const pageText = await page.textContent('body');
      
      if (pageText.includes('[의미]')) {
        console.log('\\n❌ [의미] 플레이스홀더 발견!');
        
        // 어디에 있는지 찾기
        const start = pageText.indexOf('[의미]');
        const context = pageText.substring(Math.max(0, start - 50), Math.min(pageText.length, start + 50));
        console.log('컨텍스트:', context);
      } else {
        console.log('\\n✅ [의미] 플레이스홀더가 없습니다!');
      }
      
      await page.screenshot({ path: 'tarot-final-result.png', fullPage: true });
      console.log('\\n스크린샷 저장: tarot-final-result.png');
      
    } else {
      console.log('해석 버튼을 찾을 수 없습니다');
      await page.screenshot({ path: 'tarot-no-button.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('오류:', error.message);
    await page.screenshot({ path: 'tarot-error-simple.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();