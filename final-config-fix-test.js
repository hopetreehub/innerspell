const { chromium } = require('playwright');

async function finalConfigFixTest() {
  console.log('🎯 최종 Config 수정 검증 테스트');
  console.log('================================\n');
  
  // Vercel 배포 대기 (2분)
  console.log('⏳ Vercel 배포 대기중... (2분)');
  await new Promise(resolve => setTimeout(resolve, 120000));
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let configErrorDetected = false;
  let aiInterpretationSuccess = false;
  
  // Console 모니터링
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('config is not defined')) {
      configErrorDetected = true;
      console.log('❌ CONFIG ERROR STILL PRESENT:', text);
    } else if (text.includes('[TAROT]') && text.includes('interpretation generated successfully')) {
      aiInterpretationSuccess = true;
      console.log('✅ AI INTERPRETATION SUCCESS:', text);
    } else if (text.includes('[TAROT]')) {
      console.log('🔍 [TAROT]:', text);
    } else if (msg.type() === 'error') {
      console.log('❌ Console Error:', text);
    }
  });
  
  try {
    // 타로 페이지 로드
    console.log('1️⃣ 타로 페이지 로드');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 질문 입력
    console.log('2️⃣ 질문 입력');
    const questionInput = await page.locator('input[type="text"], textarea').first();
    await questionInput.fill('지금 수정한 config 오류가 해결되었는지 확인해주세요');
    
    // 스프레드 선택 (원 카드)
    console.log('3️⃣ 원 카드 스프레드 선택');
    const tabs = await page.locator('[role="tablist"] button').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && text.includes('원 카드')) {
        await tab.click();
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    
    // 카드 섞기
    console.log('4️⃣ 카드 섞기');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(4000);
    }
    
    // 카드 펼치기
    console.log('5️⃣ 카드 펼치기');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 카드 선택
    console.log('6️⃣ 카드 선택');
    const cards = await page.locator('img[alt*="카드"]').all();
    if (cards.length > 0) {
      await cards[0].click();
      await page.waitForTimeout(2000);
    }
    
    // AI 해석 요청 - 핵심 테스트
    console.log('7️⃣ AI 해석 요청 (핵심 테스트)');
    console.log('=====================================');
    
    const interpretButton = await page.locator('button:has-text("해석 보기")').first();
    if (await interpretButton.isVisible()) {
      console.log('🔄 해석 버튼 클릭...');
      await interpretButton.click();
      
      // 60초 대기하며 결과 확인
      console.log('⏳ AI 응답 대기중... (최대 60초)');
      
      const startTime = Date.now();
      while (Date.now() - startTime < 60000) {
        // 성공 확인
        const interpretation = await page.locator('.prose').first();
        if (await interpretation.isVisible()) {
          const interpretationText = await interpretation.textContent();
          if (interpretationText && interpretationText.trim().length > 100) {
            aiInterpretationSuccess = true;
            console.log('✅ AI 해석 성공! 텍스트 길이:', interpretationText.length);
            break;
          }
        }
        
        // 에러 확인
        const errorElements = await page.locator('text=/error|오류|실패/i').all();
        for (const elem of errorElements) {
          const text = await elem.textContent();
          if (text.includes('config')) {
            configErrorDetected = true;
            console.log('❌ UI에서 Config 에러 발견:', text);
            break;
          }
        }
        
        if (configErrorDetected) break;
        
        await page.waitForTimeout(1000);
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'verification-screenshots/final-config-fix-test.png', 
      fullPage: true 
    });
    
    // 결과 출력
    console.log('\n📊 최종 테스트 결과:');
    console.log('===================');
    console.log(`Config Error 발생: ${configErrorDetected ? '❌ YES (수정 실패)' : '✅ NO (수정 성공)'}`);
    console.log(`AI 해석 성공: ${aiInterpretationSuccess ? '✅ YES' : '❌ NO'}`);
    
    if (!configErrorDetected && aiInterpretationSuccess) {
      console.log('\n🎉 최종 결론: CONFIG 오류 완전 해결!');
      console.log('✅ AI 타로 해석이 정상적으로 작동합니다.');
    } else if (!configErrorDetected && !aiInterpretationSuccess) {
      console.log('\n⚠️  Config 오류는 해결되었으나 다른 문제가 있을 수 있습니다.');
    } else {
      console.log('\n❌ Config 오류가 여전히 발생하고 있습니다. 추가 수정이 필요합니다.');
    }
    
  } catch (error) {
    console.error('\n💥 테스트 중 오류:', error);
    await page.screenshot({ 
      path: 'verification-screenshots/final-test-error.png', 
      fullPage: true 
    });
  }
  
  console.log('\n🔍 브라우저 유지 중. 수동 확인 후 Ctrl+C로 종료하세요.');
  await new Promise(() => {}); // Keep browser open
}

finalConfigFixTest().catch(console.error);