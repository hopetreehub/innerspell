const { chromium } = require('playwright');

async function finalCommunityTest() {
  console.log('🎯 최종 "커뮤니티로 저장하기" 기능 테스트');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 모니터링
  page.on('request', request => {
    if (request.url().includes('community') || request.url().includes('share') || request.url().includes('save')) {
      console.log(`📡 [요청] ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('community') || response.url().includes('share') || response.url().includes('save')) {
      console.log(`📡 [응답] ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('1️⃣ 타로 리딩 페이지 접속');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'final-test-01-loaded.png' });
    
    console.log('2️⃣ 질문 입력');
    await page.fill('textarea', '커뮤니티로 저장하기 기능을 테스트합니다.');
    
    console.log('3️⃣ 카드 섞기');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(4000);
    
    console.log('4️⃣ 카드 펼치기');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'final-test-02-cards-spread.png' });
    
    console.log('5️⃣ 카드 3장 선택');
    // 카드 선택을 더 확실하게 하기 위해 스크롤과 클릭 조합
    for (let i = 0; i < 3; i++) {
      await page.evaluate((index) => {
        const cards = document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]');
        if (cards[index]) {
          cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
          cards[index].click();
        }
      }, i);
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'final-test-03-cards-selected.png' });
    
    console.log('6️⃣ AI 해석 버튼 대기 및 클릭');
    // 여러 방법으로 AI 해석 버튼 찾기
    const interpretSelectors = [
      'button:has-text("AI 해석 받기")',
      'button:has-text("AI 해석")',
      'button[aria-label*="AI 해석"]',
      'button:has-text("해석")'
    ];
    
    let interpretButton = null;
    for (const selector of interpretSelectors) {
      try {
        interpretButton = page.locator(selector);
        if (await interpretButton.isVisible({ timeout: 3000 })) {
          console.log(`✅ AI 해석 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 버튼 못찾음: ${selector}`);
      }
    }
    
    if (interpretButton && await interpretButton.isVisible()) {
      await interpretButton.click();
      console.log('AI 해석 요청됨');
      
      // 해석 다이얼로그 대기
      console.log('7️⃣ 해석 다이얼로그 대기');
      await page.waitForSelector('[role="dialog"]', { timeout: 35000 });
      console.log('✅ 해석 다이얼로그 열림');
      
      // 해석이 완료될 때까지 충분히 대기
      console.log('8️⃣ AI 해석 완료 대기 (20초)');
      await page.waitForTimeout(20000);
      
      await page.screenshot({ path: 'final-test-04-interpretation-dialog.png' });
      
      console.log('9️⃣ 경험 공유하기 버튼 찾기');
      
      const dialog = page.locator('[role="dialog"]');
      
      // 다양한 공유 버튼 패턴 시도
      const shareSelectors = [
        'button:has-text("경험 공유하기")',
        'button:has-text("경험 공유")',
        'button:has-text("공유하기")',
        'button:has-text("커뮤니티로")',
        'button:has-text("커뮤니티")',
        'button[class*="outline"]:has-text("경험")',
        'button[variant="outline"]:has-text("경험")'
      ];
      
      let shareButton = null;
      let shareButtonFound = false;
      
      for (const selector of shareSelectors) {
        try {
          // 다이얼로그 내부와 페이지 전체에서 찾기
          const dialogButton = dialog.locator(selector);
          const pageButton = page.locator(selector);
          
          if (await dialogButton.isVisible({ timeout: 1000 })) {
            shareButton = dialogButton;
            shareButtonFound = true;
            console.log(`✅ 다이얼로그에서 공유 버튼 발견: ${selector}`);
            break;
          } else if (await pageButton.isVisible({ timeout: 1000 })) {
            shareButton = pageButton;
            shareButtonFound = true;
            console.log(`✅ 페이지에서 공유 버튼 발견: ${selector}`);
            break;
          }
        } catch (e) {
          // 계속 다음 선택자 시도
        }
      }
      
      if (!shareButtonFound) {
        // 다이얼로그 내 모든 버튼 조사
        console.log('🔍 다이얼로그 내 모든 버튼 조사:');
        const allDialogButtons = await dialog.locator('button').all();
        
        for (let i = 0; i < allDialogButtons.length; i++) {
          const buttonText = await allDialogButtons[i].textContent();
          const isVisible = await allDialogButtons[i].isVisible();
          console.log(`  버튼 ${i + 1}: "${buttonText}" (보임: ${isVisible})`);
          
          // "경험", "공유", "커뮤니티" 키워드가 포함된 버튼 찾기
          if (buttonText && (buttonText.includes('경험') || buttonText.includes('공유') || buttonText.includes('커뮤니티'))) {
            shareButton = allDialogButtons[i];
            shareButtonFound = true;
            console.log(`✅ 키워드 매칭으로 공유 버튼 발견: "${buttonText}"`);
            break;
          }
        }
      }
      
      // 🔟 공유 버튼 클릭 테스트
      if (shareButtonFound && shareButton) {
        console.log('🔟 "경험 공유하기" 버튼 클릭');
        
        // 버튼 하이라이트
        await shareButton.evaluate(el => {
          el.style.border = '3px solid #ff0000';
          el.style.backgroundColor = '#ffff00';
          el.style.color = '#000000';
        });
        
        console.log('📸 공유 버튼 하이라이트 후 스크린샷');
        await page.screenshot({ path: 'final-test-05-share-button-highlighted.png' });
        
        // 클릭 전 URL 기록
        const beforeUrl = page.url();
        console.log(`클릭 전 URL: ${beforeUrl}`);
        
        // 클릭
        await shareButton.click();
        console.log('✅ 경험 공유하기 버튼 클릭됨');
        
        // 클릭 후 변화 대기
        console.log('⏰ 클릭 후 변화 대기 (10초)');
        await page.waitForTimeout(10000);
        
        // URL 변화 확인
        const afterUrl = page.url();
        console.log(`클릭 후 URL: ${afterUrl}`);
        
        if (beforeUrl !== afterUrl) {
          console.log('✅ URL이 변경되었습니다!');
          if (afterUrl.includes('/community')) {
            console.log('🎉 커뮤니티 페이지로 리다이렉트됨!');
          } else {
            console.log(`🔄 다른 페이지로 이동: ${afterUrl}`);
          }
        } else {
          console.log('⚠️ URL 변화가 없습니다.');
        }
        
        // 토스트 메시지 확인
        console.log('📢 토스트 메시지 확인');
        const toastSelectors = [
          '[role="alert"]',
          '.toast',
          '[data-sonner-toaster]',
          '[data-testid="toast"]'
        ];
        
        for (const toastSelector of toastSelectors) {
          const toasts = await page.locator(toastSelector).all();
          if (toasts.length > 0) {
            console.log(`토스트 메시지들 (${toastSelector}):`);
            for (const toast of toasts) {
              const text = await toast.textContent();
              console.log(`  📢 ${text}`);
            }
          }
        }
        
        await page.screenshot({ path: 'final-test-06-after-share-click.png' });
        
        // 결과 메시지 확인
        const resultMessage = await page.locator('text=결과를').first().textContent().catch(() => null);
        if (resultMessage) {
          console.log(`📋 결과 메시지: ${resultMessage}`);
        }
        
      } else {
        console.log('❌ "경험 공유하기" 버튼을 찾을 수 없습니다.');
        
        // 페이지 전체에서 "공유" 관련 텍스트 찾기
        const shareTexts = await page.getByText(/공유|경험|커뮤니티/).all();
        if (shareTexts.length > 0) {
          console.log('페이지에서 발견된 공유 관련 텍스트:');
          for (let i = 0; i < shareTexts.length; i++) {
            const text = await shareTexts[i].textContent();
            console.log(`  ${i + 1}. "${text}"`);
          }
        }
      }
      
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없습니다.');
      
      // 현재 페이지 상태 확인
      const pageButtons = await page.locator('button').allTextContents();
      console.log('페이지의 모든 버튼 텍스트:');
      pageButtons.slice(0, 20).forEach((text, i) => {
        console.log(`  ${i + 1}. "${text}"`);
      });
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'final-test-07-final-state.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
    await page.screenshot({ path: 'final-test-error.png' });
  } finally {
    console.log('🔍 30초 후 브라우저가 자동으로 닫힙니다. 수동으로 확인해보세요.');
    setTimeout(() => browser.close(), 30000);
  }
}

finalCommunityTest().catch(console.error);