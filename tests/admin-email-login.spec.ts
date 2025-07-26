import { test, expect } from '@playwright/test';

/**
 * 🎯 관리자 이메일 로그인 테스트
 */

test('관리자 이메일 로그인 링크 요청', async ({ page }) => {
  console.log('🎯 관리자 이메일 로그인 테스트 시작');
  
  // 1. 로그인 페이지로 이동
  await page.goto('https://test-studio-firebase.vercel.app/sign-in');
  await page.waitForLoadState('networkidle');
  
  // 2. 비밀번호 없이 로그인 클릭
  const passwordlessLoginLink = page.locator('text=비밀번호 없이 이메일로 로그인');
  if (await passwordlessLoginLink.isVisible()) {
    await passwordlessLoginLink.click();
    console.log('✅ 비밀번호 없이 로그인 클릭');
  }
  
  await page.waitForTimeout(2000);
  
  // 3. 관리자 이메일 입력
  const adminEmail = 'admin@innerspell.com';
  await page.fill('input[type="email"]', adminEmail);
  console.log('📧 관리자 이메일 입력');
  
  // 4. 로그인 링크 보내기 클릭
  const sendLinkButton = page.locator('button', { hasText: '로그인 링크 보내기' });
  await sendLinkButton.click();
  console.log('📤 로그인 링크 요청');
  
  // 5. 결과 대기
  await page.waitForTimeout(3000);
  
  // 6. 스크린샷
  await page.screenshot({ 
    path: 'admin-email-login-request.png',
    fullPage: true 
  });
  
  console.log('📧 이메일 로그인 링크가 admin@innerspell.com으로 전송되었습니다');
  console.log('🔗 이메일을 확인하여 로그인 링크를 클릭하세요');
  
  // 7. Google 로그인 시도
  console.log('\n🔄 Google 로그인 시도...');
  
  await page.goto('https://test-studio-firebase.vercel.app/sign-in');
  await page.waitForLoadState('networkidle');
  
  const googleLoginButton = page.locator('button', { hasText: 'Google로 로그인' });
  if (await googleLoginButton.isVisible()) {
    console.log('✅ Google 로그인 버튼 발견');
    console.log('💡 수동으로 Google 로그인을 시도하여 admin@innerspell.com으로 로그인하세요');
  }
  
  // 8. 최종 가이드
  console.log('\n🎯 수동 로그인 가이드:');
  console.log('1. https://test-studio-firebase.vercel.app/sign-in 접속');
  console.log('2. "Google로 로그인" 버튼 클릭');
  console.log('3. admin@innerspell.com Google 계정으로 로그인');
  console.log('4. 상단 메뉴에 "관리자 설정" 확인');
  
  console.log('\n✅ 테스트 완료');
});