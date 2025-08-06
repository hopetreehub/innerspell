const { chromium } = require('playwright');

async function verifyPages() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const timestamp = Date.now();
  
  try {
    console.log('========================================');
    console.log('포트 4000 페이지 검증 시작');
    console.log('========================================\n');
    
    // 1. 메인 페이지 확인
    console.log('1. 메인 페이지 (http://localhost:4000) 확인 중...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000); // 페이지 완전 로드 대기
    await page.screenshot({ 
      path: `screenshots/main-page-${timestamp}.png`,
      fullPage: true 
    });
    
    const mainTitle = await page.title();
    const mainHeading = await page.$eval('h1', el => el.textContent).catch(() => 'H1 태그 없음');
    console.log(`✅ 메인 페이지 접속 성공`);
    console.log(`   - 페이지 타이틀: ${mainTitle}`);
    console.log(`   - H1 제목: ${mainHeading}`);
    console.log(`   - 스크린샷 저장: screenshots/main-page-${timestamp}.png\n`);
    
    // 2. 타로 가이드라인 페이지 확인
    console.log('2. 타로 가이드라인 페이지 (http://localhost:4000/tarot-guidelines) 확인 중...');
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 관리자 전용 메시지 확인
    const adminMessage = await page.$eval('body', el => el.textContent).catch(() => '');
    const hasAdminMessage = adminMessage.includes('관리자 전용') || 
                           adminMessage.includes('Administrator only') ||
                           adminMessage.includes('admin') ||
                           adminMessage.includes('Admin');
    
    await page.screenshot({ 
      path: `screenshots/tarot-guidelines-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log(`✅ 타로 가이드라인 페이지 접속 성공`);
    console.log(`   - 관리자 전용 메시지 확인: ${hasAdminMessage ? '✅ 발견됨' : '❌ 없음'}`);
    console.log(`   - 페이지 내용 일부: ${adminMessage.slice(0, 200)}...`);
    console.log(`   - 스크린샷 저장: screenshots/tarot-guidelines-${timestamp}.png\n`);
    
    // 3. 어드민 페이지 확인
    console.log('3. 어드민 페이지 (http://localhost:4000/admin) 확인 중...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 관리자 대시보드 요소 확인
    const adminTitle = await page.title();
    const hasAdminDashboard = await page.$('h1, h2').then(async (el) => {
      if (!el) return false;
      const text = await el.textContent();
      return text.includes('Admin') || text.includes('관리자') || text.includes('Dashboard');
    }).catch(() => false);
    
    // 관리자 탭 메뉴 확인
    const tabsExist = await page.$$('[role="tablist"], .tabs, nav').then(tabs => tabs.length > 0);
    
    await page.screenshot({ 
      path: `screenshots/admin-page-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log(`✅ 어드민 페이지 접속 성공`);
    console.log(`   - 페이지 타이틀: ${adminTitle}`);
    console.log(`   - 관리자 대시보드 확인: ${hasAdminDashboard ? '✅ 발견됨' : '❌ 없음'}`);
    console.log(`   - 탭 메뉴 존재: ${tabsExist ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   - 스크린샷 저장: screenshots/admin-page-${timestamp}.png\n`);
    
    console.log('========================================');
    console.log('모든 페이지 검증 완료!');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
  } finally {
    await browser.close();
  }
}

verifyPages().catch(console.error);