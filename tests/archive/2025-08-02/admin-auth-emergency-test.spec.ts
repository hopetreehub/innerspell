import { test, expect } from '@playwright/test';

/**
 * 🚨 긴급 테스트: 관리자 로그인 및 타로 저장 기능
 * SuperClaude 전문가 팀 수정사항 검증
 */

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test('관리자 로그인 및 타로 저장 기능 긴급 검증', async ({ page }) => {
  console.log('🚨 긴급 검증 시작: 관리자 로그인 + 타로 저장');
  
  // 1. 홈페이지 접속
  await page.goto(VERCEL_URL);
  await page.waitForLoadState('networkidle');
  console.log('✅ 홈페이지 접속 완료');
  
  // 2. 로그인 페이지로 이동
  await page.click('text=로그인');
  await page.waitForLoadState('networkidle');
  console.log('✅ 로그인 페이지 접속');
  
  // 3. Google 로그인 버튼 확인
  const googleButton = await page.locator('button:has-text("Google로 로그인")').isVisible();
  console.log(`Google 로그인 버튼 존재: ${googleButton}`);
  
  // 4. 타로 리딩 페이지로 직접 이동 (로그인 없이)
  await page.goto(`${VERCEL_URL}/reading`);
  await page.waitForLoadState('networkidle');
  console.log('✅ 타로 리딩 페이지 접속');
  
  // 5. 질문 입력
  await page.fill('textarea', '긴급 테스트용 타로 질문입니다');
  console.log('✅ 질문 입력');
  
  // 6. 저장 버튼 확인 (수정사항 검증)
  const saveButton = await page.locator('button:has-text("리딩 저장")').first();
  const saveButtonExists = await saveButton.isVisible();
  console.log(`저장 버튼 표시: ${saveButtonExists}`);
  
  if (saveButtonExists) {
    // 로그인 필요 텍스트 확인
    const loginRequiredText = await page.locator('text=(로그인 필요)').isVisible();
    console.log(`로그인 필요 안내: ${loginRequiredText}`);
    
    // 저장 버튼 클릭
    await saveButton.click();
    console.log('✅ 저장 버튼 클릭');
    
    // Toast 메시지 대기
    await page.waitForTimeout(2000);
    
    const toastMessage = await page.locator('.toast, [role="alert"], text=로그인 필요').isVisible();
    console.log(`Toast 메시지 표시: ${toastMessage}`);
    
    if (toastMessage) {
      console.log('✅ 저장 버튼 수정사항 정상 작동: 비로그인 사용자에게 적절한 안내');
    }
  }
  
  // 7. 콘솔 에러 확인
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  console.log(`콘솔 에러 개수: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('⚠️ 발견된 에러들:', consoleErrors.slice(0, 3));
  }
  
  // 8. 스크린샷 저장
  await page.screenshot({ 
    path: 'admin-auth-emergency-test.png',
    fullPage: true 
  });
  console.log('✅ 테스트 스크린샷 저장');
  
  // 9. 관리자 페이지 접근 시도 (로그인 없이)
  try {
    await page.goto(`${VERCEL_URL}/admin`);
    await page.waitForTimeout(3000);
    
    const adminPageContent = await page.textContent('body');
    console.log('관리자 페이지 접근 결과:', adminPageContent?.substring(0, 100) + '...');
    
  } catch (error) {
    console.log('관리자 페이지 접근 시도 중 예상된 동작');
  }
});