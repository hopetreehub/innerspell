const { chromium } = require('playwright');

async function testAdminManual() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 관리자 기능 수동 테스트 시작...');
    
    // 1. 관리자 페이지 접근
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/admin_test_01_admin_direct.png' });
    
    const pageContent = await page.textContent('body');
    console.log('페이지 상태:', pageContent.includes('관리자 권한을 확인하는 중') ? '로그인 필요' : '접근 가능');
    
    // 현재 URL 확인
    console.log('현재 URL:', page.url());
    
    // 2. 관리자 이메일 API 테스트
    console.log('\n🔍 관리자 이메일 설정 확인...');
    const response = await fetch('http://localhost:4000/api/test-admin?email=admin@innerspell.com');
    const data = await response.json();
    
    console.log('📧 관리자 이메일 확인:', {
      isAdmin: data.isAdmin,
      adminEmails: data.adminEmails
    });
    
    // 3. 로그인 페이지 확인 (리다이렉트된 경우)
    if (page.url().includes('/sign-in')) {
      console.log('\n✅ 관리자 페이지는 로그인이 필요함 (보안 OK)');
      
      // Google 로그인 버튼 확인
      const googleButton = await page.locator('button:has-text("Google")');
      if (await googleButton.isVisible()) {
        console.log('✅ Google 로그인 버튼 확인됨');
      }
    }
    
    await page.screenshot({ path: 'screenshots/admin_test_02_final_state.png' });
    
    // 4. 블로그 관리 API 확인
    console.log('\n🔍 블로그 관리 API 확인...');
    const blogResponse = await fetch('http://localhost:4000/api/blog/posts');
    const blogData = await blogResponse.json();
    
    console.log('📝 블로그 API 상태:', {
      status: blogResponse.status,
      hasData: !!blogData.posts
    });
    
    // 5. AI 공급자 API 확인  
    console.log('\n🔍 AI 공급자 API 확인...');
    const aiResponse = await fetch('http://localhost:4000/api/admin/ai-providers');
    console.log('🤖 AI 공급자 API 상태:', aiResponse.status);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
    await page.screenshot({ path: 'screenshots/admin_test_error.png' });
  } finally {
    await browser.close();
  }
}

testAdminManual().then(() => {
  console.log('\n🎉 관리자 기능 테스트 완료!');
}).catch(console.error);
