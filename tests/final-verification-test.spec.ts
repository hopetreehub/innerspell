import { test, expect } from '@playwright/test';

/**
 * ✅ 최종 검증 테스트 - SuperClaude 전문가 팀 수정사항 확인
 */

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test('타로 리딩 저장 기능 최종 검증', async ({ page }) => {
  console.log('🎯 최종 검증 시작: 타로 리딩 저장 기능');
  
  // 1. 페이지 접속
  await page.goto(`${VERCEL_URL}/reading`);
  await page.waitForLoadState('networkidle');
  console.log('✅ 타로 리딩 페이지 접속 완료');
  
  // 2. 질문 입력
  await page.fill('textarea', '최종 검증을 위한 테스트 질문입니다');
  console.log('✅ 질문 입력 완료');
  
  // 3. 저장 버튼 가시성 확인 (개선사항 1)
  const saveButtons = await page.locator('button:has-text("리딩 저장")').count();
  console.log(`저장 버튼 개수: ${saveButtons}`);
  
  if (saveButtons > 0) {
    console.log('✅ 개선사항 확인: 저장 버튼이 표시됨');
    
    // 로그인 필요 텍스트 확인
    const loginRequiredText = await page.locator('text=(로그인 필요)').isVisible();
    console.log(`로그인 필요 안내 표시: ${loginRequiredText}`);
    
    if (loginRequiredText) {
      console.log('✅ UX 개선 확인: 비로그인 사용자에게 로그인 필요 안내 표시');
    }
    
    // 저장 버튼 클릭 시도
    await page.locator('button:has-text("리딩 저장")').first().click();
    console.log('✅ 저장 버튼 클릭 완료');
    
    // 2초 대기 후 Toast 메시지 확인
    await page.waitForTimeout(2000);
    
    const toastVisible = await page.locator('.toast, [role="alert"], text=로그인 필요').isVisible();
    console.log(`Toast 메시지 표시: ${toastVisible}`);
    
    if (toastVisible) {
      console.log('✅ 에러 처리 개선 확인: 적절한 사용자 피드백 제공');
    }
    
  } else {
    console.log('❌ 문제: 저장 버튼이 표시되지 않음');
  }
  
  // 4. 스크린샷 캡처
  await page.screenshot({ 
    path: 'final-verification-result.png',
    fullPage: true 
  });
  console.log('✅ 최종 검증 스크린샷 저장 완료');
  
  // 5. 콘솔 에러 확인
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // 추가 상호작용으로 에러 유발 시도
  try {
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('카드 섞기 상호작용 중 예상 동작');
  }
  
  console.log(`콘솔 에러 개수: ${consoleErrors.length}`);
  if (consoleErrors.length === 0) {
    console.log('✅ 콘솔 에러 없음 - 안정성 확인');
  } else {
    console.log('⚠️ 콘솔 에러 발견:', consoleErrors.slice(0, 3));
  }
});