const { chromium } = require('playwright');

async function completeCommunityTest() {
  console.log('🎯 완전한 "커뮤니티로 저장하기" 기능 테스트');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 및 콘솔 모니터링
  const logs = { console: [], network: [] };
  
  page.on('console', msg => {
    const logEntry = { type: msg.type(), text: msg.text(), timestamp: new Date().toISOString() };
    logs.console.push(logEntry);
    if (msg.type() === 'error') {
      console.log(`🚨 [에러] ${msg.text()}`);
    }
  });
  
  page.on('request', request => {
    if (request.url().includes('community') || request.url().includes('share') || request.url().includes('save')) {
      logs.network.push({ type: 'request', method: request.method(), url: request.url(), timestamp: new Date().toISOString() });
      console.log(`📡 [요청] ${request.method()} ${request.url()}`);
    }
  });
  
  try {
    // 1. 페이지 접속
    console.log('1️⃣ 타로 리딩 페이지 접속');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'complete-test-01-loaded.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ 질문 입력');
    await page.fill('textarea', '커뮤니티 저장 기능을 테스트합니다.');
    
    // 3. 카드 섞기
    console.log('3️⃣ 카드 섞기');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(4000);
    
    // 4. 카드 펼치기
    console.log('4️⃣ 카드 펼치기');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'complete-test-02-cards-spread.png' });
    
    // 5. 정확한 카드 선택 - 실제 클릭 가능한 영역 찾기
    console.log('5️⃣ 카드 선택 (정확한 클릭)');
    
    // 카드 컨테이너 찾기
    const spreadContainer = page.locator('[class*="flex space-x-"]');
    await spreadContainer.waitFor({ timeout: 5000 });
    
    // 더 정확한 카드 선택자 사용
    const cardSelector = '[role="button"][tabindex="0"][aria-label*="펼쳐진"]';
    await page.waitForSelector(cardSelector, { timeout: 5000 });
    
    // 카드 강제 클릭 (겹침 문제 해결)
    for (let i = 0; i < 3; i++) {
      console.log(`카드 ${i + 1} 선택 시도`);
      await page.evaluate((index) => {
        const cards = document.querySelectorAll('[role="button"][tabindex="0"][aria-label*="펼쳐진"]');
        if (cards[index]) {
          cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
          cards[index].focus();
          cards[index].click();
        }
      }, i);
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'complete-test-03-cards-selected.png' });
    
    // 선택된 카드 수 확인
    console.log('6️⃣ 선택된 카드 수 확인');
    const selectedIndicator = await page.textContent('h3:has-text("선택된 카드")');
    console.log(`선택된 카드 표시: ${selectedIndicator}`);
    
    // AI 해석 버튼이 나타날 때까지 대기
    console.log('7️⃣ AI 해석 버튼 대기');
    try {
      await page.waitForSelector('button:has-text("AI 해석 받기")', { timeout: 10000 });
      console.log('✅ AI 해석 버튼 발견됨');
    } catch (e) {
      console.log('⚠️ AI 해석 버튼 대기 실패, 강제로 상태 확인');
      
      // 페이지 상태 디버그
      const allButtons = await page.locator('button').allTextContents();
      console.log('현재 페이지의 모든 버튼:', allButtons.slice(0, 15));
      
      // 선택된 카드 확인
      const selectedCards = await page.locator('[aria-label*="선택된 카드"]').count();
      console.log(`실제 선택된 카드 수: ${selectedCards}`);
    }
    
    // 8. AI 해석 요청
    console.log('8️⃣ AI 해석 요청');
    const interpretButton = page.locator('button:has-text("AI 해석 받기")');
    
    if (await interpretButton.isVisible({ timeout: 3000 })) {
      await interpretButton.click();
      console.log('AI 해석 요청됨');
      
      // 해석 다이얼로그가 열릴 때까지 대기
      await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
      console.log('✅ 해석 다이얼로그 열림');
      
      // 해석 완료 대기 (텍스트가 나타날 때까지)
      console.log('AI 해석 완료 대기...');
      await page.waitForTimeout(15000);
      
      await page.screenshot({ path: 'complete-test-04-interpretation-dialog.png' });
      
      // 9. 경험 공유하기 버튼 찾기
      console.log('9️⃣ "경험 공유하기" 버튼 찾기');
      
      const dialog = page.locator('[role="dialog"]');
      
      // 다양한 공유 버튼 패턴 확인
      const shareSelectors = [
        'button:has-text("경험 공유하기")',
        'button:has-text("경험 공유")',
        'button:has-text("공유하기")',
        'button:has-text("커뮤니티")',
        'button[class*="mr-2"]:has-text("경험")',
        '[data-testid*="share"]'
      ];
      
      let shareButton = null;
      let shareButtonFound = false;
      
      for (const selector of shareSelectors) {
        try {
          const button = dialog.locator(selector).or(page.locator(selector));
          if (await button.isVisible({ timeout: 2000 })) {
            console.log(`✅ 공유 버튼 발견: ${selector}`);
            shareButton = button;
            shareButtonFound = true;
            break;
          }
        } catch (e) {
          console.log(`❌ 버튼 찾기 실패: ${selector}`);
        }
      }
      
      if (!shareButtonFound) {
        // 다이얼로그 내 모든 버튼 확인
        console.log('다이얼로그 내 모든 버튼 확인:');
        const dialogButtons = await dialog.locator('button').all();
        for (let i = 0; i < dialogButtons.length; i++) {
          const text = await dialogButtons[i].textContent();
          const isVisible = await dialogButtons[i].isVisible();
          console.log(`  버튼 ${i}: "${text}" (보임: ${isVisible})`);
          
          // "경험" 또는 "공유" 키워드가 포함된 버튼 찾기
          if (text && (text.includes('경험') || text.includes('공유') || text.includes('커뮤니티'))) {
            shareButton = dialogButtons[i];
            shareButtonFound = true;
            console.log(`✅ 키워드 매칭으로 공유 버튼 발견: "${text}"`);
            break;
          }
        }
      }
      
      // 10. 공유 버튼 클릭
      if (shareButtonFound && shareButton) {
        console.log('🔟 "경험 공유하기" 버튼 클릭');
        
        // 클릭 전 스크린샷
        await shareButton.screenshot({ path: 'complete-test-05-share-button.png' });
        
        // 클릭
        await shareButton.click();
        console.log('✅ 경험 공유하기 버튼 클릭됨');
        
        // 클릭 후 변화 대기
        await page.waitForTimeout(8000);
        
        // URL 변화 확인
        const currentUrl = page.url();
        console.log(`현재 URL: ${currentUrl}`);
        
        // 토스트 메시지 확인
        const toastSelectors = [
          '[role="alert"]',
          '.toast',
          '[data-sonner-toaster]',
          '.sonner-toast',
          '[data-testid="toast"]'
        ];
        
        let toastFound = false;
        for (const selector of toastSelectors) {
          const toasts = await page.locator(selector).all();
          if (toasts.length > 0) {
            console.log(`토스트 메시지들 (${selector}):`);
            for (const toast of toasts) {
              const text = await toast.textContent();
              console.log(`  📢 ${text}`);
              toastFound = true;
            }
          }
        }
        
        if (!toastFound) {
          console.log('⚠️ 토스트 메시지를 찾을 수 없음');
        }
        
        await page.screenshot({ path: 'complete-test-06-after-share-click.png' });
        
        if (currentUrl.includes('/community')) {
          console.log('✅ 커뮤니티 페이지로 리다이렉트됨');
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: 'complete-test-07-community-page.png' });
          
          // 커뮤니티 페이지에서 내용 확인
          const pageTitle = await page.textContent('h1, h2').catch(() => '제목 없음');
          console.log(`커뮤니티 페이지 제목: ${pageTitle}`);
          
        } else {
          console.log('⚠️ 페이지 리다이렉트가 발생하지 않음');
          
          // 에러 메시지 확인
          const errorSelectors = ['.error', '[data-testid="error"]', '.alert-destructive', '.text-red'];
          for (const selector of errorSelectors) {
            const errors = await page.locator(selector).all();
            if (errors.length > 0) {
              console.log(`에러 메시지들 (${selector}):`);
              for (const error of errors) {
                const text = await error.textContent();
                console.log(`  ❌ ${text}`);
              }
            }
          }
        }
        
      } else {
        console.log('❌ "경험 공유하기" 버튼을 찾을 수 없습니다.');
        
        // 다이얼로그 전체 스크린샷
        await dialog.screenshot({ path: 'complete-test-05-dialog-no-share-button.png' });
      }
      
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없거나 보이지 않습니다.');
      
      // 현재 상태 스크린샷
      await page.screenshot({ path: 'complete-test-04-no-interpret-button.png' });
    }
    
    // 11. 최종 상태 및 분석
    await page.screenshot({ path: 'complete-test-08-final-state.png', fullPage: true });
    
    console.log('📊 테스트 결과 분석:');
    console.log(`- 콘솔 로그 개수: ${logs.console.length}`);
    console.log(`- 네트워크 요청 개수: ${logs.network.length}`);
    
    const errors = logs.console.filter(log => log.type === 'error');
    if (errors.length > 0) {
      console.log('JavaScript 에러들:');
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.text}`);
      });
    } else {
      console.log('✅ JavaScript 에러 없음');
    }
    
    if (logs.network.length > 0) {
      console.log('네트워크 요청들:');
      logs.network.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url}`);
      });
    } else {
      console.log('⚠️ 관련 네트워크 요청 없음');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'complete-test-error.png' });
  } finally {
    console.log('🔍 브라우저를 25초간 유지합니다. 수동으로 확인해보세요.');
    setTimeout(async () => {
      await browser.close();
    }, 25000);
  }
}

completeCommunityTest().catch(console.error);