const { chromium } = require('playwright');

async function simpleVercelTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 간단한 Vercel 테스트 시작...');
    
    // 에러 및 로그 수집
    page.on('console', msg => {
      const level = msg.type();
      const text = msg.text();
      console.log(`📝 [${level}] ${text}`);
    });

    page.on('pageerror', error => {
      console.log(`🔴 페이지 에러: ${error.message}`);
    });

    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      if (status >= 400) {
        console.log(`❌ HTTP 에러: ${status} ${url}`);
      }
    });
    
    // 1. 직접 타로 읽기 페이지로 이동
    console.log('1. 타로 읽기 페이지 직접 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000); // 5초 대기
    await page.screenshot({ path: 'simple-01-reading-page.png' });
    console.log('   ✅ 타로 읽기 페이지 로드 완료');

    // 2. 페이지 구조 확인
    console.log('2. 페이지 구조 확인...');
    const title = await page.title();
    console.log(`   페이지 제목: ${title}`);
    
    // 모든 버튼 찾기
    const buttons = await page.locator('button').all();
    console.log(`   전체 버튼 수: ${buttons.length}`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      try {
        const buttonText = await buttons[i].textContent();
        const isVisible = await buttons[i].isVisible();
        console.log(`   버튼 ${i + 1}: "${buttonText}" (보임: ${isVisible})`);
      } catch (e) {
        console.log(`   버튼 ${i + 1}: 텍스트 읽기 실패`);
      }
    }

    // 3. 입력 필드 확인
    console.log('3. 입력 필드 확인...');
    const inputs = await page.locator('input, textarea').all();
    console.log(`   전체 입력 필드 수: ${inputs.length}`);

    // 4. 에러 메시지나 경고 확인
    console.log('4. 에러 메시지 확인...');
    const errorSelectors = [
      '.error',
      '.error-message',
      '[data-testid*="error"]',
      '.alert-error',
      '.text-red'
    ];
    
    for (const selector of errorSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`   발견된 에러 요소 (${selector}): ${elements.length}개`);
          for (let i = 0; i < elements.length; i++) {
            const text = await elements[i].textContent();
            console.log(`     에러 ${i + 1}: ${text}`);
          }
        }
      } catch (e) {
        // 계속
      }
    }

    // 5. 간단한 질문 입력 시도
    console.log('5. 질문 입력 시도...');
    try {
      const questionInput = page.locator('textarea').first();
      if (await questionInput.isVisible({ timeout: 5000 })) {
        await questionInput.fill('테스트 질문입니다.');
        console.log('   ✅ 질문 입력 성공');
        await page.screenshot({ path: 'simple-02-question-entered.png' });
      } else {
        console.log('   ⚠️ 질문 입력 필드를 찾을 수 없습니다');
      }
    } catch (e) {
      console.log(`   ❌ 질문 입력 실패: ${e.message}`);
    }

    // 6. AI 관련 버튼 찾기
    console.log('6. AI 관련 기능 확인...');
    const aiKeywords = ['AI', 'ai', '해석', '생성', 'interpret', 'generate'];
    
    for (const keyword of aiKeywords) {
      try {
        const elements = await page.locator(`button:has-text("${keyword}")`).all();
        if (elements.length > 0) {
          console.log(`   "${keyword}" 버튼 발견: ${elements.length}개`);
        }
      } catch (e) {
        // 계속
      }
    }

    // 최종 스크린샷
    await page.screenshot({ path: 'simple-03-final-state.png' });
    
    console.log('🏁 간단한 Vercel 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'simple-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
simpleVercelTest().catch(console.error);