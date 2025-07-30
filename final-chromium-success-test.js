const { chromium } = require('playwright');

async function finalChromiumSuccessTest() {
  console.log('🏆 최종 크로미움 성공 확인 테스트');
  console.log('=================================\n');
  
  // Vercel 배포 대기
  console.log('⏳ Vercel 배포 대기중... (2분 30초)');
  await new Promise(resolve => setTimeout(resolve, 150000));
  
  console.log('🚀 테스트 시작!\n');
  
  // 먼저 API로 빠르게 확인
  console.log('1️⃣ API 빠른 확인');
  try {
    const response = await fetch('https://test-studio-firebase.vercel.app/api/debug/test-tarot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: '최종 성공 확인',
        cardSpread: 'single-card',
        cardInterpretations: '마법사 카드',
        isGuestUser: false
      })
    });
    
    const result = await response.json();
    const interpretation = result.result?.interpretation || '';
    
    if (interpretation.includes('NOT_FOUND')) {
      console.log('❌ 아직도 GPT 오류 발생:', interpretation);
    } else if (interpretation.length > 100) {
      console.log('✅ API 성공! 해석 생성됨');
      console.log('해석 길이:', interpretation.length);
    }
  } catch (e) {
    console.error('API 테스트 실패:', e);
  }
  
  // 크로미움으로 전체 플로우 테스트
  console.log('\n2️⃣ 크로미움 전체 플로우 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let finalResult = {
    gptError: false,
    aiSuccess: false,
    errorMessage: '',
    successContent: ''
  };
  
  // 콘솔 모니터링
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('NOT_FOUND') && text.includes('gpt')) {
      finalResult.gptError = true;
      finalResult.errorMessage = text;
    }
    if (text.includes('[TAROT]')) {
      console.log('📋', text);
    }
  });
  
  try {
    await page.goto('https://test-studio-firebase.vercel.app/tarot');
    await page.waitForTimeout(3000);
    
    // 타로 리딩 페이지로 이동
    await page.click('a[href="/reading"]');
    await page.waitForTimeout(3000);
    
    // 질문 입력
    await page.fill('textarea', '최종 성공 확인: GPT 모델 오류가 완전히 해결되었나요?');
    
    // 첫 번째 스프레드 선택
    const firstTab = await page.locator('[role="tablist"] button').first();
    await firstTab.click();
    
    // 카드 프로세스
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(4000);
    
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    
    // 카드 선택
    const cards = await page.locator('img[src*="tarot"]').all();
    if (cards.length > 0) {
      await cards[0].click();
      await page.waitForTimeout(2000);
    }
    
    // AI 해석 요청
    console.log('\n🎯 AI 해석 요청 중...');
    
    const interpretBtn = await page.locator('button:has-text("해석"), button:has-text("AI")').first();
    if (await interpretBtn.isVisible()) {
      await interpretBtn.click();
      
      // 결과 대기
      console.log('⏳ 응답 대기중...');
      
      const startTime = Date.now();
      while (Date.now() - startTime < 60000) {
        // Toast 확인
        const toasts = await page.locator('[data-sonner-toast]').all();
        for (const toast of toasts) {
          const text = await toast.textContent();
          if (text && text.includes('NOT_FOUND')) {
            finalResult.gptError = true;
            finalResult.errorMessage = text;
            console.log('🚨 Toast 오류:', text);
            break;
          }
        }
        
        // 성공 확인
        const prose = page.locator('.prose');
        if (await prose.isVisible()) {
          const text = await prose.textContent();
          if (text && text.length > 100) {
            finalResult.aiSuccess = true;
            finalResult.successContent = text.substring(0, 300) + '...';
            console.log('✅ 해석 성공!');
            break;
          }
        }
        
        if (finalResult.gptError || finalResult.aiSuccess) break;
        await page.waitForTimeout(1000);
      }
    }
    
    await page.screenshot({ 
      path: 'verification-screenshots/final-success-test.png', 
      fullPage: true 
    });
    
  } catch (error) {
    console.error('테스트 오류:', error);
  }
  
  // 최종 결과 발표
  console.log('\n');
  console.log('=====================================');
  console.log('🏆 최종 테스트 결과');
  console.log('=====================================');
  
  if (finalResult.gptError) {
    console.log('❌ GPT 오류 여전히 발생');
    console.log('오류:', finalResult.errorMessage);
    console.log('\n😔 아직 문제가 해결되지 않았습니다.');
  } else if (finalResult.aiSuccess) {
    console.log('✅ GPT 오류 해결됨!');
    console.log('✅ AI 해석 정상 작동!');
    console.log('\n🎉🎉🎉 완벽한 성공! 🎉🎉🎉');
    console.log('문제가 완전히 해결되었습니다!');
    console.log('\n생성된 해석:');
    console.log(finalResult.successContent);
  } else {
    console.log('⚠️ 명확한 결과를 얻지 못했습니다.');
    console.log('수동으로 더 확인이 필요합니다.');
  }
  
  console.log('\n브라우저를 유지합니다. Ctrl+C로 종료하세요.');
  await new Promise(() => {});
}

finalChromiumSuccessTest().catch(console.error);