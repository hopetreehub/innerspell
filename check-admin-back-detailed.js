const { chromium } = require('playwright');

async function checkAdminBackButtonDetailed() {
  console.log('🔍 관리자 대시보드 백버튼 상세 조사 시작');
  
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
    
    // 네비게이션 이벤트 리스너 추가
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        console.log(`🔄 페이지 이동 감지: ${frame.url()}`);
      }
    });
    
    // 1단계: 관리자 대시보드 접근
    console.log('1️⃣ 관리자 대시보드 접근 중...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    console.log('✅ 관리자 대시보드 로드 완료');
    console.log(`📍 현재 URL: ${page.url()}`);
    
    // 2단계: 블로그 관리 탭 클릭
    console.log('2️⃣ 블로그 관리 탭 클릭...');
    const blogTab = await page.locator('[role="tab"]:has-text("블로그 관리")').first();
    await blogTab.click();
    await page.waitForTimeout(2000);
    console.log('✅ 블로그 관리 탭 활성화');
    
    // 현재 페이지 스크린샷
    await page.screenshot({ 
      path: `admin-blog-tab-${Date.now()}.png`,
      fullPage: false 
    });
    
    // 3단계: 페이지 내 모든 클릭 가능한 요소 조사
    console.log('3️⃣ 페이지 내 모든 클릭 가능한 요소 조사...');
    
    // 헤더 영역의 버튼 찾기
    const headerButtons = await page.locator('header button, nav button, .navbar button').all();
    console.log(`📌 헤더 영역 버튼: ${headerButtons.length}개`);
    
    // 모든 링크 요소 찾기
    const allLinks = await page.locator('a').all();
    console.log(`🔗 총 링크 수: ${allLinks.length}개`);
    
    // 각 링크의 href 확인
    for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
      try {
        const href = await allLinks[i].getAttribute('href');
        const text = await allLinks[i].textContent();
        if (href) {
          console.log(`   ${i + 1}. "${text?.trim() || '(텍스트 없음)'}" -> ${href}`);
        }
      } catch (e) {
        // 무시
      }
    }
    
    // 4단계: 백버튼 패턴을 가진 모든 요소 찾기
    console.log('4️⃣ 백버튼 패턴 요소 찾기...');
    
    // SVG 아이콘이 있는 버튼 중에서 백 아이콘 찾기
    const iconButtons = await page.locator('button:has(svg)').all();
    console.log(`🎯 아이콘 버튼 수: ${iconButtons.length}개`);
    
    for (let i = 0; i < iconButtons.length; i++) {
      try {
        const button = iconButtons[i];
        const isVisible = await button.isVisible();
        if (isVisible) {
          const box = await button.boundingBox();
          if (box) {
            console.log(`   버튼 ${i + 1}: 위치(${Math.round(box.x)}, ${Math.round(box.y)}), 크기(${Math.round(box.width)}x${Math.round(box.height)})`);
            
            // aria-label 확인
            const ariaLabel = await button.getAttribute('aria-label');
            if (ariaLabel) {
              console.log(`     - aria-label: "${ariaLabel}"`);
            }
            
            // title 속성 확인
            const title = await button.getAttribute('title');
            if (title) {
              console.log(`     - title: "${title}"`);
            }
          }
        }
      } catch (e) {
        // 무시
      }
    }
    
    // 5단계: 브라우저 백버튼 사용
    console.log('5️⃣ 브라우저 백버튼 테스트...');
    const beforeBackUrl = page.url();
    console.log(`📍 백버튼 클릭 전 URL: ${beforeBackUrl}`);
    
    // 브라우저 백버튼 클릭
    await page.goBack();
    await page.waitForTimeout(3000);
    
    const afterBackUrl = page.url();
    console.log(`📍 백버튼 클릭 후 URL: ${afterBackUrl}`);
    
    if (beforeBackUrl !== afterBackUrl) {
      console.log('🔀 URL이 변경되었습니다!');
      if (afterBackUrl.includes('/community')) {
        console.log('⚠️ 커뮤니티 페이지로 리다이렉션되었습니다!');
      }
    }
    
    // 현재 페이지 스크린샷
    await page.screenshot({ 
      path: `admin-after-browser-back-${Date.now()}.png`,
      fullPage: false 
    });
    
    // 6단계: 히스토리 확인
    console.log('6️⃣ 브라우저 히스토리 확인...');
    const canGoBack = await page.evaluate(() => window.history.length > 1);
    console.log(`🔙 뒤로 갈 수 있는가: ${canGoBack}`);
    
    // JavaScript로 히스토리 길이 확인
    const historyLength = await page.evaluate(() => window.history.length);
    console.log(`📚 히스토리 길이: ${historyLength}`);
    
    console.log('✅ 백버튼 상세 조사 완료');
    
  } catch (error) {
    console.error('❌ 조사 중 오류 발생:', error.message);
    throw error;
  } finally {
    if (browser) {
      // 브라우저를 바로 닫지 않고 잠시 대기
      console.log('⏳ 브라우저를 10초 후에 닫습니다...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      await browser.close();
    }
  }
}

// 실행
if (require.main === module) {
  checkAdminBackButtonDetailed().catch(console.error);
}

module.exports = { checkAdminBackButtonDetailed };