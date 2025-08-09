const { chromium } = require('playwright');

async function checkAdminNavigationFlow() {
  console.log('🔍 관리자 대시보드 네비게이션 플로우 조사 시작');
  
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
    
    // 네비게이션 이벤트 리스너
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        console.log(`🔄 페이지 이동: ${frame.url()}`);
      }
    });
    
    // 1단계: 홈페이지에서 시작
    console.log('1️⃣ 홈페이지 접근...');
    await page.goto('http://localhost:4000/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    console.log(`📍 현재 위치: ${page.url()}`);
    
    // 2단계: 커뮤니티 페이지로 이동
    console.log('2️⃣ 커뮤니티 페이지로 이동...');
    const communityLink = await page.locator('a[href="/community"]').first();
    if (await communityLink.isVisible()) {
      await communityLink.click();
      await page.waitForTimeout(2000);
      console.log(`📍 현재 위치: ${page.url()}`);
      
      // 커뮤니티 페이지 스크린샷
      await page.screenshot({ 
        path: `navigation-community-${Date.now()}.png`,
        fullPage: false 
      });
    }
    
    // 3단계: 관리자 페이지로 이동
    console.log('3️⃣ 관리자 페이지로 이동...');
    const adminLink = await page.locator('a[href="/admin"]').first();
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await page.waitForTimeout(3000);
      console.log(`📍 현재 위치: ${page.url()}`);
    } else {
      // 직접 네비게이션
      await page.goto('http://localhost:4000/admin', { 
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(3000);
    }
    
    // 4단계: 블로그 관리 탭 클릭
    console.log('4️⃣ 블로그 관리 탭 활성화...');
    const blogTab = await page.locator('[role="tab"]:has-text("블로그 관리")').first();
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 블로그 관리 탭 활성화됨');
      
      // 블로그 관리 탭 스크린샷
      await page.screenshot({ 
        path: `navigation-blog-tab-${Date.now()}.png`,
        fullPage: false 
      });
    }
    
    // 5단계: 히스토리 정보 확인
    console.log('5️⃣ 브라우저 히스토리 상태 확인...');
    const historyInfo = await page.evaluate(() => {
      return {
        length: window.history.length,
        state: window.history.state,
        currentUrl: window.location.href,
        referrer: document.referrer
      };
    });
    console.log('📚 히스토리 정보:', JSON.stringify(historyInfo, null, 2));
    
    // 6단계: 브라우저 백버튼 클릭
    console.log('6️⃣ 브라우저 백버튼 클릭...');
    const beforeBackUrl = page.url();
    console.log(`📍 백버튼 클릭 전: ${beforeBackUrl}`);
    
    await page.goBack();
    await page.waitForTimeout(3000);
    
    const afterBackUrl = page.url();
    console.log(`📍 백버튼 클릭 후: ${afterBackUrl}`);
    
    // 백버튼 클릭 후 스크린샷
    await page.screenshot({ 
      path: `navigation-after-back-${Date.now()}.png`,
      fullPage: false 
    });
    
    // 7단계: 결과 분석
    console.log('7️⃣ 네비게이션 결과 분석...');
    if (beforeBackUrl !== afterBackUrl) {
      console.log('🔀 URL이 변경되었습니다!');
      
      if (afterBackUrl.includes('/community')) {
        console.log('✅ 커뮤니티 페이지로 돌아갔습니다 (정상 동작)');
      } else if (afterBackUrl.includes('/admin')) {
        console.log('⚠️ 여전히 관리자 페이지에 있습니다');
      } else if (afterBackUrl === 'http://localhost:4000/') {
        console.log('🏠 홈페이지로 돌아갔습니다');
      } else {
        console.log(`❓ 예상하지 못한 페이지로 이동: ${afterBackUrl}`);
      }
    } else {
      console.log('❌ URL이 변경되지 않았습니다');
    }
    
    // 8단계: 앞으로 가기 테스트
    console.log('8️⃣ 브라우저 앞으로 가기 버튼 테스트...');
    const canGoForward = await page.evaluate(() => {
      // 브라우저의 앞으로 가기 가능 여부는 직접 확인 불가
      // history.forward()를 시도해봄
      try {
        window.history.forward();
        return true;
      } catch (e) {
        return false;
      }
    });
    
    await page.waitForTimeout(2000);
    const afterForwardUrl = page.url();
    console.log(`📍 앞으로 가기 후: ${afterForwardUrl}`);
    
    console.log('✅ 네비게이션 플로우 조사 완료');
    
  } catch (error) {
    console.error('❌ 조사 중 오류 발생:', error.message);
    throw error;
  } finally {
    if (browser) {
      console.log('⏳ 브라우저를 10초 후에 닫습니다...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      await browser.close();
    }
  }
}

// 실행
if (require.main === module) {
  checkAdminNavigationFlow().catch(console.error);
}

module.exports = { checkAdminNavigationFlow };