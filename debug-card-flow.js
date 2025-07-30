const { chromium } = require('playwright');

async function debugCardFlow() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 카드 플로우 디버깅 시작...');
    
    // 에러 및 로그 수집
    page.on('console', msg => {
      const level = msg.type();
      const text = msg.text();
      console.log(`📝 [${level}] ${text}`);
    });

    page.on('pageerror', error => {
      console.log(`🔴 페이지 에러: ${error.message}`);
    });

    // API 요청 모니터링
    page.on('request', request => {
      const url = request.url();
      const method = request.method();
      if (url.includes('api') || url.includes('ai') || url.includes('tarot') || url.includes('interpret')) {
        console.log(`📤 API 요청: ${method} ${url}`);
      }
    });

    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('api') || url.includes('ai') || url.includes('tarot') || url.includes('interpret')) {
        console.log(`📥 API 응답: ${status} ${url}`);
        
        if (status >= 400) {
          console.log(`❌ API 에러: ${status} ${url}`);
          response.text().then(text => {
            if (text) {
              console.log(`   에러 내용: ${text.substring(0, 500)}`);
            }
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
    await page.screenshot({ path: 'debug-01-initial.png' });
    console.log('   ✅ 타로 읽기 페이지 로드 완료');

    // 2. 질문 입력
    console.log('2. 질문 입력...');
    const questionInput = page.locator('textarea').first();
    await questionInput.fill('AI 해석 디버깅 테스트 질문입니다.');
    console.log('   ✅ 질문 입력 완료');
    
    await page.screenshot({ path: 'debug-02-question.png' });

    // 3. 버튼 상태 확인
    console.log('3. 모든 버튼 상태 확인...');
    const allButtons = await page.locator('button').all();
    
    for (let i = 0; i < allButtons.length; i++) {
      try {
        const buttonText = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        const isEnabled = await allButtons[i].isEnabled();
        const disabled = await allButtons[i].getAttribute('disabled');
        const ariaDisabled = await allButtons[i].getAttribute('aria-disabled');
        
        if (buttonText && (buttonText.includes('카드') || buttonText.includes('펼치기') || buttonText.includes('섞기') || buttonText.includes('해석'))) {
          console.log(`   버튼 "${buttonText}": 보임=${isVisible}, 활성=${isEnabled}, disabled=${disabled}, aria-disabled=${ariaDisabled}`);
        }
      } catch (e) {
        // 계속
      }
    }

    // 4. 카드 섞기 버튼 먼저 시도
    console.log('4. 카드 섞기 시도...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible({ timeout: 2000 }) && await shuffleButton.isEnabled({ timeout: 1000 })) {
      console.log('   카드 섞기 버튼 클릭...');
      await shuffleButton.click();
      await page.waitForTimeout(3000);
      console.log('   ✅ 카드 섞기 완료');
    } else {
      console.log('   ⚠️ 카드 섞기 버튼을 클릭할 수 없습니다');
    }
    
    await page.screenshot({ path: 'debug-03-after-shuffle.png' });

    // 5. 다시 버튼 상태 확인
    console.log('5. 섞기 후 버튼 상태 재확인...');
    const allButtonsAfter = await page.locator('button').all();
    
    for (let i = 0; i < allButtonsAfter.length; i++) {
      try {
        const buttonText = await allButtonsAfter[i].textContent();
        const isVisible = await allButtonsAfter[i].isVisible();
        const isEnabled = await allButtonsAfter[i].isEnabled();
        const disabled = await allButtonsAfter[i].getAttribute('disabled');
        const ariaDisabled = await allButtonsAfter[i].getAttribute('aria-disabled');
        
        if (buttonText && (buttonText.includes('카드') || buttonText.includes('펼치기') || buttonText.includes('섞기') || buttonText.includes('해석'))) {
          console.log(`   버튼 "${buttonText}": 보임=${isVisible}, 활성=${isEnabled}, disabled=${disabled}, aria-disabled=${ariaDisabled}`);
        }
      } catch (e) {
        // 계속
      }
    }

    // 6. 카드 펼치기 시도
    console.log('6. 카드 펼치기 시도...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    if (await spreadButton.isVisible({ timeout: 2000 })) {
      const isEnabled = await spreadButton.isEnabled({ timeout: 1000 });
      console.log(`   카드 펼치기 버튼 상태: 활성화=${isEnabled}`);
      
      if (isEnabled) {
        console.log('   카드 펼치기 버튼 클릭...');
        await spreadButton.click();
        await page.waitForTimeout(3000);
        console.log('   ✅ 카드 펼치기 완료');
      } else {
        console.log('   ⚠️ 카드 펼치기 버튼이 비활성화되어 있습니다');
        
        // 버튼 비활성화 이유 찾기
        const disabled = await spreadButton.getAttribute('disabled');
        const ariaDisabled = await spreadButton.getAttribute('aria-disabled');
        const ariaLabel = await spreadButton.getAttribute('aria-label');
        console.log(`     disabled 속성: ${disabled}`);
        console.log(`     aria-disabled 속성: ${ariaDisabled}`);
        console.log(`     aria-label: ${ariaLabel}`);
      }
    } else {
      console.log('   ⚠️ 카드 펼치기 버튼을 찾을 수 없습니다');
    }
    
    await page.screenshot({ path: 'debug-04-after-spread-attempt.png' });

    // 7. 카드가 이미 펼쳐져 있는지 확인
    console.log('7. 카드 상태 확인...');
    
    const cardSelectors = [
      '.tarot-card',
      '[data-testid*="card"]',
      '.card',
      '.card-back',
      '.card-front',
      '[class*="card"]',
      'img[alt*="card"]',
      'img[alt*="카드"]'
    ];
    
    let totalCards = 0;
    for (const selector of cardSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`   카드 발견 (${selector}): ${elements.length}개`);
          totalCards = Math.max(totalCards, elements.length);
        }
      } catch (e) {
        // 계속 다음 선택자 시도
      }
    }
    
    console.log(`   총 카드 수: ${totalCards}`);

    // 8. 카드가 있다면 선택 시도
    if (totalCards > 0) {
      console.log('8. 카드 선택 시도...');
      
      // 가장 많이 발견된 선택자 사용
      let bestSelector = '.tarot-card';
      let maxCards = 0;
      
      for (const selector of cardSelectors) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > maxCards) {
            maxCards = elements.length;
            bestSelector = selector;
          }
        } catch (e) {
          // 계속
        }
      }
      
      console.log(`   최적 카드 선택자: ${bestSelector} (${maxCards}개)`);
      
      const cardElements = await page.locator(bestSelector).all();
      const selectCount = Math.min(3, cardElements.length);
      
      for (let i = 0; i < selectCount; i++) {
        try {
          console.log(`   카드 ${i + 1} 선택 시도...`);
          await cardElements[i].click();
          await page.waitForTimeout(1000);
          console.log(`   ✅ 카드 ${i + 1} 선택 완료`);
        } catch (e) {
          console.log(`   ❌ 카드 ${i + 1} 선택 실패: ${e.message}`);
        }
      }
      
      await page.screenshot({ path: 'debug-05-cards-selected.png' });
    }

    // 9. AI 해석 버튼 찾기
    console.log('9. AI 해석 버튼 찾기...');
    
    const aiButtonSelectors = [
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button:has-text("해석 요청")',
      'button:has-text("AI 해석 생성")',
      'button[data-testid*="ai"]',
      'button[data-testid*="interpret"]'
    ];
    
    let foundAIButton = false;
    for (const selector of aiButtonSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          const isEnabled = await button.isEnabled({ timeout: 1000 });
          console.log(`   AI 버튼 발견 (${selector}): 활성화=${isEnabled}`);
          
          if (isEnabled) {
            console.log('   AI 해석 버튼 클릭...');
            await button.click();
            foundAIButton = true;
            console.log('   ✅ AI 해석 요청 전송');
            break;
          }
        }
      } catch (e) {
        // 계속 다음 선택자 시도
      }
    }
    
    if (!foundAIButton) {
      console.log('   ⚠️ 활성화된 AI 해석 버튼을 찾을 수 없습니다');
    }
    
    await page.screenshot({ path: 'debug-06-after-ai-request.png' });

    // 10. AI 해석 결과 대기
    if (foundAIButton) {
      console.log('10. AI 해석 결과 대기...');
      
      let waitTime = 0;
      const maxWaitTime = 60000; // 60초
      const checkInterval = 2000; // 2초마다 확인
      
      while (waitTime < maxWaitTime) {
        await page.waitForTimeout(checkInterval);
        waitTime += checkInterval;
        
        console.log(`   대기 중... (${waitTime/1000}초)`);
        
        // 에러 메시지 확인
        const errorElements = await page.locator('.error-message, .error, [data-testid*="error"], .alert-error').all();
        
        if (errorElements.length > 0) {
          console.log(`   ❌ 에러 발견: ${errorElements.length}개`);
          
          for (let i = 0; i < errorElements.length; i++) {
            try {
              const errorText = await errorElements[i].textContent();
              if (errorText && errorText.trim()) {
                console.log(`     에러 ${i + 1}: ${errorText}`);
                
                // 특정 에러 패턴 확인
                if (errorText.includes('gpt-3.5-turbo') && errorText.includes('not found')) {
                  console.log('     🎯 TARGET ERROR FOUND: gpt-3.5-turbo not found!');
                }
                if (errorText.includes('Model') && errorText.includes('not found')) {
                  console.log('     🎯 TARGET ERROR FOUND: Model not found!');
                }
              }
            } catch (e) {
              console.log(`     에러 ${i + 1}: 텍스트 읽기 실패`);
            }
          }
          break;
        }
        
        // 성공 결과 확인
        const resultElements = await page.locator('.interpretation-result, .ai-interpretation, [data-testid*="result"]').all();
        
        if (resultElements.length > 0) {
          console.log(`   ✅ 해석 결과 발견: ${resultElements.length}개`);
          break;
        }
      }
      
      await page.screenshot({ path: 'debug-07-final-result.png' });
    }
    
    console.log('🏁 카드 플로우 디버깅 완료');
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류 발생:', error);
    await page.screenshot({ path: 'debug-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// 디버깅 실행
debugCardFlow().catch(console.error);