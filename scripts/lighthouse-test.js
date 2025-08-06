const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// 테스트할 URL들
const URLS_TO_TEST = [
  'http://localhost:4000',
  'http://localhost:4000/tarot',
  'http://localhost:4000/dream',
  'http://localhost:4000/blog',
  'http://localhost:4000/admin'
];

// Lighthouse 설정
const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36 Chrome-Lighthouse'
  }
};

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const results = [];

  console.log('🔍 Lighthouse 성능 테스트 시작...\n');

  for (const url of URLS_TO_TEST) {
    console.log(`📊 테스트 중: ${url}`);
    
    try {
      const runnerResult = await lighthouse(url, {
        port: chrome.port,
        ...config.settings
      }, config);

      const reportHtml = runnerResult.report;
      const lhr = runnerResult.lhr;

      // 결과 저장
      const urlPath = url.replace('http://localhost:4000', '').replace('/', '') || 'home';
      const reportPath = path.join(__dirname, `../lighthouse-reports/lighthouse-${urlPath}-${Date.now()}.html`);
      
      // 디렉토리 생성
      if (!fs.existsSync(path.dirname(reportPath))) {
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      }
      
      fs.writeFileSync(reportPath, reportHtml);

      // 점수 추출
      const scores = {
        url: url,
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        metrics: {
          fcp: lhr.audits['first-contentful-paint'].numericValue,
          lcp: lhr.audits['largest-contentful-paint'].numericValue,
          cls: lhr.audits['cumulative-layout-shift'].numericValue,
          fid: lhr.audits['max-potential-fid'] ? lhr.audits['max-potential-fid'].numericValue : null,
          ttfb: lhr.audits['server-response-time'] ? lhr.audits['server-response-time'].numericValue : null,
          speedIndex: lhr.audits['speed-index'].numericValue,
          totalBlockingTime: lhr.audits['total-blocking-time'].numericValue
        },
        opportunities: lhr.audits['render-blocking-resources'] ? lhr.audits['render-blocking-resources'].details : null,
        reportPath: reportPath
      };

      results.push(scores);

      console.log(`✅ 완료: 성능 ${scores.performance}/100, 접근성 ${scores.accessibility}/100`);
      console.log(`   📈 LCP: ${Math.round(scores.metrics.lcp)}ms, FCP: ${Math.round(scores.metrics.fcp)}ms`);
      console.log(`   📍 CLS: ${scores.metrics.cls.toFixed(3)}, TBT: ${Math.round(scores.metrics.totalBlockingTime)}ms\n`);

    } catch (error) {
      console.error(`❌ 에러 (${url}):`, error.message);
    }
  }

  await chrome.kill();

  // 전체 결과 출력
  console.log('\n🎯 성능 테스트 결과 요약:');
  console.log('=' .repeat(80));
  
  results.forEach(result => {
    console.log(`\n📄 ${result.url}`);
    console.log(`   성능: ${result.performance}/100 | 접근성: ${result.accessibility}/100`);
    console.log(`   모범사례: ${result.bestPractices}/100 | SEO: ${result.seo}/100`);
    console.log(`   Core Web Vitals:`);
    console.log(`     - LCP: ${Math.round(result.metrics.lcp)}ms (목표: <2500ms)`);
    console.log(`     - FCP: ${Math.round(result.metrics.fcp)}ms (목표: <1800ms)`);
    console.log(`     - CLS: ${result.metrics.cls.toFixed(3)} (목표: <0.1)`);
    console.log(`     - TBT: ${Math.round(result.metrics.totalBlockingTime)}ms (목표: <200ms)`);
    console.log(`   📊 리포트: ${result.reportPath}`);
  });

  // JSON 형태로도 저장
  const jsonResults = {
    timestamp: Date.now(),
    testDate: new Date().toISOString(),
    results: results,
    summary: {
      avgPerformance: Math.round(results.reduce((sum, r) => sum + r.performance, 0) / results.length),
      avgAccessibility: Math.round(results.reduce((sum, r) => sum + r.accessibility, 0) / results.length),
      avgBestPractices: Math.round(results.reduce((sum, r) => sum + r.bestPractices, 0) / results.length),
      avgSeo: Math.round(results.reduce((sum, r) => sum + r.seo, 0) / results.length),
      coreWebVitalsPass: results.filter(r => 
        r.metrics.lcp < 2500 && 
        r.metrics.fcp < 1800 && 
        r.metrics.cls < 0.1 && 
        r.metrics.totalBlockingTime < 200
      ).length
    }
  };

  const jsonPath = path.join(__dirname, `../lighthouse-reports/lighthouse-results-${Date.now()}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonResults, null, 2));

  console.log(`\n💾 상세 결과가 저장되었습니다: ${jsonPath}`);
  console.log(`🎯 Core Web Vitals 통과: ${jsonResults.summary.coreWebVitalsPass}/${results.length} 페이지`);
  
  return jsonResults;
}

if (require.main === module) {
  runLighthouse().catch(console.error);
}

module.exports = { runLighthouse };