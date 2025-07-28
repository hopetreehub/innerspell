const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Vercel 배포 상태 최종 확인...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    viewport: { width: 1920, height: 1080 } 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const deploymentUrl = 'https://test-studio-firebase-g8hhhxw5l-johns-projects-bf5e60f3.vercel.app';
  
  try {
    // 1. 배포된 사이트 접속
    console.log(`📍 배포 URL 접속: ${deploymentUrl}`);
    
    const response = await page.goto(deploymentUrl, {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    const status = response ? response.status() : 'No response';
    console.log(`📊 응답 상태: ${status}`);
    
    if (status === 200) {
      console.log('✅ Vercel 배포 성공!');
      
      // 홈페이지 스크린샷
      await page.screenshot({ 
        path: 'vercel-deployed-01-homepage.png',
        fullPage: true 
      });
      console.log('📸 홈페이지 스크린샷 저장');
      
      // 2. 관리자 페이지 확인
      console.log('\n📍 관리자 페이지 확인...');
      await page.goto(`${deploymentUrl}/admin`, {
        waitUntil: 'networkidle'
      });
      
      await page.screenshot({ 
        path: 'vercel-deployed-02-admin.png',
        fullPage: true 
      });
      console.log('📸 관리자 페이지 스크린샷 저장');
      
      // 3. 타로 리딩 페이지 확인
      console.log('\n📍 타로 리딩 페이지 확인...');
      await page.goto(`${deploymentUrl}/tarot-reading`, {
        waitUntil: 'networkidle'
      });
      
      await page.screenshot({ 
        path: 'vercel-deployed-03-tarot.png',
        fullPage: true 
      });
      console.log('📸 타로 리딩 페이지 스크린샷 저장');
      
      // 4. 블로그 페이지 확인
      console.log('\n📍 블로그 페이지 확인...');
      await page.goto(`${deploymentUrl}/blog`, {
        waitUntil: 'networkidle'
      });
      
      await page.screenshot({ 
        path: 'vercel-deployed-04-blog.png',
        fullPage: true 
      });
      console.log('📸 블로그 페이지 스크린샷 저장');
      
      // 5. 페이지 성능 측정
      const performanceMetrics = await page.evaluate(() => {
        const timing = performance.timing;
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
          loadComplete: timing.loadEventEnd - timing.loadEventStart,
          pageLoadTime: timing.loadEventEnd - timing.navigationStart
        };
      });
      
      console.log('\n📊 페이지 성능 지표:');
      console.log(`  - DOM 로드 시간: ${performanceMetrics.domContentLoaded}ms`);
      console.log(`  - 전체 로드 시간: ${performanceMetrics.pageLoadTime}ms`);
      
      // 6. GEO 가이드 텍스트 확인
      const geoTexts = await page.content().then(content => {
        const matches = content.match(/geo|GEO|Geo/gi);
        return matches ? matches.length : 0;
      });
      
      console.log(`\n🔍 GEO 관련 텍스트: ${geoTexts}개 발견`);
      
      console.log('\n🎉 배포 확인 완료!');
      console.log(`🌐 라이브 URL: ${deploymentUrl}`);
      
    } else {
      console.log('❌ 배포 사이트 접속 실패');
      console.log('💡 배포가 아직 진행 중일 수 있습니다. 잠시 후 다시 시도해주세요.');
    }
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    
    await page.screenshot({ 
      path: 'vercel-deployed-error.png',
      fullPage: true 
    });
    console.log('📸 에러 스크린샷 저장');
  } finally {
    await browser.close();
    console.log('🏁 검증 완료');
  }
})();