const { chromium } = require('playwright');

async function forceClickSaveTest() {
  console.log('💪 강제 클릭 저장 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 모니터링 (저장 관련만)
  const networkLogs = [];
  page.on('request', request => {
    if (request.url().includes('saveUserReading') || 
        request.url().includes('/api/') ||
        request.method() === 'POST') {
      const logEntry = `📤 REQUEST: ${request.method()} ${request.url()}`;
      networkLogs.push(logEntry);
      console.log(logEntry);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('saveUserReading') || 
        response.url().includes('/api/') ||
        response.request().method() === 'POST') {
      const status = response.status();
      let body = '';
      try {
        body = await response.text();
      } catch (e) {
        body = '[읽기 실패]';
      }
      const logEntry = `📥 RESPONSE: ${status} ${response.url()}`;
      const bodyLog = `📄 응답: ${body.substring(0, 400)}...`;
      networkLogs.push(logEntry);
      networkLogs.push(bodyLog);
      console.log(logEntry);
      console.log(bodyLog);
    }
  });
  
  // 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Error') || msg.text().includes('실패')) {
      console.log(`❌ CONSOLE: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`💥 PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('1️⃣ 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    
    console.log('2️⃣ 질문 입력...');
    await page.fill('textarea#question', '강제 클릭 테스트용 질문입니다');
    
    console.log('3️⃣ 카드 섞기...');
    await page.click('button:has-text("섞기")');
    await page.waitForTimeout(3000);
    
    console.log('4️⃣ 카드 펼치기...');
    await page.click('button:has-text("펼치기")');
    await page.waitForTimeout(3000);
    
    console.log('5️⃣ 카드 강제 클릭으로 3장 선택...');
    // 더 구체적인 셀렉터로 카드 찾기
    const cardContainer = await page.locator('div[role="group"]');
    const allCards = await cardContainer.locator('div[role="button"]');
    const cardCount = await allCards.count();
    
    console.log(`총 ${cardCount}개의 카드 발견`);
    
    if (cardCount >= 3) {
      for (let i = 0; i < 3; i++) {
        console.log(`카드 ${i+1} 강제 클릭 중...`);
        
        // force: true 옵션을 사용하여 강제 클릭
        await allCards.nth(i).click({ force: true });
        await page.waitForTimeout(800);
        
        // 선택된 카드 수 확인
        const selectedText = await page.textContent('h3:has-text("선택된 카드")');
        console.log(`현재 상태: ${selectedText}`);
      }
    } else {
      console.log('❌ 충분한 카드를 찾을 수 없음');
      return;
    }
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/force-01-selected.png' });
    
    console.log('6️⃣ AI 해석 버튼 클릭...');
    await page.click('button:has-text("AI 해석 받기")');
    console.log('AI 해석 요청됨');
    
    // 해석 모달 대기
    console.log('⏳ 해석 모달 대기...');
    await page.waitForSelector('[role="dialog"]', { timeout: 45000 });
    console.log('✅ 해석 모달 열림');
    
    // 저장 버튼이 나타날 때까지 대기
    console.log('⏳ 저장 버튼 대기...');
    await page.waitForSelector('button:has-text("이 리딩 저장하기")', { timeout: 45000 });
    console.log('✅ 저장 버튼 나타남');
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/force-02-ready-save.png' });
    
    console.log('7️⃣ 저장 버튼 클릭...');
    await page.click('button:has-text("이 리딩 저장하기")');
    console.log('💾 저장 버튼 클릭됨');
    
    // 저장 응답 대기
    console.log('⏳ 저장 응답 대기...');
    await page.waitForTimeout(5000);
    
    // 토스트 메시지나 상태 변화 확인
    const pageHTML = await page.content();
    
    if (pageHTML.includes('저장 완료') || pageHTML.includes('성공적으로 저장')) {
      console.log('✅ 저장 성공 확인됨');
    } else if (pageHTML.includes('저장 실패') || pageHTML.includes('오류') || pageHTML.includes('Error')) {
      console.log('❌ 저장 실패 확인됨');
      
      // 상세한 오류 메시지 찾기
      try {
        const toastMessages = await page.locator('[data-radix-toast-viewport] [data-radix-toast-title], [data-radix-toast-viewport] [data-radix-toast-description]').allTextContents();
        console.log('🔍 토스트 메시지들:', toastMessages);
      } catch (e) {
        console.log('토스트 메시지 추출 실패');
      }
      
      try {
        const errorTexts = await page.locator('text=오류, text=에러, text=Error, text=실패').allTextContents();
        console.log('🔍 오류 텍스트들:', errorTexts);
      } catch (e) {
        console.log('오류 텍스트 추출 실패');
      }
      
    } else {
      console.log('⚠️ 저장 결과를 명확히 확인할 수 없음');
      
      // 버튼 상태 변화 확인
      const saveButtonText = await page.locator('button:has-text("저장")').allTextContents();
      console.log('💾 저장 버튼 상태:', saveButtonText);
    }
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/force-03-save-result.png' });
    
    // 추가 대기로 지연된 응답 확인
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/force-04-final.png' });
    
    console.log('\n📋 네트워크 로그 전체:');
    networkLogs.forEach(log => console.log(log));
    
  } catch (error) {
    console.error('💥 테스트 실행 오류:', error);
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/force-error.png' });
  } finally {
    console.log('🔍 브라우저 유지 중 - 수동 확인 가능');
    // await browser.close();
  }
}

forceClickSaveTest().catch(console.error);