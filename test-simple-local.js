const { chromium } = require('playwright');

async function runSimpleLocalTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🏠 로컬 앱 간단 테스트 시작\n');
    
    // 메인 페이지 접근
    await page.goto('http://localhost:4000', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // 스크린샷 저장
    await page.screenshot({ path: 'screenshots/local-main-page.png', fullPage: true });
    
    // 기본 정보 수집
    const title = await page.title();
    const url = page.url();
    
    console.log(`✅ 페이지 로드 성공`);
    console.log(`📄 제목: ${title}`);
    console.log(`🌐 URL: ${url}`);
    
    // 네비게이션 링크 확인
    const navLinks = await page.locator('nav a').all();
    console.log(`\n🧭 네비게이션 링크 발견: ${navLinks.length}개`);
    
    for (let i = 0; i < navLinks.length; i++) {
      try {
        const text = await navLinks[i].textContent();
        const href = await navLinks[i].getAttribute('href');
        console.log(`   ${i+1}. "${text}" -> ${href}`);
      } catch (e) {
        console.log(`   ${i+1}. [링크 정보 읽기 실패]`);
      }
    }
    
    // 주요 버튼 확인
    const buttons = await page.locator('button').all();
    console.log(`\n🔘 버튼 발견: ${buttons.length}개`);
    
    for (let i = 0; i < Math.min(5, buttons.length); i++) {
      try {
        const text = await buttons[i].textContent();
        console.log(`   ${i+1}. "${text}"`);
      } catch (e) {
        console.log(`   ${i+1}. [버튼 텍스트 읽기 실패]`);
      }
    }
    
    // 타로 리딩 페이지 접근 테스트
    console.log('\n🔮 타로 리딩 페이지 테스트...');
    try {
      await page.goto('http://localhost:4000/reading', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      const readingTitle = await page.title();
      await page.screenshot({ path: 'screenshots/local-reading-page.png', fullPage: true });
      
      console.log(`✅ 타로 리딩 페이지 로드 성공`);
      console.log(`📄 제목: ${readingTitle}`);
      
      // 입력 필드 확인
      const textareas = await page.locator('textarea').count();
      const inputs = await page.locator('input[type="text"]').count();
      
      console.log(`📝 입력 필드: textarea ${textareas}개, text input ${inputs}개`);
      
    } catch (error) {
      console.log(`❌ 타로 리딩 페이지 접근 실패: ${error.message}`);
    }
    
    // 대시보드 페이지 테스트
    console.log('\n📊 대시보드 페이지 테스트...');
    try {
      await page.goto('http://localhost:4000/dashboard', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      const dashboardTitle = await page.title();
      await page.screenshot({ path: 'screenshots/local-dashboard-page.png', fullPage: true });
      
      console.log(`✅ 대시보드 페이지 로드 성공`);
      console.log(`📄 제목: ${dashboardTitle}`);
      
    } catch (error) {
      console.log(`❌ 대시보드 페이지 접근 실패: ${error.message}`);
    }
    
    console.log('\n🎉 로컬 테스트 완료!');
    console.log('📸 스크린샷은 screenshots/ 폴더에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  } finally {
    await browser.close();
  }
}

runSimpleLocalTest();