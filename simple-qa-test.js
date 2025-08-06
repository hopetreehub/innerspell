const { chromium } = require('playwright');

async function simpleQATest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== 간단한 QA 테스트 ===\n');
  
  try {
    // 메인 페이지 접속
    console.log('메인 페이지 접속 중...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(5000);
    
    // 네비게이션 확인
    const navElement = await page.locator('nav').first();
    const isNavVisible = await navElement.isVisible();
    console.log('네비게이션 표시 여부:', isNavVisible);
    
    if (isNavVisible) {
      // 모든 링크 텍스트 가져오기
      const links = await navElement.locator('a').allTextContents();
      console.log('\n네비게이션 링크:');
      links.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link}`);
        if (link.includes('타로지침')) {
          console.log('     ❌ 타로지침 메뉴 발견!');
        }
      });
      
      // 타로지침 링크 존재 여부 확인
      const tarotGuidelineLink = await page.locator('a:has-text("타로지침")').count();
      if (tarotGuidelineLink === 0) {
        console.log('\n✅ 성공: 타로지침 메뉴가 제거되었습니다.');
      } else {
        console.log('\n❌ 실패: 타로지침 메뉴가 여전히 존재합니다.');
      }
    }
    
    // 스크린샷
    await page.screenshot({ path: 'simple-qa-main.png' });
    console.log('\n📸 스크린샷: simple-qa-main.png');
    
    // 관리자 페이지 테스트
    console.log('\n관리자 페이지 접속 테스트...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    const adminUrl = page.url();
    console.log('현재 URL:', adminUrl);
    if (adminUrl.includes('sign-in')) {
      console.log('✅ 성공: 로그인 페이지로 리다이렉트됨');
    }
    
    await page.screenshot({ path: 'simple-qa-admin.png' });
    console.log('📸 스크린샷: simple-qa-admin.png');
    
  } catch (error) {
    console.error('테스트 중 오류:', error.message);
  }
  
  await browser.close();
  console.log('\n=== 테스트 완료 ===');
}

simpleQATest().catch(console.error);