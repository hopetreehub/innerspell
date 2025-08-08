const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. 관리자 대시보드로 이동');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(3000);
    
    // 타로 지침 탭 클릭
    console.log('2. 타로 지침 탭 클릭');
    await page.click('button:has-text("타로 지침")');
    await page.waitForTimeout(2000);
    
    // 지침 개수 정보 읽기
    console.log('3. 디버그 정보 읽기');
    const debugInfo = await page.locator('.bg-gray-50').first();
    if (await debugInfo.isVisible()) {
      const debugText = await debugInfo.textContent();
      console.log('디버그 정보:', debugText);
    }
    
    // 관리 탭으로 이동
    console.log('\n4. 지침 관리 탭으로 이동');
    await page.click('button:has-text("지침 관리")');
    await page.waitForTimeout(2000);
    
    // 더 정확한 선택자로 카드 찾기
    console.log('5. 지침 카드 분석');
    const cards = await page.locator('[class*="relative"]:has(.text-lg)').all();
    console.log(`발견된 카드 수: ${cards.length}개`);
    
    // 각 카드의 제목 출력
    console.log('\n지침 목록:');
    for (let i = 0; i < cards.length && i < 10; i++) {
      try {
        const title = await cards[i].locator('.text-lg').first().textContent();
        const description = await cards[i].locator('.text-muted-foreground').first().textContent();
        console.log(`${i + 1}. ${title}`);
        console.log(`   - ${description}`);
      } catch (e) {
        console.log(`${i + 1}. 카드 정보를 읽을 수 없음`);
      }
    }
    
    if (cards.length > 10) {
      console.log(`... 그리고 ${cards.length - 10}개 더`);
    }
    
    // 스크롤하여 더 많은 카드가 있는지 확인
    console.log('\n6. 페이지 스크롤하여 추가 카드 확인');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const cardsAfterScroll = await page.locator('[class*="relative"]:has(.text-lg)').all();
    console.log(`스크롤 후 카드 수: ${cardsAfterScroll.length}개`);
    
    // 통계 탭 확인
    console.log('\n7. 통계 탭 확인');
    await page.click('button:has-text("통계 및 분석")');
    await page.waitForTimeout(1000);
    
    // 총 지침 수 카드 찾기
    const statsCards = await page.locator('.p-6:has(text("총 지침 수"))').all();
    for (const card of statsCards) {
      const numberElement = await card.locator('.text-2xl').first();
      if (await numberElement.isVisible()) {
        const number = await numberElement.textContent();
        console.log(`통계: 총 지침 수 = ${number}`);
      }
    }
    
    await page.screenshot({ path: 'screenshots/tarot-guidelines-detailed.png', fullPage: true });
    
    console.log('\n분석 완료!');
    
    // 5초 대기 후 종료
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'screenshots/guidelines-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();