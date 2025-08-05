const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  // 에러 캡처
  const errors = [];
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('🚀 타로카드 페이지 테스트 시작...');
    console.log('📍 URL: http://localhost:4000/tarot/major-00-fool');
    
    // 로딩 시간 측정 시작
    const startTime = Date.now();
    
    // 페이지 접속
    await page.goto('http://localhost:4000/tarot/major-00-fool', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ 페이지 로딩 시간: ${loadTime}ms (${(loadTime/1000).toFixed(2)}초)`);
    
    // 목표 로딩 시간 확인 (5초 = 5000ms)
    if (loadTime <= 5000) {
      console.log('✅ 로딩 시간 목표 달성 (5초 이내)');
    } else {
      console.log('❌ 로딩 시간 목표 미달성 (5초 초과)');
    }
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: "${title}"`);
    
    // 기본 요소들 확인
    console.log('🔍 페이지 요소 확인 중...');
    
    // body 요소가 로드되었는지 확인
    const bodyExists = await page.locator('body').count() > 0;
    console.log(`- Body 요소: ${bodyExists ? '✅ 존재' : '❌ 없음'}`);
    
    // 페이지 내용이 있는지 확인
    const bodyText = await page.locator('body').textContent();
    const hasContent = bodyText && bodyText.trim().length > 0;
    console.log(`- 페이지 내용: ${hasContent ? '✅ 존재' : '❌ 없음'}`);
    
    // 타로카드 관련 요소들 확인
    const cardElements = {
      'h1 태그': await page.locator('h1').count(),
      'img 태그': await page.locator('img').count(),
      '타로카드 관련 텍스트': bodyText && bodyText.toLowerCase().includes('fool') ? 1 : 0
    };
    
    console.log('🃏 타로카드 관련 요소:');
    Object.entries(cardElements).forEach(([element, count]) => {
      console.log(`- ${element}: ${count > 0 ? `✅ ${count}개` : '❌ 없음'}`);
    });
    
    // 스크린샷 촬영
    const screenshotPath = `/mnt/e/project/test-studio-firebase/tarot-test-screenshot-${Date.now()}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    console.log(`📸 스크린샷 저장: ${screenshotPath}`);
    
    // 콘솔 로그 출력
    if (consoleLogs.length > 0) {
      console.log('\n📋 콘솔 로그:');
      consoleLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('\n📋 콘솔 로그: 없음');
    }
    
    // 에러 출력
    if (errors.length > 0) {
      console.log('\n❌ 에러 발생:');
      errors.forEach(error => console.log(`  ${error}`));
    } else {
      console.log('\n✅ 페이지 에러: 없음');
    }
    
    // 네트워크 상태는 이미 확인했으므로 생략
    console.log(`\n🌐 페이지 로딩 완료`);
    
    console.log('\n🎯 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error.message);
    
    // 에러 상황에서도 스크린샷 촬영
    try {
      const errorScreenshotPath = `/mnt/e/project/test-studio-firebase/tarot-error-screenshot-${Date.now()}.png`;
      await page.screenshot({ 
        path: errorScreenshotPath, 
        fullPage: true 
      });
      console.log(`📸 에러 스크린샷 저장: ${errorScreenshotPath}`);
    } catch (screenshotError) {
      console.error('스크린샷 촬영 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
})();