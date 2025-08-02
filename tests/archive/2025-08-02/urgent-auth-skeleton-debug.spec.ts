import { test, expect } from '@playwright/test';

/**
 * 🚨 긴급 UserNav 스켈레톤 무한 로딩 디버깅
 * 문제: 로그인 버튼이 보이지 않고 스켈레톤만 계속 표시됨
 */

const VERCEL_URL = 'https://test-studio-firebase-aw3tlrlgr-johns-projects-bf5e60f3.vercel.app';

test('UserNav 스켈레톤 무한 로딩 디버깅', async ({ page }) => {
  console.log('🚨 긴급: UserNav 스켈레톤 무한 로딩 디버깅 시작');
  
  // 콘솔 로그 캡처
  const authLogs: string[] = [];
  const errorLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[BROWSER ${msg.type()}]: ${text}`);
    
    if (text.includes('🔍') || text.includes('🔥') || text.includes('AuthContext') || text.includes('UserNav')) {
      authLogs.push(text);
    }
    
    if (msg.type() === 'error') {
      errorLogs.push(text);
    }
  });
  
  // 1. 홈페이지 접속
  await page.goto(VERCEL_URL);
  await page.waitForLoadState('networkidle');
  console.log('✅ 홈페이지 접속');
  
  // 5초 대기하며 로그 수집
  await page.waitForTimeout(5000);
  
  console.log('\n--- AuthContext/UserNav 로그들 ---');
  authLogs.forEach(log => console.log(`  ${log}`));
  
  // UserNav 상태 확인
  const skeletonExists = await page.locator('.animate-pulse').isVisible();
  const loginButtonExists = await page.locator('text=로그인').isVisible();
  const profileButtonExists = await page.locator('[data-testid="user-profile"]').isVisible();
  
  console.log('\n--- UserNav 상태 ---');
  console.log(`스켈레톤 표시: ${skeletonExists}`);
  console.log(`로그인 버튼 표시: ${loginButtonExists}`);
  console.log(`프로필 버튼 표시: ${profileButtonExists}`);
  
  // HTML 구조 확인
  const headerHtml = await page.locator('header').innerHTML();
  console.log('\n--- Header HTML 구조 ---');
  console.log(headerHtml.substring(0, 300) + '...');
  
  // UserNav 컴포넌트 상태 직접 확인
  const userNavContent = await page.evaluate(() => {
    const userNavs = document.querySelectorAll('[class*="UserNav"], nav');
    return Array.from(userNavs).map(nav => nav.outerHTML.substring(0, 200));
  });
  
  console.log('\n--- UserNav 컴포넌트들 ---');
  userNavContent.forEach((content, i) => {
    console.log(`${i + 1}. ${content}...`);
  });
  
  // 에러 로그 확인
  if (errorLogs.length > 0) {
    console.log('\n--- 발견된 에러들 ---');
    errorLogs.slice(0, 5).forEach(error => console.log(`  ERROR: ${error}`));
  }
  
  // 10초 더 대기하며 상태 변화 관찰
  console.log('\n--- 10초 더 대기하며 상태 변화 관찰 ---');
  await page.waitForTimeout(10000);
  
  const finalSkeletonExists = await page.locator('.animate-pulse').isVisible();
  const finalLoginButtonExists = await page.locator('text=로그인').isVisible();
  const finalProfileButtonExists = await page.locator('[data-testid="user-profile"]').isVisible();
  
  console.log('\n--- 10초 후 최종 상태 ---');
  console.log(`스켈레톤 표시: ${finalSkeletonExists}`);
  console.log(`로그인 버튼 표시: ${finalLoginButtonExists}`);
  console.log(`프로필 버튼 표시: ${finalProfileButtonExists}`);
  
  // 최종 AuthContext 로그들
  console.log('\n--- 최종 AuthContext 로그들 ---');
  authLogs.slice(-10).forEach(log => console.log(`  ${log}`));
  
  // 스크린샷 저장
  await page.screenshot({ 
    path: 'urgent-auth-skeleton-debug.png',
    fullPage: true 
  });
  console.log('✅ 긴급 디버깅 스크린샷 저장');
  
  // loading이 계속 true인지 확인하기 위해 React DevTools 정보 가져오기
  const reactState = await page.evaluate(() => {
    // React DevTools가 있다면 상태 정보를 가져오려고 시도
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      return 'React DevTools detected';
    }
    return 'No React DevTools';
  });
  
  console.log(`React 상태: ${reactState}`);
});