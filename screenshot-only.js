const { chromium } = require('playwright');

async function takeScreenshots() {
  console.log('📸 스크린샷만 촬영하는 간단한 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. 관리자 페이지 접속
    console.log('\n1️⃣ 관리자 페이지 스크린샷');
    
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'load',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: 'screenshots/admin-final-1.png',
      fullPage: true 
    });
    console.log('   - 관리자 페이지 스크린샷 저장: screenshots/admin-final-1.png');
    
    // 2. 사용통계 탭
    console.log('\n2️⃣ 사용통계 탭 스크린샷');
    
    await page.goto('http://localhost:4000/admin?tab=usage-stats', { 
      waitUntil: 'load',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: 'screenshots/admin-final-usage.png',
      fullPage: true 
    });
    console.log('   - 사용통계 탭 스크린샷 저장: screenshots/admin-final-usage.png');
    
    // 3. 실시간 모니터링 탭
    console.log('\n3️⃣ 실시간 모니터링 탭 스크린샷');
    
    await page.goto('http://localhost:4000/admin?tab=real-time-monitoring', { 
      waitUntil: 'load',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: 'screenshots/admin-final-monitoring.png',
      fullPage: true 
    });
    console.log('   - 실시간 모니터링 탭 스크린샷 저장: screenshots/admin-final-monitoring.png');
    
    console.log('\n✅ 스크린샷 촬영 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    await page.screenshot({ 
      path: 'screenshots/admin-final-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

takeScreenshots().catch(console.error);