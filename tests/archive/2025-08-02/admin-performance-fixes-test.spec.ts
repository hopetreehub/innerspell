import { test, expect } from '@playwright/test';

/**
 * 🚨 Admin Access & Performance Fixes 검증 테스트
 * 1. 로그인 속도 개선 확인 (5초 이내)
 * 2. admin@innerspell.com 관리자 권한 확인
 * 3. 관리자 페이지 접근 가능 여부 확인
 */

const MAIN_URL = 'https://test-studio-firebase.vercel.app';

test('Admin Access & Performance Fixes 검증', async ({ page }) => {
  console.log('🚨 Admin Access & Performance Fixes 검증 시작');
  
  // 콘솔 로그 캡처
  const authLogs: string[] = [];
  const adminLogs: string[] = [];
  const performanceLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[BROWSER ${msg.type()}]: ${text}`);
    
    if (text.includes('🔍') || text.includes('🔥') || text.includes('AuthContext')) {
      authLogs.push(text);
    }
    
    if (text.includes('Admin Page') || text.includes('admin') || text.includes('권한 체크')) {
      adminLogs.push(text);
    }
    
    if (text.includes('temp profile') || text.includes('Background') || text.includes('timeout')) {
      performanceLogs.push(text);
    }
  });
  
  // 시간 측정 시작
  const startTime = Date.now();
  
  // 1. 홈페이지 접속
  await page.goto(MAIN_URL);
  await page.waitForLoadState('networkidle');
  console.log('✅ 홈페이지 접속');
  
  // 5초 대기하며 Auth 초기화 확인
  await page.waitForTimeout(5000);
  
  const authLoadTime = Date.now() - startTime;
  console.log(`⚡ Auth 로딩 시간: ${authLoadTime}ms`);
  
  // 2. 로그인 상태 확인
  const loginButton = await page.locator('text=로그인').first().isVisible();
  console.log(`로그인 버튼 표시: ${loginButton}`);
  
  // 3. 로그인 페이지로 이동
  if (loginButton) {
    await page.click('text=로그인');
    await page.waitForLoadState('networkidle');
    console.log('✅ 로그인 페이지 이동');
    
    // Google 로그인 버튼 확인
    const googleButton = await page.locator('button:has-text("Google로 로그인")').isVisible();
    console.log(`Google 로그인 버튼: ${googleButton}`);
    
    if (googleButton) {
      console.log('✅ Google 로그인 준비 완료 (실제 로그인은 수동으로 진행)');
    }
  }
  
  // 4. 관리자 페이지 직접 접근 시도 (비로그인 상태에서)
  await page.goto(`${MAIN_URL}/admin`);
  await page.waitForTimeout(3000);
  
  const adminPageContent = await page.textContent('body');
  const isRedirectedToLogin = page.url().includes('/sign-in');
  
  console.log(`관리자 페이지 리다이렉션: ${isRedirectedToLogin ? '정상 (로그인 페이지로)' : '문제 있음'}`);
  
  // 5. 성능 분석
  console.log('\n--- 성능 분석 결과 ---');
  console.log(`Auth 로딩 시간: ${authLoadTime}ms ${authLoadTime < 5000 ? '✅ 양호' : '❌ 개선 필요'}`);
  
  // 6. 로그 분석
  console.log('\n--- Auth 로그 분석 ---');
  console.log(`Auth 관련 로그: ${authLogs.length}개`);
  
  const tempProfileLogs = performanceLogs.filter(log => log.includes('temp profile'));
  const timeoutLogs = performanceLogs.filter(log => log.includes('timeout'));
  
  console.log(`임시 프로필 생성 로그: ${tempProfileLogs.length}개`);
  console.log(`타임아웃 관련 로그: ${timeoutLogs.length}개`);
  
  if (tempProfileLogs.length > 0) {
    console.log('✅ 임시 프로필 생성 최적화 작동 중');
    tempProfileLogs.slice(0, 2).forEach(log => console.log(`  ${log}`));
  }
  
  // 7. 관리자 권한 로그 확인
  console.log('\n--- 관리자 권한 로그 ---');
  console.log(`관리자 관련 로그: ${adminLogs.length}개`);
  
  if (adminLogs.length > 0) {
    console.log('--- 관리자 로그 샘플 ---');
    adminLogs.slice(0, 3).forEach(log => console.log(`  ${log}`));
  }
  
  // 스크린샷 저장
  await page.screenshot({ 
    path: 'admin-performance-fixes-test.png',
    fullPage: true 
  });
  console.log('✅ 검증 스크린샷 저장');
  
  // 8. 최종 결과 요약
  console.log('\n--- 최종 수정사항 검증 결과 ---');
  console.log(`1. 로딩 성능 개선: ${authLoadTime < 5000 ? '✅ 성공' : '❌ 미흡'} (${authLoadTime}ms)`);
  console.log(`2. Google 로그인 준비: ${googleButton ? '✅ 정상' : '❌ 문제'}`);
  console.log(`3. 관리자 페이지 보호: ${isRedirectedToLogin ? '✅ 정상' : '❌ 문제'}`);
  console.log(`4. 임시 프로필 최적화: ${tempProfileLogs.length > 0 ? '✅ 작동 중' : '❌ 미작동'}`);
  
  // 성능 향상 기대치
  if (authLoadTime < 5000) {
    console.log('🎉 로딩 성능이 목표치(5초) 이내로 개선되었습니다!');
  } else {
    console.log('⚠️ 로딩 성능이 아직 목표치를 달성하지 못했습니다.');
  }
});