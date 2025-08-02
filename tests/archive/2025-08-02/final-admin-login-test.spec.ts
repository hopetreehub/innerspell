import { test, expect } from '@playwright/test';

/**
 * 🎯 최종 관리자 로그인 테스트
 * admin@innerspell.com 계정이 존재하므로 로그인 테스트
 */

test('최종 관리자 로그인 및 메뉴 확인', async ({ page }) => {
  console.log('🎯 최종 관리자 로그인 테스트 시작');
  
  // 1. 로그인 페이지로 이동
  await page.goto('https://test-studio-firebase.vercel.app/sign-in');
  await page.waitForLoadState('networkidle');
  console.log('✅ 로그인 페이지 접속');
  
  // 2. 관리자 계정으로 로그인 시도
  const adminEmail = 'admin@innerspell.com';
  const adminPassword = 'admin123';
  
  await page.fill('input[name="email"]', adminEmail);
  await page.fill('input[name="password"]', adminPassword);
  
  console.log('📝 관리자 계정 정보 입력 완료');
  
  // 3. 로그인 버튼 클릭
  const loginButton = page.locator('button', { hasText: '로그인' }).first();
  await loginButton.click();
  console.log('🔐 로그인 버튼 클릭');
  
  // 4. 로딩 대기
  await page.waitForTimeout(5000);
  
  // 5. 로그인 결과 확인
  const currentUrl = page.url();
  const hasLoginError = await page.locator('.text-red-500, .text-destructive, [role="alert"]').isVisible();
  const isStillOnLoginPage = currentUrl.includes('/sign-in');
  
  console.log(`현재 URL: ${currentUrl}`);
  console.log(`로그인 오류: ${hasLoginError}`);
  console.log(`로그인 페이지에 머물러 있음: ${isStillOnLoginPage}`);
  
  // 6. 스크린샷 촬영
  await page.screenshot({ 
    path: 'final-admin-login-result.png',
    fullPage: true 
  });
  
  if (!hasLoginError && !isStillOnLoginPage) {
    console.log('🎉 로그인 성공! 관리자 메뉴 확인 중...');
    
    // 7. 관리자 메뉴 확인
    await page.waitForTimeout(2000);
    
    const adminMenuVisible = await page.locator('text=관리자 설정').isVisible();
    const adminMenuCount = await page.locator('text=관리자 설정').count();
    const shieldIcon = await page.locator('[data-testid="ShieldIcon"], .lucide-shield').isVisible();
    
    console.log(`관리자 메뉴 표시: ${adminMenuVisible}`);
    console.log(`관리자 메뉴 개수: ${adminMenuCount}`);
    console.log(`Shield 아이콘: ${shieldIcon}`);
    
    // 8. 네비게이션 전체 구조 확인
    const allNavItems = await page.evaluate(() => {
      const navItems = document.querySelectorAll('nav a, nav button');
      return Array.from(navItems).map(item => item.textContent?.trim()).filter(Boolean);
    });
    
    console.log('\n📋 전체 네비게이션 메뉴:');
    allNavItems.forEach(item => console.log(`  - ${item}`));
    
    // 9. 사용자 정보 확인
    const userInfo = await page.evaluate(() => {
      // 사용자 정보를 찾을 수 있는 요소들 확인
      const userElements = document.querySelectorAll('[data-testid="user-profile"], .user-info, .user-menu');
      const result = [];
      userElements.forEach(el => {
        result.push(el.textContent?.trim() || 'empty');
      });
      return result;
    });
    
    console.log('\n👤 사용자 정보:');
    userInfo.forEach(info => console.log(`  - ${info}`));
    
    // 10. /admin 페이지 접근 테스트
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    await page.waitForTimeout(2000);
    
    const adminPageUrl = page.url();
    const hasAdminContent = await page.locator('text=관리자 대시보드, text=Admin Dashboard, text=관리자').isVisible();
    
    console.log(`\n🔧 관리자 페이지 테스트:`);
    console.log(`  URL: ${adminPageUrl}`);
    console.log(`  관리자 콘텐츠 표시: ${hasAdminContent}`);
    
    // 11. 최종 스크린샷
    await page.screenshot({ 
      path: 'final-admin-dashboard.png',
      fullPage: true 
    });
    
    // 12. 최종 결과
    if (adminMenuVisible && adminPageUrl.includes('/admin')) {
      console.log('\n🎯 SUCCESS: 관리자 로그인 및 권한 확인 완료!');
      console.log('✅ 관리자 메뉴 표시됨');
      console.log('✅ 관리자 페이지 접근 가능');
    } else {
      console.log('\n⚠️ PARTIAL SUCCESS: 로그인은 되었지만 관리자 권한 미확인');
    }
    
  } else {
    console.log('\n❌ 로그인 실패');
    
    if (hasLoginError) {
      const errorText = await page.locator('.text-red-500, .text-destructive, [role="alert"]').first().textContent();
      console.log(`오류 메시지: ${errorText}`);
    }
  }
  
  console.log('\n✅ 최종 테스트 완료');
});