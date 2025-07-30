const { chromium } = require('playwright');

async function preciseTarotTest() {
  console.log('🎯 정밀 타로 리딩 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 로그 수집
  const allLogs = [];
  page.on('console', msg => {
    const logEntry = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    console.log(`콘솔: ${logEntry}`);
    allLogs.push(logEntry);
  });
  
  page.on('response', response => {
    if (response.url().includes('api') || response.status() >= 400) {
      const logEntry = `HTTP: ${response.status()} ${response.url()}`;
      console.log(logEntry);
      allLogs.push(logEntry);
    }
  });
  
  try {
    // 1. 페이지 접속
    console.log('1️⃣ 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verification-screenshots/precise-01-loaded.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ 질문 입력...');
    const questionInput = page.locator('input[placeholder*="카드 이름, 키워드로 검색"]');
    await questionInput.fill('나의 연애운은 어떻게 될까요?');
    await page.screenshot({ path: 'verification-screenshots/precise-02-question.png' });
    
    // 3. 탭 선택 (구체적인 role 사용)
    console.log('3️⃣ 메이저 아르카나 탭 선택...');
    const majorTab = page.getByRole('tab', { name: '메이저 아르카나' });
    await majorTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification-screenshots/precise-03-tab-selected.png' });
    
    // 4. 카드가 나타날 때까지 대기
    console.log('4️⃣ 카드 로딩 대기...');
    await page.waitForSelector('img[alt*="카드"]', { timeout: 15000 });
    await page.screenshot({ path: 'verification-screenshots/precise-04-cards-visible.png' });
    
    // 5. 첫 번째 카드 클릭
    console.log('5️⃣ 첫 번째 카드 선택...');
    const firstCard = page.locator('img[alt*="카드"]').first();
    await firstCard.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verification-screenshots/precise-05-card-clicked.png' });
    
    // 6. 카드 상세 정보가 나타나는지 확인
    console.log('6️⃣ 카드 상세 정보 확인...');
    await page.waitForTimeout(2000);
    
    // AI 해석 버튼 찾기 (여러 가능성 시도)
    const interpretSelectors = [
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button:has-text("AI로 해석")',
      'button[class*="interpret"]',
      'button:has-text("리딩")',
      'button:has-text("분석")'
    ];
    
    let found = false;
    for (const selector of interpretSelectors) {
      const button = page.locator(selector);
      if (await button.count() > 0) {
        console.log(`✅ AI 해석 버튼 발견: ${selector}`);
        await button.first().click();
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log('❌ AI 해석 버튼을 찾을 수 없습니다. 페이지의 모든 버튼을 확인합니다...');
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`페이지에 총 ${buttonCount}개의 버튼이 있습니다:`);
      
      for (let i = 0; i < buttonCount; i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`  버튼 ${i}: "${buttonText}"`);
      }
    }
    
    await page.screenshot({ path: 'verification-screenshots/precise-06-interpretation-attempt.png' });
    
    // 7. 응답 대기 및 오류 확인
    console.log('7️⃣ 결과 대기...');
    await page.waitForTimeout(10000);
    
    // 페이지 전체 텍스트에서 오류 확인
    const pageText = await page.textContent('body');
    const hasGPTError = pageText.includes('gpt-3.5-turbo') || 
                       pageText.includes('NOT_FOUND') ||
                       pageText.includes('Model') && pageText.includes('not found');
    
    if (hasGPTError) {
      console.log('❌ GPT 모델 오류 발견!');
      console.log('오류가 포함된 텍스트:');
      const lines = pageText.split('\n');
      lines.forEach(line => {
        if (line.includes('gpt-3.5-turbo') || line.includes('NOT_FOUND') || 
           (line.includes('Model') && line.includes('not found'))) {
          console.log(`  📍 ${line.trim()}`);
        }
      });
    } else {
      console.log('✅ GPT 모델 오류가 발견되지 않았습니다.');
    }
    
    await page.screenshot({ path: 'verification-screenshots/precise-07-final-check.png' });
    
    // 8. 개발자 도구 Network 탭 확인을 위한 추가 정보
    console.log('8️⃣ 네트워크 요청 분석...');
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('api') || response.url().includes('openai')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    console.log('\n📊 수집된 모든 로그:');
    allLogs.forEach((log, index) => console.log(`${index + 1}. ${log}`));
    
    console.log('\n🔍 API 응답 분석:');
    responses.forEach(resp => {
      console.log(`  ${resp.status} ${resp.statusText}: ${resp.url}`);
    });
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    await page.screenshot({ path: 'verification-screenshots/precise-error.png' });
  }
  
  // 수동 확인을 위해 10초 대기
  console.log('\n⏰ 수동 확인을 위해 10초 대기 중...');
  setTimeout(() => {
    browser.close();
  }, 10000);
}

preciseTarotTest().catch(console.error);