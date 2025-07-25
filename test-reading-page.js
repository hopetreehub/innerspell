const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('타로 읽기 페이지 상세 테스트 시작...');
    
    // 타로 읽기 페이지로 직접 이동
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/02_reading_page.png' });
    console.log('✓ 타로 읽기 페이지 로드 완료');
    
    // 페이지 요소 확인
    const elements = {
      questionInput: await page.isVisible('textarea'),
      shuffleButton: await page.isVisible('button:has-text("셔플")'),
      cards: await page.$$('.card, [data-testid="card"]'),
      interpretButton: await page.isVisible('button:has-text("해석")')
    };
    
    console.log('\n페이지 요소 상태:');
    console.log(`- 질문 입력란: ${elements.questionInput ? '있음' : '없음'}`);
    console.log(`- 셔플 버튼: ${elements.shuffleButton ? '있음' : '없음'}`);
    console.log(`- 카드 개수: ${elements.cards.length}개`);
    console.log(`- 해석 버튼: ${elements.interpretButton ? '있음' : '없음'}`);
    
    // Firebase 인증 상태 확인
    const authState = await page.evaluate(() => {
      return window.localStorage.getItem('firebase:authUser:AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg:[DEFAULT]');
    });
    console.log(`\nFirebase 인증 상태: ${authState ? '로그인됨' : '로그인 안됨'}`);
    
    // 공유 기능 관련 요소 확인
    const shareButton = await page.isVisible('button:has-text("공유")');
    console.log(`공유 버튼: ${shareButton ? '있음' : '없음'}`);
    
    console.log('\n테스트 완료!');
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ path: 'screenshots/reading_error.png' });
  } finally {
    console.log('\n브라우저를 열어둔 상태입니다.');
  }
})();