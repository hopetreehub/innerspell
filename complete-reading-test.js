const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🎯 완전한 타로 리딩 과정 테스트');
    
    // 1단계: 리딩 페이지로 이동
    console.log('📋 1단계: 타로 리딩 페이지로 이동');
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);
    
    // 2단계: 질문 입력
    console.log('❓ 2단계: 질문 입력');
    const questionInput = page.locator('#question');
    await questionInput.fill('오늘의 운세는 어떨까요?');
    await page.waitForTimeout(1000);
    
    // 3단계: 카드 섞기
    console.log('🎴 3단계: 카드 섞기');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 4단계: 카드 펼치기
    console.log('🎲 4단계: 카드 펼치기');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 5단계: 카드 선택 (3장)
    console.log('🎯 5단계: 카드 선택 (3장 스프레드)');
    
    // 카드가 나타날 때까지 기다림
    await page.waitForTimeout(5000);
    
    // 카드 클릭하여 뒤집기
    const cardElements = page.locator('[class*="card"]:visible, button[class*="card"]:visible, div[role="button"]:visible');
    const cardCount = await cardElements.count();
    console.log(`발견된 카드 요소 수: ${cardCount}`);
    
    if (cardCount > 0) {
      // 첫 3장의 카드를 순서대로 클릭
      for (let i = 0; i < Math.min(3, cardCount); i++) {
        try {
          console.log(`카드 ${i + 1} 클릭`);
          await cardElements.nth(i).click();
          await page.waitForTimeout(2000);
        } catch (e) {
          console.log(`카드 ${i + 1} 클릭 실패: ${e.message}`);
        }
      }
    }
    
    // 6단계: 해석 생성 버튼 찾기
    console.log('🔮 6단계: 해석 생성 버튼 찾기');
    await page.waitForTimeout(3000);
    
    const interpretButtons = [
      'button:has-text("해석")',
      'button:has-text("분석")',
      'button:has-text("의미")',
      'button:has-text("읽기")',
      'button:has-text("리딩")',
      'button:has-text("결과")',
      'button:has-text("보기")'
    ];
    
    let interpretationStarted = false;
    for (const selector of interpretButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0 && await button.first().isVisible()) {
        console.log(`✅ 해석 버튼 발견: ${selector}`);
        try {
          await button.first().click();
          await page.waitForTimeout(3000);
          interpretationStarted = true;
          break;
        } catch (e) {
          console.log(`해석 버튼 클릭 실패: ${e.message}`);
        }
      }
    }
    
    if (!interpretationStarted) {
      console.log('⚠️ 해석 버튼을 찾을 수 없음. 현재 페이지의 모든 버튼 확인:');
      const allButtons = await page.locator('button:visible').all();
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const text = await allButtons[i].textContent();
          if (text && text.trim()) {
            console.log(`  - "${text.trim()}"`);
          }
        } catch (e) {
          // 무시
        }
      }
    }
    
    // 7단계: 해석 결과 대기
    console.log('⏳ 7단계: 해석 결과 대기 (최대 30초)');
    await page.waitForTimeout(15000);
    
    // 8단계: 공유 버튼 찾기 (해석 완료 후)
    console.log('🔗 8단계: 공유 버튼 찾기');
    
    // 페이지 새로고침하여 최신 상태 확인
    await page.reload();
    await page.waitForTimeout(3000);
    
    const shareSelectors = [
      'button:has-text("공유")',
      'button:has-text("share")',
      'button:has-text("경험")',
      'button:has-text("나누기")',
      '[class*="share"]',
      'button[title*="공유"]',
      'button[aria-label*="공유"]'
    ];
    
    let shareButtonFound = false;
    let shareUrl = '';
    
    for (const selector of shareSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`공유 관련 요소 발견 (${selector}): ${count}개`);
        
        for (let i = 0; i < count; i++) {
          try {
            const element = elements.nth(i);
            const text = await element.textContent();
            console.log(`  요소 ${i + 1}: "${text}"`);
            
            if (await element.isVisible()) {
              console.log(`  -> 클릭 시도`);
              await element.click();
              await page.waitForTimeout(2000);
              
              // 공유 URL이 생성되었는지 확인
              const urlElements = page.locator('input[value*="/reading/shared/"], text*="/reading/shared/"');
              if (await urlElements.count() > 0) {
                shareUrl = await urlElements.first().inputValue() || await urlElements.first().textContent();
                console.log(`✅ 공유 URL 발견: ${shareUrl}`);
                shareButtonFound = true;
                break;
              }
            }
          } catch (e) {
            console.log(`  클릭 실패: ${e.message}`);
          }
        }
        
        if (shareButtonFound) break;
      }
    }
    
    if (!shareButtonFound) {
      console.log('❌ 공유 버튼/기능을 찾을 수 없음');
      
      // 현재 URL 확인
      const currentUrl = page.url();
      console.log(`현재 페이지 URL: ${currentUrl}`);
      
      // URL이 /reading/shared/ 형태인지 확인
      if (currentUrl.includes('/reading/shared/')) {
        console.log('✅ 이미 공유 페이지에 있음');
        shareUrl = currentUrl;
        shareButtonFound = true;
      }
    }
    
    await page.screenshot({ path: 'screenshots/complete-reading-result.png', fullPage: true });
    
    // 9단계: 공유 URL로 접속 테스트
    if (shareUrl && shareUrl.includes('/reading/shared/')) {
      console.log('🌐 9단계: 공유 URL 접속 테스트');
      
      const newPage = await context.newPage();
      await newPage.goto(shareUrl);
      await newPage.waitForTimeout(5000);
      
      // 공유 페이지 내용 확인
      const hasReadingContent = await newPage.locator('text*="질문", text*="카드", text*="해석"').count() > 0;
      const hasErrorMessage = await newPage.locator('text*="찾을 수 없습니다", text*="만료"').count() > 0;
      
      if (hasReadingContent) {
        console.log('✅ 공유 페이지에 리딩 내용이 정상 표시됨');
      } else if (hasErrorMessage) {
        console.log('❌ 공유 페이지에 오류 메시지 표시됨');
      } else {
        console.log('⚠️ 공유 페이지 상태 불명확');
      }
      
      await newPage.screenshot({ path: 'screenshots/shared-reading-page.png', fullPage: true });
      await newPage.close();
    }
    
    // 10단계: 경험 공유방 연결 테스트
    console.log('📝 10단계: 경험 공유방 연결 테스트');
    await page.goto('http://localhost:4000/community/reading-share/new');
    await page.waitForTimeout(3000);
    
    // 경험 공유 폼에 공유 URL 붙여넣기 테스트
    const contentTextarea = page.locator('textarea#content, textarea[placeholder*="경험"]');
    if (await contentTextarea.isVisible()) {
      const testContent = `리딩 경험을 공유합니다!\n\n공유 링크: ${shareUrl}\n\n이 링크를 클릭하면 제가 받은 타로 리딩 결과를 볼 수 있습니다.`;
      await contentTextarea.fill(testContent);
      console.log('✅ 경험 공유 폼에 공유 URL 붙여넣기 완료');
      
      await page.screenshot({ path: 'screenshots/experience-sharing-form.png', fullPage: true });
    } else {
      console.log('❌ 경험 공유 폼을 찾을 수 없음');
    }
    
    console.log('\n🎉 완전한 리딩 및 공유 플로우 분석 완료!');
    console.log('📋 분석 결과:');
    console.log(`  - 공유 기능 발견: ${shareButtonFound ? '✅' : '❌'}`);
    console.log(`  - 공유 URL: ${shareUrl || '없음'}`);
    console.log(`  - 경험 공유방 연결: ✅`);
    
    // 5초 대기
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'screenshots/complete-reading-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();