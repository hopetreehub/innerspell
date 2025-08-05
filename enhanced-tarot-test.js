const { chromium } = require('playwright');

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
    console.log('🚀 향상된 타로카드 페이지 테스트 시작...');
    console.log('📍 URL: http://localhost:4000/tarot/major-00-fool');
    
    const startTime = Date.now();
    
    // 페이지 접속 (더 관대한 조건으로)
    await page.goto('http://localhost:4000/tarot/major-00-fool', { 
      waitUntil: 'load',
      timeout: 10000 
    });
    
    // 추가로 2초 더 기다려서 React 컴포넌트가 완전히 렌더링되도록 함
    console.log('⏳ React 컴포넌트 렌더링을 위해 2초 대기...');
    await page.waitForTimeout(2000);
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ 총 로딩 시간: ${loadTime}ms (${(loadTime/1000).toFixed(2)}초)`);
    
    if (loadTime <= 5000) {
      console.log('✅ 로딩 시간 목표 달성 (5초 이내)');
    } else {
      console.log('❌ 로딩 시간 목표 미달성 (5초 초과)');
    }
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: "${title}"`);
    
    // 페이지 URL 확인
    const currentUrl = page.url();
    console.log(`🔗 현재 URL: ${currentUrl}`);
    
    // 로딩 스피너가 사라질 때까지 대기
    try {
      console.log('🔄 로딩 스피너 확인 중...');
      const spinnerExists = await page.locator('.animate-spin, [role="status"], .loading').count() > 0;
      if (spinnerExists) {
        console.log('⏳ 로딩 스피너 발견, 완료까지 대기...');
        await page.waitForSelector('.animate-spin, [role="status"], .loading', { 
          state: 'detached', 
          timeout: 10000 
        });
        console.log('✅ 로딩 완료');
      } else {
        console.log('✅ 로딩 스피너 없음');
      }
    } catch (spinnerError) {
      console.log('⚠️ 로딩 스피너 대기 중 타임아웃 (계속 진행)');
    }
    
    // 페이지 내용 확인
    console.log('🔍 페이지 내용 분석 중...');
    
    const bodyText = await page.locator('body').textContent();
    const hasContent = bodyText && bodyText.trim().length > 0;
    console.log(`📝 페이지 텍스트 길이: ${bodyText ? bodyText.length : 0}자`);
    
    // 타로카드 관련 텍스트 확인
    const foolKeywords = ['fool', '바보', '광대', 'The Fool', '새로운 시작'];
    const foundKeywords = foolKeywords.filter(keyword => 
      bodyText && bodyText.toLowerCase().includes(keyword.toLowerCase())
    );
    console.log(`🃏 타로카드 관련 키워드 발견: ${foundKeywords.join(', ') || '없음'}`);
    
    // DOM 요소들 확인
    const elements = {
      'h1 태그': await page.locator('h1').count(),
      'h2 태그': await page.locator('h2').count(),
      'img 태그': await page.locator('img').count(),
      'button 태그': await page.locator('button').count(),
      'div 태그': await page.locator('div').count(),
      'p 태그': await page.locator('p').count()
    };
    
    console.log('🏗️ DOM 요소 분석:');
    Object.entries(elements).forEach(([element, count]) => {
      console.log(`- ${element}: ${count}개`);
    });
    
    // 이미지 로딩 상태 확인
    const images = await page.locator('img').all();
    console.log(`📷 이미지 요소 수: ${images.length}`);
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      console.log(`- 이미지 ${i+1}: src="${src}", alt="${alt}"`);
    }
    
    // 스크린샷 촬영 (여러 시점)
    const timestamp = Date.now();
    const screenshotPath1 = `/mnt/e/project/test-studio-firebase/enhanced-test-${timestamp}-initial.png`;
    await page.screenshot({ 
      path: screenshotPath1, 
      fullPage: true 
    });
    console.log(`📸 초기 스크린샷: ${screenshotPath1}`);
    
    // 추가로 3초 더 기다린 후 최종 스크린샷
    await page.waitForTimeout(3000);
    const screenshotPath2 = `/mnt/e/project/test-studio-firebase/enhanced-test-${timestamp}-final.png`;
    await page.screenshot({ 
      path: screenshotPath2, 
      fullPage: true 
    });
    console.log(`📸 최종 스크린샷: ${screenshotPath2}`);
    
    // 콘솔 에러 체크
    const errorLogs = consoleLogs.filter(log => log.startsWith('ERROR'));
    const warningLogs = consoleLogs.filter(log => log.startsWith('WARNING'));
    
    console.log(`\n📊 로그 분석:`);
    console.log(`- 전체 로그: ${consoleLogs.length}개`);
    console.log(`- 에러 로그: ${errorLogs.length}개`);
    console.log(`- 경고 로그: ${warningLogs.length}개`);
    
    if (errorLogs.length > 0) {
      console.log('\n❌ 에러 로그:');
      errorLogs.forEach(log => console.log(`  ${log}`));
    }
    
    if (errors.length > 0) {
      console.log('\n❌ 페이지 에러:');
      errors.forEach(error => console.log(`  ${error}`));
    }
    
    console.log('\n🎯 향상된 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    
    // 에러 상황 스크린샷
    try {
      const errorScreenshot = `/mnt/e/project/test-studio-firebase/enhanced-error-${Date.now()}.png`;
      await page.screenshot({ path: errorScreenshot, fullPage: true });
      console.log(`📸 에러 스크린샷: ${errorScreenshot}`);
    } catch (e) {
      console.error('스크린샷 촬영 실패:', e.message);
    }
  } finally {
    await browser.close();
  }
})();