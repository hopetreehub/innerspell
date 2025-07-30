const { chromium } = require('playwright');

async function accurateTest() {
  console.log('🎯 정확한 AI 오류 확인 테스트');
  console.log('============================');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let modelNotFoundError = false;
  let errorMessage = '';
  let aiSuccess = false;
  
  // 모든 콘솔 및 에러 감지
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('NOT_FOUND') && text.includes('gpt-3.5-turbo')) {
      modelNotFoundError = true;
      errorMessage = text;
      console.log('🚨 MODEL ERROR:', text);
    }
    if (text.includes('[TAROT]')) {
      console.log('📋', text);
    }
  });
  
  try {
    await page.goto('https://test-studio-firebase.vercel.app/tarot');
    await page.waitForTimeout(3000);
    
    console.log('✅ 페이지 로드됨');
    
    // 질문 입력
    await page.fill('input[type="text"], textarea', '모델 오류 테스트');
    console.log('✅ 질문 입력됨');
    
    // 원 카드 스프레드 클릭
    await page.click('text=원 카드');
    await page.waitForTimeout(1000);
    console.log('✅ 원 카드 선택됨');
    
    // 카드 섞기 버튼 찾기 및 클릭
    try {
      await page.click('button:has-text("카드 섞기")');
      await page.waitForTimeout(3000);
      console.log('✅ 카드 섞기 완료');
    } catch (e) {
      console.log('⚠️ 카드 섞기 버튼 못 찾음');
    }
    
    // 카드 펼치기
    try {
      await page.click('button:has-text("카드 펼치기")');
      await page.waitForTimeout(2000);
      console.log('✅ 카드 펼치기 완료');
    } catch (e) {
      console.log('⚠️ 카드 펼치기 버튼 못 찾음');
    }
    
    // 카드 선택
    try {
      const cards = await page.locator('img[alt*="카드"]').all();
      if (cards.length > 0) {
        await cards[0].click();
        await page.waitForTimeout(1000);
        console.log('✅ 카드 선택됨');
      }
    } catch (e) {
      console.log('⚠️ 카드 선택 실패');
    }
    
    // 스크린샷
    await page.screenshot({ path: 'verification-screenshots/accurate-test-before.png', fullPage: true });
    
    // 해석 버튼 찾기 (여러 방법 시도)
    console.log('\n🎯 해석 버튼 찾기...');
    
    const buttonSelectors = [
      'button:has-text("해석 보기")',
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button[class*="interpretation"]',
      '[data-testid="interpret-button"]'
    ];
    
    let interpretButton = null;
    for (const selector of buttonSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible()) {
          interpretButton = button;
          console.log(`✅ 해석 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 무시하고 다음 selector 시도
      }
    }
    
    if (interpretButton) {
      console.log('🔄 해석 버튼 클릭...');
      await interpretButton.click();
      
      // 60초 대기
      console.log('⏳ AI 응답 대기 중...');
      const startTime = Date.now();
      
      while (Date.now() - startTime < 60000) {
        // Toast 메시지 확인
        const toasts = await page.locator('[data-sonner-toast]').all();
        for (const toast of toasts) {
          const toastText = await toast.textContent();
          if (toastText && toastText.includes('NOT_FOUND')) {
            modelNotFoundError = true;
            errorMessage = toastText;
            console.log('🚨 TOAST ERROR:', toastText);
            break;
          }
        }
        
        // 성공 확인
        const prose = page.locator('.prose');
        if (await prose.isVisible()) {
          const text = await prose.textContent();
          if (text && text.length > 50) {
            aiSuccess = true;
            console.log('✅ AI 해석 성공!');
            break;
          }
        }
        
        if (modelNotFoundError || aiSuccess) break;
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('❌ 해석 버튼을 찾을 수 없음');
      
      // 페이지의 모든 버튼 출력
      const allButtons = await page.locator('button').all();
      console.log('\n📋 페이지의 모든 버튼들:');
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const text = await allButtons[i].textContent();
        console.log(`- "${text}"`);
      }
    }
    
    await page.screenshot({ path: 'verification-screenshots/accurate-test-final.png', fullPage: true });
    
    // 최종 결과
    console.log('\n📊 정확한 테스트 결과:');
    console.log('=====================');
    
    if (modelNotFoundError) {
      console.log('❌ MODEL NOT FOUND 오류 확인됨!');
      console.log('🚨 오류 메시지:', errorMessage);
      console.log('\n🔥 결론: 문제가 여전히 존재합니다!');
    } else if (aiSuccess) {
      console.log('✅ AI 해석 성공');
      console.log('🎉 MODEL NOT FOUND 오류 없음');
      console.log('\n✅ 결론: 문제가 해결되었습니다!');
    } else {
      console.log('⚠️ 해석 요청을 완료하지 못함');
      console.log('🔍 수동으로 더 확인 필요');
    }
    
  } catch (error) {
    console.error('💥 테스트 오류:', error);
    await page.screenshot({ path: 'verification-screenshots/accurate-test-error.png', fullPage: true });
  }
  
  console.log('\n🔍 브라우저 유지. 수동 확인 후 Ctrl+C로 종료하세요.');
  await new Promise(() => {});
}

accurateTest().catch(console.error);