import { test, expect } from '@playwright/test';

/**
 * 🎯 관리자 로그인 상태 실시간 검증
 */

test('관리자 로그인 상태 실시간 확인', async ({ page }) => {
  console.log('🎯 관리자 로그인 상태 실시간 검증 시작');
  
  // 모든 콘솔 로그 캡처
  const allLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(`[${msg.type()}] ${text}`);
    if (text.includes('user:') || text.includes('role:') || text.includes('admin')) {
      console.log(`🔍 [${msg.type()}] ${text}`);
    }
  });
  
  // 1. 홈페이지 접속
  await page.goto('https://test-studio-firebase.vercel.app');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✅ 홈페이지 접속 완료');
  
  // 2. 현재 인증 상태 확인
  const signUpButton = await page.locator('text=회원가입').isVisible();
  const loginButton = await page.locator('text=로그인').first().isVisible();
  const adminMenu = await page.locator('text=관리자 설정').isVisible();
  const userAvatar = await page.locator('[data-testid="user-avatar"], .user-avatar').isVisible();
  
  console.log('\\n--- 현재 UI 상태 ---');
  console.log(`회원가입 버튼: ${signUpButton}`);
  console.log(`로그인 버튼: ${loginButton}`);
  console.log(`관리자 메뉴: ${adminMenu}`);
  console.log(`사용자 아바타: ${userAvatar}`);
  
  // 3. JavaScript로 직접 사용자 상태 확인
  const userState = await page.evaluate(() => {
    // React DevTools나 전역 상태에서 사용자 정보 찾기
    return {
      hasAuth: typeof window !== 'undefined',
      localStorage: Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('firebase')),
      sessionStorage: Object.keys(sessionStorage).filter(key => key.includes('auth') || key.includes('firebase')),
      cookies: document.cookie
    };
  });
  
  console.log('\\n--- 브라우저 상태 ---');
  console.log(`LocalStorage auth keys: ${userState.localStorage.join(', ')}`);
  console.log(`SessionStorage auth keys: ${userState.sessionStorage.join(', ')}`);
  console.log(`Has cookies: ${userState.cookies.length > 0}`);
  
  // 4. 사용자 메뉴 구조 분석
  const navItems = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    if (!nav) return [];
    
    const items = Array.from(nav.querySelectorAll('a, button')).map(item => ({
      text: item.textContent?.trim() || '',
      href: item.getAttribute('href'),
      classes: item.className
    }));
    
    return items.filter(item => item.text.length > 0);
  });
  
  console.log('\\n--- 네비게이션 구조 ---');
  navItems.forEach(item => {
    console.log(`  - "${item.text}" (href: ${item.href})`);
  });
  
  // 5. 스크린샷
  await page.screenshot({ 
    path: 'current-login-state.png',
    fullPage: true 
  });
  
  // 6. 진단 결과
  console.log('\\n--- 진단 결과 ---');
  
  if (signUpButton && loginButton && !adminMenu) {
    console.log('❌ 현재 상태: 로그인되지 않음');
    console.log('💡 해결책: 실제 Google 로그인 필요');
    console.log('🔗 로그인 URL: https://test-studio-firebase.vercel.app/sign-in');
  } else if (!signUpButton && !loginButton && adminMenu) {
    console.log('✅ 현재 상태: 관리자로 로그인됨');
  } else if (!signUpButton && !loginButton && !adminMenu) {
    console.log('⚠️ 현재 상태: 일반 사용자로 로그인됨');
  } else {
    console.log('🤔 현재 상태: 알 수 없는 상태');
  }
  
  // 7. 상세 로그 분석
  const authRelatedLogs = allLogs.filter(log => 
    log.includes('AuthContext') || 
    log.includes('user:') || 
    log.includes('role:') ||
    log.includes('admin')
  );
  
  console.log(`\\n--- Auth 관련 로그 (${authRelatedLogs.length}개) ---`);
  authRelatedLogs.slice(0, 10).forEach(log => console.log(`  ${log}`));
  
  console.log('\\n✅ 검증 완료');
});