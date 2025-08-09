const { chromium } = require('playwright');

async function checkAdminBackButton() {
  console.log('🔍 관리자 대시보드 블로그 관리 백버튼 리다이렉션 문제 조사 시작');
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 1단계: 관리자 대시보드 접근
    console.log('1️⃣ 관리자 대시보드 접근 중...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    console.log('✅ 관리자 대시보드 로드 완료');
    
    // 현재 URL 확인
    console.log(`📍 현재 URL: ${page.url()}`);
    
    // 2단계: 블로그 관리 탭 클릭
    console.log('2️⃣ 블로그 관리 탭 찾는 중...');
    
    const blogTabSelectors = [
      '[role="tab"]:has-text("블로그 관리")',
      'button:has-text("블로그 관리")',
      '[data-testid="tab-blog-management"]',
      '.tabs button:has-text("블로그")',
      '[role="tablist"] button:nth-child(3)'
    ];
    
    let blogTabClicked = false;
    for (const selector of blogTabSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          blogTabClicked = true;
          console.log(`✅ 블로그 탭 클릭 성공: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector}`);
      }
    }
    
    if (!blogTabClicked) {
      console.log('⚠️ 블로그 탭 클릭 실패, 직접 URL로 이동');
      await page.goto('http://localhost:4000/admin?tab=blog', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
    }
    
    await page.waitForTimeout(3000);
    console.log(`📍 블로그 탭 클릭 후 URL: ${page.url()}`);
    
    // 3단계: 백버튼 찾기
    console.log('3️⃣ 백버튼 찾는 중...');
    
    const backButtonSelectors = [
      'button:has-text("뒤로")',
      'button:has-text("Back")',
      'button:has-text("돌아가기")',
      '[aria-label="뒤로"]',
      '[aria-label="back"]',
      '.back-button',
      'button[data-testid="back-button"]',
      'button svg[class*="arrow"]',
      'button:has(svg)',
      'button[class*="back"]'
    ];
    
    // 모든 버튼 요소 확인
    const allButtons = await page.locator('button').all();
    console.log(`🔘 페이지에 총 ${allButtons.length}개의 버튼 발견`);
    
    // 각 버튼의 텍스트 출력
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      try {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        console.log(`   ${i + 1}. "${text?.trim() || '(텍스트 없음)'}" - 표시: ${isVisible}`);
      } catch (e) {
        console.log(`   ${i + 1}. 버튼 정보 읽기 실패`);
      }
    }
    
    // 백버튼 찾기 시도
    let backButton = null;
    for (const selector of backButtonSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          backButton = element;
          console.log(`✅ 백버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 선택자 실패는 무시
      }
    }
    
    if (backButton) {
      // 4단계: 백버튼 클릭 전 상태 기록
      console.log('4️⃣ 백버튼 클릭 전 상태 기록...');
      const beforeClickUrl = page.url();
      console.log(`📍 클릭 전 URL: ${beforeClickUrl}`);
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: `admin-before-back-${Date.now()}.png`,
        fullPage: false 
      });
      
      // 백버튼 클릭
      console.log('🖱️ 백버튼 클릭...');
      await backButton.click();
      
      // 페이지 로드 대기
      await page.waitForTimeout(3000);
      
      // 5단계: 클릭 후 상태 확인
      console.log('5️⃣ 백버튼 클릭 후 상태 확인...');
      const afterClickUrl = page.url();
      console.log(`📍 클릭 후 URL: ${afterClickUrl}`);
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: `admin-after-back-${Date.now()}.png`,
        fullPage: false 
      });
      
      // URL 변경 확인
      if (beforeClickUrl !== afterClickUrl) {
        console.log('🔀 URL이 변경되었습니다!');
        console.log(`   변경 전: ${beforeClickUrl}`);
        console.log(`   변경 후: ${afterClickUrl}`);
        
        if (afterClickUrl.includes('/community')) {
          console.log('⚠️ 커뮤니티 페이지로 리다이렉션되었습니다!');
        } else if (afterClickUrl.includes('/admin')) {
          console.log('✅ 관리자 페이지 내에 머물러 있습니다.');
        } else {
          console.log('❓ 예상하지 못한 페이지로 이동했습니다.');
        }
      } else {
        console.log('✅ URL이 변경되지 않았습니다.');
      }
      
      // 현재 페이지 제목 확인
      const pageTitle = await page.title();
      console.log(`📄 현재 페이지 제목: ${pageTitle}`);
      
      // 현재 페이지의 주요 요소 확인
      const h1Elements = await page.locator('h1').all();
      if (h1Elements.length > 0) {
        const h1Text = await h1Elements[0].textContent();
        console.log(`📝 페이지 H1: ${h1Text}`);
      }
      
    } else {
      console.log('❌ 백버튼을 찾을 수 없습니다.');
      
      // 페이지 구조 더 자세히 분석
      console.log('📋 페이지 구조 분석 중...');
      
      // 헤더나 네비게이션 영역 확인
      const headerSelectors = ['header', 'nav', '[role="navigation"]', '.header', '.navbar'];
      for (const selector of headerSelectors) {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`🔍 ${selector} 영역 발견`);
          const buttons = await element.locator('button').all();
          console.log(`   - ${buttons.length}개의 버튼 포함`);
        }
      }
    }
    
    console.log('✅ 백버튼 리다이렉션 문제 조사 완료');
    
  } catch (error) {
    console.error('❌ 조사 중 오류 발생:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
if (require.main === module) {
  checkAdminBackButton().catch(console.error);
}

module.exports = { checkAdminBackButton };