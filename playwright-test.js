const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 1. 홈페이지 접속
    console.log('1. 홈페이지 접속 중...');
    await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
    console.log('홈페이지 스크린샷 저장 완료');
    
    // 2. /tarot-guidelines 페이지 접속
    console.log('\n2. /tarot-guidelines 페이지 접속 중...');
    await page.goto('http://localhost:4000/tarot-guidelines', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const tarotTitle = await page.title();
    console.log(`페이지 제목: ${tarotTitle}`);
    await page.screenshot({ path: 'tarot-guidelines-screenshot.png', fullPage: true });
    console.log('타로 가이드라인 페이지 스크린샷 저장 완료');
    
    // 3. /admin 페이지 접속
    console.log('\n3. /admin 페이지 접속 중...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const adminTitle = await page.title();
    console.log(`페이지 제목: ${adminTitle}`);
    
    // 관리자 페이지 내용 확인
    const adminContent = await page.textContent('body');
    if (adminContent.includes('로그인') || adminContent.includes('Sign in') || adminContent.includes('Login')) {
      console.log('관리자 페이지: 로그인 페이지로 리다이렉트됨');
    } else if (adminContent.includes('대시보드') || adminContent.includes('Dashboard')) {
      console.log('관리자 페이지: 대시보드 접근 가능');
    }
    
    await page.screenshot({ path: 'admin-screenshot.png', fullPage: true });
    console.log('관리자 페이지 스크린샷 저장 완료');
    
  } catch (error) {
    console.error('에러 발생:', error.message);
  } finally {
    await browser.close();
    console.log('\n테스트 완료!');
  }
})();