const { chromium } = require('playwright');

async function testAdminFunctionality() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 관리자 기능 테스트 시작...');
    
    // 1. 메인 페이지 접근
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/admin_test_01_homepage.png' });
    console.log('✅ 메인 페이지 로드됨');
    
    // 2. 관리자 페이지 직접 접근 시도
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/admin_test_02_admin_page.png' });
    console.log('✅ 관리자 페이지에 접근됨');
    
    // 페이지 내용 확인
    const pageContent = await page.textContent('body');
    
    if (pageContent.includes('관리자 권한을 확인하는 중')) {
      console.log('🔄 로그인 확인 중...');
      
      // 3. 로그인 페이지로 리다이렉트되는지 확인
      await page.waitForTimeout(5000);
      const currentUrl = page.url();
      
      if (currentUrl.includes('/sign-in')) {
        console.log('🔄 로그인 페이지로 리다이렉트됨');
        await page.screenshot({ path: 'screenshots/admin_test_03_signin_redirect.png' });
        
        // Google 로그인 버튼 확인
        const googleButton = await page.locator('button:has-text("Google")').first();
        if (await googleButton.isVisible()) {
          console.log('✅ Google 로그인 버튼 확인됨');
        }
      } else {
        console.log('📍 현재 URL:', currentUrl);
        await page.screenshot({ path: 'screenshots/admin_test_03_current_state.png' });
      }
    } else if (pageContent.includes('관리자 대시보드')) {
      console.log('✅ 관리자 대시보드가 로드됨 (이미 로그인된 상태)');
      
      // 관리자 탭들 확인
      const tabs = [
        'AI 공급자',
        '타로 지침', 
        '타로 AI',
        '꿈해몽 AI',
        'GEO 가이드',
        '블로그 관리',
        '회원 관리',
        '시스템 관리'
      ];
      
      for (const tab of tabs) {
        const tabElement = await page.locator(`button:has-text("${tab}")`).first();
        if (await tabElement.isVisible()) {
          console.log(`✅ ${tab} 탭 확인됨`);
        } else {
          console.log(`❌ ${tab} 탭 찾을 수 없음`);
        }
      }
      
      await page.screenshot({ path: 'screenshots/admin_test_04_dashboard.png' });
    }
    
    // 4. ADMIN_EMAILS 설정 확인을 위한 API 테스트
    console.log('\n🔍 관리자 이메일 설정 확인...');
    const response = await fetch('http://localhost:4000/api/test-admin?email=admin@innerspell.com');
    const data = await response.json();
    
    console.log('📧 관리자 이메일 확인 결과:', {
      email: data.email,
      isAdmin: data.isAdmin,
      adminEmails: data.adminEmails
    });
    
    // 5. 블로그 관리 API 테스트
    console.log('\n🔍 블로그 관리 API 테스트...');
    const blogResponse = await fetch('http://localhost:4000/api/blog/posts');
    const blogData = await blogResponse.json();
    
    console.log('📝 블로그 포스트 API 응답:', {
      status: blogResponse.status,
      postsCount: blogData.posts ? blogData.posts.length : 0
    });
    
    await page.screenshot({ path: 'screenshots/admin_test_final.png' });
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'screenshots/admin_test_error.png' });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testAdminFunctionality().then(() => {
  console.log('\n🎉 관리자 기능 테스트 완료!');
}).catch(console.error);