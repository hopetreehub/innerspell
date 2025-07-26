import { test, expect } from '@playwright/test';

/**
 * 간단한 관리자 메뉴 표시 확인
 */

test('InnerSpell 관리자 메뉴 확인', async ({ page }) => {
  console.log('🎯 InnerSpell 관리자 메뉴 확인 시작');
  
  // 1. 홈페이지 접속
  await page.goto('https://test-studio-firebase.vercel.app');
  await page.waitForLoadState('networkidle');
  
  // 2. 스크린샷 촬영
  await page.screenshot({ 
    path: 'innerspell-home-check.png',
    fullPage: true 
  });
  
  // 3. 네비게이션 메뉴 텍스트 확인
  const navTexts = await page.evaluate(() => {
    const navItems = document.querySelectorAll('nav a, nav button');
    return Array.from(navItems).map(item => item.textContent?.trim()).filter(Boolean);
  });
  
  console.log('\n현재 네비게이션 메뉴:');
  navTexts.forEach(text => console.log(`- ${text}`));
  
  // 4. 관리자 메뉴 존재 여부
  const adminMenuExists = navTexts.some(text => text?.includes('관리자'));
  console.log(`\n관리자 메뉴 표시: ${adminMenuExists}`);
  
  // 5. 로그인 버튼 확인
  const loginButton = await page.locator('text=로그인').first().isVisible().catch(() => false);
  console.log(`로그인 버튼 표시: ${loginButton}`);
  
  // 6. 사용자 프로필 확인
  const userProfile = await page.locator('[data-testid="user-profile"]').isVisible().catch(() => false);
  console.log(`사용자 프로필 표시: ${userProfile}`);
  
  console.log('\n✅ 테스트 완료');
});