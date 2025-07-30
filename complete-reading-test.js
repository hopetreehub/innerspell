const { chromium } = require('playwright');

async function completeReadingTest() {
  console.log('🎯 완전한 타로 리딩 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 실시간 로그 모니터링
  const errorKeywords = ['NOT_FOUND', 'gpt-3.5-turbo', 'Model', 'not found', 'OpenAI', 'API', 'Error'];
  const foundErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const hasError = errorKeywords.some(keyword => text.includes(keyword));
    
    if (hasError) {
      foundErrors.push(text);
      console.log(`🚨 오류 감지: [${msg.type()}] ${text}`);
    } else if (text.includes('해석') || text.includes('AI') || text.includes('리딩')) {
      console.log(`📝 리딩 관련 로그: [${msg.type()}] ${text}`);
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') && !url.includes('analytics')) {
      const status = response.status();
      console.log(`📡 API 요청: ${status} ${response.request().method()} ${url}`);
      
      if (status >= 400) {
        try {
          const responseText = await response.text();
          console.log(`🚨 API 오류 응답: ${responseText}`);
          foundErrors.push(`API Error ${status}: ${responseText}`);
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
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verification-screenshots/complete-01-loaded.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ 질문 입력...');
    const questionTextarea = page.locator('textarea');
    await questionTextarea.fill('내 연애운은 어떻게 될까요?');
    await page.screenshot({ path: 'verification-screenshots/complete-02-question.png' });
    
    // 3. 원카드 스프레드 선택
    console.log('3️⃣ 원카드 스프레드 선택...');
    await page.locator('[role="combobox"]').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=한 장의 불꽃').first().click();
    await page.screenshot({ path: 'verification-screenshots/complete-03-spread.png' });
    
    // 4. 카드 섞기
    console.log('4️⃣ 카드 섞기...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'verification-screenshots/complete-04-shuffled.png' });
    
    // 5. 카드 뒤집기 (중요한 단계!)
    console.log('5️⃣ 카드 뒤집기 - AI 해석 요청...');
    const flipButton = page.locator('button:has-text("카드 뒤집기")');
    if (await flipButton.count() > 0) {
      await flipButton.click();
      console.log('✅ 카드 뒤집기 버튼 클릭됨 - AI 해석 시작');
      await page.screenshot({ path: 'verification-screenshots/complete-05-flipped.png' });
      
      // 6. AI 해석 결과 대기 및 모니터링
      console.log('6️⃣ AI 해석 결과 대기 (최대 30초)...');
      
      let checkCount = 0;
      let interpretationFound = false;
      let errorFound = false;
      
      while (checkCount < 15 && !interpretationFound && !errorFound) {
        await page.waitForTimeout(2000);
        checkCount++;
        
        const pageContent = await page.textContent('body');
        
        // 오류 확인
        if (pageContent.includes('NOT_FOUND') || 
            pageContent.includes('gpt-3.5-turbo') ||
            pageContent.includes('Model') && pageContent.includes('not found')) {
          
          console.log(`🚨 ${checkCount * 2}초 후 GPT 모델 오류 발견!`);
          
          // 구체적인 오류 메시지 추출
          const lines = pageContent.split('\\n');
          const errorLines = lines.filter(line => 
            line.includes('NOT_FOUND') || 
            line.includes('gpt-3.5-turbo') ||
            (line.includes('Model') && line.includes('not found'))
          );
          
          console.log('📍 발견된 오류 메시지들:');
          errorLines.forEach(line => console.log(`   ${line.trim()}`));
          
          errorFound = true;
          await page.screenshot({ path: 'verification-screenshots/complete-06-ERROR-DETECTED.png' });
          break;
        }
        
        // 해석 결과 확인
        const hasInterpretation = pageContent.includes('해석') || 
                                 pageContent.includes('의미') ||
                                 pageContent.includes('카드가 말하는');
        
        if (hasInterpretation && pageContent.length > 1000) {
          console.log(`✅ ${checkCount * 2}초 후 해석 결과 발견`);
          interpretationFound = true;
          await page.screenshot({ path: 'verification-screenshots/complete-06-interpretation-success.png' });
          break;
        }
        
        console.log(`⏳ ${checkCount * 2}초 대기 중... (해석 진행중)`);
      }
      
      if (!interpretationFound && !errorFound) {
        console.log('⚠️ 30초 대기 후에도 결과나 오류를 찾을 수 없음');
        await page.screenshot({ path: 'verification-screenshots/complete-06-timeout.png' });
      }
      
    } else {
      console.log('❌ 카드 뒤집기 버튼을 찾을 수 없음');
      await page.screenshot({ path: 'verification-screenshots/complete-05-no-flip-button.png' });
    }
    
    // 7. 최종 결과 정리
    console.log('7️⃣ 최종 페이지 상태 확인...');
    await page.screenshot({ path: 'verification-screenshots/complete-07-final-state.png' });
    
    // 페이지 전체 텍스트에서 오류 재확인
    const finalPageContent = await page.textContent('body');
    const finalErrorCheck = finalPageContent.includes('NOT_FOUND') || 
                           finalPageContent.includes('gpt-3.5-turbo') ||
                           finalPageContent.includes('Model') && finalPageContent.includes('not found');
    
    console.log('\\n📊 최종 테스트 결과:');
    console.log(`감지된 오류 수: ${foundErrors.length}`);
    console.log(`GPT 모델 오류 발견: ${finalErrorCheck ? '🚨 예' : '✅ 아니오'}`);
    
    if (finalErrorCheck) {
      console.log('\\n🚨 *** GPT 모델 오류 확인됨! ***');
      console.log('정확한 오류 메시지: "AI 해석 오류: NOT_FOUND: Model gpt-3.5-turbo not found"');
    } else {
      console.log('\\n✅ GPT 모델 오류가 발견되지 않았습니다.');
    }
    
    if (foundErrors.length > 0) {
      console.log('\\n🔍 발견된 모든 오류:');
      foundErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 예외 발생:', error.message);
    await page.screenshot({ path: 'verification-screenshots/complete-exception.png' });
  }
  
  // 수동 확인을 위해 15초 대기
  console.log('\\n⏰ 수동 확인을 위해 15초 대기 중...');
  console.log('👀 브라우저에서 직접 오류 메시지가 보이는지 확인해주세요!');
  setTimeout(() => {
    browser.close();
  }, 15000);
}

completeReadingTest().catch(console.error);