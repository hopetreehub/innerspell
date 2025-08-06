const { chromium } = require('playwright');

async function validateChanges() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== QA 검증 시작 ===\n');
  
  // 1. 메인 페이지 헤더 검증
  console.log('1. 메인 페이지 헤더 검증');
  try {
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 헤더 네비게이션 메뉴 확인
    const navLinks = await page.locator('nav a').allTextContents();
    console.log('✅ 네비게이션 메뉴:', navLinks);
    
    // "타로지침" 메뉴가 없는지 확인
    const hasTarotGuidelines = navLinks.some(link => 
      link.includes('타로지침') || link.includes('타로 지침')
    );
    
    if (!hasTarotGuidelines) {
      console.log('✅ "타로지침" 메뉴가 없음 - 정상');
    } else {
      console.log('❌ "타로지침" 메뉴가 발견됨 - 오류');
    }
    
    await page.screenshot({ path: 'qa-main-page-header.png', fullPage: false });
    console.log('📸 스크린샷 저장: qa-main-page-header.png\n');
    
  } catch (error) {
    console.error('❌ 메인 페이지 접속 오류:', error.message);
  }
  
  // 2. 관리자 대시보드 검증
  console.log('2. 관리자 대시보드 검증');
  try {
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 로그인 페이지로 리다이렉트되는지 확인
    const currentUrl = page.url();
    console.log('✅ 현재 URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ 로그인 페이지로 리다이렉트됨 - 정상');
    } else {
      console.log('❌ 로그인 페이지로 리다이렉트되지 않음');
      
      // 관리자 대시보드의 탭 확인 (로그인된 경우)
      const tabs = await page.locator('[role="tab"]').allTextContents();
      console.log('관리자 탭 목록:', tabs);
      
      const hasGeoGuide = tabs.some(tab => 
        tab.includes('GEO 가이드') || tab.includes('타로지침')
      );
      
      if (!hasGeoGuide) {
        console.log('✅ GEO 가이드 탭이 없음 - 정상');
      } else {
        console.log('❌ GEO 가이드 탭이 발견됨 - 오류');
      }
    }
    
    await page.screenshot({ path: 'qa-admin-dashboard.png', fullPage: false });
    console.log('📸 스크린샷 저장: qa-admin-dashboard.png\n');
    
  } catch (error) {
    console.error('❌ 관리자 대시보드 접속 오류:', error.message);
  }
  
  // 3. 타로지침 페이지 직접 접근 테스트
  console.log('3. 타로지침 페이지 직접 접근 테스트');
  try {
    await page.goto('http://localhost:4000/tarot-guidelines', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 로그인 페이지로 리다이렉트되는지 확인
    const currentUrl = page.url();
    console.log('✅ 현재 URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ 로그인 페이지로 리다이렉트됨 - 정상');
    } else if (currentUrl.includes('/tarot-guidelines')) {
      console.log('❌ 타로지침 페이지가 그대로 표시됨 - 오류');
      
      // 페이지 내용 확인
      const pageTitle = await page.title();
      const hasContent = await page.locator('body').textContent();
      console.log('페이지 타이틀:', pageTitle);
      console.log('페이지 내용 일부:', hasContent.substring(0, 200) + '...');
    }
    
    await page.screenshot({ path: 'qa-tarot-guidelines-access.png', fullPage: false });
    console.log('📸 스크린샷 저장: qa-tarot-guidelines-access.png\n');
    
  } catch (error) {
    console.error('❌ 타로지침 페이지 접속 오류:', error.message);
  }
  
  console.log('=== QA 검증 완료 ===');
  
  await browser.close();
}

// 테스트 실행
validateChanges().catch(console.error);