const { chromium } = require('playwright');
const fs = require('fs');

async function checkOptimizationResults() {
  console.log('🚀 최적화 결과 확인 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const results = {
    before: {},
    after: {},
    improvements: {}
  };
  
  // 이전 테스트 결과 로드
  try {
    const previousResults = JSON.parse(fs.readFileSync('product-test-results.json', 'utf8'));
    results.before = previousResults.performance;
  } catch (error) {
    console.log('이전 결과를 찾을 수 없습니다.');
  }
  
  const pages = [
    { name: '홈', url: 'http://localhost:4000' },
    { name: '타로', url: 'http://localhost:4000/tarot' },
    { name: '블로그', url: 'http://localhost:4000/blog' }
  ];
  
  try {
    console.log('📊 페이지별 로딩 속도 측정...\n');
    
    for (const pageInfo of pages) {
      console.log(`${pageInfo.name} 페이지 측정 중...`);
      
      const startTime = Date.now();
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      // 메타데이터 확인
      const title = await page.title();
      const hasJsonLd = await page.locator('script[type="application/ld+json"]').count() > 0;
      
      // 이미지 형식 확인
      const images = await page.locator('img').all();
      let webpCount = 0;
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src && src.includes('webp')) webpCount++;
      }
      
      results.after[pageInfo.name] = {
        loadTime,
        title,
        hasJsonLd,
        imageCount: images.length,
        webpImages: webpCount
      };
      
      // 개선율 계산
      if (results.before[pageInfo.name]) {
        const improvement = ((results.before[pageInfo.name].loadTime - loadTime) / results.before[pageInfo.name].loadTime * 100).toFixed(1);
        results.improvements[pageInfo.name] = improvement;
      }
      
      await page.screenshot({ 
        path: `optimized-${pageInfo.name}.png`, 
        fullPage: false 
      });
    }
    
    // 결과 출력
    console.log('\n\n📈 최적화 결과 요약');
    console.log('='.repeat(50));
    
    console.log('\n⚡ 페이지 로딩 속도:');
    for (const [page, data] of Object.entries(results.after)) {
      const before = results.before[page]?.loadTime || 0;
      const improvement = results.improvements[page] || '0';
      console.log(`  ${page}: ${(data.loadTime / 1000).toFixed(2)}초 (이전: ${(before / 1000).toFixed(2)}초)`);
      if (parseFloat(improvement) > 0) {
        console.log(`    ✅ ${improvement}% 개선`);
      }
    }
    
    console.log('\n🔍 SEO 개선:');
    for (const [page, data] of Object.entries(results.after)) {
      console.log(`  ${page}:`);
      console.log(`    - Title: ✅ ${data.title}`);
      console.log(`    - JSON-LD: ${data.hasJsonLd ? '✅ 적용됨' : '❌ 없음'}`);
    }
    
    console.log('\n🖼️ 이미지 최적화:');
    for (const [page, data] of Object.entries(results.after)) {
      if (data.imageCount > 0) {
        const webpPercentage = (data.webpImages / data.imageCount * 100).toFixed(0);
        console.log(`  ${page}: ${data.webpImages}/${data.imageCount} WebP 형식 (${webpPercentage}%)`);
      }
    }
    
    // 평균 개선율
    const avgImprovement = Object.values(results.improvements).reduce((sum, val) => sum + parseFloat(val), 0) / Object.values(results.improvements).length;
    
    console.log(`\n🎯 전체 성능 개선율: ${avgImprovement.toFixed(1)}%`);
    
    // 결과 저장
    fs.writeFileSync('optimization-results.json', JSON.stringify(results, null, 2));
    console.log('\n✅ 최적화 결과가 optimization-results.json에 저장되었습니다.');
    
    // 브라우저는 10초간 열어둠
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

checkOptimizationResults().catch(console.error);