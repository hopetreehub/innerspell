const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 성능 최적화 테스트 시작...\n');
    
    // 네트워크 모니터링 시작
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/images/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType()
        });
      }
    });
    
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/images/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'] || 'unknown'
        });
      }
    });
    
    // 1. 홈페이지 테스트
    console.log('1. 홈페이지 성능 테스트');
    const homeStart = Date.now();
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    const homeLoadTime = Date.now() - homeStart;
    
    await page.screenshot({ path: 'performance-01-homepage.png', fullPage: true });
    console.log(`   ⏱️  로드 시간: ${homeLoadTime}ms`);
    
    // 이미지 요청 분석
    const imageRequests = requests.filter(r => r.resourceType === 'image');
    const webpRequests = imageRequests.filter(r => r.url.includes('.webp'));
    
    console.log(`   📊 이미지 요청: ${imageRequests.length}개`);
    console.log(`   🖼️  WebP 이미지: ${webpRequests.length}개`);
    console.log(`   📈 WebP 사용률: ${webpRequests.length > 0 ? (webpRequests.length / imageRequests.length * 100).toFixed(1) : 0}%`);
    
    // 2. 타로 리딩 페이지 테스트
    console.log('\n2. 타로 리딩 페이지 성능 테스트');
    requests.length = 0; // 요청 초기화
    responses.length = 0;
    
    const readingStart = Date.now();
    await page.goto('http://localhost:4000/tarot/reading', { waitUntil: 'networkidle' });
    const readingLoadTime = Date.now() - readingStart;
    
    await page.screenshot({ path: 'performance-02-reading.png', fullPage: true });
    console.log(`   ⏱️  로드 시간: ${readingLoadTime}ms`);
    
    // 타로 카드 이미지 분석
    const tarotImages = requests.filter(r => r.url.includes('/tarot'));
    const optimizedTarot = tarotImages.filter(r => r.url.includes('/optimized/'));
    
    console.log(`   🎴 타로 이미지: ${tarotImages.length}개`);
    console.log(`   ✨ 최적화된 이미지: ${optimizedTarot.length}개`);
    
    // 3. 이미지 크기 비교
    console.log('\n3. 이미지 크기 분석');
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    responses.forEach(response => {
      if (response.size !== 'unknown') {
        const size = parseInt(response.size);
        if (response.url.includes('/optimized/')) {
          totalOptimizedSize += size;
        } else {
          totalOriginalSize += size;
        }
      }
    });
    
    console.log(`   📦 원본 이미지 크기: ${(totalOriginalSize / 1024).toFixed(1)}KB`);
    console.log(`   📦 최적화 이미지 크기: ${(totalOptimizedSize / 1024).toFixed(1)}KB`);
    if (totalOptimizedSize > 0) {
      const reduction = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);
      console.log(`   📉 크기 감소: ${reduction}%`);
    }
    
    // 4. Core Web Vitals 측정
    console.log('\n4. Core Web Vitals 측정');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcp = 0;
        let fid = 0;
        let cls = 0;
        
        // LCP 측정
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // CLS 측정
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            cls += entry.value;
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        // 3초 후 결과 반환
        setTimeout(() => {
          resolve({ lcp, cls });
        }, 3000);
      });
    });
    
    console.log(`   🎯 LCP (Largest Contentful Paint): ${metrics.lcp.toFixed(0)}ms`);
    console.log(`   📏 CLS (Cumulative Layout Shift): ${metrics.cls.toFixed(3)}`);
    
    // 5. 번들 크기 체크
    console.log('\n5. JavaScript 번들 분석');
    const jsRequests = requests.filter(r => r.url.includes('.js'));
    const chunkedJS = jsRequests.filter(r => r.url.includes('chunks'));
    
    console.log(`   📦 전체 JS 파일: ${jsRequests.length}개`);
    console.log(`   🧩 청크된 JS 파일: ${chunkedJS.length}개`);
    
    // 최종 평가
    console.log('\n✅ 성능 최적화 평가 완료');
    console.log('━'.repeat(50));
    
    const score = {
      webpUsage: webpRequests.length > 0,
      loadTime: homeLoadTime < 3000 && readingLoadTime < 3000,
      imageOptimization: optimizedTarot.length > 0,
      bundleSplitting: chunkedJS.length > 5
    };
    
    console.log('최종 점수:');
    console.log(`   WebP 사용: ${score.webpUsage ? '✅' : '❌'}`);
    console.log(`   빠른 로드 시간: ${score.loadTime ? '✅' : '❌'}`);
    console.log(`   이미지 최적화: ${score.imageOptimization ? '✅' : '❌'}`);
    console.log(`   번들 스플리팅: ${score.bundleSplitting ? '✅' : '❌'}`);
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'performance-error.png' });
  } finally {
    await browser.close();
  }
})();