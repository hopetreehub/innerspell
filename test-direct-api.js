const { chromium } = require('playwright');

async function testDirectAPI() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔧 직접 API 테스트 시작...');
    
    // 네트워크 요청을 자세히 모니터링
    const requestLog = [];
    const responseLog = [];
    
    page.on('request', request => {
      const url = request.url();
      const method = request.method();
      const headers = request.headers();
      
      requestLog.push({
        timestamp: new Date().toISOString(),
        method,
        url,
        headers: Object.keys(headers).length > 10 ? '많은 헤더' : headers
      });
      
      console.log(`📤 [${method}] ${url}`);
    });

    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      
      let body = '';
      try {
        if (url.includes('api') || status >= 400) {
          body = await response.text();
        }
      } catch (e) {
        body = 'body를 읽을 수 없음';
      }
      
      responseLog.push({
        timestamp: new Date().toISOString(),
        status,
        url,
        headers: Object.keys(headers).length > 10 ? '많은 헤더' : headers,
        body: body.length > 500 ? body.substring(0, 500) + '...' : body
      });
      
      if (status >= 400 || url.includes('api')) {
        console.log(`📥 [${status}] ${url}`);
        if (body && body.length < 1000) {
          console.log(`   응답: ${body}`);
        }
      }
    });

    // 페이지 에러 및 콘솔 로그
    page.on('pageerror', error => {
      console.log(`🔴 페이지 에러: ${error.message}`);
      console.log(`   스택: ${error.stack}`);
    });

    page.on('console', msg => {
      const level = msg.type();
      const text = msg.text();
      
      if (level === 'error' || text.includes('TAROT') || text.includes('AI') || text.includes('error') || text.includes('Error')) {
        console.log(`📝 [${level}] ${text}`);
      }
    });
    
    // 1. 페이지 로드
    console.log('1. 타로 읽기 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    console.log('   ✅ 페이지 로드 완료');

    // 2. 질문 입력
    console.log('2. 질문 입력...');
    const questionInput = page.locator('textarea').first();
    await questionInput.fill('API 직접 테스트 질문입니다.');
    console.log('   ✅ 질문 입력 완료');

    // 3. 카드 섞기
    console.log('3. 카드 섞기...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible({ timeout: 2000 })) {
      await shuffleButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ 카드 섞기 완료');
    }

    // 4. 카드 1장 선택 (간단하게)
    console.log('4. 카드 선택...');
    const cardElement = page.locator('img[alt*="카드"]').first();
    if (await cardElement.isVisible({ timeout: 2000 })) {
      try {
        await cardElement.click({ timeout: 5000 });
        await page.waitForTimeout(1000);
        console.log('   ✅ 카드 1장 선택 완료');
      } catch (e) {
        console.log(`   ⚠️ 카드 선택 실패, 계속 진행: ${e.message}`);
      }
    }

    // 5. AI 해석 요청 전 로그 초기화
    console.log('5. AI 해석 요청 전 로그 정리...');
    requestLog.length = 0;
    responseLog.length = 0;

    // 6. AI 해석 버튼 클릭
    console.log('6. AI 해석 버튼 클릭...');
    const aiButton = page.locator('button:has-text("해석")').first();
    
    if (await aiButton.isVisible({ timeout: 2000 }) && await aiButton.isEnabled({ timeout: 1000 })) {
      console.log('   AI 해석 버튼 클릭 중...');
      await aiButton.click();
      console.log('   ✅ AI 해석 버튼 클릭 완료');
      
      // 7. 10초 동안 네트워크 활동 모니터링
      console.log('7. 네트워크 활동 모니터링 (10초)...');
      for (let i = 1; i <= 10; i++) {
        await page.waitForTimeout(1000);
        console.log(`   ${i}초 경과... (요청: ${requestLog.length}개, 응답: ${responseLog.length}개)`);
        
        // 매초마다 새로운 요청이나 응답이 있는지 확인
        if (requestLog.length > 0) {
          console.log('   📤 최근 요청들:');
          requestLog.slice(-3).forEach((req, idx) => {
            console.log(`     ${idx + 1}. [${req.method}] ${req.url}`);
          });
        }
        
        if (responseLog.length > 0) {
          console.log('   📥 최근 응답들:');
          responseLog.slice(-3).forEach((res, idx) => {
            console.log(`     ${idx + 1}. [${res.status}] ${res.url}`);
            if (res.body && res.body.trim() && res.status >= 400) {
              console.log(`       응답 내용: ${res.body.substring(0, 200)}`);
            }
          });
        }
      }
      
      // 8. 최종 네트워크 로그 분석
      console.log('8. 최종 네트워크 로그 분석...');
      console.log(`   총 요청 수: ${requestLog.length}`);
      console.log(`   총 응답 수: ${responseLog.length}`);
      
      // AI 관련 요청 찾기
      const aiRequests = requestLog.filter(req => 
        req.url.includes('ai') || req.url.includes('tarot') || req.url.includes('interpret') || req.method === 'POST'
      );
      
      const aiResponses = responseLog.filter(res => 
        res.url.includes('ai') || res.url.includes('tarot') || res.url.includes('interpret')
      );
      
      console.log(`   AI 관련 요청: ${aiRequests.length}개`);
      console.log(`   AI 관련 응답: ${aiResponses.length}개`);
      
      if (aiRequests.length > 0) {
        console.log('   🎯 AI 관련 요청 상세:');
        aiRequests.forEach((req, idx) => {
          console.log(`     ${idx + 1}. [${req.method}] ${req.url}`);
          console.log(`        시간: ${req.timestamp}`);
        });
      }
      
      if (aiResponses.length > 0) {
        console.log('   🎯 AI 관련 응답 상세:');
        aiResponses.forEach((res, idx) => {
          console.log(`     ${idx + 1}. [${res.status}] ${res.url}`);
          console.log(`        시간: ${res.timestamp}`);
          if (res.body && res.body.trim()) {
            console.log(`        응답: ${res.body}`);
          }
        });
      }
      
      // 9. UI 상태 확인
      console.log('9. 최종 UI 상태 확인...');
      
      // 에러 메시지 확인
      const errorElements = await page.locator('.error-message, .error, [data-testid*="error"], .alert-error').all();
      if (errorElements.length > 0) {
        console.log(`   ❌ 에러 메시지 발견: ${errorElements.length}개`);
        for (let i = 0; i < errorElements.length; i++) {
          try {
            const errorText = await errorElements[i].textContent();
            if (errorText && errorText.trim()) {
              console.log(`     에러 ${i + 1}: ${errorText}`);
            }
          } catch (e) {
            console.log(`     에러 ${i + 1}: 텍스트 읽기 실패`);
          }
        }
      } else {
        console.log('   ℹ️ UI에 에러 메시지 없음');
      }
      
      // 성공 결과 확인
      const resultElements = await page.locator('.interpretation-result, .ai-interpretation, [data-testid*="result"]').all();
      if (resultElements.length > 0) {
        console.log(`   ✅ 결과 발견: ${resultElements.length}개`);
      } else {
        console.log('   ⚠️ 결과 없음');
      }
      
    } else {
      console.log('   ❌ AI 해석 버튼을 클릭할 수 없습니다');
    }
    
    await page.screenshot({ path: 'direct-api-test-final.png' });
    
    console.log('🏁 직접 API 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'direct-api-test-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testDirectAPI().catch(console.error);