const { chromium } = require('playwright');

async function mobileTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security']
  });
  
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  
  const mobilePage = await mobileContext.newPage();
  
  console.log('📱 모바일 성능 테스트 시작...');
  const startTime = Date.now();
  
  try {
    await mobilePage.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'load',
      timeout: 60000 
    });
    
    await mobilePage.waitForTimeout(3000);
    
    const loadTime = Date.now() - startTime;
    console.log(`📱 모바일 로딩 시간: ${loadTime}ms`);
    
    // 모바일에서 스크롤 테스트
    await mobilePage.touchscreen.tap(200, 400);
    await mobilePage.evaluate(() => {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    });
    await mobilePage.waitForTimeout(2000);
    
    await mobilePage.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/optimized-04-mobile.png',
      fullPage: true 
    });
    console.log('✅ 모바일 스크린샷 저장 완료');
    
    // 성능 정보 수집
    const performanceMetrics = await mobilePage.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadEventEnd: navigation.loadEventEnd,
        domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
        responseEnd: navigation.responseEnd
      };
    });
    
    console.log('📊 모바일 성능 메트릭스:', performanceMetrics);
    
  } catch (error) {
    console.error('❌ 모바일 테스트 오류:', error.message);
  }
  
  await mobileContext.close();
  await browser.close();
  console.log('🎉 모바일 테스트 완료');
}

mobileTest();