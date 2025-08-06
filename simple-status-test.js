const { chromium } = require('playwright');

async function simpleStatusTest() {
  console.log('🔍 간단한 상태 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1200,800']
  });
  
  const page = await browser.newPage();
  
  try {
    // 매우 긴 타임아웃으로 실제 상황 확인
    console.log('🔄 페이지 로딩 시도 (60초 타임아웃)...');
    const startTime = Date.now();
    
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ 페이지 로딩 성공! (${loadTime}ms)`);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📋 페이지 제목: "${title}"`);
    
    // 에러 요소 확인
    const errorTexts = await page.$$eval('*', (elements) => {
      return elements
        .filter(el => el.textContent && el.textContent.toLowerCase().includes('error'))
        .map(el => el.textContent.slice(0, 100))
        .filter(text => text.length > 5);
    });
    
    if (errorTexts.length > 0) {
      console.log('❌ 페이지에서 발견된 에러들:');
      errorTexts.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    } else {
      console.log('✅ 페이지에서 에러가 발견되지 않음');
    }
    
    // 기본적인 콘텐츠 확인
    const bodyText = await page.textContent('body');
    const hasContent = bodyText && bodyText.length > 100;
    console.log(`📄 콘텐츠 존재: ${hasContent ? '✅' : '❌'} (${bodyText ? bodyText.length : 0} characters)`);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: `simple-status-${Date.now()}.png`,
      fullPage: true
    });
    console.log('📸 스크린샷 저장 완료');
    
  } catch (error) {
    console.log('💥 테스트 실패:', error.message);
    
    // 에러 스크린샷
    try {
      await page.screenshot({ 
        path: `simple-status-ERROR-${Date.now()}.png`,
        fullPage: true
      });
      console.log('📸 에러 스크린샷 저장');
    } catch (e) {
      console.log('❌ 에러 스크린샷 저장 실패');
    }
  } finally {
    await browser.close();
    console.log('🔄 브라우저 종료');
  }
}

simpleStatusTest().catch(console.error);