import { test, expect } from '@playwright/test';

/**
 * 🚨 실시간 로그인 디버깅 테스트
 * 브라우저 콘솔 로그를 실시간으로 캡처하여 문제 진단
 */

const VERCEL_URL = 'https://test-studio-firebase-aw3tlrlgr-johns-projects-bf5e60f3.vercel.app';

test('실시간 로그인 상태 디버깅', async ({ page }) => {
  console.log('🔍 실시간 로그인 디버깅 시작');
  
  // 콘솔 로그 캡처
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[BROWSER] ${msg.type()}: ${text}`);
    
    if (msg.type() === 'log') {
      consoleLogs.push(text);
    } else if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });
  
  // 1. 홈페이지 접속
  await page.goto(VERCEL_URL);
  await page.waitForLoadState('networkidle');
  console.log('✅ 홈페이지 접속');
  
  // 초기 상태 확인
  await page.waitForTimeout(2000);
  console.log('--- 초기 상태 로그 ---');
  consoleLogs.forEach(log => {
    if (log.includes('🔥') || log.includes('🔍')) {
      console.log(`  ${log}`);
    }
  });
  
  // 2. 로그인 버튼 클릭
  const loginButton = await page.locator('text=로그인').first();
  const isVisible = await loginButton.isVisible();
  console.log(`로그인 버튼 존재: ${isVisible}`);
  
  if (isVisible) {
    await loginButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ 로그인 페이지 이동');
    
    // 3. Google 로그인 시도 (실제로는 클릭만)
    const googleButton = await page.locator('button:has-text("Google로 로그인")');
    const googleExists = await googleButton.isVisible();
    console.log(`Google 로그인 버튼 존재: ${googleExists}`);
    
    if (googleExists) {
      // Google 로그인 클릭 (팝업은 자동으로 닫힐 것)
      try {
        await googleButton.click();
        console.log('✅ Google 로그인 버튼 클릭');
        
        // 5초 대기하며 로그 관찰
        await page.waitForTimeout(5000);
        
        console.log('--- 로그인 시도 후 로그 ---');
        consoleLogs.slice(-20).forEach(log => {
          if (log.includes('🔥') || log.includes('🔍') || log.includes('AuthContext') || log.includes('UserNav')) {
            console.log(`  ${log}`);
          }
        });
        
        // 현재 헤더 상태 확인
        const currentLoginButton = await page.locator('text=로그인').isVisible();
        const profileAvatar = await page.locator('[data-testid="user-profile"]').isVisible();
        
        console.log(`현재 상태 - 로그인 버튼: ${currentLoginButton}, 프로필 아바타: ${profileAvatar}`);
        
      } catch (error) {
        console.log('Google 로그인 클릭 중 예상된 팝업 동작:', error);
      }
    }
  }
  
  // 에러 로그 확인
  if (consoleErrors.length > 0) {
    console.log('--- 발견된 에러들 ---');
    consoleErrors.forEach(error => console.log(`  ERROR: ${error}`));
  }
  
  // 스크린샷 저장
  await page.screenshot({ path: 'auth-debug-live-test.png', fullPage: true });
  console.log('✅ 디버깅 스크린샷 저장');
});