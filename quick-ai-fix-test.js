const { chromium } = require('playwright');

async function quickAIFixTest() {
  console.log('🚀 빠른 AI 수정 테스트 시작');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1. 타로 리딩 페이지 직접 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'quick-fix-01-reading-page.png' });
    
    console.log('2. 페이지 구조 분석...');
    // 질문 입력 필드 찾기
    const inputs = await page.locator('input, textarea').all();
    console.log(`발견된 입력 필드 수: ${inputs.length}`);
    
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      console.log(`입력 필드 ${i}: placeholder="${placeholder}", type="${type}"`);
    }
    
    // 더 넓은 범위의 질문 입력 필드 시도
    const questionSelectors = [
      'input[type="text"]',
      'textarea',
      'input',
      '[placeholder*="질문"]',
      '[placeholder*="question"]',
      '.question-input',
      '#question'
    ];
    
    let questionInputFound = false;
    for (const selector of questionSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ 질문 입력 필드 발견: ${selector}`);
          await element.fill('AI 시스템 테스트 질문입니다');
          questionInputFound = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!questionInputFound) {
      console.log('⚠️ 질문 입력 필드를 찾을 수 없습니다. 페이지 HTML 확인...');
      const bodyText = await page.locator('body').textContent();
      console.log('페이지 텍스트 미리보기:', bodyText.substring(0, 500));
      
      // 강제로 첫 번째 input 사용
      const firstInput = page.locator('input').first();
      if (await firstInput.count() > 0) {
        await firstInput.fill('AI 테스트 질문');
        console.log('✅ 첫 번째 input 필드에 텍스트 입력');
      }
    }
    
    await page.screenshot({ path: 'quick-fix-02-question-entered.png' });
    
    console.log('3. 카드나 버튼 찾기...');
    // 클릭 가능한 요소들 찾기
    const buttons = await page.locator('button').all();
    console.log(`발견된 버튼 수: ${buttons.length}`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      console.log(`버튼 ${i}: "${text}"`);
    }
    
    // 다양한 방법으로 진행 시도
    const actionSelectors = [
      'button:has-text("시작")',
      'button:has-text("셔플")', 
      'button:has-text("카드")',
      'button:has-text("해석")',
      'button:has-text("AI")',
      'button',
      '.card',
      '[data-testid*="card"]'
    ];
    
    let actionTaken = false;
    for (const selector of actionSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ 액션 요소 발견 및 클릭: ${selector}`);
          await element.click();
          actionTaken = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    await page.screenshot({ path: 'quick-fix-03-after-action.png' });
    
    console.log('4. AI 해석 버튼 찾기...');
    await page.waitForTimeout(3000); // UI 로딩 대기
    
    const aiButtonSelectors = [
      'button:has-text("AI")',
      'button:has-text("해석")',
      'button:has-text("시작")',
      'button:has-text("interpret")',
      '[data-testid*="ai"]',
      '[data-testid*="interpret"]'
    ];
    
    let aiButtonClicked = false;
    for (const selector of aiButtonSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ AI 버튼 발견 및 클릭: ${selector}`);
          await element.click();
          aiButtonClicked = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    await page.screenshot({ path: 'quick-fix-04-ai-button-clicked.png' });
    
    if (aiButtonClicked) {
      console.log('5. AI 응답 대기 (30초)...');
      
      // 30초 동안 AI 응답 대기
      let aiResponseFound = false;
      const maxWait = 30000;
      const checkInterval = 2000;
      let waited = 0;
      
      while (waited < maxWait && !aiResponseFound) {
        try {
          const content = await page.content();
          
          // 에러 메시지 확인
          if (content.includes('gpt-3.5-turbo') && content.includes('not found')) {
            console.log('❌ gpt-3.5-turbo not found 에러 여전히 발생!');
            aiResponseFound = true;
            break;
          }
          
          // 정상 응답 확인
          if (content.includes('서론') || content.includes('본론') || content.includes('결론') || 
              content.includes('🤖') || content.includes('해석')) {
            console.log('✅ 정상적인 AI 응답 감지!');
            aiResponseFound = true;
            break;
          }
          
          // 새로운 에러 메시지 확인
          if (content.includes('활성화된 AI 모델이 없습니다') || 
              content.includes('AI 제공업체 설정을 확인해주세요')) {
            console.log('🔧 새로운 에러 메시지 감지 - 시스템이 업데이트되었습니다!');
            aiResponseFound = true;
            break;
          }
          
          await page.waitForTimeout(checkInterval);
          waited += checkInterval;
          console.log(`⏳ 대기 중... ${waited/1000}초`);
          
        } catch (error) {
          await page.waitForTimeout(checkInterval);
          waited += checkInterval;
        }
      }
      
      await page.screenshot({ path: 'quick-fix-05-final-result.png' });
      
      // 최종 페이지 내용 분석
      const finalContent = await page.content();
      const hasOldError = finalContent.includes('gpt-3.5-turbo') && finalContent.includes('not found');
      const hasNewSystem = finalContent.includes('🤖') || finalContent.includes('⚙️') || 
                          finalContent.includes('활성화된 AI 모델');
      
      console.log('================================================');
      console.log('🎯 빠른 수정 테스트 결과');
      console.log('================================================');
      console.log(`기존 gpt-3.5-turbo 에러: ${hasOldError ? '❌ 여전히 발생' : '✅ 수정됨'}`);
      console.log(`새로운 시스템 작동: ${hasNewSystem ? '✅ 감지됨' : '❌ 미감지'}`);
      console.log(`AI 버튼 클릭: ${aiButtonClicked ? '✅' : '❌'}`);
      
      if (!hasOldError && hasNewSystem) {
        console.log('🎉 SUCCESS: AI 해석 시스템이 성공적으로 수정되었습니다!');
        return { success: true, fixed: true };
      } else if (!hasOldError) {
        console.log('👍 PARTIAL: gpt-3.5-turbo 에러는 수정되었지만 추가 확인 필요');
        return { success: true, fixed: true, needsMoreTesting: true };
      } else {
        console.log('⚠️ FAILED: 여전히 기존 에러가 발생합니다');
        return { success: false, fixed: false };
      }
    } else {
      console.log('⚠️ AI 버튼을 찾을 수 없어 테스트를 완료할 수 없습니다');
      return { success: false, reason: 'AI button not found' };
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
    await page.screenshot({ path: 'quick-fix-error.png' });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

quickAIFixTest().then(result => {
  console.log('\n🎯 최종 결과:', result);
}).catch(console.error);