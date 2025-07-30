const { chromium } = require('playwright');

async function chromiumFinalVerification() {
  console.log('🎯 크로미움 최종 검증 테스트');
  console.log('==========================');
  console.log('사용자 요청: 실제 크로미움으로 완전히 해결되었는지 확인\n');
  
  // Vercel 배포 대기 (2분)
  console.log('⏳ Vercel 배포 대기중... (2분)');
  await new Promise(resolve => setTimeout(resolve, 120000));
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let gptErrorFound = false;
  let actualError = '';
  let interpretationSuccess = false;
  let interpretationContent = '';
  
  // 모든 콘솔 로그 모니터링
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('NOT_FOUND') && text.includes('gpt-3.5-turbo')) {
      gptErrorFound = true;
      actualError = text;
      console.log('🚨 GPT ERROR IN CONSOLE:', text);
    }
    if (text.includes('[TAROT]')) {
      console.log('📋', text);
    }
  });
  
  try {
    // 1. 직접 API 테스트
    console.log('\n1️⃣ 직접 API 테스트');
    console.log('==================');
    
    const apiResponse = await fetch('https://test-studio-firebase.vercel.app/api/debug/test-tarot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: '크로미움으로 직접 확인하는 최종 테스트',
        cardSpread: 'single-card',
        cardInterpretations: '1. 마법사 (정방향): 의지력과 창조력',
        isGuestUser: false
      })
    });
    
    const apiResult = await apiResponse.json();
    console.log('API 응답:', JSON.stringify(apiResult, null, 2));
    
    if (apiResult.result && apiResult.result.interpretation) {
      if (apiResult.result.interpretation.includes('NOT_FOUND')) {
        gptErrorFound = true;
        actualError = apiResult.result.interpretation;
        console.log('❌ API에서 GPT 오류 확인됨!');
      } else if (apiResult.result.interpretation.length > 100) {
        interpretationSuccess = true;
        interpretationContent = apiResult.result.interpretation.substring(0, 200) + '...';
        console.log('✅ API에서 정상 해석 반환됨!');
      }
    }
    
    // 2. UI 테스트
    console.log('\n2️⃣ UI 통합 테스트');
    console.log('==================');
    
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForTimeout(3000);
    
    // 질문 입력
    await page.fill('textarea, input[type="text"]', '최종 검증: GPT 모델 오류가 완전히 해결되었는지 확인');
    console.log('✅ 질문 입력됨');
    
    // 첫 번째 탭 클릭
    const firstTab = await page.locator('[role="tablist"] button').first();
    await firstTab.click();
    console.log('✅ 스프레드 선택됨');
    
    // 카드 섞기
    try {
      await page.click('button:has-text("카드 섞기")');
      await page.waitForTimeout(4000);
      console.log('✅ 카드 섞기 완료');
    } catch (e) {
      console.log('⚠️ 카드 섞기 건너뜀');
    }
    
    // 카드 펼치기
    try {
      await page.click('button:has-text("카드 펼치기")');
      await page.waitForTimeout(3000);
      console.log('✅ 카드 펼치기 완료');
    } catch (e) {
      console.log('⚠️ 카드 펼치기 건너뜀');
    }
    
    // 카드 선택
    const cards = await page.locator('img[alt*="카드"], img[src*="tarot"]').all();
    if (cards.length > 0) {
      await cards[0].click();
      console.log('✅ 카드 선택됨');
      await page.waitForTimeout(2000);
    }
    
    // 해석 요청
    console.log('\n🎯 AI 해석 요청 (핵심 테스트)');
    
    const interpretButtons = [
      'button:has-text("해석 보기")',
      'button:has-text("AI 해석")',
      'button:has-text("해석받기")'
    ];
    
    let buttonClicked = false;
    for (const selector of interpretButtons) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible()) {
          await button.click();
          buttonClicked = true;
          console.log('✅ 해석 버튼 클릭됨');
          break;
        }
      } catch (e) {
        // 다음 시도
      }
    }
    
    if (buttonClicked) {
      console.log('⏳ AI 응답 대기중... (최대 60초)');
      
      const startTime = Date.now();
      while (Date.now() - startTime < 60000) {
        // Toast 에러 확인
        const toasts = await page.locator('[data-sonner-toast]').all();
        for (const toast of toasts) {
          const text = await toast.textContent();
          if (text && text.includes('NOT_FOUND')) {
            gptErrorFound = true;
            actualError = text;
            console.log('🚨 UI TOAST ERROR:', text);
            break;
          }
        }
        
        // 성공 확인
        const prose = page.locator('.prose');
        if (await prose.isVisible()) {
          const text = await prose.textContent();
          if (text && text.length > 100) {
            interpretationSuccess = true;
            interpretationContent = text.substring(0, 200) + '...';
            console.log('✅ UI에서 해석 성공!');
            break;
          }
        }
        
        if (gptErrorFound || interpretationSuccess) break;
        await page.waitForTimeout(1000);
      }
    }
    
    // 스크린샷
    await page.screenshot({ 
      path: 'verification-screenshots/chromium-final-result.png', 
      fullPage: true 
    });
    
    // 최종 결과
    console.log('\n🎯 크로미움 최종 검증 결과');
    console.log('=========================');
    console.log(`GPT 오류 발생: ${gptErrorFound ? '❌ YES' : '✅ NO'}`);
    console.log(`AI 해석 성공: ${interpretationSuccess ? '✅ YES' : '❌ NO'}`);
    
    if (gptErrorFound) {
      console.log('\n❌ 문제가 여전히 존재합니다!');
      console.log('오류 내용:', actualError);
      console.log('\n🔍 추가 디버깅이 필요합니다.');
    } else if (interpretationSuccess) {
      console.log('\n🎉🎉🎉 완벽한 성공! 🎉🎉🎉');
      console.log('✅ GPT 모델 오류가 완전히 해결되었습니다!');
      console.log('✅ AI 타로 해석이 정상 작동합니다!');
      console.log('\n📝 생성된 해석 미리보기:');
      console.log(interpretationContent);
    } else {
      console.log('\n⚠️ 해석 요청이 완료되지 않았습니다.');
      console.log('다른 문제가 있을 수 있습니다.');
    }
    
  } catch (error) {
    console.error('\n💥 테스트 오류:', error);
    await page.screenshot({ 
      path: 'verification-screenshots/chromium-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 브라우저를 유지합니다. 수동 확인 후 Ctrl+C로 종료하세요.');
  await new Promise(() => {});
}

chromiumFinalVerification().catch(console.error);