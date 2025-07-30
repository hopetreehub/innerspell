const { chromium } = require('playwright');

async function testVercelDeployment() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Vercel 배포 환경 테스트 시작...');
    
    // 1. 메인 페이지 로드
    console.log('1. 메인 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // 추가 로딩 대기
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'vercel-01-main-page.png' });
    console.log('   ✅ 메인 페이지 로드 완료');

    // 2. 타로 읽기 페이지로 이동
    console.log('2. 타로 읽기 페이지로 이동...');
    const readingLink = page.locator('a[href="/reading"]').first();
    await readingLink.click();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'vercel-02-reading-page.png' });
    console.log('   ✅ 타로 읽기 페이지 로드 완료');

    // 3. 질문 입력
    console.log('3. 질문 입력...');
    const questionInput = page.locator('textarea[placeholder*="질문"]').first();
    await questionInput.fill('AI 해석 테스트를 위한 질문입니다.');
    
    await page.screenshot({ path: 'vercel-03-question-entered.png' });
    console.log('   ✅ 질문 입력 완료');

    // 4. 카드 선택 (3장)
    console.log('4. 카드 선택...');
    const cards = page.locator('.tarot-card, [data-testid*="card"]').first();
    
    // 카드가 로드될 때까지 대기
    await page.waitForSelector('.tarot-card, [data-testid*="card"], .card', { timeout: 10000 });
    
    // 첫 3장 카드 클릭
    const cardElements = await page.locator('.tarot-card, [data-testid*="card"], .card').all();
    console.log(`   발견된 카드 수: ${cardElements.length}`);
    
    for (let i = 0; i < Math.min(3, cardElements.length); i++) {
      await cardElements[i].click();
      await page.waitForTimeout(500); // 각 카드 선택 후 잠시 대기
    }
    
    await page.screenshot({ path: 'vercel-04-cards-selected.png' });
    console.log('   ✅ 카드 선택 완료');

    // 5. AI 해석 버튼 클릭
    console.log('5. AI 해석 요청...');
    
    // AI 해석 버튼 찾기 (여러 가능한 선택자 시도)
    const aiButtonSelectors = [
      'button:has-text("AI 해석")',
      'button:has-text("해석")',
      'button[data-testid*="ai"]',
      'button[data-testid*="interpret"]',
      'button:has-text("생성")',
      '.ai-button',
      '.interpret-button'
    ];
    
    let aiButton = null;
    for (const selector of aiButtonSelectors) {
      try {
        aiButton = page.locator(selector).first();
        if (await aiButton.isVisible({ timeout: 1000 })) {
          console.log(`   발견된 AI 버튼: ${selector}`);
          break;
        }
      } catch (e) {
        // 계속 다음 선택자 시도
      }
      aiButton = null;
    }
    
    if (!aiButton) {
      console.log('   ⚠️ AI 해석 버튼을 찾을 수 없습니다. 페이지 구조 확인...');
      
      // 페이지의 모든 버튼 찾기
      const allButtons = await page.locator('button').all();
      console.log(`   페이지의 전체 버튼 수: ${allButtons.length}`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`   버튼 ${i + 1}: "${buttonText}"`);
      }
      
      await page.screenshot({ path: 'vercel-05-no-ai-button.png' });
      throw new Error('AI 해석 버튼을 찾을 수 없습니다');
    }
    
    // AI 해석 버튼 클릭
    await aiButton.click();
    console.log('   ✅ AI 해석 버튼 클릭 완료');
    
    await page.screenshot({ path: 'vercel-06-ai-request-sent.png' });

    // 6. AI 해석 결과 대기 및 에러 확인
    console.log('6. AI 해석 결과 대기...');
    
    // 로딩 상태나 결과를 최대 30초 대기
    try {
      await page.waitForSelector('.interpretation-result, .error-message, .ai-interpretation, [data-testid*="result"]', { 
        timeout: 30000 
      });
      
      // 에러 메시지 확인
      const errorElements = await page.locator('.error-message, .error, [data-testid*="error"]').all();
      
      if (errorElements.length > 0) {
        console.log('   ❌ 에러 발생!');
        for (let i = 0; i < errorElements.length; i++) {
          const errorText = await errorElements[i].textContent();
          console.log(`   에러 ${i + 1}: ${errorText}`);
        }
      }
      
      // 성공적인 해석 결과 확인
      const resultElements = await page.locator('.interpretation-result, .ai-interpretation, [data-testid*="result"]').all();
      
      if (resultElements.length > 0) {
        console.log('   ✅ AI 해석 결과 생성됨');
        for (let i = 0; i < resultElements.length; i++) {
          const resultText = await resultElements[i].textContent();
          console.log(`   결과 ${i + 1}: ${resultText.substring(0, 100)}...`);
        }
      }
      
    } catch (waitError) {
      console.log('   ⏰ 타임아웃: AI 해석 결과를 기다리는 중 시간 초과');
    }
    
    await page.screenshot({ path: 'vercel-07-final-result.png' });
    
    // 7. 콘솔 로그에서 에러 확인
    console.log('7. 브라우저 콘솔 로그 확인...');
    
    page.on('console', msg => {
      const level = msg.type();
      const text = msg.text();
      if (level === 'error') {
        console.log(`   🔴 콘솔 에러: ${text}`);
      } else if (text.includes('AI') || text.includes('error') || text.includes('Error')) {
        console.log(`   🟡 콘솔 로그: [${level}] ${text}`);
      }
    });

    // 8. 네트워크 요청 확인
    console.log('8. 네트워크 요청 모니터링...');
    
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('api') || url.includes('ai') || url.includes('tarot')) {
        console.log(`   📡 API 응답: ${status} ${url}`);
        
        if (status >= 400) {
          console.log(`   ❌ API 에러: ${status} ${url}`);
        }
      }
    });
    
    // 추가로 5초 대기하여 모든 로그 수집
    await page.waitForTimeout(5000);
    
    console.log('🏁 Vercel 배포 환경 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'vercel-error-final.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testVercelDeployment().catch(console.error);