const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 로깅 설정
  const logs = { console: [], errors: [], network: [] };
  
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      time: new Date().toISOString()
    };
    logs.console.push(logEntry);
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    logs.errors.push({
      message: err.message,
      stack: err.stack,
      time: new Date().toISOString()
    });
    console.log(`[PAGE ERROR] ${err.message}`);
  });
  
  page.on('response', response => {
    if (response.url().includes('api/') || response.url().includes('functions') || response.url().includes('tarot')) {
      console.log(`[API] ${response.url()} - Status: ${response.status()}`);
      if (response.status() >= 400) {
        response.text().then(text => {
          console.log(`[API ERROR] Response: ${text.substring(0, 200)}...`);
          logs.network.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            responseBody: text,
            time: new Date().toISOString()
          });
        });
      }
    }
  });
  
  try {
    console.log('=== 타로 리딩 오류 재현 테스트 시작 ===\n');
    
    console.log('1. 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    console.log('2. 질문 입력: "나의 미래는 어떻게 될까요?"');
    await page.fill('textarea', '나의 미래는 어떻게 될까요?');
    await page.screenshot({ path: 'step1-question.png' });
    
    console.log('3. 타로 스프레드 선택 (기본값 유지)');
    // 스프레드 선택은 기본값으로 유지
    
    console.log('4. 해석 스타일 선택 (기본값 유지)');
    // 해석 스타일도 기본값으로 유지
    
    console.log('5. 카드 섞기...');
    const shuffleButton = await page.getByRole('button', { name: /섞/i });
    await shuffleButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step2-shuffled.png' });
    
    console.log('6. 카드 펼치기...');
    const spreadButton = await page.getByRole('button', { name: /펼치기/i });
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'step3-spread.png' });
    }
    
    console.log('7. 카드 3장 선택...');
    // 다양한 카드 선택자 시도
    const cardSelectors = [
      '.card-item',
      'button[class*="card"]',
      'div[class*="card-item"]',
      '[data-card]',
      'div[role="button"]'
    ];
    
    let selectedCount = 0;
    for (const selector of cardSelectors) {
      if (selectedCount >= 3) break;
      
      const cards = await page.$$(selector);
      console.log(`선택자 ${selector}: ${cards.length}개 카드 발견`);
      
      for (let i = 0; i < cards.length && selectedCount < 3; i++) {
        try {
          await cards[i].click();
          selectedCount++;
          console.log(`  카드 ${selectedCount} 선택됨`);
          await page.waitForTimeout(500);
        } catch (e) {
          console.log(`  카드 클릭 실패: ${e.message}`);
        }
      }
    }
    
    await page.screenshot({ path: 'step4-selected.png' });
    
    console.log(`\n8. AI 해석 받기 (선택된 카드: ${selectedCount}장)...`);
    
    // API 응답 대기 준비
    const apiPromise = page.waitForResponse(
      response => {
        const url = response.url();
        return url.includes('api/') || url.includes('functions') || url.includes('tarot');
      },
      { timeout: 30000 }
    ).catch(err => {
      console.log('API 응답 시간 초과');
      return null;
    });
    
    // AI 해석 버튼 클릭
    const interpretButton = await page.getByRole('button', { name: /AI.*해석/i });
    if (await interpretButton.isVisible()) {
      console.log('AI 해석 받기 버튼 클릭...');
      await interpretButton.click();
      
      // API 응답 대기
      const apiResponse = await apiPromise;
      if (apiResponse) {
        console.log(`\nAPI 응답: ${apiResponse.url()}`);
        console.log(`상태 코드: ${apiResponse.status()}`);
        
        if (apiResponse.status() >= 400) {
          const responseText = await apiResponse.text();
          console.log(`에러 응답:\n${responseText}`);
        }
      }
    } else {
      console.log('AI 해석 받기 버튼을 찾을 수 없음');
    }
    
    // 결과 대기
    await page.waitForTimeout(5000);
    
    console.log('\n9. 오류 메시지 확인...');
    
    // 다양한 오류 요소 확인
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '.alert',
      '.text-red-500',
      '.text-destructive',
      '[class*="error"]',
      '[class*="danger"]',
      '.toast-error',
      '[data-state="error"]'
    ];
    
    let errorFound = false;
    for (const selector of errorSelectors) {
      const errorElements = await page.$$(selector);
      if (errorElements.length > 0) {
        for (const el of errorElements) {
          const text = await el.textContent();
          if (text && text.trim() && text.trim().length > 5) {
            console.log(`\n🔴 오류 발견 (${selector}):`);
            console.log(`   "${text.trim()}"`);
            errorFound = true;
          }
        }
      }
    }
    
    if (!errorFound) {
      console.log('명시적인 오류 메시지가 발견되지 않음');
      
      // 로딩 상태 확인
      const loadingElements = await page.$$('[class*="loading"], [class*="spinner"]');
      if (loadingElements.length > 0) {
        console.log('로딩 요소가 여전히 표시되고 있음');
      }
      
      // 결과 영역 확인
      const resultElements = await page.$$('[class*="result"], [class*="interpretation"]');
      console.log(`결과 영역 발견: ${resultElements.length}개`);
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'error-reproduction.png',
      fullPage: true 
    });
    
    console.log('\n=== 로그 요약 ===');
    console.log(`콘솔 로그: ${logs.console.length}개`);
    console.log(`페이지 에러: ${logs.errors.length}개`);
    console.log(`네트워크 에러: ${logs.network.length}개`);
    
    // 에러 로그 상세 출력
    if (logs.errors.length > 0) {
      console.log('\n=== 페이지 에러 상세 ===');
      logs.errors.forEach((err, i) => {
        console.log(`\n에러 ${i + 1}:`);
        console.log(err.message);
      });
    }
    
    if (logs.network.length > 0) {
      console.log('\n=== 네트워크 에러 상세 ===');
      logs.network.forEach((err, i) => {
        console.log(`\n에러 ${i + 1}:`);
        console.log(`URL: ${err.url}`);
        console.log(`상태: ${err.status} ${err.statusText}`);
        if (err.responseBody) {
          console.log(`응답: ${err.responseBody.substring(0, 500)}...`);
        }
      });
    }
    
    // 콘솔 에러/경고 출력
    const importantLogs = logs.console.filter(log => 
      log.type === 'error' || log.type === 'warning'
    );
    if (importantLogs.length > 0) {
      console.log('\n=== 콘솔 에러/경고 ===');
      importantLogs.forEach(log => {
        console.log(`[${log.type}] ${log.text}`);
      });
    }
    
    // 로그 파일 저장
    const fs = require('fs');
    fs.writeFileSync('tarot-error-detailed.json', JSON.stringify(logs, null, 2));
    console.log('\n상세 로그가 tarot-error-detailed.json에 저장되었습니다.');
    
    console.log('\n테스트 완료. 브라우저를 닫으려면 Ctrl+C를 누르세요.');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('\n테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'error-reproduction.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();