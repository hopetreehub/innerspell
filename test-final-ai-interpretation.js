const { chromium } = require('@playwright/test');

(async () => {
  const url = 'https://test-studio-firebase.vercel.app';
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🎯 최종 AI 해석 기능 완전 테스트 (질문 포함)');
    
    await page.goto(url);
    await page.waitForTimeout(3000);
    
    // 1. 타로 리딩 페이지로 이동
    console.log('\n1️⃣ 타로 리딩 페이지로 이동...');
    const readingLink = page.locator('a[href="/reading"]').first();
    await readingLink.click();
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력 (중요!)
    console.log('\n2️⃣ 질문 입력...');
    const questionTextarea = page.locator('textarea');
    await questionTextarea.fill('내가 앞으로 어떤 방향으로 나아가야 할까요?');
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: `screenshots/final-ai-01-question-entered-${Date.now()}.png`,
      fullPage: true
    });
    console.log('✅ 질문 입력 완료');
    
    // 3. 카드 섞기
    console.log('\n3️⃣ 카드 섞기...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(3000);
    
    // 4. 카드 펼치기
    console.log('\n4️⃣ 카드 펼치기...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(5000);
    
    // 5. 3장 카드 선택
    console.log('\n5️⃣ 3장 카드 선택...');
    for (let i = 0; i < 3; i++) {
      const card = page.locator('div[role="button"]').nth(i);
      await card.click({ force: true });
      await page.waitForTimeout(1000);
      
      const cardCount = await page.locator('text=선택된 카드').textContent().catch(() => 'none');
      console.log(`${i + 1}번째 카드 선택 후: ${cardCount}`);
    }
    
    await page.screenshot({
      path: `screenshots/final-ai-02-cards-selected-${Date.now()}.png`,
      fullPage: true
    });
    
    // 6. AI 해석 버튼 확인 및 클릭
    console.log('\n6️⃣ AI 해석 버튼 클릭...');
    const aiButton = page.locator('button:has-text("AI 해석 받기")');
    const aiButtonVisible = await aiButton.isVisible().catch(() => false);
    console.log(`AI 해석 버튼 표시: ${aiButtonVisible}`);
    
    if (!aiButtonVisible) {
      console.log('❌ AI 해석 버튼이 표시되지 않습니다.');
      return;
    }
    
    await aiButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: `screenshots/final-ai-03-button-clicked-${Date.now()}.png`,
      fullPage: true
    });
    
    // 7. AI 해석 다이얼로그 대기
    console.log('\n7️⃣ AI 해석 다이얼로그 대기...');
    
    // 다이얼로그가 열리기를 기다림
    const dialogVisible = await page.waitForSelector('[role="dialog"]', { 
      timeout: 10000,
      state: 'visible'
    }).then(() => true).catch(() => false);
    
    console.log(`AI 해석 다이얼로그 표시: ${dialogVisible}`);
    
    if (dialogVisible) {
      await page.screenshot({
        path: `screenshots/final-ai-04-dialog-opened-${Date.now()}.png`,
        fullPage: true
      });
      
      // 8. 로딩 상태 관찰
      console.log('\n8️⃣ AI 해석 생성 과정 관찰...');
      
      const loadingElement = page.locator('text=AI가 지혜를 엮고 있습니다');
      const loadingVisible = await loadingElement.isVisible().catch(() => false);
      
      if (loadingVisible) {
        console.log('✅ 로딩 상태 확인됨');
        await page.screenshot({
          path: `screenshots/final-ai-05-loading-${Date.now()}.png`,
          fullPage: true
        });
      }
      
      // 9. AI 해석 결과 대기 (최대 60초)
      console.log('\n9️⃣ AI 해석 결과 대기 (최대 60초)...');
      const maxWaitTime = 60000;
      const startTime = Date.now();
      
      let interpretationFound = false;
      let errorFound = false;
      let resultText = '';
      
      while (Date.now() - startTime < maxWaitTime) {
        try {
          // 에러 메시지 확인
          const errorSelectors = [
            'text=NOT_FOUND',
            'text=Model',
            'text=not found',
            'text=오류',
            'text=에러',
            'text=Error'
          ];
          
          for (const selector of errorSelectors) {
            const errorElement = page.locator(selector);
            if (await errorElement.isVisible().catch(() => false)) {
              errorFound = true;
              resultText = await errorElement.textContent();
              console.log(`❌ 에러 발견: ${resultText}`);
              break;
            }
          }
          
          if (errorFound) break;
          
          // 성공적인 해석 결과 확인 (다이얼로그 내부)
          const interpretationElement = page.locator('[role="dialog"] .prose, [role="dialog"] [class*="prose"]');
          if (await interpretationElement.count() > 0) {
            const text = await interpretationElement.first().textContent();
            if (text && text.trim().length > 50) {
              interpretationFound = true;
              resultText = text.trim();
              console.log(`✅ AI 해석 결과 발견 (${text.length}자)`);
              console.log(`미리보기: ${text.substring(0, 200)}...`);
              break;
            }
          }
          
          await page.waitForTimeout(2000);
          
        } catch (e) {
          await page.waitForTimeout(2000);
        }
      }
      
      // 10. 최종 결과 스크린샷
      await page.screenshot({
        path: `screenshots/final-ai-06-final-result-${Date.now()}.png`,
        fullPage: true
      });
      
      // 11. 저장 버튼 확인
      console.log('\n🔟 저장 버튼 확인...');
      const saveButton = page.locator('[role="dialog"] button:has-text("이 리딩 저장하기")');
      const saveButtonVisible = await saveButton.isVisible().catch(() => false);
      console.log(`저장 버튼 표시: ${saveButtonVisible}`);
      
      if (saveButtonVisible) {
        await page.screenshot({
          path: `screenshots/final-ai-07-save-button-${Date.now()}.png`,
          fullPage: true
        });
      }
      
      // 12. 최종 보고
      console.log('\n📊 AI 해석 기능 최종 테스트 결과:');
      console.log('='.repeat(60));
      console.log(`✅ 질문 입력: 완료`);
      console.log(`✅ 3개 카드 선택: 완료`);
      console.log(`✅ AI 해석 버튼 표시: 성공`);
      console.log(`✅ AI 해석 다이얼로그 열림: 성공`);
      
      if (errorFound) {
        console.log(`❌ AI 해석 생성: 실패`);
        console.log(`   에러 내용: ${resultText}`);
        console.log(`   🔴 이전 "NOT_FOUND: Model 'openai/gpt-3.5-turbo' not found" 오류가 여전히 존재합니다.`);
      } else if (interpretationFound) {
        console.log(`✅ AI 해석 생성: 성공`);
        console.log(`   해석 길이: ${resultText.length}자`);
        console.log(`   🟢 이전 오류가 해결되었습니다!`);
      } else {
        console.log(`⚠️ AI 해석 생성: 시간 초과`);
        console.log(`   60초 내에 결과를 받지 못했습니다.`);
      }
      
      console.log(`${saveButtonVisible ? '✅' : '❌'} 저장 버튼 표시: ${saveButtonVisible ? '성공' : '실패'}`);
      console.log('='.repeat(60));
      
      // 종합 결과
      const overallSuccess = !errorFound && interpretationFound && saveButtonVisible;
      if (overallSuccess) {
        console.log('🎉 전체 AI 해석 기능이 정상적으로 작동합니다!');
      } else {
        console.log('⚠️ 일부 기능에 문제가 있습니다.');
      }
      
    } else {
      console.log('❌ AI 해석 다이얼로그가 열리지 않았습니다.');
      console.log('   질문이 입력되었고 3장의 카드가 선택되었음에도 불구하고 다이얼로그가 나타나지 않았습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({
      path: `screenshots/final-ai-error-${Date.now()}.png`,
      fullPage: true
    });
  } finally {
    console.log('\n🏁 테스트 완료. 5초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();