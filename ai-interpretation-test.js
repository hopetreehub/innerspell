const { chromium } = require('playwright');

async function testAIInterpretation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🤖 AI 해석 기능 테스트 시작...');
    
    // 에러 및 로그 수집
    page.on('console', msg => {
      const level = msg.type();
      const text = msg.text();
      if (level === 'error' || text.includes('AI') || text.includes('error') || text.includes('Error') || text.includes('TAROT')) {
        console.log(`📝 [${level}] ${text}`);
      }
    });

    page.on('pageerror', error => {
      console.log(`🔴 페이지 에러: ${error.message}`);
    });

    // API 요청 모니터링
    page.on('request', request => {
      const url = request.url();
      if (url.includes('api') || url.includes('ai') || url.includes('tarot') || url.includes('interpret')) {
        console.log(`📤 API 요청: ${request.method()} ${url}`);
      }
    });

    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('api') || url.includes('ai') || url.includes('tarot') || url.includes('interpret')) {
        console.log(`📥 API 응답: ${status} ${url}`);
        
        if (status >= 400) {
          console.log(`❌ API 에러: ${status} ${url}`);
          // 에러 응답 내용 확인
          response.text().then(text => {
            console.log(`   에러 내용: ${text.substring(0, 500)}`);
          }).catch(() => {});
        }
      }
    });
    
    // 1. 타로 읽기 페이지로 이동
    console.log('1. 타로 읽기 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'ai-test-01-reading-page.png' });
    console.log('   ✅ 타로 읽기 페이지 로드 완료');

    // 2. 질문 입력
    console.log('2. 질문 입력...');
    const questionInput = page.locator('textarea').first();
    await questionInput.fill('AI 해석 테스트: 오늘의 운세는 어떨까요?');
    console.log('   ✅ 질문 입력 완료');
    
    await page.screenshot({ path: 'ai-test-02-question.png' });

    // 3. 카드 펼치기
    console.log('3. 카드 펼치기...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    if (await spreadButton.isVisible({ timeout: 5000 })) {
      await spreadButton.click();
      console.log('   ✅ 카드 펼치기 완료');
      await page.waitForTimeout(2000);
    } else {
      console.log('   ⚠️ 카드 펼치기 버튼을 찾을 수 없습니다');
    }
    
    await page.screenshot({ path: 'ai-test-03-cards-spread.png' });

    // 4. 카드 선택 (첫 3장)
    console.log('4. 카드 선택...');
    
    // 카드 요소 찾기 (여러 선택자 시도)
    const cardSelectors = [
      '.tarot-card',
      '[data-testid*="card"]',
      '.card',
      '.card-back',
      '.card-front',
      '[class*="card"]'
    ];
    
    let cardElements = [];
    for (const selector of cardSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`   카드 발견 (${selector}): ${elements.length}개`);
          cardElements = elements;
          break;
        }
      } catch (e) {
        // 계속 다음 선택자 시도
      }
    }
    
    if (cardElements.length === 0) {
      console.log('   ⚠️ 카드를 찾을 수 없습니다. 페이지 구조 확인...');
      
      // 모든 클릭 가능한 요소 찾기
      const clickableElements = await page.locator('[role="button"], button, [onclick], [class*="click"], [class*="select"]').all();
      console.log(`   클릭 가능한 요소: ${clickableElements.length}개`);
      
      for (let i = 0; i < Math.min(clickableElements.length, 5); i++) {
        try {
          const text = await clickableElements[i].textContent();
          const className = await clickableElements[i].getAttribute('class');
          console.log(`     요소 ${i + 1}: "${text}" (class: ${className})`);
        } catch (e) {
          console.log(`     요소 ${i + 1}: 정보 읽기 실패`);
        }
      }
    } else {
      // 카드 선택 (최대 3장)
      const selectCount = Math.min(3, cardElements.length);
      for (let i = 0; i < selectCount; i++) {
        try {
          await cardElements[i].click();
          console.log(`   카드 ${i + 1} 선택 완료`);
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log(`   카드 ${i + 1} 선택 실패: ${e.message}`);
        }
      }
    }
    
    await page.screenshot({ path: 'ai-test-04-cards-selected.png' });

    // 5. AI 해석 버튼 찾기 및 클릭
    console.log('5. AI 해석 요청...');
    
    const aiButtonSelectors = [
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button:has-text("해석 요청")',
      'button:has-text("AI 해석 생성")',
      'button[data-testid*="ai"]',
      'button[data-testid*="interpret"]',
      '.ai-button',
      '.interpret-button'
    ];
    
    let aiButton = null;
    for (const selector of aiButtonSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`   AI 버튼 발견: ${selector}`);
          aiButton = button;
          break;
        }
      } catch (e) {
        // 계속 다음 선택자 시도
      }
    }
    
    if (!aiButton) {
      console.log('   ⚠️ AI 해석 버튼을 찾을 수 없습니다. 모든 버튼 확인...');
      
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const buttonText = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          if (buttonText && (buttonText.includes('해석') || buttonText.includes('AI') || buttonText.includes('생성'))) {
            console.log(`   관련 버튼 발견: "${buttonText}" (보임: ${isVisible})`);
          }
        } catch (e) {
          // 계속
        }
      }
    } else {
      // AI 해석 버튼 클릭
      console.log('   AI 해석 버튼 클릭...');
      await aiButton.click();
      console.log('   ✅ AI 해석 요청 전송');
    }
    
    await page.screenshot({ path: 'ai-test-05-ai-request.png' });

    // 6. AI 해석 결과 대기
    console.log('6. AI 해석 결과 대기...');
    
    // 로딩 상태나 결과를 최대 60초 대기
    let foundResult = false;
    let foundError = false;
    
    try {
      // 결과나 에러 메시지를 기다림
      await page.waitForSelector('.interpretation-result, .error-message, .ai-interpretation, [data-testid*="result"], [data-testid*="error"], .error, .alert', { 
        timeout: 60000 
      });
      
      // 에러 메시지 확인
      const errorSelectors = ['.error-message', '.error', '[data-testid*="error"]', '.alert-error', '.text-red'];
      
      for (const selector of errorSelectors) {
        try {
          const errorElements = await page.locator(selector).all();
          
          if (errorElements.length > 0) {
            foundError = true;
            console.log(`   ❌ 에러 발견 (${selector}): ${errorElements.length}개`);
            
            for (let i = 0; i < errorElements.length; i++) {
              try {
                const errorText = await errorElements[i].textContent();
                if (errorText && errorText.trim()) {
                  console.log(`     에러 ${i + 1}: ${errorText}`);
                  
                  // 특정 에러 패턴 확인
                  if (errorText.includes('gpt-3.5-turbo') && errorText.includes('not found')) {
                    console.log('     🎯 발견된 에러: gpt-3.5-turbo not found 에러!');
                  }
                  if (errorText.includes('Model') && errorText.includes('not found')) {
                    console.log('     🎯 발견된 에러: 모델을 찾을 수 없음 에러!');
                  }
                  if (errorText.includes('API key')) {
                    console.log('     🎯 발견된 에러: API 키 관련 에러!');
                  }
                }
              } catch (e) {
                console.log(`     에러 ${i + 1}: 텍스트 읽기 실패`);
              }
            }
          }
        } catch (e) {
          // 계속
        }
      }
      
      // 성공적인 해석 결과 확인
      const resultSelectors = ['.interpretation-result', '.ai-interpretation', '[data-testid*="result"]', '.result'];
      
      for (const selector of resultSelectors) {
        try {
          const resultElements = await page.locator(selector).all();
          
          if (resultElements.length > 0) {
            foundResult = true;
            console.log(`   ✅ 해석 결과 발견 (${selector}): ${resultElements.length}개`);
            
            for (let i = 0; i < resultElements.length; i++) {
              try {
                const resultText = await resultElements[i].textContent();
                if (resultText && resultText.trim()) {
                  console.log(`     결과 ${i + 1} (길이: ${resultText.length}): ${resultText.substring(0, 200)}...`);
                }
              } catch (e) {
                console.log(`     결과 ${i + 1}: 텍스트 읽기 실패`);
              }
            }
          }
        } catch (e) {
          // 계속
        }
      }
      
    } catch (waitError) {
      console.log('   ⏰ 타임아웃: AI 해석 결과를 기다리는 중 시간 초과');
    }
    
    await page.screenshot({ path: 'ai-test-06-final-result.png' });
    
    // 7. 최종 상태 요약
    console.log('7. 테스트 결과 요약...');
    console.log(`   해석 결과 발견: ${foundResult}`);
    console.log(`   에러 발견: ${foundError}`);
    
    if (!foundResult && !foundError) {
      console.log('   ⚠️ 해석 결과도 에러도 발견되지 않음 - UI 상태를 확인하세요');
    }
    
    // 추가로 10초 대기하여 더 많은 로그 수집
    console.log('8. 추가 로그 수집 대기...');
    await page.waitForTimeout(10000);
    
    console.log('🏁 AI 해석 기능 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'ai-test-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testAIInterpretation().catch(console.error);