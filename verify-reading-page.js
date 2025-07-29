const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('브라우저 시작...');
  
  try {
    // 페이지 이동
    console.log('타로리딩 페이지로 이동 중...');
    await page.goto('https://test-studio-firebase-buz4i1pbo-johns-projects-bf5e60f3.vercel.app/reading', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 페이지 로딩 완료 후 3초 대기
    console.log('페이지 로딩 완료, 3초 대기 중...');
    await page.waitForTimeout(3000);
    
    // 타임스탬프 생성
    const timestamp = Date.now();
    const screenshotPath = `screenshots/reading-page-verification-${timestamp}.png`;
    
    // 풀페이지 스크린샷 촬영
    console.log('풀페이지 스크린샷 촬영 중...');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`스크린샷 저장 완료: ${screenshotPath}`);
    
    // 주요 요소 확인
    console.log('\n=== 주요 요소 확인 ===');
    
    // 1. 타로 카드 덱 확인
    const cardDeck = await page.$$('.card-back, .tarot-card, [class*="card"]');
    console.log(`1. 타로 카드 덱: ${cardDeck.length}개의 카드 요소 발견`);
    
    // 2. 질문 입력 필드 확인
    const questionInput = await page.$('input[type="text"], textarea, [placeholder*="질문"], [placeholder*="question"]');
    console.log(`2. 질문 입력 필드: ${questionInput ? '존재함' : '찾을 수 없음'}`);
    
    // 3. 카드 선택 가능 여부 확인
    if (cardDeck.length > 0) {
      console.log('3. 카드 선택 기능 테스트 중...');
      try {
        // 첫 번째 카드 클릭 시도
        await cardDeck[0].click();
        await page.waitForTimeout(1000);
        
        // 선택된 카드 확인
        const selectedCards = await page.$$('.selected, .flipped, [class*="selected"]');
        console.log(`   - 선택된 카드: ${selectedCards.length}개`);
      } catch (error) {
        console.log('   - 카드 클릭 중 오류:', error.message);
      }
    }
    
    // 4. 전체 UI 레이아웃 분석
    console.log('\n4. UI 레이아웃 분석:');
    
    // 페이지 제목
    const pageTitle = await page.title();
    console.log(`   - 페이지 제목: ${pageTitle}`);
    
    // 주요 컨테이너 확인
    const mainContainer = await page.$('main, .main-container, #root');
    console.log(`   - 메인 컨테이너: ${mainContainer ? '존재함' : '찾을 수 없음'}`);
    
    // 버튼 요소들
    const buttons = await page.$$('button');
    console.log(`   - 버튼 개수: ${buttons.length}개`);
    
    // 페이지 내 텍스트 일부 추출
    const pageText = await page.evaluate(() => {
      const body = document.body;
      return body ? body.innerText.substring(0, 200) : '';
    });
    console.log(`\n페이지 텍스트 미리보기:\n${pageText}...`);
    
    // 추가 스크린샷 - 뷰포트만
    const viewportScreenshot = `screenshots/reading-page-viewport-${timestamp}.png`;
    await page.screenshot({
      path: viewportScreenshot,
      fullPage: false
    });
    console.log(`\n뷰포트 스크린샷 저장: ${viewportScreenshot}`);
    
  } catch (error) {
    console.error('오류 발생:', error);
    
    // 오류 시 스크린샷
    const errorScreenshot = `screenshots/reading-page-error-${Date.now()}.png`;
    await page.screenshot({ path: errorScreenshot, fullPage: true });
    console.log(`오류 스크린샷 저장: ${errorScreenshot}`);
  } finally {
    // 브라우저는 열어둠 (수동 확인 가능)
    console.log('\n브라우저를 수동으로 닫으려면 Ctrl+C를 누르세요.');
    // await browser.close();
  }
})();