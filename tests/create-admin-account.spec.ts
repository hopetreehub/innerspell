import { test, expect } from '@playwright/test';

/**
 * 관리자 계정 직접 생성 테스트
 */

test('관리자 계정 생성', async ({ page }) => {
  console.log('🚀 관리자 계정 생성 시작');
  
  // 1. 회원가입 페이지로 이동
  await page.goto('https://test-studio-firebase.vercel.app/sign-up');
  await page.waitForLoadState('networkidle');
  
  // 2. 관리자 계정 정보 입력
  const adminEmail = 'admin@innerspell.com';
  const adminPassword = 'admin123';
  const adminNickname = '관리자';
  
  // 닉네임 입력 (첫 번째 input)
  await page.fill('input[name="displayName"]', adminNickname);
  await page.waitForTimeout(500);
  
  // 이메일 입력
  await page.fill('input[name="email"]', adminEmail);
  await page.waitForTimeout(500);
  
  // 비밀번호 입력
  await page.fill('input[name="password"]', adminPassword);
  await page.waitForTimeout(500);
  
  // 3. 스크린샷 - 가입 전
  await page.screenshot({ 
    path: 'admin-signup-before.png',
    fullPage: true 
  });
  
  // 4. 회원가입 버튼 클릭
  const signupButton = page.locator('button', { hasText: '회원가입' }).or(
    page.locator('button', { hasText: '가입' })
  ).or(
    page.locator('button[type="submit"]')
  );
  
  if (await signupButton.isVisible()) {
    await signupButton.click();
    console.log('✅ 회원가입 버튼 클릭');
  } else {
    console.log('⚠️ 회원가입 버튼을 찾을 수 없음');
  }
  
  // 5. 결과 대기
  await page.waitForTimeout(3000);
  
  // 6. 결과 확인
  const currentUrl = page.url();
  const hasError = await page.locator('.text-red-500, .text-destructive, [role="alert"]').isVisible();
  const hasSuccess = currentUrl.includes('/dashboard') || currentUrl.includes('/') && !currentUrl.includes('/sign-up');
  
  console.log(`현재 URL: ${currentUrl}`);
  console.log(`오류 메시지: ${hasError}`);
  console.log(`가입 성공: ${hasSuccess}`);
  
  // 7. 스크린샷 - 가입 후
  await page.screenshot({ 
    path: 'admin-signup-after.png',
    fullPage: true 
  });
  
  // 8. 가입 성공 시 로그인 테스트
  if (hasSuccess && !hasError) {
    console.log('🎉 관리자 계정 생성 성공! 로그인 테스트 시작...');
    
    // 로그아웃 후 재로그인
    await page.goto('https://test-studio-firebase.vercel.app/sign-in');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    
    const loginButton = page.locator('button', { hasText: '로그인' });
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    
    // 관리자 메뉴 확인
    const adminMenu = await page.locator('text=관리자 설정').isVisible();
    console.log(`관리자 메뉴 표시: ${adminMenu}`);
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'admin-login-final.png',
      fullPage: true 
    });
    
    if (adminMenu) {
      console.log('🎯 SUCCESS: 관리자 계정 생성 및 로그인 완료!');
    } else {
      console.log('⚠️ 로그인은 성공했지만 관리자 메뉴가 보이지 않음');
    }
  } else {
    console.log('❌ 관리자 계정 생성 실패');
  }
  
  console.log('✅ 테스트 완료');
});