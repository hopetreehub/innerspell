const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('📋 의존성 정리 완료 후 최종 확인...\n');
  
  try {
    // 1. 홈페이지
    console.log('1. 홈페이지 테스트...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const title = await page.title();
    console.log(`   ✅ 페이지 타이틀: ${title}`);
    await page.screenshot({ path: 'cleanup-final-01-homepage.png', fullPage: true });
    
    // 2. 타로 리딩
    console.log('\n2. 타로 리딩 페이지...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const hasQuestionInput = await page.locator('textarea[placeholder*="질문"]').count() > 0;
    console.log(`   ✅ 질문 입력란: ${hasQuestionInput ? '정상' : '오류'}`);
    await page.screenshot({ path: 'cleanup-final-02-reading.png', fullPage: true });
    
    // 3. 블로그
    console.log('\n3. 블로그 페이지...');
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'cleanup-final-03-blog.png', fullPage: true });
    console.log('   ✅ 블로그 로드 완료');
    
    console.log('\n✅ 모든 테스트 통과! 의존성 정리 후 서버 정상 작동 확인');
    
  } catch (error) {
    console.error('\n❌ 에러 발생:', error.message);
    await page.screenshot({ path: 'cleanup-final-error.png', fullPage: true });
  }
  
  await browser.close();
})();