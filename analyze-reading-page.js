const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔮 타로 리딩 페이지 구조 분석');
    
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    // 모든 버튼 텍스트 확인
    const buttons = await page.locator('button').all();
    console.log('\n📋 페이지의 모든 버튼들:');
    for (let i = 0; i < buttons.length; i++) {
      try {
        const text = await buttons[i].textContent();
        if (text && text.trim()) {
          console.log(`  ${i + 1}. "${text.trim()}"`);
        }
      } catch (e) {
        console.log(`  ${i + 1}. [텍스트 읽기 실패]`);
      }
    }
    
    // 헤딩 및 주요 텍스트 확인
    console.log('\n📄 페이지 헤딩 및 주요 텍스트:');
    const headings = await page.locator('h1, h2, h3, h4').all();
    for (let i = 0; i < headings.length; i++) {
      try {
        const text = await headings[i].textContent();
        const tagName = await headings[i].evaluate(el => el.tagName);
        if (text && text.trim()) {
          console.log(`  ${tagName}: "${text.trim()}"`);
        }
      } catch (e) {
        // 헤딩 읽기 실패는 무시
      }
    }
    
    // 입력 필드 확인
    console.log('\n📝 입력 필드들:');
    const inputs = await page.locator('input, textarea').all();
    for (let i = 0; i < inputs.length; i++) {
      try {
        const placeholder = await inputs[i].getAttribute('placeholder');
        const type = await inputs[i].getAttribute('type');
        const id = await inputs[i].getAttribute('id');
        console.log(`  - Type: ${type}, ID: ${id}, Placeholder: "${placeholder}"`);
      } catch (e) {
        // 입력 필드 읽기 실패는 무시
      }
    }
    
    // 카드 관련 요소들 확인
    console.log('\n🎴 카드 관련 요소들:');
    const cardElements = await page.locator('[class*="card"], [class*="tarot"], [class*="deck"]').all();
    console.log(`카드 관련 요소 수: ${cardElements.length}개`);
    
    await page.screenshot({ path: 'screenshots/reading-page-analysis.png', fullPage: true });
    console.log('\n📸 타로 리딩 페이지 스크린샷 저장');
    
    // 리딩 시작 과정 시뮬레이션
    console.log('\n🎯 리딩 시작 과정 시뮬레이션');
    
    // 질문 입력 필드 찾기
    const questionInput = page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"]').first();
    if (await questionInput.isVisible()) {
      console.log('✅ 질문 입력 필드 발견');
      await questionInput.fill('테스트 질문입니다');
      await page.waitForTimeout(1000);
    }
    
    // 시작 버튼 찾기
    const possibleStartButtons = [
      'button:has-text("시작")',
      'button:has-text("리딩")',
      'button:has-text("뽑기")',
      'button:has-text("카드")',
      'button:has-text("Start")'
    ];
    
    let startButtonFound = false;
    for (const selector of possibleStartButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0 && await button.first().isVisible()) {
        console.log(`✅ 시작 버튼 발견: ${selector}`);
        try {
          await button.first().click();
          await page.waitForTimeout(3000);
          startButtonFound = true;
          break;
        } catch (e) {
          console.log(`버튼 클릭 실패: ${e.message}`);
        }
      }
    }
    
    if (!startButtonFound) {
      console.log('❌ 시작 버튼을 찾을 수 없음');
    }
    
    // 공유 관련 요소 확인
    console.log('\n🔗 공유 관련 요소 확인');
    const shareElements = await page.locator('button:has-text("공유"), button:has-text("share"), [class*="share"]').all();
    console.log(`공유 관련 요소 수: ${shareElements.length}개`);
    
    for (let i = 0; i < shareElements.length; i++) {
      try {
        const text = await shareElements[i].textContent();
        console.log(`  공유 요소 ${i + 1}: "${text}"`);
      } catch (e) {
        // 읽기 실패는 무시
      }
    }
    
    await page.screenshot({ path: 'screenshots/reading-page-after-interaction.png', fullPage: true });
    
    // 5초 대기
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 분석 중 오류:', error);
    await page.screenshot({ path: 'screenshots/reading-page-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();