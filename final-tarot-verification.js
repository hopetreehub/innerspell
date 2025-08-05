const { chromium } = require('playwright');

(async () => {
  console.log('타로카드 상세 페이지 최종 검증 시작...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // 테스트할 카드 목록
  const cardsToTest = [
    { url: 'major-00-fool', name: 'The Fool' },
    { url: 'major-01-magician', name: 'The Magician' },
    { url: 'cups-ace', name: 'Ace of Cups' },
    { url: 'swords-10', name: 'Ten of Swords' }
  ];
  
  for (const card of cardsToTest) {
    try {
      console.log(`\n${card.name} 카드 테스트 중...`);
      
      // 페이지 로드
      await page.goto(`http://localhost:4000/tarot/${card.url}`, {
        waitUntil: 'networkidle'
      });
      
      // 페이지 로드 대기
      await page.waitForTimeout(3000);
      
      // 이미지 로드 확인
      const imageLoaded = await page.evaluate(() => {
        const img = document.querySelector('img[alt*="카드"]');
        return img && img.complete && img.naturalWidth > 0;
      });
      console.log(`- 이미지 로드: ${imageLoaded ? '✓' : '✗'}`);
      
      // 카드 정보 확인
      const hasTitle = await page.locator('h1').isVisible();
      console.log(`- 카드 제목 표시: ${hasTitle ? '✓' : '✗'}`);
      
      const hasDescription = await page.locator('text=/타로카드/').isVisible();
      console.log(`- 카드 설명 표시: ${hasDescription ? '✓' : '✗'}`);
      
      // 탭 확인
      const hasUprightTab = await page.locator('button:has-text("정방향")').isVisible();
      const hasReversedTab = await page.locator('button:has-text("역방향")').isVisible();
      console.log(`- 정방향/역방향 탭: ${hasUprightTab && hasReversedTab ? '✓' : '✗'}`);
      
      // 역방향 탭 클릭 테스트
      if (hasReversedTab) {
        await page.click('button:has-text("역방향")');
        await page.waitForTimeout(1000);
        console.log('- 역방향 탭 클릭: ✓');
      }
      
      // 스크린샷 저장
      await page.screenshot({
        path: `final-tarot-verification-${card.url}.png`,
        fullPage: true
      });
      console.log(`- 스크린샷 저장: final-tarot-verification-${card.url}.png`);
      
    } catch (error) {
      console.error(`${card.name} 테스트 중 오류:`, error.message);
    }
  }
  
  // 5분 대기 (사용자가 직접 확인할 수 있도록)
  console.log('\n\n모든 테스트 완료! 브라우저를 5분간 열어둡니다...');
  console.log('직접 다른 카드들도 클릭해보세요.');
  await page.waitForTimeout(300000);
  
  await browser.close();
})();