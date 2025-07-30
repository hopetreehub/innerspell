const { chromium } = require('playwright');

async function finalErrorTest() {
  console.log('🎯 최종 GPT 오류 확인 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 3000,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // GPT 관련 오류 감지
  let gptErrorDetected = false;
  const gptErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('NOT_FOUND') || text.includes('gpt-3.5-turbo') || text.includes('Model')) {
      gptErrors.push(text);
      gptErrorDetected = true;
      console.log(`🚨 GPT 오류 감지: ${text}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('api/readings') || response.url().includes('api/tarot') || response.url().includes('openai')) {
      console.log(`📡 API 응답: ${response.status()} ${response.url()}`);
      if (response.status() >= 400) {
        try {
          const responseText = await response.text();
          console.log(`🔍 오류 응답 내용: ${responseText}`);
          if (responseText.includes('NOT_FOUND') || responseText.includes('gpt-3.5-turbo')) {
            gptErrors.push(responseText);
            gptErrorDetected = true;
          }
        } catch (e) {
          console.log(`응답 읽기 실패: ${e.message}`);
        }
      }
    }
  });
  
  try {
    // 1. 페이지 접속
    console.log('1️⃣ 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'verification-screenshots/final-01-loaded.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ 질문 입력...');
    await page.fill('textarea', '나의 미래는 어떻게 될까요?');
    await page.screenshot({ path: 'verification-screenshots/final-02-question.png' });
    
    // 3. 원카드 선택
    console.log('3️⃣ 원카드 스프레드 선택...');
    await page.click('[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('text=한 장의 불꽃');
    await page.screenshot({ path: 'verification-screenshots/final-03-spread.png' });
    
    // 4. 카드 섞기
    console.log('4️⃣ 카드 섞기...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'verification-screenshots/final-04-shuffled.png' });
    
    // 5. 카드 뒤집기 - 여러 방법으로 시도
    console.log('5️⃣ 카드 뒤집기 버튼 찾기 및 클릭...');
    
    const flipSelectors = [
      'button:has-text("카드 뒤집기")',
      'button:has-text("뒤집기")',
      'button[aria-label*="뒤집기"]',
      'button[aria-label*="카드 뒤집기"]',
      '.flip-button',
      '[data-action="flip"]'
    ];
    
    let buttonClicked = false;
    for (const selector of flipSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.count() > 0) {
          console.log(`✅ 버튼 발견: ${selector}`);
          await button.first().click();
          buttonClicked = true;
          console.log('🎯 카드 뒤집기 버튼 클릭됨!');
          break;
        }
      } catch (e) {
        console.log(`${selector} 시도 실패: ${e.message}`);
      }
    }
    
    if (!buttonClicked) {
      // 모든 버튼 확인
      console.log('⚠️ 카드 뒤집기 버튼을 찾지 못함. 모든 버튼 확인...');
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`버튼 ${i}: "${buttonText}"`);
        if (buttonText && buttonText.includes('뒤집')) {
          console.log(`🎯 뒤집기 관련 버튼 발견! 클릭 시도...`);
          await allButtons[i].click();
          buttonClicked = true;
          break;
        }
      }
    }
    
    if (buttonClicked) {
      await page.screenshot({ path: 'verification-screenshots/final-05-flip-clicked.png' });
      
      // 6. AI 해석 결과 대기 및 오류 감지
      console.log('6️⃣ AI 해석 진행 중... 오류 감지 대기...');
      
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(1500);
        
        // 페이지 내용 실시간 확인
        const pageContent = await page.textContent('body');
        
        if (pageContent.includes('NOT_FOUND') || 
            pageContent.includes('gpt-3.5-turbo') ||
            (pageContent.includes('Model') && pageContent.includes('not found'))) {
          
          console.log(`🚨 ${(i + 1) * 1.5}초 후 GPT 오류 발견!`);
          gptErrorDetected = true;
          
          // 구체적인 오류 텍스트 추출
          if (pageContent.includes('AI 해석 오류')) {
            const errorMatch = pageContent.match(/AI 해석 오류[^\\n]*/);
            if (errorMatch) {
              console.log(`📍 정확한 오류 메시지: "${errorMatch[0]}"`);
            }
          }
          
          await page.screenshot({ path: 'verification-screenshots/final-06-ERROR-FOUND.png' });
          break;
        }
        
        // 성공적인 해석 확인
        if (pageContent.includes('카드의 의미') || 
            pageContent.includes('해석 결과') ||
            (pageContent.includes('해석') && pageContent.length > 2000)) {
          console.log(`✅ ${(i + 1) * 1.5}초 후 해석 완료`);
          await page.screenshot({ path: 'verification-screenshots/final-06-success.png' });
          break;
        }
        
        console.log(`⏳ ${(i + 1) * 1.5}초 대기 중...`);
      }
      
    } else {
      console.log('❌ 카드 뒤집기 버튼을 찾을 수 없음');
    }
    
    // 7. 최종 확인
    await page.screenshot({ path: 'verification-screenshots/final-07-complete.png' });
    
    console.log('\\n🎯 최종 테스트 결과:');
    console.log(`GPT 오류 감지: ${gptErrorDetected ? '🚨 예' : '✅ 아니오'}`);
    console.log(`감지된 오류 수: ${gptErrors.length}`);
    
    if (gptErrorDetected) {
      console.log('\\n🚨 *** 확인된 GPT 모델 오류! ***');
      console.log('예상되는 오류: "AI 해석 오류: NOT_FOUND: Model gpt-3.5-turbo not found"');
      gptErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\\n✅ GPT 모델 오류가 감지되지 않았습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 예외:', error.message);
    await page.screenshot({ path: 'verification-screenshots/final-exception.png' });
  }
  
  // 수동 확인을 위해 20초 대기
  console.log('\\n⏰ 수동 확인을 위해 20초 대기합니다...');
  console.log('👀 브라우저에서 직접 "AI 해석 오류: NOT_FOUND: Model gpt-3.5-turbo not found" 메시지를 확인해주세요!');
  
  setTimeout(() => {
    browser.close();
  }, 20000);
}

finalErrorTest().catch(console.error);