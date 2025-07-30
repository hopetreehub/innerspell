const { chromium } = require('playwright');

async function completeCardFlowTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🎯 완전한 카드 플로우 테스트 시작...');
    
    // 에러 및 로그 수집
    page.on('console', msg => {
      const level = msg.type();
      const text = msg.text();
      if (level === 'error' || text.includes('TAROT') || text.includes('AI') || text.includes('error') || text.includes('Error')) {
        console.log(`📝 [${level}] ${text}`);
      }
    });

    page.on('pageerror', error => {
      console.log(`🔴 페이지 에러: ${error.message}`);
    });

    // API 요청 모니터링 (AI 관련만)
    page.on('request', request => {
      const url = request.url();
      if (url.includes('api') && (url.includes('ai') || url.includes('tarot') || url.includes('interpret'))) {
        console.log(`📤 AI API 요청: ${request.method()} ${url}`);
      }
    });

    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('api') && (url.includes('ai') || url.includes('tarot') || url.includes('interpret'))) {
        console.log(`📥 AI API 응답: ${status} ${url}`);
        
        if (status >= 400) {
          response.text().then(text => {
            console.log(`   에러 내용: ${text.substring(0, 500)}`);
          }).catch(() => {});
        }
      }
    });
    
    // 1. 페이지 로드
    console.log('1. 타로 읽기 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'complete-01-loaded.png' });
    console.log('   ✅ 페이지 로드 완료');

    // 2. 질문 입력
    console.log('2. 질문 입력...');
    const questionInput = page.locator('textarea').first();
    await questionInput.fill('완전한 AI 해석 테스트 질문입니다. 실제 gpt-3.5-turbo 에러를 재현해보겠습니다.');
    console.log('   ✅ 질문 입력 완료');
    
    await page.screenshot({ path: 'complete-02-question.png' });

    // 3. 카드 섞기
    console.log('3. 카드 섞기...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible({ timeout: 2000 })) {
      await shuffleButton.click();
      console.log('   카드 섞기 버튼 클릭함');
      
      // 섞기 완료까지 대기 (최대 10초)
      for (let i = 1; i <= 10; i++) {
        await page.waitForTimeout(1000);
        
        const shuffleStatus = await page.locator('button').filter({ hasText: '섞는 중' }).first();
        const isStillShuffling = await shuffleStatus.isVisible({ timeout: 100 }).catch(() => false);
        
        if (!isStillShuffling) {
          console.log(`   ✅ 카드 섞기 완료 (${i}초 후)`);
          break;
        } else {
          console.log(`   섞는 중... ${i}초`);
        }
        
        if (i === 10) {
          console.log('   ⚠️ 섞기가 10초 후에도 완료되지 않음, 계속 진행');
        }
      }
    }
    
    await page.screenshot({ path: 'complete-03-shuffled.png' });

    // 4. 카드 뽑기 버튼 클릭
    console.log('4. 카드 뽑기...');
    const drawButton = page.locator('button:has-text("카드 뽑기")');
    if (await drawButton.isVisible({ timeout: 5000 })) {
      console.log('   카드 뽑기 버튼 발견, 클릭...');
      await drawButton.click();
      
      // 카드 뽑기 완료까지 대기
      await page.waitForTimeout(3000);
      console.log('   ✅ 카드 뽑기 완료');
    } else {
      console.log('   ⚠️ 카드 뽑기 버튼을 찾을 수 없습니다');
    }
    
    await page.screenshot({ path: 'complete-04-cards-drawn.png' });

    // 5. 현재 버튼 상태 다시 확인
    console.log('5. 카드 뽑기 후 버튼 상태 확인...');
    const allButtons = await page.locator('button').all();
    
    for (let i = 0; i < allButtons.length; i++) {
      try {
        const buttonText = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        const isEnabled = await allButtons[i].isEnabled();
        
        if (buttonText && buttonText.trim()) {
          console.log(`   버튼: "${buttonText.trim()}" (보임: ${isVisible}, 활성: ${isEnabled})`);
        }
      } catch (e) {
        // 계속
      }
    }

    // 6. AI 해석 버튼 찾기 및 클릭
    console.log('6. AI 해석 버튼 찾기...');
    
    const aiButtonSelectors = [
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button:has-text("해석 요청")',
      'button:has-text("AI 해석 생성")',
      'button:has-text("해석하기")',
      'button:has-text("분석")',
      'button:has-text("시작")',
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
            console.log('   🎯 AI 해석 버튼 클릭!');
            await button.click();
            foundAIButton = true;
            console.log('   ✅ AI 해석 요청 전송됨');
            break;
          } else {
            console.log('   버튼이 비활성화되어 있음');
          }
        }
      } catch (e) {
        // 계속 다음 선택자 시도
      }
    }
    
    if (!foundAIButton) {
      console.log('   ❌ AI 해석 버튼을 찾을 수 없습니다');
      console.log('   현재 페이지의 모든 텍스트 확인...');
      
      const pageText = await page.textContent('body');
      const lines = pageText.split('\n').filter(line => 
        line.includes('해석') || line.includes('AI') || line.includes('분석') || line.includes('시작')
      );
      
      lines.forEach((line, idx) => {
        console.log(`     ${idx + 1}. ${line.trim()}`);
      });
    }
    
    await page.screenshot({ path: 'complete-05-ai-button-clicked.png' });

    // 7. AI 해석 결과 대기 (최대 60초)
    if (foundAIButton) {
      console.log('7. AI 해석 결과 대기...');
      
      let waitTime = 0;
      const maxWaitTime = 60000; // 60초
      const checkInterval = 3000; // 3초마다 확인
      
      while (waitTime < maxWaitTime) {
        await page.waitForTimeout(checkInterval);
        waitTime += checkInterval;
        
        console.log(`   대기 중... (${waitTime/1000}초)`);
        
        // 에러 메시지 확인
        const errorElements = await page.locator('.error-message, .error, [data-testid*="error"], .alert-error, .text-red').all();
        
        if (errorElements.length > 0) {
          console.log(`   🎯 에러 발견: ${errorElements.length}개`);
          
          for (let i = 0; i < errorElements.length; i++) {
            try {
              const errorText = await errorElements[i].textContent();
              if (errorText && errorText.trim()) {
                console.log(`     🔴 에러 ${i + 1}: ${errorText}`);
                
                // 특정 에러 패턴 확인
                if (errorText.includes('gpt-3.5-turbo') && errorText.includes('not found')) {
                  console.log('     🎯 TARGET ERROR FOUND: gpt-3.5-turbo not found!');
                  console.log('     ✅ 문제 재현 성공!');
                }
                if (errorText.includes('Model') && errorText.includes('not found')) {
                  console.log('     🎯 TARGET ERROR FOUND: Model not found!');
                  console.log('     ✅ 문제 재현 성공!');
                }
                if (errorText.includes('API key')) {
                  console.log('     🎯 API 키 관련 에러 발견!');
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
          for (let i = 0; i < resultElements.length; i++) {
            try {
              const resultText = await resultElements[i].textContent();
              if (resultText && resultText.trim()) {
                console.log(`     결과 ${i + 1} (${resultText.length}자): ${resultText.substring(0, 100)}...`);
              }
            } catch (e) {
              console.log(`     결과 ${i + 1}: 텍스트 읽기 실패`);
            }
          }
          break;
        }
        
        // 로딩 상태 확인
        const loadingElements = await page.locator('.loading, .spinner, [data-testid*="loading"]').all();
        if (loadingElements.length > 0) {
          console.log(`   ⏳ 로딩 중... (${loadingElements.length}개 로딩 요소)`);
        }
      }
      
      if (waitTime >= maxWaitTime) {
        console.log('   ⏰ 60초 타임아웃: AI 해석 결과를 받지 못함');
      }
      
      await page.screenshot({ path: 'complete-06-final-result.png' });
    }
    
    console.log('🏁 완전한 카드 플로우 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'complete-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
completeCardFlowTest().catch(console.error);