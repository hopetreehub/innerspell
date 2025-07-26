const { chromium } = require('playwright');

async function testHydrationFix() {
  console.log('🔍 Hydration 에러 수정 확인 시작...');
  
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // 콘솔 에러 캡처
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 페이지 에러 캡처
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // 홈페이지 접속
    const url = 'https://test-studio-firebase.vercel.app/';
    console.log(`\n📡 홈페이지 접속: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // 페이지 로딩 대기
    await page.waitForTimeout(3000);
    
    console.log('\n📊 에러 확인 결과:');
    console.log(`- 콘솔 에러 수: ${consoleErrors.length}`);
    console.log(`- 페이지 에러 수: ${pageErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ 콘솔 에러들:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (pageErrors.length > 0) {
      console.log('\n❌ 페이지 에러들:');
      pageErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // Hydration 관련 에러 체크
    const hydrationErrors = [...consoleErrors, ...pageErrors].filter(error => 
      error.includes('Hydration') || 
      error.includes('hydrat') || 
      error.includes('418') ||
      error.includes('Minified React error')
    );
    
    console.log(`\n🧪 Hydration 관련 에러: ${hydrationErrors.length}개`);
    
    if (hydrationErrors.length === 0) {
      console.log('✅ Hydration 에러가 수정된 것으로 보입니다!');
    } else {
      console.log('❌ 여전히 Hydration 에러가 있습니다:');
      hydrationErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // 블로그 페이지도 확인
    console.log('\n📡 블로그 페이지 확인...');
    await page.goto('https://test-studio-firebase.vercel.app/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const blogVisible = await page.isVisible('text=InnerSpell 블로그');
    console.log(`📝 블로그 페이지 정상 로딩: ${blogVisible ? '✅' : '❌'}`);
    
    // 스크린샷
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await page.screenshot({ 
      path: `hydration-fix-test-${timestamp}.png`,
      fullPage: true 
    });
    console.log(`\n📸 스크린샷 저장: hydration-fix-test-${timestamp}.png`);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

testHydrationFix();