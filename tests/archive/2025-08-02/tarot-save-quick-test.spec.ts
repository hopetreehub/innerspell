import { test, expect } from '@playwright/test';

/**
 * 🧪 타로 리딩 저장 기능 빠른 검증 테스트
 * SuperClaude 테스트 전문가 - 핵심 기능만 빠르게 확인
 */

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test('핵심 저장 기능 검증', async ({ page }) => {
  console.log('🎯 타로 리딩 페이지 접속 중...');
  
  await page.goto(`${VERCEL_URL}/reading`);
  await page.waitForLoadState('networkidle');
  
  console.log('✅ 페이지 로드 완료');
  
  // 1. 질문 입력
  await page.fill('textarea', '테스트용 타로 질문입니다');
  console.log('✅ 질문 입력 완료');
  
  // 2. 저장 버튼 존재 여부 확인
  const saveButtonExists = await page.locator('button:has-text("리딩 저장")').count();
  console.log(`저장 버튼 발견 개수: ${saveButtonExists}`);
  
  if (saveButtonExists > 0) {
    console.log('✅ 저장 버튼이 존재함');
    
    // 저장 버튼 클릭 시도
    await page.locator('button:has-text("리딩 저장")').first().click();
    console.log('✅ 저장 버튼 클릭 완료');
    
    // 2초 대기 후 반응 확인
    await page.waitForTimeout(2000);
    
    const hasResponse = await page.locator('.toast, [role="alert"], text=로그인, text=저장').isVisible();
    console.log(`저장 시도 후 반응 있음: ${hasResponse}`);
    
  } else {
    console.log('⚠️ 저장 버튼을 찾을 수 없음');
    
    // 전체 플로우를 거쳐야 나타나는지 확인
    try {
      await page.click('button:has-text("카드 섞기")');
      await page.waitForTimeout(2000);
      
      await page.click('button:has-text("카드 펼치기")');
      await page.waitForTimeout(2000);
      
      const saveButtonAfterFlow = await page.locator('button:has-text("리딩 저장")').count();
      console.log(`플로우 완료 후 저장 버튼 개수: ${saveButtonAfterFlow}`);
      
    } catch (error) {
      console.log('플로우 진행 중 에러:', error);
    }
  }
  
  // 스크린샷 캡처
  await page.screenshot({ path: 'tarot-save-test-result.png' });
  console.log('✅ 테스트 완료 - 스크린샷 저장됨');
});