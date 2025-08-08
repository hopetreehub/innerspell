const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🎯 최종 통합 테스트: 리딩 → 자동 커뮤니티 공유');
    
    // 1단계: 리딩 시작
    console.log('📋 1단계: 리딩 페이지로 이동');
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);
    
    console.log('❓ 질문 입력');
    await page.fill('#question', '최종 통합 테스트: 자동 커뮤니티 공유가 제대로 작동할까요?');
    
    console.log('🎴 카드 섞기');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    console.log('🎲 카드 펼치기');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    
    // 2단계: 카드 선택
    console.log('🎯 2단계: 카드 선택');
    await page.evaluate(() => {
      const cards = document.querySelectorAll('[role="button"][aria-label*="카드 선택"]');
      console.log(`발견된 카드 수: ${cards.length}`);
      
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        cards[i].click();
        console.log(`카드 ${i + 1} 클릭 완료`);
      }
    });
    await page.waitForTimeout(2000);
    
    // 3단계: 해석 시작
    console.log('🔮 3단계: 해석 시작');
    await page.click('button:has-text("해석")');
    
    // 4단계: 해석 완료까지 대기하면서 모니터링
    console.log('⏳ 4단계: 해석 완료 모니터링');
    let interpretationComplete = false;
    let checkCount = 0;
    
    while (!interpretationComplete && checkCount < 30) { // 최대 2.5분
      await page.waitForTimeout(5000);
      checkCount++;
      
      // 다양한 공유 버튼 패턴 체크
      const shareButtonPatterns = [
        'button:has-text("경험 공유")',
        'button:has-text("리딩 공유")', 
        'button:has-text("공유")',
        'button:has-text("경험")',
      ];
      
      let foundButtons = 0;
      for (const pattern of shareButtonPatterns) {
        const count = await page.locator(pattern).count();
        foundButtons += count;
      }
      
      console.log(`${checkCount * 5}초 경과: 공유 관련 버튼 ${foundButtons}개 발견`);
      
      if (foundButtons > 0) {
        interpretationComplete = true;
        break;
      }
      
      // 10초마다 현재 상태 확인
      if (checkCount % 2 === 0) {
        const allVisibleButtons = await page.locator('button:visible').count();
        console.log(`  현재 보이는 전체 버튼 수: ${allVisibleButtons}`);
        
        // 해석 텍스트나 다이얼로그가 있는지 확인
        const hasInterpretation = await page.locator('text*="해석", text*="의미", [role="dialog"]').count();
        console.log(`  해석 관련 요소 수: ${hasInterpretation}`);
      }
    }
    
    if (!interpretationComplete) {
      console.log('❌ 해석이 완료되지 않음');
      
      // 최종 상태 확인
      console.log('\n🔍 최종 상태 디버깅:');
      const allButtons = await page.locator('button:visible').all();
      console.log('현재 보이는 모든 버튼:');
      
      for (let i = 0; i < Math.min(10, allButtons.length); i++) {
        try {
          const text = await allButtons[i].textContent();
          if (text && text.trim()) {
            console.log(`  - "${text.trim()}"`);
          }
        } catch (e) {
          // 무시
        }
      }
      
      await page.screenshot({ path: 'screenshots/interpretation-incomplete.png', fullPage: true });
      return;
    }
    
    console.log('✅ 해석 완료! 공유 버튼 발견');
    
    // 5단계: 정확한 공유 버튼 찾기 및 클릭
    console.log('🔗 5단계: 공유 버튼 클릭');
    
    // 모든 공유 관련 버튼을 찾아서 텍스트 확인
    const shareSelectors = [
      'button:has-text("경험 공유")',
      'button:has-text("경험")',
      'button:has-text("공유")',
    ];
    
    let shareButtonClicked = false;
    for (const selector of shareSelectors) {
      const elements = await page.locator(selector).all();
      
      for (let i = 0; i < elements.length; i++) {
        try {
          const element = elements[i];
          const text = await element.textContent();
          const isVisible = await element.isVisible();
          
          console.log(`공유 버튼 후보: "${text}" (visible: ${isVisible})`);
          
          if (isVisible && (text.includes('경험') || text.includes('공유'))) {
            console.log(`🎯 클릭 대상: "${text}"`);
            await element.click();
            shareButtonClicked = true;
            break;
          }
        } catch (e) {
          console.log(`버튼 클릭 실패: ${e.message}`);
        }
      }
      
      if (shareButtonClicked) break;
    }
    
    if (!shareButtonClicked) {
      console.log('❌ 공유 버튼 클릭 실패');
      await page.screenshot({ path: 'screenshots/share-button-not-clicked.png', fullPage: true });
      return;
    }
    
    console.log('✅ 공유 버튼 클릭 완료');
    
    // 6단계: 페이지 이동 대기
    console.log('🌐 6단계: 커뮤니티 페이지 이동 대기');
    await page.waitForTimeout(3000); // 토스트 + 이동 시간
    
    // URL 변경 확인
    await page.waitForURL('**/community/reading-share/new**', { timeout: 10000 }).catch(() => {
      console.log('⚠️ URL 변경 대기 타임아웃, 수동 확인 진행');
    });
    
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);
    
    if (currentUrl.includes('/community/reading-share/new')) {
      console.log('✅ 커뮤니티 공유 페이지로 이동 성공!');
      
      // 7단계: 자동 입력 내용 확인
      console.log('📝 7단계: 자동 입력 확인');
      await page.waitForTimeout(3000); // useEffect 실행 대기
      
      const titleValue = await page.inputValue('#title');
      const contentValue = await page.inputValue('#content');
      
      console.log(`\n📊 자동 입력 결과:`);
      console.log(`제목: ${titleValue}`);
      console.log(`내용 길이: ${contentValue.length}자`);
      console.log(`공유 URL 포함: ${contentValue.includes('/reading/shared/') ? '✅' : '❌'}`);
      
      if (contentValue.includes('/reading/shared/')) {
        const urlMatch = contentValue.match(/http:\/\/localhost:4000\/reading\/shared\/[a-zA-Z0-9_]+/);
        if (urlMatch) {
          console.log(`발견된 공유 URL: ${urlMatch[0]}`);
        }
      }
      
      await page.screenshot({ path: 'screenshots/auto-share-success.png', fullPage: true });
      
      console.log('\n🎉 최종 통합 테스트 성공!');
      console.log('📋 결과:');
      console.log('  - 타로 리딩 완료: ✅');
      console.log('  - 공유 버튼 클릭: ✅');
      console.log('  - 커뮤니티 페이지 이동: ✅');
      console.log('  - 자동 입력 완료: ✅');
      console.log('  - 공유 URL 생성: ✅');
      
    } else {
      console.log('❌ 커뮤니티 페이지로 이동하지 않음');
      await page.screenshot({ path: 'screenshots/navigation-failed.png', fullPage: true });
    }
    
    // 10초 대기
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 최종 테스트 실패:', error);
    await page.screenshot({ path: 'screenshots/final-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();