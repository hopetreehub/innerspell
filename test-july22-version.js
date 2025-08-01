const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('=== 7월 22일 완전 복원 버전 테스트 ===\n');
    console.log('커밋: f0e5f04 (2025-07-24)\n');
    
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('1. 질문 입력...');
    await page.fill('textarea[placeholder*="카드에게"]', '7월 22일 버전 카드 펼치기 테스트');
    
    console.log('2. 카드 섞기...');
    const shuffleBtn = await page.locator('button:has-text("카드 섞기")');
    await shuffleBtn.click();
    
    console.log('3. 섞기 애니메이션 대기 (10초)...');
    await page.waitForTimeout(10000);
    
    console.log('4. 카드 펼치기 버튼 찾기...');
    const spreadBtn = await page.locator('button:has-text("카드 펼치기")');
    const isVisible = await spreadBtn.isVisible();
    const isDisabled = await spreadBtn.isDisabled();
    
    console.log(`   - 버튼 표시: ${isVisible}`);
    console.log(`   - 버튼 비활성화: ${isDisabled}`);
    
    if (isVisible && !isDisabled) {
      console.log('5. 카드 펼치기 버튼 클릭...');
      await spreadBtn.click();
      await page.waitForTimeout(3000);
      
      // 펼쳐진 카드 확인
      const spreadSection = await page.locator('text=펼쳐진 카드').isVisible();
      console.log(`   - 펼쳐진 카드 섹션 표시: ${spreadSection}`);
      
      // 카드 개수 확인
      const cards = await page.locator('[role="button"][tabIndex="0"]').count();
      console.log(`\n✅ 결과: ${cards}개 카드 펼쳐짐!`);
      
      // 레이아웃 정보
      const container = await page.locator('[role="group"] > div').first();
      const containerClass = await container.getAttribute('class');
      console.log(`   - 컨테이너 클래스: ${containerClass}`);
      
      // space-x-[-125px] 확인
      const hasNegativeSpacing = containerClass && containerClass.includes('space-x-[-125px]');
      console.log(`   - 음수 간격 사용: ${hasNegativeSpacing}`);
      
      if (cards === 78) {
        console.log('\n🎉 성공: 모든 카드가 정상적으로 펼쳐졌습니다!');
      } else if (cards === 0) {
        console.log('\n❌ 실패: 카드가 전혀 펼쳐지지 않았습니다.');
      } else {
        console.log(`\n⚠️ 부분 성공: 78장 중 ${cards}장만 펼쳐졌습니다.`);
      }
      
      await page.screenshot({ path: 'july22-version-result.png', fullPage: true });
      console.log('\n📸 스크린샷: july22-version-result.png');
      
    } else {
      console.log('\n❌ 문제: 카드 펼치기 버튼을 사용할 수 없습니다!');
    }
    
  } catch (error) {
    console.error('테스트 오류:', error);
    await page.screenshot({ path: 'july22-version-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();