const { chromium } = require('playwright');

async function ultimateTest() {
  console.log('🏆 궁극적 GPT 오류 탐지 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 실시간 오류 감지
  let gptErrorFound = false;
  const errorMessages = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('NOT_FOUND') || text.includes('gpt-3.5-turbo') || text.includes('Model')) {
      errorMessages.push(text);
      gptErrorFound = true;
      console.log(`🚨 콘솔 오류: ${text}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('api') && !response.url().includes('analytics')) {
      const status = response.status();
      console.log(`📡 API 호출: ${status} ${response.request().method()} ${response.url()}`);
      
      if (status >= 400) {
        try {
          const body = await response.text();
          console.log(`🔍 API 오류 응답: ${body}`);
          if (body.includes('NOT_FOUND') || body.includes('gpt-3.5-turbo')) {
            errorMessages.push(body);
            gptErrorFound = true;
          }
        } catch (e) {
          console.log(`응답 읽기 실패: ${e.message}`);
        }
      }
    }
  });
  
  try {
    // 1. 페이지 접속
    console.log('1️⃣ 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'verification-screenshots/ultimate-01.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ 질문 입력...');
    await page.fill('textarea', '나의 미래는 어떻게 될까요?');
    await page.screenshot({ path: 'verification-screenshots/ultimate-02.png' });
    
    // 3. 원카드 선택
    console.log('3️⃣ 원카드 선택...');
    await page.click('[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('text=한 장의 불꽃');
    await page.screenshot({ path: 'verification-screenshots/ultimate-03.png' });
    
    // 4. 카드 섞기
    console.log('4️⃣ 카드 섞기...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verification-screenshots/ultimate-04.png' });
    
    // 5. 카드 펼치기
    console.log('5️⃣ 카드 펼치기...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification-screenshots/ultimate-05.png' });
    
    // 6. AI 해석 대기 및 오류 감지
    console.log('6️⃣ AI 해석 과정 모니터링 시작...');
    
    let maxWaitTime = 30; // 30초 최대 대기
    let checkInterval = 1; // 1초마다 확인
    
    for (let i = 0; i < maxWaitTime; i++) {
      await page.waitForTimeout(checkInterval * 1000);
      
      const pageContent = await page.textContent('body');
      
      // GPT 오류 확인
      if (pageContent.includes('NOT_FOUND') || 
          pageContent.includes('gpt-3.5-turbo') ||
          pageContent.includes('Model') && pageContent.includes('not found')) {
        
        console.log(`🚨 ${i + 1}초 후 GPT 오류 발견!`);
        gptErrorFound = true;
        
        // "AI 해석 오류" 메시지 정확히 찾기
        const errorPattern = /AI 해석 오류[^\\n\\r]*/g;
        const matches = pageContent.match(errorPattern);
        if (matches) {
          matches.forEach(match => {
            console.log(`📍 발견된 오류 메시지: "${match}"`);
            errorMessages.push(match);
          });
        }
        
        await page.screenshot({ path: 'verification-screenshots/ultimate-06-ERROR.png' });
        break;
      }
      
      // 성공적인 해석 확인
      if (pageContent.includes('해석이 완료') || 
          pageContent.includes('카드의 메시지') ||
          pageContent.includes('타로 해석')) {
        console.log(`✅ ${i + 1}초 후 해석 성공`);
        await page.screenshot({ path: 'verification-screenshots/ultimate-06-SUCCESS.png' });
        break;
      }
      
      if (i % 5 === 0) { // 5초마다 상태 보고
        console.log(`⏳ ${i + 1}초 경과... AI 해석 진행 중`);
      }
    }
    
    // 7. 최종 페이지 상태 확인
    console.log('7️⃣ 최종 상태 확인...');
    await page.screenshot({ path: 'verification-screenshots/ultimate-07-final.png' });
    
    // 페이지 소스에서 숨겨진 오류 메시지 확인
    const finalContent = await page.textContent('body');
    const hiddenGptError = finalContent.includes('gpt-3.5-turbo') || 
                          finalContent.includes('NOT_FOUND') ||
                          finalContent.includes('Model') && finalContent.includes('not found');
    
    if (hiddenGptError && !gptErrorFound) {
      console.log('🔍 페이지 소스에서 숨겨진 GPT 오류 발견');
      gptErrorFound = true;
    }
    
    // 결과 보고
    console.log('\\n🏆 *** 최종 테스트 결과 ***');
    console.log('='.repeat(50));
    console.log(`GPT 모델 오류 발견: ${gptErrorFound ? '🚨 예' : '✅ 아니오'}`);
    console.log(`오류 메시지 수: ${errorMessages.length}`);
    
    if (gptErrorFound) {
      console.log('\\n🚨 확인된 GPT 관련 오류:');
      errorMessages.forEach((msg, idx) => {
        console.log(`${idx + 1}. ${msg}`);
      });
      console.log('\\n📋 예상 오류 패턴:');
      console.log('   "AI 해석 오류: NOT_FOUND: Model gpt-3.5-turbo not found"');
    } else {
      console.log('\\n✅ GPT 모델 관련 오류가 발견되지 않았습니다.');
      console.log('현재 타로 시스템이 정상적으로 작동하고 있습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 예외 발생:', error.message);
    await page.screenshot({ path: 'verification-screenshots/ultimate-exception.png' });
  }
  
  // 수동 검증을 위한 대기 시간
  console.log('\\n⏰ 수동 검증을 위해 25초 대기 중...');
  console.log('🔍 브라우저 화면에서 다음을 확인해주세요:');
  console.log('   1. "AI 해석 오류" 메시지가 표시되는지');
  console.log('   2. "NOT_FOUND: Model gpt-3.5-turbo not found" 오류가 있는지');
  console.log('   3. 정상적인 타로 해석 결과가 나타나는지');
  
  setTimeout(() => {
    console.log('\\n👋 테스트 완료! 브라우저를 닫습니다.');
    browser.close();
  }, 25000);
}

ultimateTest().catch(console.error);