import { test, expect } from '@playwright/test';

/**
 * 🎯 junsupark9999@gmail.com 관리자 로그인 테스트
 */

test('junsu 계정 관리자 권한 확인', async ({ page }) => {
  // 헤드리스 모드 비활성화
  test.slow();
  console.log('🎯 junsupark9999@gmail.com 관리자 권한 테스트 시작');
  
  // 콘솔 로그 캡처
  const authLogs: string[] = [];
  const navbarLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    
    if (text.includes('🔥') || text.includes('🎯') || text.includes('AuthContext')) {
      authLogs.push(text);
      console.log(`[AUTH] ${text}`);
    }
    
    if (text.includes('🔍 Navbar')) {
      navbarLogs.push(text);
      console.log(`[NAVBAR] ${text}`);
    }
  });
  
  // 1. 홈페이지 접속
  await page.goto('https://test-studio-firebase.vercel.app');
  await page.waitForLoadState('networkidle');
  console.log('✅ 홈페이지 접속');
  
  // 2. 초기 상태 확인
  await page.waitForTimeout(3000);
  
  const loginButton = await page.locator('text=로그인').first().isVisible();
  const adminMenu = await page.locator('text=관리자 설정').isVisible();
  
  console.log(`\n--- 초기 상태 ---`);
  console.log(`로그인 버튼: ${loginButton}`);
  console.log(`관리자 메뉴: ${adminMenu}`);
  
  // 3. Auth 로그 분석
  console.log(`\n--- Auth 로그 분석 (총 ${authLogs.length}개) ---`);
  authLogs.slice(0, 10).forEach(log => console.log(`  ${log}`));
  
  // 4. junsupark9999@gmail.com 감지 확인
  const hasJunsuDetection = authLogs.some(log => 
    log.includes('junsupark9999@gmail.com') || 
    log.includes('ADMIN EMAIL DETECTED')
  );
  
  console.log(`\njunsupark9999@gmail.com 감지: ${hasJunsuDetection}`);
  
  // 5. 관리자 권한 부여 로그 확인
  const hasAdminRoleLog = authLogs.some(log => 
    log.includes('with role: admin') || 
    log.includes('role: "admin"')
  );
  
  console.log(`관리자 권한 부여 로그: ${hasAdminRoleLog}`);
  
  // 6. Navbar 상태 로그 확인
  console.log(`\n--- Navbar 로그 (총 ${navbarLogs.length}개) ---`);
  if (navbarLogs.length > 0) {
    navbarLogs.slice(-5).forEach(log => console.log(`  ${log}`));
  } else {
    console.log('⚠️ Navbar 로그 없음 - 이전 배포 버전일 가능성');
  }
  
  // 7. 스크린샷
  await page.screenshot({ 
    path: 'junsu-admin-test-result.png',
    fullPage: true 
  });
  
  // 8. 결과 분석
  console.log(`\n--- 결과 분석 ---`);
  
  if (hasJunsuDetection && hasAdminRoleLog && adminMenu) {
    console.log('🎉 SUCCESS: junsupark9999@gmail.com이 관리자 권한으로 로그인됨');
  } else if (hasJunsuDetection && hasAdminRoleLog && !adminMenu) {
    console.log('⚠️ PARTIAL: 권한은 있지만 메뉴 표시 안됨 - Navbar 버그 가능성');
  } else if (hasJunsuDetection && !hasAdminRoleLog) {
    console.log('❌ FAIL: 계정 감지되었지만 admin 권한 미부여');
  } else {
    console.log('❌ FAIL: junsupark9999@gmail.com 로그인 미감지');
  }
  
  // 9. 수동 테스트 가이드
  console.log(`\n--- 수동 테스트 가이드 ---`);
  console.log('1. 새 시크릿 창에서 https://test-studio-firebase.vercel.app 접속');
  console.log('2. "로그인" → "Google로 로그인" 클릭');
  console.log('3. junsupark9999@gmail.com으로 로그인');
  console.log('4. 상단 메뉴에서 "관리자 설정" 확인');
  console.log('5. F12 콘솔에서 다음 로그 확인:');
  console.log('   - "🎯 AuthContext: ADMIN EMAIL DETECTED"');
  console.log('   - "with role: admin"');
  console.log('   - "🔍 Navbar: User state changed: {role: admin}"');
  
  console.log('\n✅ 테스트 완료');
});