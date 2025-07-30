const { chromium } = require('playwright');

async function completeFlowTest() {
  console.log('🚀 완전한 AI 해석 플로우 테스트');
  console.log('================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let gptError = false;
  let errorMsg = '';
  let aiSuccess = false;
  let interpretationText = '';
  
  // 콘솔 및 에러 모니터링
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('NOT_FOUND') && text.includes('gpt-3.5-turbo')) {
      gptError = true;
      errorMsg = text;
      console.log('🚨 GPT ERROR FOUND:', text);
    }
    if (text.includes('[TAROT]')) {
      console.log('📋', text);
    }
  });
  
  try {
    // Reading 페이지로 직접 이동
    console.log('🎯 타로 리딩 페이지로 이동...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForTimeout(3000);
    
    // 질문 입력
    console.log('1️⃣ 질문 입력');
    const questionInput = await page.locator('textarea, input[type="text"]').first();
    await questionInput.fill('실제 GPT 모델 오류가 발생하는지 테스트해주세요');
    
    // 스프레드 선택 (첫 번째 탭 클릭)
    console.log('2️⃣ 스프레드 선택');
    const firstTab = await page.locator('[role="tablist"] button').first();
    await firstTab.click();
    await page.waitForTimeout(1000);
    
    // 카드 섞기
    console.log('3️⃣ 카드 섞기');
    try {
      await page.click('button:has-text("카드 섞기")');
      await page.waitForTimeout(4000);
      console.log('✅ 카드 섞기 완료');
    } catch (e) {
      console.log('⚠️ 카드 섞기 건너뛰기');
    }
    
    // 카드 펼치기
    console.log('4️⃣ 카드 펼치기');
    try {
      await page.click('button:has-text("카드 펼치기")');
      await page.waitForTimeout(3000);
      console.log('✅ 카드 펼치기 완료');
    } catch (e) {
      console.log('⚠️ 카드 펼치기 건너뛰기');
    }
    
    // 카드 선택 (모든 가능한 카드 이미지 클릭)
    console.log('5️⃣ 카드 선택');
    const cardSelectors = [
      'img[alt*="카드"]',
      'img[src*="tarot"]',
      '.card-image',
      '[data-card]',
      'img[alt*="Card"]'
    ];
    
    let cardSelected = false;
    for (const selector of cardSelectors) {
      try {
        const cards = await page.locator(selector).all();
        if (cards.length > 0) {
          await cards[0].click();
          cardSelected = true;
          console.log(`✅ 카드 선택됨: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 selector 시도
      }
    }
    
    if (!cardSelected) {
      console.log('⚠️ 카드 이미지를 찾을 수 없음. 다른 요소 클릭 시도...');
      // 클릭 가능한 요소들 시도
      const clickableElements = await page.locator('div[class*="card"], button[class*="card"]').all();
      if (clickableElements.length > 0) {
        await clickableElements[0].click();
        cardSelected = true;
        console.log('✅ 카드 대체 요소 클릭됨');
      }
    }
    
    await page.waitForTimeout(2000);
    
    // 해석 버튼 찾기 및 클릭
    console.log('6️⃣ AI 해석 요청');
    
    const interpretButtonSelectors = [
      'button:has-text("해석 보기")',
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button:has-text("해석받기")',
      'button[class*="interpret"]',
      '.interpretation-button'
    ];
    
    let buttonFound = false;
    for (const selector of interpretButtonSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible()) {
          console.log(`🔄 해석 버튼 클릭: ${selector}`);
          await button.click();
          buttonFound = true;
          break;
        }
      } catch (e) {
        // 다음 selector 시도
      }
    }
    
    if (buttonFound) {
      console.log('⏳ AI 응답 대기 중... (최대 90초)');
      
      const startTime = Date.now();
      while (Date.now() - startTime < 90000) {
        // Toast 메시지 확인
        const toasts = await page.locator('[data-sonner-toast], .toast, [class*="toast"]').all();
        for (const toast of toasts) {
          const toastText = await toast.textContent();
          if (toastText && toastText.includes('NOT_FOUND')) {
            gptError = true;
            errorMsg = toastText;
            console.log('🚨 TOAST ERROR:', toastText);
            break;
          }
        }
        
        // 해석 결과 확인
        const interpretationSelectors = [
          '.prose',
          '[class*="interpretation"]',
          '[data-interpretation]',
          '.ai-response'
        ];
        
        for (const selector of interpretationSelectors) {
          try {
            const element = page.locator(selector);
            if (await element.isVisible()) {
              const text = await element.textContent();
              if (text && text.trim().length > 100) {
                aiSuccess = true;
                interpretationText = text.substring(0, 200) + '...';
                console.log('✅ AI 해석 성공!');
                console.log('📝 해석 내용:', interpretationText);
                break;
              }
            }
          } catch (e) {
            // 다음 selector 시도
          }
        }
        
        if (gptError || aiSuccess) break;
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('❌ 해석 버튼을 찾을 수 없음');
      
      // 페이지의 모든 버튼 출력
      const allButtons = await page.locator('button').all();
      console.log('\n📋 페이지의 모든 버튼들:');
      for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
        try {
          const text = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          console.log(`- "${text}" (visible: ${isVisible})`);
        } catch (e) {
          console.log(`- [버튼 ${i}] (텍스트 읽기 실패)`);
        }
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'verification-screenshots/complete-flow-test.png', 
      fullPage: true 
    });
    
    // 최종 결과
    console.log('\n🎯 완전한 플로우 테스트 결과:');
    console.log('============================');
    
    if (gptError) {
      console.log('❌ GPT 모델 오류 확인됨!');
      console.log('🚨 오류 메시지:', errorMsg);
      console.log('\n🔥 결론: 사용자가 보고한 오류가 실제로 발생합니다!');
      console.log('추가 수정이 필요합니다.');
    } else if (aiSuccess) {
      console.log('✅ AI 해석 성공');
      console.log('📝 해석 내용:', interpretationText);
      console.log('\n🎉 결론: GPT 모델 오류가 발생하지 않습니다!');
      console.log('시스템이 정상 작동하고 있습니다.');
    } else {
      console.log('⚠️ 해석 요청을 완료하지 못함');
      console.log('🔍 UI 흐름에 문제가 있을 수 있습니다.');
    }
    
  } catch (error) {
    console.error('💥 테스트 중 오류:', error);
    await page.screenshot({ 
      path: 'verification-screenshots/complete-flow-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 브라우저 유지 중. 수동 확인 후 Ctrl+C로 종료하세요.');
  await new Promise(() => {});
}

completeFlowTest().catch(console.error);