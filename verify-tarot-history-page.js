const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== 타로 히스토리 페이지 최종 확인 ===\n');
    
    // 타로 히스토리 페이지로 직접 이동
    console.log('타로 히스토리 페이지 접속 중...');
    const response = await page.goto('http://localhost:4000/tarot/history', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('HTTP 상태:', response?.status());
    
    // 페이지 로드 완료 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 페이지 정보 수집
    const pageInfo = await page.evaluate(() => {
      const title = document.title;
      const h1Element = document.querySelector('h1');
      const bodyText = document.body.innerText;
      
      return {
        title: title,
        h1Text: h1Element ? h1Element.innerText : null,
        hasLoginText: bodyText.includes('로그인'),
        hasTarotText: bodyText.includes('타로'),
        hasHistoryText: bodyText.includes('기록') || bodyText.includes('히스토리'),
        has404Text: bodyText.includes('404'),
        hasCardComponent: document.querySelectorAll('[class*="card"]').length > 0,
        url: window.location.href
      };
    });
    
    console.log('\n페이지 분석 결과:');
    console.log('- URL:', pageInfo.url);
    console.log('- 타이틀:', pageInfo.title);
    console.log('- H1 텍스트:', pageInfo.h1Text);
    console.log('- 로그인 텍스트 포함:', pageInfo.hasLoginText);
    console.log('- 타로 텍스트 포함:', pageInfo.hasTarotText);
    console.log('- 히스토리/기록 텍스트 포함:', pageInfo.hasHistoryText);
    console.log('- 404 에러 표시:', pageInfo.has404Text);
    console.log('- Card 컴포넌트 존재:', pageInfo.hasCardComponent);
    
    // 로그인 필요 메시지 확인
    const loginRequired = await page.locator('text=/로그인이 필요합니다/').isVisible().catch(() => false);
    console.log('- 로그인 필요 메시지:', loginRequired);
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'tarot-history-verified.png', fullPage: true });
    console.log('\n스크린샷 저장: tarot-history-verified.png');
    
    // 페이지가 404인 경우 추가 디버깅
    if (pageInfo.has404Text) {
      console.log('\n⚠️  404 에러 발생! 추가 디버깅 정보:');
      
      // 네트워크 요청 로그
      const requests = [];
      page.on('request', request => {
        if (request.url().includes('tarot')) {
          requests.push({
            url: request.url(),
            method: request.method()
          });
        }
      });
      
      // 페이지 리로드
      await page.reload();
      await page.waitForTimeout(2000);
      
      console.log('관련 네트워크 요청:', requests);
    }
    
  } catch (error) {
    console.error('\n❌ 에러 발생:', error.message);
    await page.screenshot({ path: 'tarot-history-error-final.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();