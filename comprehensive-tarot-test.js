const { chromium } = require('playwright');

async function comprehensiveTarotTest() {
  console.log('🔮 포괄적 타로 리딩 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000, // 각 액션 사이에 1초 대기
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 수집
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    console.log(`브라우저 콘솔: ${logEntry}`);
    consoleLogs.push(logEntry);
  });
  
  // 네트워크 요청/응답 모니터링
  const networkLogs = [];
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('openai') || request.url().includes('gpt')) {
      const logEntry = `REQUEST: ${request.method()} ${request.url()}`;
      console.log(logEntry);
      networkLogs.push(logEntry);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('api') || response.url().includes('openai') || response.url().includes('gpt')) {
      const logEntry = `RESPONSE: ${response.status()} ${response.url()}`;
      console.log(logEntry);
      networkLogs.push(logEntry);
    }
  });
  
  try {
    // 1. 타로 페이지 접속
    console.log('1️⃣ 타로 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'networkidle' 
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verification-screenshots/step-01-page-loaded.png' });
    
    // 2. 질문 입력 필드 찾기 및 입력
    console.log('2️⃣ 질문 입력...');
    const questionInput = await page.locator('input').first();
    await questionInput.fill('나의 미래 연애운은 어떻게 될까요?');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification-screenshots/step-02-question-entered.png' });
    
    // 3. 메이저 아르카나 탭 선택 (기본값이 아닐 수 있음)
    console.log('3️⃣ 메이저 아르카나 선택...');
    const majorArcanaTab = page.locator('text=메이저 아르카나');
    if (await majorArcanaTab.count() > 0) {
      await majorArcanaTab.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: 'verification-screenshots/step-03-major-arcana-selected.png' });
    
    // 4. 카드가 로드될 때까지 대기
    console.log('4️⃣ 카드 로딩 대기...');
    await page.waitForSelector('.card, [class*="card"], img[alt*="카드"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification-screenshots/step-04-cards-loaded.png' });
    
    // 5. 첫 번째 카드 클릭
    console.log('5️⃣ 첫 번째 카드 선택...');
    const firstCard = page.locator('.card, [class*="card"], img[alt*="카드"]').first();
    await firstCard.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification-screenshots/step-05-card-selected.png' });
    
    // 6. AI 해석 버튼 찾기 및 클릭
    console.log('6️⃣ AI 해석 요청...');
    const interpretButtons = [
      'button:has-text("AI 해석")',
      'button:has-text("해석 요청")',
      'button:has-text("해석")',
      'button:has-text("AI로 해석하기")',
      '[class*="interpret"]'
    ];
    
    let interpretButton = null;
    for (const selector of interpretButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0) {
        interpretButton = button.first();
        break;
      }
    }
    
    if (interpretButton) {
      await interpretButton.click();
      console.log('✅ AI 해석 버튼 클릭됨');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'verification-screenshots/step-06-interpretation-requested.png' });
      
      // 7. 응답 대기 및 오류 확인
      console.log('7️⃣ AI 응답 대기 중...');
      await page.waitForTimeout(10000); // 10초 대기
      
      // 오류 메시지 확인
      const errorSelectors = [
        'text=/error/i',
        'text=/오류/i', 
        'text=/NOT_FOUND/i',
        'text=/gpt-3.5-turbo/i',
        'text=/Model.*not found/i',
        '[class*="error"]',
        '.error-message'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        const errorElement = page.locator(selector);
        if (await errorElement.count() > 0) {
          const errorText = await errorElement.first().textContent();
          console.log(`❌ 오류 발견: ${errorText}`);
          errorFound = true;
          break;
        }
      }
      
      if (!errorFound) {
        console.log('✅ 눈에 보이는 오류 메시지 없음');
      }
      
      await page.screenshot({ path: 'verification-screenshots/step-07-final-result.png' });
      
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없음');
      await page.screenshot({ path: 'verification-screenshots/step-06-no-interpret-button.png' });
    }
    
    // 8. 페이지 전체 HTML 확인 (오류가 숨어있을 수 있음)
    console.log('8️⃣ 페이지 내용 확인 중...');
    const pageContent = await page.content();
    const hasError = pageContent.toLowerCase().includes('not_found') || 
                    pageContent.toLowerCase().includes('gpt-3.5-turbo') ||
                    pageContent.toLowerCase().includes('model') && pageContent.toLowerCase().includes('not found');
    
    if (hasError) {
      console.log('❌ 페이지 소스에서 오류 관련 텍스트 발견');
      // HTML에서 오류 부분 추출
      const lines = pageContent.split('\n');
      const errorLines = lines.filter(line => 
        line.toLowerCase().includes('not_found') || 
        line.toLowerCase().includes('gpt-3.5-turbo') ||
        (line.toLowerCase().includes('model') && line.toLowerCase().includes('not found'))
      );
      console.log('오류 관련 HTML:', errorLines.join('\n'));
    }
    
    console.log('\n📊 테스트 결과 요약:');
    console.log(`콘솔 로그 개수: ${consoleLogs.length}`);
    console.log(`네트워크 로그 개수: ${networkLogs.length}`);
    console.log('수집된 로그들:');
    consoleLogs.forEach(log => console.log(`  ${log}`));
    networkLogs.forEach(log => console.log(`  ${log}`));
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'verification-screenshots/test-error.png' });
  } finally {
    // 브라우저를 5초 후에 닫음 (수동 확인 시간)
    setTimeout(() => {
      browser.close();
    }, 5000);
  }
}

comprehensiveTarotTest().catch(console.error);