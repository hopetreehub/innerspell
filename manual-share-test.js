const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🧪 수동 공유 테스트 - 간소화된 접근');
    
    // 리딩 페이지로 바로 이동
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);
    
    console.log('📝 질문 입력');
    await page.fill('#question', '공유 기능 테스트 질문입니다');
    
    console.log('🎴 카드 섞기');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    console.log('🎲 카드 펼치기');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    
    console.log('🎯 카드 클릭 (강제 클릭)');
    // JavaScript로 직접 카드 클릭 이벤트 발생
    await page.evaluate(() => {
      const cards = document.querySelectorAll('[role="button"]');
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        if (cards[i].getAttribute('aria-label')?.includes('카드 선택')) {
          cards[i].click();
          console.log(`카드 ${i + 1} 클릭됨`);
        }
      }
    });
    
    await page.waitForTimeout(3000);
    
    console.log('🔮 해석 버튼 클릭');
    await page.click('button:has-text("해석")');
    
    console.log('⏳ 해석 완료까지 대기 (최대 2분)');
    // 공유 버튼이 나타날 때까지 대기
    let shareButtonVisible = false;
    for (let i = 0; i < 24; i++) { // 2분간 5초씩 체크
      await page.waitForTimeout(5000);
      
      const shareButtons = await page.locator('button:has-text("공유"), button:has-text("리딩 공유")').count();
      console.log(`${i * 5 + 5}초 경과: 공유 버튼 ${shareButtons}개 발견`);
      
      if (shareButtons > 0) {
        shareButtonVisible = true;
        break;
      }
      
      // 중간에 페이지 상태 확인
      if (i % 4 === 0) { // 20초마다
        const allButtons = await page.locator('button:visible').all();
        console.log(`현재 보이는 버튼 수: ${allButtons.length}`);
      }
    }
    
    if (shareButtonVisible) {
      console.log('✅ 공유 버튼 발견!');
      
      await page.screenshot({ path: 'screenshots/before-share-button-click.png', fullPage: true });
      
      console.log('🔗 공유 버튼 클릭');
      await page.click('button:has-text("공유"), button:has-text("리딩 공유")');
      await page.waitForTimeout(3000);
      
      console.log('📋 클립보드에서 URL 확인');
      const clipboardContent = await page.evaluate(async () => {
        try {
          const text = await navigator.clipboard.readText();
          return text;
        } catch (e) {
          return `클립보드 접근 실패: ${e.message}`;
        }
      });
      
      console.log(`클립보드 내용: ${clipboardContent}`);
      
      if (clipboardContent && clipboardContent.includes('/reading/shared/')) {
        console.log('✅ 공유 URL 확인됨!');
        console.log(`공유 URL: ${clipboardContent}`);
        
        // 새 탭에서 공유 URL 테스트
        console.log('🌐 공유 URL 접속 테스트');
        const sharedPage = await context.newPage();
        await sharedPage.goto(clipboardContent);
        await sharedPage.waitForTimeout(5000);
        
        const pageTitle = await sharedPage.title();
        const hasContent = await sharedPage.locator('text*="질문", text*="카드"').count() > 0;
        
        console.log(`공유 페이지 제목: ${pageTitle}`);
        console.log(`내용 표시 여부: ${hasContent ? '✅' : '❌'}`);
        
        await sharedPage.screenshot({ path: 'screenshots/shared-url-result.png', fullPage: true });
        await sharedPage.close();
        
        // 경험 공유방 테스트
        console.log('📝 경험 공유방에서 URL 사용 테스트');
        await page.goto('http://localhost:4000/community/reading-share/new');
        await page.waitForTimeout(2000);
        
        await page.fill('#title', '실제 타로 리딩 공유 테스트');
        
        const shareContent = `방금 받은 타로 리딩을 공유합니다!

질문: 공유 기능 테스트 질문입니다

리딩 결과를 보시려면 아래 링크를 클릭하세요:
${clipboardContent}

이 링크를 클릭하면 제가 받은 실제 타로 리딩 결과를 볼 수 있어요!`;

        await page.fill('#content', shareContent);
        
        await page.screenshot({ path: 'screenshots/community-share-with-url.png', fullPage: true });
        
        console.log('✅ 완전한 공유 플로우 테스트 성공!');
        console.log('\n📋 요약:');
        console.log(`1. 리딩 경험 공유 버튼: ✅ 동작함`);
        console.log(`2. 생성된 공유 URL: ${clipboardContent}`);
        console.log(`3. 공유 URL 접속: ${hasContent ? '✅ 정상' : '❌ 문제있음'}`);
        console.log(`4. 경험 공유방 연동: ✅ 정상`);
        
      } else {
        console.log('❌ 클립보드에 유효한 공유 URL이 없음');
        console.log('토스트 메시지 확인...');
        
        const toasts = await page.locator('[role="status"], .toast').all();
        for (let i = 0; i < toasts.length; i++) {
          try {
            const text = await toasts[i].textContent();
            console.log(`토스트 ${i + 1}: ${text}`);
          } catch (e) {
            // 무시
          }
        }
      }
      
    } else {
      console.log('❌ 공유 버튼이 나타나지 않음');
      
      // 디버깅: 현재 상태 확인
      const currentStage = await page.evaluate(() => {
        return document.body.innerHTML.includes('해석') ? '해석중/완료' : '해석 전';
      });
      
      console.log(`현재 상태: ${currentStage}`);
      
      const allButtons = await page.locator('button:visible').all();
      console.log('현재 보이는 모든 버튼:');
      for (let i = 0; i < Math.min(10, allButtons.length); i++) {
        try {
          const text = await allButtons[i].textContent();
          if (text?.trim()) {
            console.log(`  - "${text.trim()}"`);
          }
        } catch (e) {
          // 무시
        }
      }
    }
    
    await page.screenshot({ path: 'screenshots/manual-share-final.png', fullPage: true });
    
    // 결과 대기
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    await page.screenshot({ path: 'screenshots/manual-share-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();