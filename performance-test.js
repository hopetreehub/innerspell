const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function performanceTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  console.log('🚀 성능 최적화 후 테스트 시작: https://test-studio-firebase.vercel.app');
  
  try {
    // 1. 메인 페이지 로딩 속도 및 이미지 최적화 확인
    console.log('1️⃣ 메인 페이지 로딩 및 이미지 최적화 테스트...');
    const startTime = Date.now();
    
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'load',
      timeout: 60000 
    });
    
    // 추가 대기 시간으로 리소스 로딩 완료 대기
    await page.waitForTimeout(3000);
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ 페이지 로딩 시간: ${loadTime}ms`);
    
    // 이미지 최적화 확인
    const images = await page.locator('img').all();
    console.log(`📸 페이지 내 이미지 수: ${images.length}`);
    
    // WebP 형식 이미지 확인
    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const src = await images[i].getAttribute('src');
      console.log(`🖼️ 이미지 ${i+1}: ${src}`);
    }
    
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/optimized-01-main.png',
      fullPage: true 
    });
    console.log('✅ 메인 페이지 스크린샷 저장');
    
    // 2. 페이지 애니메이션 테스트
    console.log('2️⃣ 애니메이션 부드러운 작동 테스트...');
    
    // 스크롤 애니메이션 테스트
    await page.evaluate(() => {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    });
    await page.waitForTimeout(2000);
    
    await page.evaluate(() => {
      window.scrollTo({ top: 1000, behavior: 'smooth' });
    });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/optimized-02-animations.png',
      fullPage: true 
    });
    console.log('✅ 애니메이션 테스트 스크린샷 저장');
    
    // 3. 개발자 도구 Network 탭 성능 확인
    console.log('3️⃣ Network 성능 분석...');
    
    // 새 페이지로 Network 모니터링
    const networkPage = await context.newPage();
    
    // Network 이벤트 리스너
    const requests = [];
    networkPage.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    const responses = [];
    networkPage.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        contentType: response.headers()['content-type'] || 'unknown'
      });
    });
    
    await networkPage.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'load',
      timeout: 60000 
    });
    
    await networkPage.waitForTimeout(3000);
    
    console.log(`📊 총 요청 수: ${requests.length}`);
    console.log(`📊 총 응답 수: ${responses.length}`);
    
    // JavaScript 번들 분석
    const jsRequests = requests.filter(req => 
      req.resourceType === 'script' || req.url.includes('.js')
    );
    console.log(`🔧 JavaScript 파일 수: ${jsRequests.length}`);
    
    // 이미지 요청 분석
    const imageRequests = requests.filter(req => 
      req.resourceType === 'image' || 
      req.url.includes('.webp') || 
      req.url.includes('.jpg') || 
      req.url.includes('.png')
    );
    console.log(`🖼️ 이미지 요청 수: ${imageRequests.length}`);
    
    // WebP 이미지 확인
    const webpImages = responses.filter(res => 
      res.contentType.includes('webp')
    );
    console.log(`✨ WebP 이미지 수: ${webpImages.length}`);
    
    // 개발자 도구 열기
    await networkPage.keyboard.press('F12');
    await networkPage.waitForTimeout(2000);
    
    // Network 탭 클릭
    await networkPage.click('text=Network');
    await networkPage.waitForTimeout(1000);
    
    await networkPage.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/optimized-03-network.png',
      fullPage: true 
    });
    console.log('✅ Network 탭 스크린샷 저장');
    
    // 4. 모바일 성능 테스트
    console.log('4️⃣ 모바일 성능 테스트...');
    
    const mobileContext = await browser.newContext({
      ...chromium.devices['iPhone 13'],
      viewport: { width: 390, height: 844 }
    });
    
    const mobilePage = await mobileContext.newPage();
    const mobileStartTime = Date.now();
    
    await mobilePage.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'load',
      timeout: 60000 
    });
    
    await mobilePage.waitForTimeout(3000);
    
    const mobileLoadTime = Date.now() - mobileStartTime;
    console.log(`📱 모바일 로딩 시간: ${mobileLoadTime}ms`);
    
    // 모바일에서 스크롤 테스트
    await mobilePage.touchscreen.tap(200, 400);
    await mobilePage.evaluate(() => {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    });
    await mobilePage.waitForTimeout(1500);
    
    await mobilePage.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/optimized-04-mobile.png',
      fullPage: true 
    });
    console.log('✅ 모바일 테스트 스크린샷 저장');
    
    // 성능 보고서 생성
    const report = {
      timestamp: new Date().toISOString(),
      desktopLoadTime: loadTime,
      mobileLoadTime: mobileLoadTime,
      totalRequests: requests.length,
      totalResponses: responses.length,
      jsFiles: jsRequests.length,
      imageRequests: imageRequests.length,
      webpImages: webpImages.length,
      improvements: {
        webpOptimization: webpImages.length > 0,
        jsCodeSplitting: jsRequests.some(req => req.url.includes('chunk')),
        fastLoading: loadTime < 3000
      }
    };
    
    console.log('\n📊 성능 최적화 보고서:');
    console.log(`🖥️ 데스크톱 로딩: ${loadTime}ms`);
    console.log(`📱 모바일 로딩: ${mobileLoadTime}ms`);
    console.log(`🔧 JavaScript 파일: ${jsRequests.length}개`);
    console.log(`🖼️ 이미지 요청: ${imageRequests.length}개`);
    console.log(`✨ WebP 이미지: ${webpImages.length}개`);
    console.log(`📊 총 네트워크 요청: ${requests.length}개`);
    
    // 보고서 파일 저장
    fs.writeFileSync(
      '/mnt/e/project/test-studio-firebase/performance-report.json',
      JSON.stringify(report, null, 2)
    );
    
    await mobileContext.close();
    await networkPage.close();
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    
    // 오류 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/optimized-error.png',
      fullPage: true 
    });
  }
  
  await context.close();
  await browser.close();
  
  console.log('🎉 성능 최적화 테스트 완료!');
}

performanceTest();