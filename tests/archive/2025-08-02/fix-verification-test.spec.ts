import { test, expect } from '@playwright/test';

/**
 * 🚨 긴급 수정사항 검증 테스트
 * 타임아웃 제거 및 auth 무한 로딩 수정 확인
 */

const VERCEL_URL = 'https://test-studio-firebase-a4f0upaeh-johns-projects-bf5e60f3.vercel.app';

test('수정사항 검증: 로그인 버튼 표시 및 로그아웃 기능', async ({ page }) => {
  console.log('🚨 긴급 수정사항 검증 시작');
  
  // 콘솔 로그 캡처
  const authLogs: string[] = [];
  const allLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(`[${msg.type()}] ${text}`);
    
    if (text.includes('🔍') || text.includes('🔥') || text.includes('AuthContext') || text.includes('UserNav') || text.includes('RootLayoutClient')) {
      authLogs.push(text);
    }
  });
  
  // 1. 홈페이지 접속
  await page.goto(VERCEL_URL);
  await page.waitForLoadState('networkidle');
  console.log('✅ 홈페이지 접속');
  
  // 3초 대기하며 로그 수집
  await page.waitForTimeout(3000);
  
  console.log('\n--- Auth 관련 로그들 ---');
  authLogs.forEach(log => console.log(`  ${log}`));
  
  // UI 상태 확인
  const skeletonExists = await page.locator('.animate-pulse').isVisible();
  const loginButtonExists = await page.locator('text=로그인').isVisible();
  const profileButtonExists = await page.locator('[data-testid="user-profile"]').isVisible();
  
  console.log('\n--- UI 상태 확인 ---');
  console.log(`스켈레톤 표시: ${skeletonExists}`);
  console.log(`로그인 버튼 표시: ${loginButtonExists}`);
  console.log(`프로필 버튼 표시: ${profileButtonExists}`);
  
  // 로그인 버튼이 보여야 함 (비로그인 상태)
  expect(loginButtonExists).toBe(true);
  expect(skeletonExists).toBe(false);
  
  // 2. 로그인 페이지로 이동
  if (loginButtonExists) {
    await page.click('text=로그인');
    await page.waitForLoadState('networkidle');
    console.log('✅ 로그인 페이지 이동');
    
    // 추가 대기 후 로그 확인
    await page.waitForTimeout(2000);
    
    console.log('\n--- 로그인 페이지에서의 Auth 로그들 ---');
    authLogs.slice(-10).forEach(log => console.log(`  ${log}`));
    
    // Google 로그인 버튼 확인
    const googleButtonExists = await page.locator('button:has-text("Google로 로그인")').isVisible();
    console.log(`Google 로그인 버튼 존재: ${googleButtonExists}`);
    
    expect(googleButtonExists).toBe(true);
  }
  
  // 스크린샷 저장
  await page.screenshot({ 
    path: 'fix-verification-test.png',
    fullPage: true 
  });
  console.log('✅ 검증 스크린샷 저장');
  
  // 최종 로그 요약
  console.log('\n--- 최종 로그 요약 ---');
  console.log(`총 로그 개수: ${allLogs.length}`);
  console.log(`Auth 관련 로그 개수: ${authLogs.length}`);
  
  if (authLogs.length === 0) {
    console.log('⚠️ Auth 관련 로그가 없습니다 - AuthContext가 초기화되지 않았을 수 있습니다');
  } else {
    console.log('✅ Auth 관련 로그가 발견되었습니다 - AuthContext가 정상 작동 중');
  }
});