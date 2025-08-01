const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('=== 오전 6시 이전 버전 카드 펼치기 테스트 ===\n');
    console.log('커밋: 0ecf329 (2025-07-31 03:57)\n');
    
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('1. 질문 입력...');
    await page.fill('textarea', '새벽 버전 카드 펼치기 테스트');
    
    console.log('2. 카드 섞기...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(10000);
    
    console.log('3. 카드 펼치기...');
    const spreadBtn = await page.locator('button:has-text("카드 펼치기")');
    const isVisible = await spreadBtn.isVisible();
    const isDisabled = await spreadBtn.isDisabled();
    
    console.log(`   - 버튼 표시: ${isVisible}`);
    console.log(`   - 버튼 비활성화: ${isDisabled}`);
    
    if (isVisible && !isDisabled) {
      await spreadBtn.click();
      await page.waitForTimeout(3000);
      
      // 카드 개수 확인
      const cards = await page.locator('[role="button"][tabIndex="0"]').count();
      console.log(`\n✅ 결과: ${cards}개 카드 펼쳐짐!`);
      
      // 카드 레이아웃 확인
      const container = await page.locator('[role="group"] > div').first();
      const containerClass = await container.getAttribute('class');
      console.log(`   - 컨테이너 클래스: ${containerClass}`);
      
      if (cards === 78) {
        console.log('\n🎉 성공: 78장 모두 정상 펼쳐짐!');
      } else {
        console.log(`\n⚠️ 문제: 78장 중 ${cards}장만 펼쳐짐`);
      }
      
      // 카드 선택 테스트
      if (cards > 0) {
        console.log('\n4. 카드 선택 테스트...');
        await page.locator('[role="button"][tabIndex="0"]').first().click();
        await page.waitForTimeout(1000);
        
        const status = await page.locator('text=/선택됨/').textContent();
        console.log(`   - 선택 상태: ${status}`);
      }
      
      await page.screenshot({ path: 'early-morning-version.png', fullPage: true });
      console.log('\n📸 스크린샷: early-morning-version.png');
    }
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await browser.close();
  }
})();