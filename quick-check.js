const { chromium } = require('playwright');

async function quickCheck() {
  console.log('🚀 빠른 상태 확인...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔄 페이지 접속 시도...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log('✅ 페이지 접속 성공!');
    
    // 로딩 스피너 확인
    const hasSpinner = await page.locator('[class*="spinner"], [class*="loading"]').count() > 0;
    
    // 실제 콘텐츠 확인
    const hasContent = await page.locator('main, article, section').count() > 0;
    const hasNavigation = await page.locator('nav').count() > 0;
    
    console.log(`🎯 결과:`);
    console.log(`   - 로딩 스피너: ${hasSpinner ? '있음' : '없음'}`);
    console.log(`   - 메인 콘텐츠: ${hasContent ? '있음' : '없음'}`);
    console.log(`   - 네비게이션: ${hasNavigation ? '있음' : '없음'}`);
    
    // 제목 확인
    const title = await page.title();
    console.log(`   - 페이지 제목: "${title}"`);
    
    // 스크린샷
    await page.screenshot({ path: 'quick-check-result.png', fullPage: false });
    console.log('📸 스크린샷 저장: quick-check-result.png');
    
  } catch (error) {
    console.log('❌ 페이지 접속 실패:', error.message);
  } finally {
    await browser.close();
  }
}

quickCheck().catch(console.error);