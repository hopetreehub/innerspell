const { chromium } = require('playwright');

async function verifyAdminFeatures() {
  console.log('🔍 관리자 대시보드 기능 검증 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. 관리자 페이지 접속
    console.log('\n1️⃣ 관리자 페이지 접속');
    const response = await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log(`   - 응답 상태: ${response.status()}`);
    console.log(`   - 최종 URL: ${page.url()}`);
    
    await page.waitForTimeout(2000);
    
    // 페이지 스크린샷
    await page.screenshot({ 
      path: 'screenshots/admin-verify-1.png',
      fullPage: true 
    });
    console.log('   - 스크린샷 저장: screenshots/admin-verify-1.png');
    
    // 2. 사용통계 탭 URL 직접 접속
    console.log('\n2️⃣ 사용통계 탭 URL 직접 접속');
    const usageResponse = await page.goto('http://localhost:4000/admin?tab=usage-stats', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log(`   - 응답 상태: ${usageResponse.status()}`);
    console.log(`   - 최종 URL: ${page.url()}`);
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'screenshots/admin-verify-usage-stats.png',
      fullPage: true 
    });
    console.log('   - 스크린샷 저장: screenshots/admin-verify-usage-stats.png');
    
    // 3. 실시간 모니터링 탭 URL 직접 접속
    console.log('\n3️⃣ 실시간 모니터링 탭 URL 직접 접속');
    const monitoringResponse = await page.goto('http://localhost:4000/admin?tab=real-time-monitoring', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log(`   - 응답 상태: ${monitoringResponse.status()}`);
    console.log(`   - 최종 URL: ${page.url()}`);
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'screenshots/admin-verify-monitoring.png',
      fullPage: true 
    });
    console.log('   - 스크린샷 저장: screenshots/admin-verify-monitoring.png');
    
    console.log('\n✅ 검증 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    await page.screenshot({ 
      path: 'screenshots/admin-verify-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

verifyAdminFeatures().catch(console.error);