const { chromium } = require('playwright');

async function testAdminSimple() {
  console.log('🔍 관리자 대시보드 간단 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. 관리자 페이지 접속
    console.log('\n1️⃣ 관리자 페이지 접속 테스트');
    const response = await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log(`   - 응답 상태: ${response.status()}`);
    console.log(`   - URL: ${page.url()}`);
    
    // 페이지 내용 확인
    await page.waitForTimeout(1000);
    
    const pageContent = await page.content();
    const hasLoginForm = pageContent.includes('email') || pageContent.includes('password');
    const hasAdminText = pageContent.includes('관리자') || pageContent.includes('Admin');
    
    console.log(`   - 로그인 폼 존재: ${hasLoginForm}`);
    console.log(`   - 관리자 텍스트 존재: ${hasAdminText}`);
    
    // 스크린샷
    await page.screenshot({ path: 'screenshots/admin-page-simple.png' });
    console.log('   - 스크린샷 저장: screenshots/admin-page-simple.png');
    
    // 2. 사용통계 탭 URL 테스트
    console.log('\n2️⃣ 사용통계 탭 URL 테스트');
    const usageResponse = await page.goto('http://localhost:4000/admin?tab=usage-stats', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log(`   - 응답 상태: ${usageResponse.status()}`);
    console.log(`   - URL: ${page.url()}`);
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/admin-usage-stats-simple.png' });
    console.log('   - 스크린샷 저장: screenshots/admin-usage-stats-simple.png');
    
    // 3. 실시간 모니터링 탭 URL 테스트
    console.log('\n3️⃣ 실시간 모니터링 탭 URL 테스트');
    const monitoringResponse = await page.goto('http://localhost:4000/admin?tab=real-time-monitoring', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log(`   - 응답 상태: ${monitoringResponse.status()}`);
    console.log(`   - URL: ${page.url()}`);
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/admin-monitoring-simple.png' });
    console.log('   - 스크린샷 저장: screenshots/admin-monitoring-simple.png');
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

testAdminSimple().catch(console.error);