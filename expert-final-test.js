const { chromium } = require('playwright');

async function expertFinalTest() {
  console.log('🎯 전문가 최종 검증 테스트');
  console.log('=========================\n');
  
  // Vercel 배포 대기 (2분)
  console.log('⏳ Vercel 배포 대기중... (2분)');
  await new Promise(resolve => setTimeout(resolve, 120000));
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let actualErrorMessage = '';
  let modelNotFoundError = false;
  let aiSuccess = false;
  
  // 실제 오류 메시지 캡처
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('NOT_FOUND') || text.includes('Model') && text.includes('not found')) {
      modelNotFoundError = true;
      actualErrorMessage = text;
      console.log('🚨 실제 오류 메시지:', text);
    } else if (text.includes('[TAROT]') && text.includes('interpretation generated successfully')) {
      aiSuccess = true;
      console.log('✅ AI 성공:', text);
    } else if (text.includes('[TAROT]')) {
      console.log('📋', text);
    }
  });
  
  try {
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 빠른 테스트
    console.log('📝 질문 입력');
    const questionInput = await page.locator('input[type="text"], textarea').first();
    await questionInput.fill('전문가 수정 후 최종 테스트');
    
    // 원 카드 선택
    const tabs = await page.locator('[role="tablist"] button').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && text.includes('원 카드')) {
        await tab.click();
        break;
      }
    }
    
    // 카드 섞기 → 펼치기 → 선택
    console.log('🃏 카드 준비');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(3000);
    }
    
    const spreadButton = await page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      await page.waitForTimeout(2000);
    }
    
    const cards = await page.locator('img[alt*="카드"]').all();
    if (cards.length > 0) {
      await cards[0].click();
      await page.waitForTimeout(1000);
    }
    
    // 해석 요청
    console.log('🎯 AI 해석 요청');
    const interpretButton = await page.locator('button:has-text("해석 보기")').first();
    if (await interpretButton.isVisible()) {
      await interpretButton.click();
      
      // 60초 대기
      const startTime = Date.now();
      while (Date.now() - startTime < 60000) {
        // Toast 메시지 확인 (실제 오류 메시지가 여기 표시됨)
        const toastElements = await page.locator('[data-sonner-toast]').all();
        for (const toast of toastElements) {
          const toastText = await toast.textContent();
          if (toastText && toastText.includes('NOT_FOUND')) {
            actualErrorMessage = toastText;
            modelNotFoundError = true;
            console.log('🚨 Toast에서 실제 오류 발견:', toastText);
            break;
          }
        }
        
        // 성공 확인
        const interpretation = await page.locator('.prose').first();
        if (await interpretation.isVisible()) {
          const text = await interpretation.textContent();
          if (text && text.trim().length > 50) {
            aiSuccess = true;
            console.log('✅ AI 해석 성공! 길이:', text.length);
            break;
          }
        }
        
        if (modelNotFoundError || aiSuccess) break;
        await page.waitForTimeout(1000);
      }
    }
    
    await page.screenshot({ 
      path: 'verification-screenshots/expert-final-test.png', 
      fullPage: true 
    });
    
    // 최종 결과
    console.log('\n🎯 전문가 최종 진단:');
    console.log('==================');
    console.log(`Model NOT_FOUND 오류: ${modelNotFoundError ? '❌ 여전히 발생' : '✅ 해결됨'}`);
    console.log(`AI 해석 성공: ${aiSuccess ? '✅ 성공' : '❌ 실패'}`);
    
    if (actualErrorMessage) {
      console.log(`실제 오류 메시지: "${actualErrorMessage}"`);
    }
    
    if (modelNotFoundError) {
      console.log('\n🔬 전문가 분석:');
      console.log('Model NOT_FOUND 오류가 여전히 발생하고 있습니다.');
      console.log('추가 디버깅이 필요합니다.');
    } else if (aiSuccess) {
      console.log('\n🎉 전문가 결론: 완전 해결 성공!');
    } else {
      console.log('\n⚠️ Model 오류는 해결되었으나 다른 문제가 있을 수 있습니다.');
    }
    
  } catch (error) {
    console.error('\n💥 테스트 오류:', error);
    await page.screenshot({ 
      path: 'verification-screenshots/expert-final-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 브라우저 유지. Ctrl+C로 종료하세요.');
  await new Promise(() => {});
}

expertFinalTest().catch(console.error);