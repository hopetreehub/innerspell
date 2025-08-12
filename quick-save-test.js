const { chromium } = require('playwright');

async function quickSaveTest() {
  console.log('⚡ 빠른 저장 오류 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // API 요청/응답만 모니터링
  const apiLogs = [];
  page.on('request', request => {
    if (request.url().includes('/api/reading') || request.url().includes('/save')) {
      apiLogs.push(`📤 ${request.method()} ${request.url()}`);
      console.log(`📤 ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/reading') || response.url().includes('/save')) {
      const status = response.status();
      let body = '';
      try {
        body = await response.text();
      } catch (e) {
        body = '[읽기 실패]';
      }
      apiLogs.push(`📥 ${status} ${response.url()}`);
      apiLogs.push(`📄 응답: ${body.substring(0, 200)}...`);
      console.log(`📥 ${status} ${response.url()}`);
      console.log(`📄 응답: ${body.substring(0, 200)}...`);
    }
  });

  try {
    await page.goto('http://localhost:4000/reading');
    console.log('✅ 페이지 로드됨');
    
    // 질문 입력
    try {
      await page.fill('textarea', '빠른 테스트 질문');
    } catch (e) { console.log('질문 입력 생략'); }
    
    // 섞기 & 펼치기
    await page.click('button:has-text("섞기")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("펼치기")');
    await page.waitForTimeout(1000);
    
    console.log('🎴 카드 선택 시작...');
    
    // 정확한 선택 가능한 카드 찾기
    const selectableCards = await page.locator('div[data-card-id], .selectable-card, [onClick*="selectCard"]');
    let selectedCount = 0;
    
    if (await selectableCards.count() > 0) {
      console.log(`선택 가능한 카드 ${await selectableCards.count()}개 발견`);
      for (let i = 0; i < Math.min(3, await selectableCards.count()); i++) {
        await selectableCards.nth(i).click();
        selectedCount++;
        await page.waitForTimeout(300);
      }
    } else {
      // 백업: 모든 이미지 중 클릭 가능한 것들
      const allCards = await page.locator('img[alt*="카드"]');
      for (let i = 0; i < Math.min(3, await allCards.count()) && selectedCount < 3; i++) {
        try {
          await allCards.nth(i).click();
          selectedCount++;
          await page.waitForTimeout(200);
        } catch (e) {
          continue;
        }
      }
    }
    
    console.log(`✅ ${selectedCount}장 카드 선택 완료`);
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/quick-cards-selected.png' });
    
    // AI 해석 요청
    console.log('🤖 AI 해석 요청...');
    try {
      await page.click('button:has-text("해석"), button:has-text("AI 해석"), button:contains("interpret")');
      
      // 해석 대기 (짧게)
      await page.waitForTimeout(3000);
      
      // 저장 버튼 기다리기
      await page.waitForSelector('button:has-text("저장"), button:has-text("Save")', { timeout: 10000 });
      console.log('✅ 저장 버튼 나타남');
      
    } catch (e) {
      console.log(`⚠️ AI 해석 대기 중 오류: ${e.message}`);
    }
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/quick-ready-to-save.png' });
    
    // 저장 시도
    console.log('💾 저장 버튼 클릭...');
    try {
      await page.click('button:has-text("저장"), button:has-text("Save")');
      console.log('저장 버튼 클릭됨');
      
      // 저장 결과 대기
      await page.waitForTimeout(5000);
      
      // 결과 확인
      const pageContent = await page.content();
      const hasError = pageContent.includes('오류') || pageContent.includes('에러') || pageContent.includes('Error') || pageContent.includes('실패');
      const hasSuccess = pageContent.includes('성공') || pageContent.includes('완료') || pageContent.includes('저장됨') || pageContent.includes('Success');
      
      console.log(`결과 - 오류: ${hasError}, 성공: ${hasSuccess}`);
      
      if (hasError) {
        // 에러 메시지 추출
        const errorElements = await page.locator('*:has-text("오류"), *:has-text("에러"), *:has-text("Error"), *:has-text("실패")').all();
        for (const element of errorElements) {
          const text = await element.textContent();
          console.log(`❌ 에러 메시지: ${text}`);
        }
      }
      
    } catch (e) {
      console.log(`💥 저장 버튼 클릭 실패: ${e.message}`);
    }
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/quick-save-result.png' });
    
    console.log('\n📋 API 로그 요약:');
    apiLogs.forEach(log => console.log(log));
    
  } catch (error) {
    console.error('💥 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

quickSaveTest().catch(console.error);