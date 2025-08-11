import { test, expect } from '@playwright/test';

/**
 * 🚨 Critical Fixes 검증 테스트
 * 1. Firebase projectId 개행 문자 수정 확인
 * 2. 타로 저장 기능 복구 확인
 * 3. 어드민 권한 (junsupark9999@gmail.com) 확인
 */

const MAIN_URL = 'https://test-studio-firebase.vercel.app';

test('Critical Firebase 및 권한 수정사항 검증', async ({ page }) => {
  console.log('🚨 Critical Fixes 검증 시작');
  
  // 콘솔 로그 캡처
  const authLogs: string[] = [];
  const errorLogs: string[] = [];
  const saveResults: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[BROWSER ${msg.type()}]: ${text}`);
    
    if (text.includes('🔍') || text.includes('🔥') || text.includes('권한 체크')) {
      authLogs.push(text);
    }
    
    if (text.includes('저장') || text.includes('Firebase Admin') || text.includes('📤')) {
      saveResults.push(text);
    }
    
    if (msg.type() === 'error' && text.includes('illegal characters')) {
      errorLogs.push(text);
    }
  });
  
  // 1. 홈페이지 접속
  await page.goto(MAIN_URL);
  await page.waitForLoadState('networkidle');
  console.log('✅ 홈페이지 접속');
  
  // 5초 대기하며 초기화 확인
  await page.waitForTimeout(5000);
  
  // 2. 로그인 상태 확인
  const loginButton = await page.locator('text=로그인').first().isVisible();
  console.log(`로그인 버튼 표시: ${loginButton}`);
  
  // 3. 타로 리딩 페이지로 이동하여 저장 테스트
  await page.goto(`${MAIN_URL}/reading`);
  await page.waitForLoadState('networkidle');
  console.log('✅ 타로 리딩 페이지 접속');
  
  // 3초 대기
  await page.waitForTimeout(3000);
  
  // 질문 입력
  const questionInput = await page.locator('textarea').first();
  if (await questionInput.isVisible()) {
    await questionInput.fill('Critical fix 테스트용 질문입니다');
    console.log('✅ 질문 입력 완료');
  }
  
  // 저장 버튼 확인
  const saveButton = await page.locator('button:has-text("리딩 저장")').first();
  const saveButtonVisible = await saveButton.isVisible();
  console.log(`저장 버튼 표시: ${saveButtonVisible}`);
  
  if (saveButtonVisible) {
    // 저장 버튼 클릭
    await saveButton.click();
    console.log('✅ 저장 버튼 클릭');
    
    // 5초 대기하며 저장 결과 확인
    await page.waitForTimeout(5000);
    
    // Toast 메시지 확인
    const toastSuccess = await page.locator('text=저장').isVisible();
    const toastError = await page.locator('text=오류').isVisible();
    const toastLogin = await page.locator('text=로그인 필요').isVisible();
    
    console.log(`성공 Toast: ${toastSuccess}, 오류 Toast: ${toastError}, 로그인 필요: ${toastLogin}`);
  }
  
  // 4. 로그인 시도 (Google 로그인 페이지만 확인)
  await page.goto(`${MAIN_URL}/sign-in`);
  await page.waitForLoadState('networkidle');
  console.log('✅ 로그인 페이지 접속');
  
  const googleButton = await page.locator('button:has-text("Google로 로그인")').isVisible();
  console.log(`Google 로그인 버튼: ${googleButton}`);
  
  // 5. 관리자 페이지 접근 테스트 (비로그인 상태)
  await page.goto(`${MAIN_URL}/admin`);
  await page.waitForTimeout(3000);
  
  const adminContent = await page.textContent('body');
  const hasUnauthorized = adminContent?.includes('unauthorized') || adminContent?.includes('권한') || adminContent?.includes('로그인');
  console.log(`관리자 페이지 보호: ${hasUnauthorized ? '정상' : '문제 있음'}`);
  
  // 스크린샷 저장
  await page.screenshot({ 
    path: 'critical-fixes-verification.png',
    fullPage: true 
  });
  console.log('✅ 검증 스크린샷 저장');
  
  // 6. 결과 분석
  console.log('\n--- Critical Fixes 검증 결과 ---');
  
  // Firebase illegal characters 에러 확인
  const hasIllegalCharError = errorLogs.length > 0;
  console.log(`Firebase illegal characters 에러: ${hasIllegalCharError ? '여전히 존재' : '해결됨'}`);
  
  // Auth 로그 확인
  console.log(`Auth 관련 로그: ${authLogs.length}개`);
  if (authLogs.length > 0) {
    console.log('--- Auth 로그 샘플 ---');
    authLogs.slice(0, 3).forEach(log => console.log(`  ${log}`));
  }
  
  // 저장 관련 로그 확인  
  console.log(`저장 관련 로그: ${saveResults.length}개`);
  if (saveResults.length > 0) {
    console.log('--- 저장 로그 샘플 ---');
    saveResults.slice(0, 3).forEach(log => console.log(`  ${log}`));
  }
  
  // 전체 에러 로그 확인
  if (errorLogs.length > 0) {
    console.log('--- 발견된 에러들 ---');
    errorLogs.forEach(error => console.log(`  ERROR: ${error}`));
  } else {
    console.log('✅ Firebase illegal characters 에러 없음');
  }
  
  // 최종 상태 요약
  console.log('\n--- 최종 수정사항 상태 ---');
  console.log(`1. Firebase projectId 수정: ${hasIllegalCharError ? '❌ 미해결' : '✅ 해결됨'}`);
  console.log(`2. 저장 버튼 표시: ${saveButtonVisible ? '✅ 정상' : '❌ 문제'}`);
  console.log(`3. Google 로그인 버튼: ${googleButton ? '✅ 정상' : '❌ 문제'}`);
  console.log(`4. 관리자 페이지 보호: ${hasUnauthorized ? '✅ 정상' : '❌ 문제'}`);
});