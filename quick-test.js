const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  const page = await browser.newPage();
  
  try {
    console.log('\\n간단한 Vercel 배포 테스트 시작...\\n');
    
    // domcontentloaded로 빠르게 로드
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('페이지 로드 성공!');
    
    // 빠른 스크린샷
    await page.screenshot({ path: 'quick-test.png' });
    console.log('스크린샷 저장: quick-test.png');
    
    // 기본 정보 수집
    const title = await page.title();
    const url = page.url();
    
    console.log('\\n페이지 정보:');
    console.log('- URL:', url);
    console.log('- 타이틀:', title);
    
    // HTML 일부 확인
    const bodyText = await page.textContent('body').catch(() => '');
    console.log('- 페이지 텍스트 길이:', bodyText.length, '문자');
    console.log('- InnerSpell 포함:', bodyText.includes('InnerSpell') ? '예' : '아니오');
    
  } catch (error) {
    console.error('에러:', error.message);
  } finally {
    await browser.close();
  }
})();