const { chromium } = require('playwright');

async function fullReadingTest() {
  console.log('🔮 전체 타로 리딩 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 오류 및 네트워크 로그 수집
  const logs = [];
  const apiErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    if (text.includes('NOT_FOUND') || text.includes('gpt-3.5-turbo') || text.includes('Model') || text.includes('error')) {
      console.log(`🚨 중요 로그: [${msg.type()}] ${text}`);
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('openai') || url.includes('gpt')) {
      const status = response.status();
      logs.push(`HTTP: ${status} ${url}`);
      
      if (status >= 400) {
        try {
          const responseText = await response.text();
          apiErrors.push({
            url,
            status,
            body: responseText
          });
          console.log(`🚨 API 오류: ${status} ${url}`);
          console.log(`응답 내용: ${responseText}`);
        } catch (e) {
          console.log(`응답 내용을 읽을 수 없음: ${e.message}`);
        }
      }
    }
  });
  
  try {
    // 1. 타로 리딩 페이지로 직접 이동
    console.log('1️⃣ 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verification-screenshots/reading-01-initial.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ 질문 입력...');
    const questionInput = page.locator('textarea, input[type="text"]').first();
    await questionInput.fill('나의 미래 연애운은 어떻게 될까요?');
    await page.screenshot({ path: 'verification-screenshots/reading-02-question.png' });
    
    // 3. 스프레드 선택 (원카드 또는 기본 스프레드)
    console.log('3️⃣ 스프레드 선택...');
    const spreadSelectors = [
      'select',
      'button:has-text("원카드")',
      'button:has-text("스프레드")',
      '[role="combobox"]'
    ];
    
    for (const selector of spreadSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await element.first().click();
        console.log(`✅ 스프레드 선택: ${selector}`);
        await page.waitForTimeout(1000);
        break;
      }
    }
    await page.screenshot({ path: 'verification-screenshots/reading-03-spread.png' });
    
    // 4. 시작 버튼 찾기 및 클릭
    console.log('4️⃣ 타로 리딩 시작...');
    const startButtons = [
      'button:has-text("시작")',
      'button:has-text("카드 뽑기")',
      'button:has-text("리딩 시작")',
      'button:has-text("카드 섞기")',
      'button[type="submit"]'
    ];
    
    let startButton = null;
    for (const selector of startButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0) {
        startButton = button.first();
        console.log(`✅ 시작 버튼 발견: ${selector}`);
        break;
      }
    }
    
    if (startButton) {
      await startButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'verification-screenshots/reading-04-started.png' });
      
      // 5. 카드 선택 또는 자동 진행 대기
      console.log('5️⃣ 카드 선택 대기...');
      await page.waitForTimeout(5000);
      
      // 클릭 가능한 카드가 있는지 확인
      const selectableCards = page.locator('.card:not([disabled]), [class*="card"]:not([disabled]), img[alt*="카드"]:not([disabled])');
      const cardCount = await selectableCards.count();
      
      if (cardCount > 0) {
        console.log(`✅ 선택 가능한 카드 ${cardCount}개 발견`);
        await selectableCards.first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'verification-screenshots/reading-05-card-selected.png' });
      }
      
      // 6. AI 해석 요청 또는 자동 해석 대기
      console.log('6️⃣ AI 해석 기능 확인...');
      
      const interpretButtons = [
        'button:has-text("AI 해석")',
        'button:has-text("해석 요청")',
        'button:has-text("해석")',
        'button:has-text("완료")',
        'button:has-text("결과")'
      ];
      
      let interpretButton = null;
      for (const selector of interpretButtons) {
        const button = page.locator(selector);
        if (await button.count() > 0) {
          interpretButton = button.first();
          console.log(`✅ 해석 버튼 발견: ${selector}`);
          break;
        }
      }
      
      if (interpretButton) {
        await interpretButton.click();
        console.log('7️⃣ AI 해석 요청됨...');
        await page.waitForTimeout(10000);
        await page.screenshot({ path: 'verification-screenshots/reading-06-interpretation.png' });
      } else {
        console.log('⏳ 자동 해석 진행 중...');
        await page.waitForTimeout(15000);
        await page.screenshot({ path: 'verification-screenshots/reading-06-auto-interpretation.png' });
      }
      
      // 7. 최종 결과 확인 및 오류 검색
      console.log('7️⃣ 결과 및 오류 확인...');
      
      const pageContent = await page.textContent('body');
      const errorKeywords = ['NOT_FOUND', 'gpt-3.5-turbo', 'Model', 'not found', 'Error', '오류', 'error'];
      
      let foundErrors = [];
      for (const keyword of errorKeywords) {
        if (pageContent.toLowerCase().includes(keyword.toLowerCase())) {
          foundErrors.push(keyword);
        }
      }
      
      if (foundErrors.length > 0) {
        console.log(`❌ 발견된 오류 키워드: ${foundErrors.join(', ')}`);
        
        // 페이지에서 오류 관련 텍스트 추출
        const lines = pageContent.split('\n');
        const errorLines = lines.filter(line => 
          foundErrors.some(keyword => 
            line.toLowerCase().includes(keyword.toLowerCase())
          ) && line.trim().length > 0
        );
        
        console.log('🔍 오류 관련 텍스트:');
        errorLines.slice(0, 5).forEach(line => console.log(`  📍 ${line.trim()}`));
      } else {
        console.log('✅ 페이지에서 명시적인 오류 메시지를 찾을 수 없습니다.');
      }
      
      await page.screenshot({ path: 'verification-screenshots/reading-07-final.png' });
      
    } else {
      console.log('❌ 시작 버튼을 찾을 수 없습니다.');
      
      // 페이지의 모든 버튼 나열
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`페이지의 모든 버튼 (${buttonCount}개):`);
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`  ${i}: "${buttonText}"`);
      }
    }
    
    // 8. 수집된 로그 및 API 오류 요약
    console.log('\n📊 테스트 결과 요약:');
    console.log(`총 로그 수: ${logs.length}`);
    console.log(`API 오류 수: ${apiErrors.length}`);
    
    if (apiErrors.length > 0) {
      console.log('\n🚨 발견된 API 오류들:');
      apiErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.status} ${error.url}`);
        if (error.body && error.body.length < 500) {
          console.log(`   응답: ${error.body}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    await page.screenshot({ path: 'verification-screenshots/reading-error.png' });
  }
  
  // 수동 확인을 위해 20초 대기
  console.log('\n⏰ 수동 확인을 위해 20초 대기 중... (브라우저에서 직접 확인해주세요)');
  setTimeout(() => {
    browser.close();
  }, 20000);
}

fullReadingTest().catch(console.error);