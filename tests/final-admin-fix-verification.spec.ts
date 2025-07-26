import { test, expect } from '@playwright/test';

/**
 * 🎯 최종 관리자 권한 수정 검증
 * Fallback 프로필에서도 admin 권한 부여 확인
 */

const MAIN_URL = 'https://test-studio-firebase.vercel.app';

test('최종 admin@innerspell.com 권한 및 메뉴 표시 검증', async ({ page }) => {
  console.log('🎯 최종 관리자 권한 수정 검증 시작');
  
  // 콘솔 로그 캡처
  const allLogs: string[] = [];
  const authLogs: string[] = [];
  const navbarLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(`[${msg.type()}] ${text}`);
    
    if (text.includes('🔥') || text.includes('AuthContext')) {
      authLogs.push(text);
      console.log(`[AUTH] ${text}`);
    }
    
    if (text.includes('🔍 Navbar')) {
      navbarLogs.push(text);
      console.log(`[NAVBAR] ${text}`);
    }
  });
  
  // 1. 홈페이지 접속
  await page.goto(MAIN_URL);
  await page.waitForLoadState('networkidle');
  console.log('✅ 홈페이지 접속 완료');
  
  // 3초 대기
  await page.waitForTimeout(3000);
  
  // 2. 초기 상태 확인
  const loginButtonExists = await page.locator('text=로그인').first().isVisible();
  const adminMenuExists = await page.locator('text=관리자 설정').isVisible();
  
  console.log('\n--- 초기 상태 (로그인 전) ---');
  console.log(`로그인 버튼: ${loginButtonExists}`);
  console.log(`관리자 메뉴: ${adminMenuExists}`);
  
  // 3. Auth 로그 분석
  console.log('\n--- Auth 로그 분석 ---');
  console.log(`총 Auth 로그: ${authLogs.length}개`);
  
  // Fallback 프로필 생성 로그 찾기
  const fallbackLogs = authLogs.filter(log => 
    log.includes('Created fallback profile') || 
    log.includes('No profile found') ||
    log.includes('getUserProfile result: null')
  );
  
  if (fallbackLogs.length > 0) {
    console.log('\n🔍 Fallback 프로필 관련 로그:');
    fallbackLogs.forEach(log => console.log(`  ${log}`));
  }
  
  // 4. Navbar 로그 분석
  console.log('\n--- Navbar 상태 로그 ---');
  console.log(`총 Navbar 로그: ${navbarLogs.length}개`);
  
  if (navbarLogs.length > 0) {
    console.log('최신 Navbar 로그:');
    navbarLogs.slice(-3).forEach(log => console.log(`  ${log}`));
  } else {
    console.log('⚠️ Navbar 로그가 없습니다 - 이전 배포 버전일 가능성');
  }
  
  // 5. 로그인 페이지로 이동 (테스트 목적)
  if (loginButtonExists) {
    await page.click('text=로그인');
    await page.waitForLoadState('networkidle');
    console.log('\n✅ 로그인 페이지 이동');
    
    const googleLoginButton = await page.locator('button:has-text("Google로 로그인")').isVisible();
    console.log(`Google 로그인 버튼: ${googleLoginButton}`);
  }
  
  // 6. 직접 admin 페이지 접근 시도
  await page.goto(`${MAIN_URL}/admin`);
  await page.waitForTimeout(2000);
  
  const isRedirectedToLogin = page.url().includes('/sign-in');
  const adminPageTitle = await page.locator('text=관리자 대시보드').isVisible();
  
  console.log('\n--- 관리자 페이지 접근 테스트 ---');
  console.log(`로그인 페이지로 리다이렉트: ${isRedirectedToLogin}`);
  console.log(`관리자 대시보드 표시: ${adminPageTitle}`);
  
  // 7. 캐시 상태 확인
  const cacheCheckCode = `
    const logs = [];
    logs.push('LocalStorage items: ' + Object.keys(localStorage).length);
    logs.push('SessionStorage items: ' + Object.keys(sessionStorage).length);
    
    // Firebase auth 상태 확인
    const authKeys = Object.keys(localStorage).filter(key => key.includes('firebase'));
    logs.push('Firebase auth keys: ' + authKeys.length);
    
    return logs;
  `;
  
  const cacheStatus = await page.evaluate(cacheCheckCode);
  console.log('\n--- 캐시 상태 ---');
  cacheStatus.forEach(status => console.log(`  ${status}`));
  
  // 스크린샷 저장
  await page.screenshot({ 
    path: 'final-admin-fix-verification.png',
    fullPage: true 
  });
  console.log('\n✅ 최종 검증 스크린샷 저장');
  
  // 8. 최종 진단
  console.log('\n--- 최종 진단 결과 ---');
  
  if (navbarLogs.length === 0) {
    console.log('❌ 새 배포가 아직 적용되지 않음 (Navbar 디버깅 로그 없음)');
    console.log('💡 해결책: 캐시 강제 새로고침 필요 (Ctrl+Shift+R)');
  } else if (navbarLogs.some(log => log.includes('role: admin'))) {
    console.log('✅ Admin 권한이 정상적으로 부여됨');
    console.log('✅ 관리자 메뉴가 표시되어야 함');
  } else {
    console.log('⚠️ Admin 권한 부여 실패 - 추가 분석 필요');
  }
  
  // 9. 수동 테스트 가이드
  console.log('\n--- 수동 테스트 가이드 ---');
  console.log('1. 시크릿 창에서 https://test-studio-firebase.vercel.app 접속');
  console.log('2. admin@innerspell.com으로 Google 로그인');
  console.log('3. 상단 메뉴에 "관리자 설정" 확인');
  console.log('4. 콘솔에서 다음 로그 확인:');
  console.log('   - Created fallback profile for admin@innerspell.com with role: admin');
  console.log('   - Navbar: User state changed: {...role: "admin", isAdmin: true}');
});