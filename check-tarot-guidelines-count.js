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
    const tarotTab = await page.locator('button:has-text("타로 지침")').first();
    if (await tarotTab.isVisible()) {
      await tarotTab.click();
      console.log('✅ 타로 지침 탭 클릭됨');
      await page.waitForTimeout(2000);
    }
    
    // 지침 개수 확인
    console.log('3. 지침 개수 확인');
    const guidelineCountText = await page.locator('text=/지침: \\d+개/').first();
    if (await guidelineCountText.isVisible()) {
      const text = await guidelineCountText.textContent();
      console.log(`✅ 표시된 지침 개수: ${text}`);
    }
    
    // 관리 탭 클릭
    console.log('4. 지침 관리 탭 클릭');
    const managementTab = await page.locator('button:has-text("지침 관리")').first();
    if (await managementTab.isVisible()) {
      await managementTab.click();
      console.log('✅ 지침 관리 탭 클릭됨');
      await page.waitForTimeout(2000);
    }
    
    // 지침 카드 개수 세기
    console.log('5. 실제 표시된 지침 카드 개수 세기');
    const guidelineCards = await page.locator('.grid > div').all();
    console.log(`✅ 표시된 지침 카드 개수: ${guidelineCards.length}개`);
    
    // 첫 번째 지침의 정보 읽기
    if (guidelineCards.length > 0) {
      const firstCardTitle = await guidelineCards[0].locator('.text-lg').first().textContent();
      console.log(`첫 번째 지침: ${firstCardTitle}`);
    }
    
    // 마지막 지침의 정보 읽기
    if (guidelineCards.length > 0) {
      const lastCardTitle = await guidelineCards[guidelineCards.length - 1].locator('.text-lg').first().textContent();
      console.log(`마지막 지침: ${lastCardTitle}`);
    }
    
    // 통계 탭 클릭
    console.log('\n6. 통계 및 분석 탭 클릭');
    const analyticsTab = await page.locator('button:has-text("통계 및 분석")').first();
    if (await analyticsTab.isVisible()) {
      await analyticsTab.click();
      console.log('✅ 통계 탭 클릭됨');
      await page.waitForTimeout(2000);
    }
    
    // 총 지침 수 확인
    const totalGuidelines = await page.locator('text=총 지침 수').locator('..').locator('text=/\\d+/').first();
    if (await totalGuidelines.isVisible()) {
      const total = await totalGuidelines.textContent();
      console.log(`✅ 통계 탭의 총 지침 수: ${total}개`);
    }
    
    // 스크린샷 저장
    await page.screenshot({ path: 'screenshots/tarot-guidelines-count.png', fullPage: true });
    
    console.log('\n분석 완료!');
    console.log('종료하려면 Ctrl+C를 누르세요.');
    
    // 무한 대기
    await new Promise(() => {});
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'screenshots/tarot-guidelines-error.png', fullPage: true });
  }
})();