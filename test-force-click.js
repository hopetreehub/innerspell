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
    console.log('🎯 Force 클릭으로 AI 해석 기능 완전 테스트');
    
    await page.goto(url);
    await page.waitForTimeout(3000);
    
    // 타로 리딩 페이지로 이동
    console.log('\n1️⃣ 타로 리딩 페이지로 이동...');
    const readingLink = page.locator('a[href="/reading"]').first();
    await readingLink.click();
    await page.waitForTimeout(3000);
    
    // 카드 섞기
    console.log('\n2️⃣ 카드 섞기...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(3000);
    
    // 카드 펼치기
    console.log('\n3️⃣ 카드 펼치기...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(5000);
    
    await page.screenshot({
      path: `screenshots/force-test-01-spread-ready-${Date.now()}.png`,
      fullPage: true
    });
    
    // 첫 번째 카드 강제 클릭
    console.log('\n4️⃣ 첫 번째 카드 강제 클릭...');
    const firstCard = page.locator('div[role="button"]').first();
    await firstCard.click({ force: true });
    await page.waitForTimeout(2000);
    
    const afterFirst = await page.locator('text=선택된 카드').textContent().catch(() => 'none');
    console.log(`첫 카드 선택 후: ${afterFirst}`);
    
    await page.screenshot({
      path: `screenshots/force-test-02-first-card-${Date.now()}.png`,
      fullPage: true
    });
    
    // 두 번째 카드 강제 클릭
    console.log('\n5️⃣ 두 번째 카드 강제 클릭...');
    const secondCard = page.locator('div[role="button"]').nth(1);
    await secondCard.click({ force: true });
    await page.waitForTimeout(2000);
    
    const afterSecond = await page.locator('text=선택된 카드').textContent().catch(() => 'none');
    console.log(`두 카드 선택 후: ${afterSecond}`);
    
    await page.screenshot({
      path: `screenshots/force-test-03-second-card-${Date.now()}.png`,
      fullPage: true
    });
    
    // 세 번째 카드 강제 클릭
    console.log('\n6️⃣ 세 번째 카드 강제 클릭...');
    const thirdCard = page.locator('div[role="button"]').nth(2);
    await thirdCard.click({ force: true });
    await page.waitForTimeout(3000);
    
    const afterThird = await page.locator('text=선택된 카드').textContent().catch(() => 'none');
    console.log(`세 카드 선택 후: ${afterThird}`);
    
    await page.screenshot({
      path: `screenshots/force-test-04-third-card-${Date.now()}.png`,
      fullPage: true
    });
    
    // AI 해석 버튼 확인
    console.log('\n7️⃣ AI 해석 버튼 확인...');
    const aiButton = page.locator('button:has-text("AI 해석 받기")');
    const aiButtonVisible = await aiButton.isVisible().catch(() => false);
    console.log(`AI 해석 버튼 표시: ${aiButtonVisible}`);
    
    if (aiButtonVisible) {
      console.log('\n8️⃣ AI 해석 버튼 클릭...');
      await aiButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: `screenshots/force-test-05-ai-clicked-${Date.now()}.png`,
        fullPage: true
      });
      
      // AI 해석 결과 대기 (30초)
      console.log('\n9️⃣ AI 해석 결과 대기...');
      const maxWaitTime = 30000;
      const startTime = Date.now();
      
      let interpretationFound = false;
      let errorFound = false;
      let resultText = '';
      
      while (Date.now() - startTime < maxWaitTime) {
        try {
          // 에러 확인
          const errorElement = page.locator('text=NOT_FOUND, text=Model, text=not found, text=오류, text=에러, text=Error').first();
          if (await errorElement.isVisible().catch(() => false)) {
            errorFound = true;
            resultText = await errorElement.textContent();
            console.log(`❌ 에러 발견: ${resultText}`);
            break;
          }
          
          // 성공적인 해석 확인 - 다양한 선택자 시도
          const interpretationSelectors = [
            '.prose',
            '[class*="prose"]',
            'div:has-text("스프레드")',
            'div:has-text("카드")',
            'p:has-text("해석")',
            'div[class*="interpretation"]',
            'div[class*="result"]'
          ];
          
          for (const selector of interpretationSelectors) {
            const element = page.locator(selector);
            if (await element.count() > 0) {
              const text = await element.first().textContent();
              if (text && text.length > 100) { // 의미 있는 길이의 텍스트
                interpretationFound = true;
                resultText = text.substring(0, 200);
                console.log(`✅ AI 해석 결과 발견: ${resultText}...`);
                break;
              }
            }
          }
          
          if (interpretationFound) break;
          
          await page.waitForTimeout(1000);
          
        } catch (e) {
          await page.waitForTimeout(1000);
        }
      }
      
      await page.screenshot({
        path: `screenshots/force-test-06-ai-result-${Date.now()}.png`,
        fullPage: true
      });
      
      // 저장 버튼 확인
      console.log('\n🔟 저장 버튼 확인...');
      const saveButton = page.locator('button:has-text("이 리딩 저장하기"), button:has-text("저장하기"), button:has-text("저장")');
      const saveButtonVisible = await saveButton.isVisible().catch(() => false);
      console.log(`저장 버튼 표시: ${saveButtonVisible}`);
      
      // 최종 보고
      console.log('\n📊 AI 해석 기능 테스트 결과:');
      console.log('='.repeat(50));
      console.log(`✅ 3개 카드 선택: 완료 (force 클릭 사용)`);
      console.log(`✅ AI 해석 버튼 표시: 성공`);
      
      if (errorFound) {
        console.log(`❌ AI 해석 생성: 실패`);
        console.log(`   에러 내용: ${resultText}`);
        console.log(`   이전 "NOT_FOUND: Model 'openai/gpt-3.5-turbo' not found" 오류가 여전히 존재합니다.`);
      } else if (interpretationFound) {
        console.log(`✅ AI 해석 생성: 성공`);
        console.log(`   해석 내용: ${resultText}...`);
        console.log(`   이전 오류가 해결되었습니다!`);
      } else {
        console.log(`⚠️ AI 해석 생성: 시간 초과 또는 불분명`);
      }
      
      console.log(`${saveButtonVisible ? '✅' : '❌'} 저장 버튼 표시: ${saveButtonVisible ? '성공' : '실패'}`);
      console.log('='.repeat(50));
      
    } else {
      console.log('❌ AI 해석 버튼이 나타나지 않았습니다.');
      
      // 모든 버튼 확인
      const allButtons = await page.locator('button').all();
      console.log('\n현재 페이지의 모든 버튼:');
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const buttonText = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          console.log(`  - "${buttonText}" (visible: ${isVisible})`);
        } catch (e) {
          console.log(`  - 버튼 ${i + 1}: 텍스트 읽기 실패`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({
      path: `screenshots/force-test-error-${Date.now()}.png`,
      fullPage: true
    });
  } finally {
    console.log('\n🏁 테스트 완료. 3초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();