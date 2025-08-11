const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('타로 리딩 페이지 접속 중...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 페이지 완전 로드 대기
    await page.waitForTimeout(5000);
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'reading-page-initial.png',
      fullPage: true 
    });
    
    console.log('초기 페이지 스크린샷 저장됨: reading-page-initial.png');
    
    // 페이지 구조 확인
    const pageContent = await page.content();
    console.log('\n페이지에 "질문" 텍스트가 있는지 확인:', pageContent.includes('질문'));
    console.log('페이지에 "타로" 텍스트가 있는지 확인:', pageContent.includes('타로'));
    
    // 모든 텍스트 영역 찾기
    const textareas = await page.$$('textarea');
    console.log(`\n발견된 textarea 수: ${textareas.length}`);
    
    // 모든 버튼 찾기
    const buttons = await page.$$('button');
    console.log(`발견된 button 수: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length && i < 5; i++) {
      const text = await buttons[i].textContent();
      console.log(`버튼 ${i + 1}: ${text}`);
    }
    
    // 브라우저 열어둔 채로 대기
    console.log('\n브라우저를 닫으려면 Ctrl+C를 누르세요.');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'error-page.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();