import { test, expect } from '@playwright/test';

/**
 * 🚨 관리자 메뉴 디버깅 테스트
 * 현재 사용자 권한 상태 및 메뉴 렌더링 조건 확인
 */

const MAIN_URL = 'https://test-studio-firebase.vercel.app';

test('관리자 메뉴 디버깅 - 사용자 권한 상태 확인', async ({ page }) => {
  console.log('🚨 관리자 메뉴 디버깅 시작');
  
  // 콘솔 로그 캡처
  const authLogs: string[] = [];
  const userStateLogs: string[] = [];
  const adminLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[BROWSER ${msg.type()}]: ${text}`);
    
    if (text.includes('UserNav state') || text.includes('user:')) {
      userStateLogs.push(text);
    }
    
    if (text.includes('admin') || text.includes('Admin') || text.includes('권한')) {
      adminLogs.push(text);
    }
    
    if (text.includes('AuthContext') || text.includes('🔥') || text.includes('🔍')) {
      authLogs.push(text);
    }
  });
  
  // 1. 홈페이지 접속 - 로그인 전 상태
  await page.goto(MAIN_URL);
  await page.waitForLoadState('networkidle');
  console.log('✅ 홈페이지 접속 (로그인 전)');
  
  // 3초 대기
  await page.waitForTimeout(3000);
  
  // 로그인 전 관리자 메뉴 확인
  const adminMenuBeforeLogin = await page.locator('text=관리자 설정').isVisible();
  const shieldIcon = await page.locator('[data-icon="shield"]').isVisible();
  const adminNavLink = await page.locator('a[href="/admin"]').isVisible();
  
  console.log('\n--- 로그인 전 관리자 메뉴 상태 ---');
  console.log(`관리자 설정 텍스트: ${adminMenuBeforeLogin}`);
  console.log(`Shield 아이콘: ${shieldIcon}`);
  console.log(`/admin 링크: ${adminNavLink}`);
  
  // 현재 사용자 상태 확인
  console.log('\n--- 현재 사용자 상태 로그 ---');
  const latestUserStates = userStateLogs.slice(-5);
  latestUserStates.forEach(log => console.log(`  ${log}`));
  
  // 2. JavaScript로 현재 user 객체 직접 확인
  const userObjectInfo = await page.evaluate(() => {
    // React DevTools나 전역 변수에서 user 정보 찾기
    const userElements = document.querySelectorAll('[data-testid="user-profile"]');
    const loginButtons = document.querySelectorAll('a[href="/sign-in"]');
    const adminLinks = document.querySelectorAll('a[href="/admin"]');
    
    return {
      hasUserProfile: userElements.length > 0,
      hasLoginButtons: loginButtons.length > 0,
      hasAdminLinks: adminLinks.length > 0,
      userElementsCount: userElements.length,
      loginButtonsCount: loginButtons.length,
      adminLinksCount: adminLinks.length
    };
  });
  
  console.log('\n--- DOM 요소 분석 ---');
  console.log(`사용자 프로필 요소: ${userObjectInfo.hasUserProfile} (${userObjectInfo.userElementsCount}개)`);
  console.log(`로그인 버튼: ${userObjectInfo.hasLoginButtons} (${userObjectInfo.loginButtonsCount}개)`);
  console.log(`관리자 링크: ${userObjectInfo.hasAdminLinks} (${userObjectInfo.adminLinksCount}개)`);
  
  // 3. Navbar HTML 구조 분석
  const navbarHtml = await page.locator('nav').first().innerHTML();
  const hasAdminInHtml = navbarHtml.includes('admin') || navbarHtml.includes('관리자');
  
  console.log('\n--- Navbar HTML 분석 ---');
  console.log(`Navbar에 admin 관련 내용: ${hasAdminInHtml}`);
  if (navbarHtml.length > 0) {
    // Shield 아이콘이나 관리자 관련 내용 찾기
    const adminMatches = navbarHtml.match(/admin|관리자|shield/gi);
    console.log(`발견된 admin 관련 키워드: ${adminMatches ? adminMatches.join(', ') : '없음'}`);
  }
  
  // 4. 로그인 시도 (Google 로그인 페이지까지만)
  const loginButton = await page.locator('text=로그인').first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
    await page.waitForLoadState('networkidle');
    console.log('\n✅ 로그인 페이지 이동');
    
    const googleLoginButton = await page.locator('button:has-text("Google로 로그인")').isVisible();
    console.log(`Google 로그인 버튼 존재: ${googleLoginButton}`);
    
    if (googleLoginButton) {
      console.log('💡 다음 단계: admin@innerspell.com으로 Google 로그인 후 관리자 메뉴 확인 필요');
    }
  }
  
  // 스크린샷 저장
  await page.screenshot({ 
    path: 'admin-menu-debug-test.png',
    fullPage: true 
  });
  console.log('✅ 디버깅 스크린샷 저장');
  
  // 5. 관리자 로그 분석
  console.log('\n--- 관리자 관련 로그 분석 ---');
  console.log(`관리자 관련 로그: ${adminLogs.length}개`);
  if (adminLogs.length > 0) {
    adminLogs.slice(0, 3).forEach(log => console.log(`  ${log}`));
  }
  
  // 6. 최종 진단
  console.log('\n--- 관리자 메뉴 미표시 원인 진단 ---');
  
  if (userObjectInfo.hasLoginButtons && !userObjectInfo.hasUserProfile) {
    console.log('🔍 원인: 사용자가 로그인하지 않음 → 관리자 메뉴 숨김 (정상)');
  } else if (userObjectInfo.hasUserProfile && !userObjectInfo.hasAdminLinks) {
    console.log('🚨 원인: 로그인했지만 admin 역할이 없음 → user.role 확인 필요');
  } else {
    console.log('🤔 원인: 기타 - 추가 분석 필요');
  }
  
  console.log('\n--- 해결 방법 ---');
  console.log('1. admin@innerspell.com으로 Google 로그인');
  console.log('2. 로그인 후 콘솔에서 user.role이 "admin"인지 확인');
  console.log('3. role이 "user"라면 서버 권한 로직 점검 필요');
});