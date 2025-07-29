const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('브라우저 시작...');
  
  try {
    console.log('타로리딩 페이지로 이동 중...');
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    console.log('페이지 로딩 완료, 3초 대기 중...');
    await page.waitForTimeout(3000);
    
    const timestamp = Date.now();
    const screenshotPath = `screenshots/reading-page-verification-${timestamp}.png`;
    
    console.log('풀페이지 스크린샷 촬영 중...');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`스크린샷 저장 완료: ${screenshotPath}`);
    
    // 페이지 제목 확인
    const pageTitle = await page.title();
    console.log(`페이지 제목: ${pageTitle}`);
    
    // 주요 요소 확인
    console.log('\n=== 주요 요소 확인 ===');
    
    // 1. 타로 관련 텍스트 확인
    const hasSpellText = await page.getByText('AI 타로').isVisible();
    console.log(`1. AI 타로 텍스트: ${hasSpellText ? '표시됨' : '찾을 수 없음'}`);
    
    // 2. 질문 입력 필드 확인
    const questionField = await page.locator('textarea[placeholder*="카드에게"]').first();
    const questionFieldVisible = await questionField.isVisible().catch(() => false);
    console.log(`2. 질문 입력 필드: ${questionFieldVisible ? '존재함' : '찾을 수 없음'}`);
    
    // 3. 카드 덱 확인
    const cardDeck = await page.locator('div').filter({ hasText: '덱 (섞기)' }).first();
    const cardDeckVisible = await cardDeck.isVisible().catch(() => false);
    console.log(`3. 카드 덱: ${cardDeckVisible ? '표시됨' : '찾을 수 없음'}`);
    
    // 4. 카드 섞기 버튼 확인
    const shuffleButton = await page.getByRole('button', { name: /카드 섞기|Shuffle/ });
    const shuffleButtonVisible = await shuffleButton.isVisible().catch(() => false);
    console.log(`4. 카드 섞기 버튼: ${shuffleButtonVisible ? '존재함' : '찾을 수 없음'}`);
    
    // 5. 스프레드 선택 드롭다운 확인
    const spreadSelect = await page.locator('select, [role="combobox"]').first();
    const spreadSelectVisible = await spreadSelect.isVisible().catch(() => false);
    console.log(`5. 스프레드 선택: ${spreadSelectVisible ? '존재함' : '찾을 수 없음'}`);
    
    console.log('\n=== 전체적인 UI 레이아웃 확인 ===');
    
    // 메인 컨테이너들
    const mainContainers = await page.locator('div[class*="space-y"], main, .container').count();
    console.log(`메인 컨테이너: ${mainContainers}개`);
    
    // 카드 컴포넌트들
    const cardComponents = await page.locator('[class*="card"], .card').count();
    console.log(`카드 컴포넌트: ${cardComponents}개`);
    
    // 버튼들
    const buttons = await page.locator('button').count();
    console.log(`버튼 개수: ${buttons}개`);
    
    console.log('\n=== 기능 테스트 ===');
    
    if (questionFieldVisible) {
      console.log('질문 입력 필드에 테스트 텍스트 입력 중...');
      await questionField.fill('테스트 질문: 오늘의 운세는?');
      console.log('질문 입력 완료');
    }
    
    if (shuffleButtonVisible) {
      console.log('카드 섞기 버튼 클릭 테스트...');
      try {
        await shuffleButton.click();
        await page.waitForTimeout(2000); // 애니메이션 기다리기
        console.log('카드 섞기 성공');
      } catch (error) {
        console.log('카드 섞기 오류:', error.message);
      }
    }
    
    // 최종 스크린샷
    const finalScreenshot = `screenshots/reading-page-final-${timestamp}.png`;
    await page.screenshot({
      path: finalScreenshot,
      fullPage: true
    });
    console.log(`최종 스크린샷 저장: ${finalScreenshot}`);
    
  } catch (error) {
    console.error('오류 발생:', error);
    
    const errorScreenshot = `screenshots/reading-page-error-${Date.now()}.png`;
    await page.screenshot({ path: errorScreenshot, fullPage: true });
    console.log(`오류 스크린샷 저장: ${errorScreenshot}`);
  } finally {
    console.log('\n5초 후 브라우저 종료...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();