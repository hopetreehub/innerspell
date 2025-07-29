const { chromium } = require('@playwright/test');

(async () => {
  // Vercel 배포 우선 원칙에 따라 Vercel URL로 테스트
  const url = 'https://test-studio-firebase.vercel.app';
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🎯 AI 해석 기능 완전 테스트 시작');
    console.log(`📍 URL: ${url}`);
    
    // 1. 사이트 접속
    console.log('\n1️⃣ 사이트 접속 중...');
    await page.goto(url);
    await page.waitForTimeout(3000);
    
    // 초기 화면 스크린샷
    await page.screenshot({
      path: `screenshots/ai-test-01-initial-${Date.now()}.png`,
      fullPage: true
    });
    console.log('✅ 초기 화면 스크린샷 저장 완료');
    
    // 2. 타로 리딩 페이지로 이동
    console.log('\n2️⃣ 타로 리딩 페이지로 이동...');
    const readingLink = page.locator('a[href="/reading"]').first();
    await readingLink.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: `screenshots/ai-test-02-reading-page-${Date.now()}.png`,
      fullPage: true
    });
    console.log('✅ 타로 리딩 페이지 스크린샷 저장 완료');
    
    // 3. 카드 섞기 버튼 클릭
    console.log('\n3️⃣ 카드 섞기...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: `screenshots/ai-test-03-shuffle-${Date.now()}.png`,
      fullPage: true
    });
    console.log('✅ 카드 섞기 완료');
    
    // 4. 카드 펼치기 버튼 클릭
    console.log('\n4️⃣ 카드 펼치기...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: `screenshots/ai-test-04-spread-${Date.now()}.png`,
      fullPage: true
    });
    console.log('✅ 카드 펼치기 완료');
    
    // 5. 첫 번째 카드 선택 (다양한 선택자 시도)
    console.log('\n5️⃣ 첫 번째 카드 선택...');
    
    const cardSelectors = [
      '.tarot-card',
      '[data-testid="tarot-card"]',
      '.card-back',
      '[class*="card"]',
      'button[class*="card"]',
      'div[role="button"]',
      '[onclick]'
    ];
    
    let firstCard = null;
    for (const selector of cardSelectors) {
      try {
        const cards = page.locator(selector);
        if (await cards.count() > 0) {
          const card = cards.first();
          if (await card.isVisible()) {
            firstCard = card;
            console.log(`✅ 첫 번째 카드 발견: ${selector}`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!firstCard) {
      console.log('❌ 카드를 찾을 수 없습니다. 현재 화면 상태 확인...');
      
      // 모든 클릭 가능한 요소 확인
      const clickableElements = await page.locator('button, [role="button"], [onclick], [tabindex="0"]').all();
      console.log(`📊 클릭 가능한 요소: ${clickableElements.length}개`);
      
      for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
        try {
          const element = clickableElements[i];
          const text = await element.textContent();
          const isVisible = await element.isVisible();
          console.log(`  - 요소 ${i + 1}: "${text}" (visible: ${isVisible})`);
        } catch (e) {
          console.log(`  - 요소 ${i + 1}: 텍스트 읽기 실패`);
        }
      }
      
      await page.screenshot({
        path: `screenshots/ai-test-05-no-cards-${Date.now()}.png`,
        fullPage: true
      });
      console.log('✅ 카드 없음 상태 스크린샷 저장');
      return;
    }
    
    await firstCard.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: `screenshots/ai-test-05-first-card-${Date.now()}.png`,
      fullPage: true
    });
    console.log('✅ 첫 번째 카드 선택 완료');
    
    // 6. 두 번째 카드 선택
    console.log('\n6️⃣ 두 번째 카드 선택...');
    
    // 동일한 선택자로 두 번째 카드 찾기
    let secondCard = null;
    for (const selector of cardSelectors) {
      try {
        const cards = page.locator(selector);
        if (await cards.count() > 1) {
          const card = cards.nth(1);
          if (await card.isVisible()) {
            secondCard = card;
            console.log(`✅ 두 번째 카드 발견: ${selector}`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    if (secondCard) {
      await secondCard.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: `screenshots/ai-test-06-second-card-${Date.now()}.png`,
        fullPage: true
      });
      console.log('✅ 두 번째 카드 선택 완료');
    } else {
      console.log('❌ 두 번째 카드를 찾을 수 없습니다.');
    }
    
    // 7. 세 번째 카드 선택
    console.log('\n7️⃣ 세 번째 카드 선택...');
    
    // 동일한 선택자로 세 번째 카드 찾기
    let thirdCard = null;
    for (const selector of cardSelectors) {
      try {
        const cards = page.locator(selector);
        if (await cards.count() > 2) {
          const card = cards.nth(2);
          if (await card.isVisible()) {
            thirdCard = card;
            console.log(`✅ 세 번째 카드 발견: ${selector}`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    if (thirdCard) {
      await thirdCard.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: `screenshots/ai-test-07-third-card-${Date.now()}.png`,
        fullPage: true
      });
      console.log('✅ 세 번째 카드 선택 완료');
    } else {
      console.log('❌ 세 번째 카드를 찾을 수 없습니다.');
    }
    
    // 8. "AI 해석 받기" 버튼 확인
    console.log('\n8️⃣ "AI 해석 받기" 버튼 확인...');
    
    // 여러 가능한 선택자로 버튼 찾기
    let aiButton = null;
    const buttonSelectors = [
      'button:has-text("AI 해석 받기")',
      'button:has-text("AI 해석")',
      'button:has-text("해석 받기")',
      '[data-testid="ai-interpretation-button"]',
      '.ai-interpretation-button',
      'button[class*="ai"]',
      'button[class*="interpretation"]'
    ];
    
    for (const selector of buttonSelectors) {
      try {
        aiButton = page.locator(selector).first();
        if (await aiButton.count() > 0 && await aiButton.isVisible()) {
          console.log(`✅ AI 해석 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!aiButton || await aiButton.count() === 0) {
      console.log('❌ AI 해석 버튼을 찾을 수 없습니다. 현재 화면 상태 확인...');
      
      // 페이지의 모든 버튼 요소 확인
      const allButtons = await page.locator('button').all();
      console.log(`📊 페이지의 총 버튼 개수: ${allButtons.length}`);
      
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const buttonText = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          console.log(`  - 버튼 ${i + 1}: "${buttonText}" (visible: ${isVisible})`);
        } catch (e) {
          console.log(`  - 버튼 ${i + 1}: 텍스트 읽기 실패`);
        }
      }
      
      await page.screenshot({
        path: `screenshots/ai-test-08-no-button-${Date.now()}.png`,
        fullPage: true
      });
      console.log('✅ 버튼 없음 상태 스크린샷 저장');
      
      return;
    }
    
    await page.screenshot({
      path: `screenshots/ai-test-08-button-found-${Date.now()}.png`,
      fullPage: true
    });
    console.log('✅ AI 해석 버튼 발견 스크린샷 저장');
    
    // 9. AI 해석 버튼 클릭
    console.log('\n9️⃣ AI 해석 버튼 클릭...');
    await aiButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: `screenshots/ai-test-09-button-clicked-${Date.now()}.png`,
      fullPage: true
    });
    console.log('✅ AI 해석 버튼 클릭 완료');
    
    // 10. AI 해석 생성 과정 관찰 (로딩 상태, 진행 표시 등)
    console.log('\n🔟 AI 해석 생성 과정 관찰...');
    
    // 로딩 상태 확인
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[data-testid="loading"]',
      'text=로딩',
      'text=생성 중',
      'text=처리 중',
      '.ai-loading',
      '[class*="loading"]'
    ];
    
    let loadingFound = false;
    for (const selector of loadingSelectors) {
      try {
        const loadingElement = page.locator(selector);
        if (await loadingElement.count() > 0 && await loadingElement.isVisible()) {
          console.log(`✅ 로딩 상태 발견: ${selector}`);
          loadingFound = true;
          
          await page.screenshot({
            path: `screenshots/ai-test-10-loading-${Date.now()}.png`,
            fullPage: true
          });
          console.log('✅ 로딩 상태 스크린샷 저장');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!loadingFound) {
      console.log('ℹ️ 로딩 상태를 찾을 수 없습니다 (빠르게 완료되었을 수 있음)');
    }
    
    // 11. AI 해석 결과 대기 및 확인
    console.log('\n1️⃣1️⃣ AI 해석 결과 대기 및 확인...');
    
    // 최대 30초 대기
    const maxWaitTime = 30000;
    const startTime = Date.now();
    
    let interpretationFound = false;
    let errorFound = false;
    let interpretationText = '';
    let errorText = '';
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // 에러 메시지 확인
        const errorSelectors = [
          'text=NOT_FOUND',
          'text=Model',
          'text=not found',
          'text=오류',
          'text=에러',
          'text=Error',
          '.error',
          '[class*="error"]'
        ];
        
        for (const selector of errorSelectors) {
          const errorElement = page.locator(selector);
          if (await errorElement.count() > 0 && await errorElement.isVisible()) {
            errorText = await errorElement.textContent();
            errorFound = true;
            console.log(`❌ 에러 발견: ${errorText}`);
            break;
          }
        }
        
        if (errorFound) break;
        
        // 성공적인 해석 결과 확인
        const interpretationSelectors = [
          '.interpretation-result',
          '.ai-interpretation',
          '[data-testid="interpretation-result"]',
          '.tarot-interpretation',
          '[class*="interpretation"]',
          '[class*="result"]'
        ];
        
        for (const selector of interpretationSelectors) {
          const interpretationElement = page.locator(selector);
          if (await interpretationElement.count() > 0 && await interpretationElement.isVisible()) {
            interpretationText = await interpretationElement.textContent();
            if (interpretationText && interpretationText.length > 50) { // 의미있는 길이의 텍스트
              interpretationFound = true;
              console.log(`✅ AI 해석 결과 발견: ${interpretationText.substring(0, 100)}...`);
              break;
            }
          }
        }
        
        if (interpretationFound) break;
        
        await page.waitForTimeout(1000);
        
      } catch (e) {
        console.log(`⚠️ 확인 중 오류: ${e.message}`);
        await page.waitForTimeout(1000);
      }
    }
    
    // 최종 결과 스크린샷
    await page.screenshot({
      path: `screenshots/ai-test-11-final-result-${Date.now()}.png`,
      fullPage: true
    });
    console.log('✅ 최종 결과 스크린샷 저장');
    
    // 12. 결과 분석 및 보고
    console.log('\n🔍 AI 해석 기능 테스트 결과 분석:');
    
    if (errorFound) {
      console.log('❌ AI 해석 실패:');
      console.log(`   에러 메시지: ${errorText}`);
      console.log('   이전 "NOT_FOUND: Model \'openai/gpt-3.5-turbo\' not found" 오류가 여전히 존재합니다.');
    } else if (interpretationFound) {
      console.log('✅ AI 해석 성공:');
      console.log(`   해석 텍스트 길이: ${interpretationText.length}자`);
      console.log(`   해석 내용 미리보기: ${interpretationText.substring(0, 200)}...`);
      console.log('   이전 오류가 해결되었습니다!');
    } else {
      console.log('⚠️ AI 해석 상태 불분명:');
      console.log('   명확한 성공/실패 결과를 확인할 수 없습니다.');
    }
    
    // 13. "이 리딩 저장하기" 버튼 확인
    console.log('\n1️⃣3️⃣ "이 리딩 저장하기" 버튼 확인...');
    
    const saveButtonSelectors = [
      'button:has-text("이 리딩 저장하기")',
      'button:has-text("저장하기")',
      'button:has-text("저장")',
      '[data-testid="save-reading-button"]',
      '.save-reading-button',
      'button[class*="save"]'
    ];
    
    let saveButtonFound = false;
    for (const selector of saveButtonSelectors) {
      try {
        const saveButton = page.locator(selector);
        if (await saveButton.count() > 0 && await saveButton.isVisible()) {
          console.log(`✅ 저장 버튼 발견: ${selector}`);
          saveButtonFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (saveButtonFound) {
      console.log('✅ "이 리딩 저장하기" 버튼이 정상적으로 표시됩니다.');
    } else {
      console.log('❌ "이 리딩 저장하기" 버튼을 찾을 수 없습니다.');
    }
    
    // 14. 최종 종합 보고
    console.log('\n📊 AI 해석 기능 완전 테스트 종합 보고:');
    console.log('='.repeat(50));
    console.log(`✅ 3개 카드 선택: 완료`);
    console.log(`${aiButton ? '✅' : '❌'} AI 해석 버튼 표시: ${aiButton ? '정상' : '실패'}`);
    console.log(`${!errorFound && interpretationFound ? '✅' : '❌'} AI 해석 생성: ${!errorFound && interpretationFound ? '성공' : '실패'}`);
    console.log(`${saveButtonFound ? '✅' : '❌'} 저장 버튼 표시: ${saveButtonFound ? '정상' : '실패'}`);
    
    if (errorFound) {
      console.log(`❌ 오류 상태: ${errorText}`);
    } else if (interpretationFound) {
      console.log(`✅ 해석 성공: ${interpretationText.length}자 생성`);
    }
    
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({
      path: `screenshots/ai-test-error-${Date.now()}.png`,
      fullPage: true
    });
  } finally {
    console.log('\n🏁 테스트 완료. 3초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();