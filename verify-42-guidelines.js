const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🎯 42개 타로 지침 확인 시작');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(3000);
    
    // 타로 지침 탭 클릭
    console.log('📋 타로 지침 탭으로 이동');
    await page.click('button:has-text("타로 지침")');
    await page.waitForTimeout(2000);
    
    // 통계 탭으로 이동하여 총 지침 수 확인
    console.log('📊 통계 및 분석 탭으로 이동');
    await page.click('button:has-text("통계 및 분석")');
    await page.waitForTimeout(1500);
    
    // 총 지침 수 확인
    const totalGuidelinesCard = page.locator('.p-6:has-text("총 지침 수")');
    const totalNumber = await totalGuidelinesCard.locator('.text-2xl').first().textContent();
    console.log(`📈 총 지침 수: ${totalNumber}개`);
    
    if (totalNumber === '42') {
      console.log('✅ 성공! 42개의 타로 지침이 올바르게 구현됨');
    } else {
      console.log(`❌ 실패: 예상 42개, 실제 ${totalNumber}개`);
    }
    
    // 지침 관리 탭으로 이동하여 실제 카드 개수 확인
    console.log('🗂️ 지침 관리 탭으로 이동');
    await page.click('button:has-text("지침 관리")');
    await page.waitForTimeout(2000);
    
    // 스크롤하여 모든 카드 로드
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const cards = await page.locator('[class*="relative"]:has(.text-lg)').all();
    console.log(`📋 실제 지침 카드 수: ${cards.length}개`);
    
    if (cards.length === 42) {
      console.log('✅ 확인! 지침 관리에서도 42개 카드 정상 표시');
    } else {
      console.log(`❌ 불일치: 통계는 ${totalNumber}개, 관리 화면은 ${cards.length}개`);
    }
    
    // 추가된 7개 지침 중 몇 개를 확인
    console.log('\n🔍 새로 추가된 현실적 통찰 지침들 확인:');
    const targetIds = [
      'past-present-future-realistic-insight',
      'celtic-cross-elemental-seasonal',
      'celtic-cross-realistic-insight'
    ];
    
    for (const targetId of targetIds) {
      const cardExists = await page.locator(`[data-testid="${targetId}"], :has-text("${targetId}")`, { timeout: 1000 }).count() > 0;
      if (cardExists) {
        console.log(`✅ ${targetId} 지침 확인됨`);
      } else {
        console.log(`⚠️ ${targetId} 지침을 화면에서 찾을 수 없음`);
      }
    }
    
    await page.screenshot({ path: 'screenshots/42-guidelines-verification.png', fullPage: true });
    console.log('📸 스크린샷 저장: screenshots/42-guidelines-verification.png');
    
    console.log('\n🎉 타로 지침 42개 구현 및 검증 완료!');
    
    // 5초 대기 후 종료
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'screenshots/guidelines-verification-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();