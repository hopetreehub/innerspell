const { chromium } = require('playwright');

async function networkTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🌐 네트워크 성능 분석 시작...');
  
  // Network 이벤트 리스너
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });
  
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      contentType: response.headers()['content-type'] || 'unknown',
      contentLength: response.headers()['content-length'] || '0'
    });
  });
  
  try {
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'load',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 리소스 분석
    console.log(`📊 총 요청 수: ${requests.length}`);
    console.log(`📊 총 응답 수: ${responses.length}`);
    
    // JavaScript 파일 분석
    const jsRequests = requests.filter(req => 
      req.resourceType === 'script' || req.url.includes('.js')
    );
    console.log(`🔧 JavaScript 파일 수: ${jsRequests.length}`);
    
    // CSS 파일 분석
    const cssRequests = requests.filter(req => 
      req.resourceType === 'stylesheet' || req.url.includes('.css')
    );
    console.log(`🎨 CSS 파일 수: ${cssRequests.length}`);
    
    // 이미지 요청 분석
    const imageRequests = requests.filter(req => 
      req.resourceType === 'image' || 
      req.url.includes('.webp') || 
      req.url.includes('.jpg') || 
      req.url.includes('.png')
    );
    console.log(`🖼️ 이미지 요청 수: ${imageRequests.length}`);
    
    // Next.js 최적화된 이미지 확인
    const nextImageRequests = responses.filter(res => 
      res.url.includes('/_next/image')
    );
    console.log(`⚡ Next.js 최적화 이미지: ${nextImageRequests.length}`);
    
    // WebP 이미지 확인
    const webpImages = responses.filter(res => 
      res.contentType.includes('webp')
    );
    console.log(`✨ WebP 이미지 수: ${webpImages.length}`);
    
    // 폰트 분석
    const fontRequests = requests.filter(req => 
      req.resourceType === 'font' || 
      req.url.includes('.woff') || 
      req.url.includes('.woff2')
    );
    console.log(`🔤 폰트 파일 수: ${fontRequests.length}`);
    
    // 정적 자산 분석
    const staticAssets = requests.filter(req => 
      req.url.includes('/_next/static/')
    );
    console.log(`📦 Next.js 정적 자산: ${staticAssets.length}`);
    
    // 개발자 도구를 간단히 캡처
    await page.keyboard.press('F12');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/optimized-03-network.png',
      fullPage: false 
    });
    console.log('✅ 개발자 도구 스크린샷 저장');
    
    // 성능 보고서 생성
    const performanceReport = {
      timestamp: new Date().toISOString(),
      totalRequests: requests.length,
      totalResponses: responses.length,
      breakdown: {
        javascript: jsRequests.length,
        css: cssRequests.length,
        images: imageRequests.length,
        fonts: fontRequests.length,
        nextOptimizedImages: nextImageRequests.length,
        webpImages: webpImages.length,
        staticAssets: staticAssets.length
      },
      optimizations: {
        nextImageOptimization: nextImageRequests.length > 0,
        webpSupport: webpImages.length > 0,
        staticAssetCaching: staticAssets.length > 0
      }
    };
    
    console.log('\n📊 네트워크 성능 보고서:');
    console.log(JSON.stringify(performanceReport, null, 2));
    
    // 보고서 파일 저장
    require('fs').writeFileSync(
      '/mnt/e/project/test-studio-firebase/network-performance-report.json',
      JSON.stringify(performanceReport, null, 2)
    );
    
  } catch (error) {
    console.error('❌ 네트워크 테스트 오류:', error.message);
  }
  
  await context.close();
  await browser.close();
  console.log('🎉 네트워크 테스트 완료');
}

networkTest();