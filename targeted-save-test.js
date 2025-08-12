const { chromium } = require('playwright');

async function targetedSaveTest() {
  console.log('🎯 타겟팅된 저장 오류 재현 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 모니터링
  const networkLogs = [];
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('saveUserReading')) {
      const logEntry = `📤 REQUEST: ${request.method()} ${request.url()}`;
      networkLogs.push(logEntry);
      console.log(logEntry);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/') || response.url().includes('saveUserReading')) {
      const status = response.status();
      let body = '';
      try {
        body = await response.text();
      } catch (e) {
        body = '[읽기 실패]';
      }
      const logEntry = `📥 RESPONSE: ${status} ${response.url()}`;
      const bodyLog = `📄 응답 내용: ${body.substring(0, 300)}...`;
      networkLogs.push(logEntry);
      networkLogs.push(bodyLog);
      console.log(logEntry);
      console.log(bodyLog);
    }
  });
  
  // 콘솔 에러만 캐치
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`💥 PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('1️⃣ 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/target-01-loaded.png' });
    
    console.log('2️⃣ 질문 입력...');
    const questionTextarea = await page.locator('textarea#question').first();
    await questionTextarea.fill('저장 기능 테스트용 질문입니다');
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/target-02-question.png' });
    
    console.log('3️⃣ 카드 섞기...');
    await page.click('button:has-text("섞기")');
    await page.waitForTimeout(2000); // 섞기 애니메이션 대기
    
    console.log('4️⃣ 카드 펼치기...');
    await page.click('button:has-text("펼치기")');
    await page.waitForTimeout(2000); // 펼치기 애니메이션 대기
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/target-03-spread.png' });
    
    console.log('5️⃣ 카드 3장 선택...');
    // 펼쳐진 카드들을 찾아서 클릭 (role="button"이고 tabIndex가 0인 것들)
    const spreadCards = await page.locator('[role="button"][tabindex="0"]');
    const cardCount = await spreadCards.count();
    console.log(`펼쳐진 카드 ${cardCount}개 발견`);
    
    if (cardCount >= 3) {
      for (let i = 0; i < 3; i++) {
        console.log(`카드 ${i+1} 선택 중...`);
        await spreadCards.nth(i).click();
        await page.waitForTimeout(500);
      }
      console.log('✅ 3장 카드 선택 완료');
    } else {
      console.log('⚠️ 펼쳐진 카드가 3장 미만');
    }
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/target-04-selected.png' });
    
    console.log('6️⃣ AI 해석 요청...');
    await page.click('button:has-text("AI 해석 받기")');
    console.log('AI 해석 버튼 클릭됨');
    
    // 해석 모달이 나타날 때까지 대기
    console.log('⏳ 해석 모달 대기 중...');
    await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
    console.log('✅ 해석 모달 나타남');
    
    // 해석이 완료될 때까지 대기 (저장 버튼이 나타날 때까지)
    console.log('⏳ 저장 버튼 대기 중...');
    await page.waitForSelector('button:has-text("이 리딩 저장하기"), button:has-text("리딩 저장")', { timeout: 30000 });
    console.log('✅ 저장 버튼 나타남');
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/target-05-interpretation.png' });
    
    console.log('7️⃣ 저장 버튼 클릭...');
    const saveButton = await page.locator('button:has-text("이 리딩 저장하기"), button:has-text("리딩 저장")').first();
    
    if (await saveButton.isVisible()) {
      console.log('💾 저장 버튼 클릭 실행...');
      await saveButton.click();
      console.log('저장 버튼 클릭됨');
      
      // 저장 결과 대기
      console.log('⏳ 저장 결과 대기 중...');
      await page.waitForTimeout(5000);
      
      // 성공/실패 메시지 확인
      const pageContent = await page.content();
      
      if (pageContent.includes('저장 완료') || pageContent.includes('성공적으로 저장')) {
        console.log('✅ 저장 성공 메시지 발견');
      } else if (pageContent.includes('저장 실패') || pageContent.includes('오류') || pageContent.includes('Error')) {
        console.log('❌ 저장 실패 메시지 발견');
        
        // 에러 메시지 추출
        try {
          const errorElements = await page.locator('text=오류, text=에러, text=Error, text=실패').all();
          for (const element of errorElements) {
            const text = await element.textContent();
            if (text && text.trim()) {
              console.log(`🔍 오류 메시지: ${text.trim()}`);
            }
          }
        } catch (e) {
          console.log('오류 메시지 추출 실패');
        }
      } else {
        console.log('⚠️ 저장 결과 메시지를 찾을 수 없음');
      }
      
    } else {
      console.log('❌ 저장 버튼을 찾을 수 없음');
    }
    
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/target-06-save-result.png' });
    
    // 추가 대기 후 최종 상태
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/target-07-final.png' });
    
    console.log('\n📋 네트워크 로그 요약:');
    networkLogs.forEach(log => console.log(log));
    
  } catch (error) {
    console.error('💥 테스트 실행 오류:', error);
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/screenshots/target-error.png' });
  } finally {
    console.log('🏁 테스트 완료, 브라우저 유지 (수동 확인 가능)');
    // 브라우저를 닫지 않고 유지하여 수동 확인 가능
    // await browser.close();
  }
}

targetedSaveTest().catch(console.error);