const { chromium } = require('playwright');

async function testTarotReading() {
  console.log('타로 리딩 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 타로 페이지 접속
    console.log('1. 타로 페이지 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'verification-screenshots/01-tarot-page.png' });
    
    // 2. 질문 입력
    console.log('2. 질문 입력 중...');
    const questionInput = page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"], input[type="text"]').first();
    await questionInput.fill('나의 미래는 어떻게 될까요?');
    await page.screenshot({ path: 'verification-screenshots/02-question-input.png' });
    
    // 3. 스프레드 선택 (원카드 또는 기본 스프레드)
    console.log('3. 스프레드 선택 중...');
    const spreadSelector = page.locator('select, button:has-text("스프레드"), button:has-text("원카드")').first();
    if (await spreadSelector.count() > 0) {
      await spreadSelector.click();
    }
    await page.screenshot({ path: 'verification-screenshots/03-spread-selected.png' });
    
    // 4. 카드 섞기 버튼 클릭
    console.log('4. 카드 섞기 중...');
    const shuffleButton = page.locator('button:has-text("카드 섞기"), button:has-text("섞기"), button:has-text("시작")').first();
    if (await shuffleButton.count() > 0) {
      await shuffleButton.click();
      await page.waitForTimeout(3000); // 섞기 애니메이션 대기
    }
    await page.screenshot({ path: 'verification-screenshots/04-cards-shuffled.png' });
    
    // 5. 카드 펼치기
    console.log('5. 카드 펼치기 중...');
    const spreadButton = page.locator('button:has-text("카드 펼치기"), button:has-text("펼치기")').first();
    if (await spreadButton.count() > 0) {
      await spreadButton.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'verification-screenshots/05-cards-spread.png' });
    
    // 6. 카드 선택
    console.log('6. 카드 선택 중...');
    const cardElement = page.locator('.card, [class*="card"], img[alt*="카드"]').first();
    if (await cardElement.count() > 0) {
      await cardElement.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: 'verification-screenshots/06-card-selected.png' });
    
    // 7. AI 해석 요청
    console.log('7. AI 해석 요청 중...');
    const interpretButton = page.locator('button:has-text("AI 해석"), button:has-text("해석"), button:has-text("결과")').first();
    if (await interpretButton.count() > 0) {
      // 콘솔 로그 수집 시작
      page.on('console', msg => {
        console.log(`브라우저 콘솔: ${msg.type()}: ${msg.text()}`);
      });
      
      // 네트워크 요청 모니터링
      page.on('response', response => {
        if (response.url().includes('api') || response.url().includes('gpt') || response.url().includes('openai')) {
          console.log(`API 응답: ${response.status()} ${response.url()}`);
        }
      });
      
      await interpretButton.click();
      
      // AI 응답 대기 (최대 30초)
      console.log('AI 응답 대기 중...');
      await page.waitForTimeout(5000);
      
      // 오류 메시지 확인
      const errorMessage = await page.locator('text=/error/i, text=/오류/i, text=/NOT_FOUND/i, text=/gpt-3.5-turbo/i').first();
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent();
        console.log(`❌ 오류 발견: ${errorText}`);
        await page.screenshot({ path: 'verification-screenshots/07-error-found.png' });
      } else {
        console.log('✅ 오류가 발견되지 않았습니다.');
        await page.screenshot({ path: 'verification-screenshots/07-no-error.png' });
      }
    }
    
    // 최종 페이지 상태 캡처
    await page.screenshot({ path: 'verification-screenshots/08-final-state.png' });
    
    // 개발자 도구 콘솔 내용 캡처
    const consoleLogs = await page.evaluate(() => {
      return window.console._logs || [];
    });
    
    console.log('개발자 도구 콘솔 로그:', consoleLogs);
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'verification-screenshots/error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testTarotReading().catch(console.error);