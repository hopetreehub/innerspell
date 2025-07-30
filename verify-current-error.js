// Verify Current getActiveAIModels Error
const { chromium } = require('playwright');

async function verifyCurrentError() {
  console.log('🔍 현재 getActiveAIModels 에러 검증');
  console.log('===================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 에러 수집
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('getActiveAIModels') || msg.text().includes('not defined')) {
      errors.push({
        type: msg.type(),
        text: msg.text(),
        time: new Date().toISOString()
      });
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  
  // 페이지 에러 수집
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
    if (error.stack) {
      console.log(`[STACK] ${error.stack}`);
    }
  });
  
  try {
    console.log('1. Vercel 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2. 타로 카드 읽기 페이지로 이동...');
    await page.click('text="무료 타로 카드 뽑기"');
    await page.waitForTimeout(3000);
    
    console.log('3. 질문 입력...');
    await page.fill('textarea[placeholder*="질문"]', '현재 에러 테스트 질문입니다');
    
    console.log('4. 카드 스프레드 선택...');
    await page.click('text="1장 뽑기"');
    await page.waitForTimeout(2000);
    
    console.log('5. 카드 선택...');
    const cardBacks = await page.locator('.card-back').all();
    if (cardBacks.length > 0) {
      await cardBacks[0].click();
      await page.waitForTimeout(2000);
    }
    
    console.log('6. AI 해석 버튼 클릭 (에러 발생 예상 지점)...');
    
    // AI 해석 버튼 찾기 및 클릭
    let aiButton = null;
    const possibleSelectors = [
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button:has-text("AI")',
      '[data-testid="ai-interpretation-button"]'
    ];
    
    for (const selector of possibleSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 })) {
          aiButton = button;
          console.log(`AI 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {}
    }
    
    if (aiButton) {
      console.log('AI 해석 버튼 클릭 시도...');
      await aiButton.click();
      
      // 10초 동안 에러 발생 대기
      console.log('에러 발생 대기 중...');
      await page.waitForTimeout(10000);
      
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없습니다');
    }
    
    // 스크린샷
    await page.screenshot({ 
      path: `verify-error-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('\n=== 수집된 에러 ===');
    console.log('총 에러 수:', errors.length);
    
    let foundGetActiveAIModelsError = false;
    errors.forEach((error, i) => {
      console.log(`${i + 1}. [${error.type}] ${error.text}`);
      if (error.text.includes('getActiveAIModels') || error.text.includes('not defined')) {
        foundGetActiveAIModelsError = true;
      }
    });
    
    if (foundGetActiveAIModelsError) {
      console.log('\n❌ getActiveAIModels 에러 확인됨!');
      console.log('롤백이 필요합니다.');
    } else if (errors.length === 0) {
      console.log('\n⚠️ 에러가 발생하지 않았습니다. 문제가 해결되었거나 다른 이슈일 수 있습니다.');
    } else {
      console.log('\n⚠️ 다른 종류의 에러가 발생했습니다.');
    }
    
  } catch (error) {
    console.error('테스트 오류:', error);
  }
  
  console.log('\n브라우저를 열어두고 수동 확인 가능합니다.');
  await new Promise(() => {});
}

verifyCurrentError().catch(console.error);