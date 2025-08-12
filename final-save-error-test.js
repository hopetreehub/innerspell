const { chromium } = require('playwright');

async function finalSaveErrorTest() {
  console.log('🔥 최종 타로 리딩 저장 오류 재현');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 모니터링 - 저장 관련 API만 집중
  const saveApiLogs = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/reading/history') || 
        request.url().includes('saveUserReading')) {
      const logEntry = `📤 REQUEST: ${request.method()} ${request.url()}`;
      const postData = request.postData();
      if (postData) {
        const preview = postData.substring(0, 200) + (postData.length > 200 ? '...' : '');
        saveApiLogs.push(`${logEntry}\n📄 POST DATA: ${preview}`);
      } else {
        saveApiLogs.push(logEntry);
      }
      console.log(logEntry);
      if (postData) console.log(`📄 POST DATA: ${preview}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/reading/history') || 
        response.url().includes('saveUserReading')) {
      const status = response.status();
      let body = '';
      try {
        body = await response.text();
      } catch (e) {
        body = '[읽기 실패]';
      }
      const logEntry = `📥 RESPONSE: ${status} ${response.url()}`;
      const bodyEntry = `📄 응답 내용: ${body}`;
      saveApiLogs.push(logEntry);
      saveApiLogs.push(bodyEntry);
      console.log(logEntry);
      console.log(bodyEntry);
    }
  });
  
  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('저장') || msg.text().includes('Error')) {
      console.log(`❌ CONSOLE: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`💥 PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('1️⃣ 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2️⃣ 질문 입력...');
    await page.fill('textarea#question', '최종 테스트: 저장 오류 재현 질문입니다');
    
    console.log('3️⃣ 카드 섞기...');
    await page.click('button:has-text("섞기")');
    await page.waitForTimeout(4000); // 섞기 애니메이션 완료 대기
    
    console.log('4️⃣ 카드 펼치기...');
    await page.click('button:has-text("펼치기")');
    await page.waitForTimeout(3000); // 펼치기 애니메이션 완료 대기
    
    console.log('5️⃣ 카드 3장 선택 (JavaScript 방식)...');
    
    // JavaScript로 직접 카드 선택 함수 호출
    await page.evaluate(() => {
      // 펼쳐진 카드들 찾기
      const cardButtons = document.querySelectorAll('[role="button"][tabindex="0"]');
      console.log(`발견된 카드: ${cardButtons.length}개`);
      
      // 첫 3장 강제 클릭
      for (let i = 0; i < Math.min(3, cardButtons.length); i++) {
        const card = cardButtons[i];
        console.log(`카드 ${i+1} 클릭 중...`);
        
        // 클릭 이벤트 강제 발생
        card.click();
        
        // 잠시 대기
        return new Promise(resolve => setTimeout(resolve, 500));
      }
    });
    
    // 카드 선택 결과 확인
    await page.waitForTimeout(2000);
    
    const selectedCardCount = await page.evaluate(() => {
      const selectedSection = document.querySelector('h3:has-text("선택된 카드")');
      return selectedSection ? selectedSection.textContent : 'not found';
    });
    
    console.log(`선택된 카드 상태: ${selectedCardCount}`);
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/final-01-cards-selected.png' });
    
    console.log('6️⃣ AI 해석 버튼 클릭...');
    await page.click('button:has-text("AI 해석 받기")');
    console.log('AI 해석 요청됨');
    
    // 해석 모달 대기
    console.log('⏳ 해석 모달 대기...');
    await page.waitForSelector('[role="dialog"]', { timeout: 60000 });
    console.log('✅ 해석 모달 열림');
    
    // 저장 버튼이 나타날 때까지 대기
    console.log('⏳ 저장 버튼 대기...');
    await page.waitForSelector('button:has-text("이 리딩 저장하기"), button:has-text("리딩 저장")', { timeout: 60000 });
    console.log('✅ 저장 버튼 나타남');
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/final-02-ready-to-save.png' });
    
    console.log('7️⃣ 저장 버튼 클릭 및 API 모니터링...');
    
    // 저장 버튼 클릭
    await page.click('button:has-text("이 리딩 저장하기"), button:has-text("리딩 저장")');
    console.log('💾 저장 버튼 클릭됨');
    
    // 저장 API 응답 대기
    console.log('⏳ 저장 API 응답 대기...');
    await page.waitForTimeout(8000);
    
    // 저장 결과 확인
    const finalPageContent = await page.content();
    
    if (finalPageContent.includes('저장 완료') || finalPageContent.includes('성공적으로 저장')) {
      console.log('✅ 저장 성공!');
    } else if (finalPageContent.includes('저장 실패') || finalPageContent.includes('오류') || finalPageContent.includes('Error')) {
      console.log('❌ 저장 실패 감지');
      
      // 토스트 메시지 확인
      try {
        const toastMessages = await page.locator('[data-radix-toast-viewport] [data-radix-toast-title], [data-radix-toast-viewport] [data-radix-toast-description]').allTextContents();
        if (toastMessages.length > 0) {
          console.log('🔍 토스트 메시지들:', toastMessages);
        }
      } catch (e) {
        console.log('토스트 메시지 추출 실패');
      }
      
    } else {
      console.log('⚠️ 저장 결과 불명확');
    }
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/final-03-save-result.png' });
    
    // 추가 대기 후 최종 상태
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/final-04-final-state.png' });
    
    console.log('\n📋 저장 API 로그 전체:');
    saveApiLogs.forEach(log => console.log(log));
    
    console.log('\n📊 요약:');
    if (saveApiLogs.length === 0) {
      console.log('❌ 저장 API 호출이 전혀 감지되지 않았습니다!');
      console.log('💡 가능한 원인:');
      console.log('   - 저장 버튼이 실제로 클릭되지 않음');
      console.log('   - API 호출이 다른 경로로 이루어짐');
      console.log('   - 클라이언트 사이드 에러로 API 호출 차단');
    } else {
      console.log(`✅ 총 ${saveApiLogs.length}개의 저장 관련 로그 수집됨`);
    }
    
  } catch (error) {
    console.error('💥 테스트 실행 오류:', error);
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/final-error.png' });
  } finally {
    console.log('🔍 테스트 완료. 브라우저는 수동 확인을 위해 유지됩니다.');
    // await browser.close();
  }
}

finalSaveErrorTest().catch(console.error);