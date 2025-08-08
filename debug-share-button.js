const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 공유 버튼 디버깅');
    
    // 리딩 페이지로 이동하여 해석 완료된 상태 확인
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(2000);
    
    // 페이지의 모든 버튼 확인
    console.log('\n📋 현재 페이지의 모든 버튼:');
    const buttons = await page.locator('button').all();
    
    for (let i = 0; i < buttons.length; i++) {
      try {
        const text = await buttons[i].textContent();
        const isVisible = await buttons[i].isVisible();
        if (text && text.trim() && isVisible) {
          console.log(`  ${i + 1}. "${text.trim()}" (visible: ${isVisible})`);
          
          // 공유 관련 텍스트가 있는지 확인
          if (text.includes('공유') || text.includes('경험')) {
            console.log(`    👆 공유 관련 버튼 발견!`);
          }
        }
      } catch (e) {
        // 무시
      }
    }
    
    // 특정 버튼들 개별 검색
    console.log('\n🔍 특정 버튼 검색:');
    const searchPatterns = [
      'button:has-text("경험 공유")',
      'button:has-text("공유")',
      'button:has-text("경험")',
      'button:has-text("share")',
      'button:has-text("Share")',
      '[role="button"]:has-text("공유")',
      'button:has(svg)', // SVG 아이콘이 있는 버튼들
    ];
    
    for (const pattern of searchPatterns) {
      const count = await page.locator(pattern).count();
      if (count > 0) {
        console.log(`  - ${pattern}: ${count}개 발견`);
        
        // 각각의 텍스트 내용 출력
        const elements = await page.locator(pattern).all();
        for (let i = 0; i < elements.length; i++) {
          try {
            const text = await elements[i].textContent();
            const isVisible = await elements[i].isVisible();
            console.log(`    ${i + 1}: "${text}" (visible: ${isVisible})`);
          } catch (e) {
            // 무시
          }
        }
      }
    }
    
    // AlertDialog 내부 확인
    console.log('\n📑 AlertDialog 내부 확인:');
    const dialogButtons = await page.locator('[role="dialog"] button, [role="alertdialog"] button').all();
    console.log(`Dialog 내부 버튼 수: ${dialogButtons.length}`);
    
    for (let i = 0; i < dialogButtons.length; i++) {
      try {
        const text = await dialogButtons[i].textContent();
        const isVisible = await dialogButtons[i].isVisible();
        console.log(`  Dialog 버튼 ${i + 1}: "${text}" (visible: ${isVisible})`);
      } catch (e) {
        // 무시
      }
    }
    
    await page.screenshot({ path: 'screenshots/debug-buttons.png', fullPage: true });
    console.log('\n📸 스크린샷 저장: screenshots/debug-buttons.png');
    
    // 10초 대기
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 디버깅 실패:', error);
    await page.screenshot({ path: 'screenshots/debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();