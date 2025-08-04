const { chromium } = require('playwright');

async function testTarotDetail() {
  console.log('🔍 Testing tarot card detail pages...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. 타로카드 목록 페이지로 이동
    console.log('\n📱 Navigating to /tarot...');
    await page.goto('http://localhost:4000/tarot', { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    
    console.log('✅ Tarot page loaded');
    
    // 2. 카드가 로드될 때까지 대기
    await page.waitForSelector('[class*="card"]', { timeout: 10000 });
    
    // 3. 첫 번째 카드 찾기
    const firstCard = await page.locator('a[href^="/tarot/"]').first();
    const cardHref = await firstCard.getAttribute('href');
    console.log(`\n🃏 Found first card link: ${cardHref}`);
    
    // 4. 카드 클릭
    console.log('👆 Clicking on the card...');
    await firstCard.click();
    
    // 5. 상세 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 6. 현재 URL 확인
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // 7. 페이지 콘텐츠 확인
    const pageTitle = await page.title();
    const hasCardDetail = await page.locator('[class*="card-detail"], [class*="tarot-detail"], h1').count() > 0;
    const hasError = await page.locator('text=/404|not found|찾을 수 없/i').count() > 0;
    
    console.log(`\n📊 Page Analysis:`);
    console.log(`  - Title: ${pageTitle}`);
    console.log(`  - Has card detail content: ${hasCardDetail ? '✅' : '❌'}`);
    console.log(`  - Has error message: ${hasError ? '❌' : '✅ No error'}`);
    
    // 8. 스크린샷 저장
    await page.screenshot({ 
      path: 'screenshots/tarot-detail-test.png', 
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved to screenshots/tarot-detail-test.png');
    
    // 9. 직접 URL 접근 테스트
    console.log('\n🔗 Testing direct URL access...');
    await page.goto('http://localhost:4000/tarot/00-the-fool', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const directAccessUrl = page.url();
    const directAccessHasContent = await page.locator('h1').count() > 0;
    
    console.log(`  - Direct access URL: ${directAccessUrl}`);
    console.log(`  - Has content: ${directAccessHasContent ? '✅' : '❌'}`);
    
    return currentUrl.includes('/tarot/') && !hasError;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ 
      path: 'screenshots/tarot-detail-error.png', 
      fullPage: true 
    });
    return false;
  } finally {
    await browser.close();
  }
}

testTarotDetail().then(success => {
  if (success) {
    console.log('\n✅ 타로카드 상세 페이지가 정상 작동합니다.');
  } else {
    console.log('\n❌ 타로카드 상세 페이지에 문제가 있습니다.');
  }
});