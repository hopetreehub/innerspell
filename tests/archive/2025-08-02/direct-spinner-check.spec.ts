import { test, expect } from '@playwright/test';

/**
 * 🚨 RootLayoutClient Spinner 직접 확인
 * Spinner가 계속 보이는지 확인
 */

const VERCEL_URL = 'https://test-studio-firebase-a4f0upaeh-johns-projects-bf5e60f3.vercel.app';

test('RootLayoutClient Spinner 상태 직접 확인', async ({ page }) => {
  console.log('🚨 RootLayoutClient Spinner 상태 확인 시작');
  
  // 콘솔 로그 캡처
  const allLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(`[${msg.type()}] ${text}`);
    console.log(`[BROWSER ${msg.type()}]: ${text}`);
  });
  
  // 1. 홈페이지 접속
  await page.goto(VERCEL_URL);
  
  // 즉시 페이지 상태 확인
  console.log('\n--- 즉시 페이지 상태 ---');
  const immediateSpinner = await page.locator('[size="large"]').isVisible();
  const immediateSpinnerGeneric = await page.locator('.animate-spin').isVisible();
  console.log(`대형 스피너 표시: ${immediateSpinner}`);
  console.log(`회전 애니메이션 표시: ${immediateSpinnerGeneric}`);
  
  // 3초 대기
  await page.waitForTimeout(3000);
  
  console.log('\n--- 3초 후 상태 ---');
  const afterSpinner = await page.locator('[size="large"]').isVisible();
  const afterSpinnerGeneric = await page.locator('.animate-spin').isVisible();
  const spinnerContent = await page.evaluate(() => {
    const spinners = document.querySelectorAll('.animate-spin, [size="large"]');
    return Array.from(spinners).map(el => el.outerHTML);
  });
  
  console.log(`대형 스피너 표시: ${afterSpinner}`);
  console.log(`회전 애니메이션 표시: ${afterSpinnerGeneric}`);
  console.log('스피너 HTML:', spinnerContent);
  
  // body 전체 내용 확인
  const bodyContent = await page.evaluate(() => {
    return document.body.innerText.substring(0, 500);
  });
  console.log('\n--- Body 내용 (첫 500자) ---');
  console.log(bodyContent);
  
  // 헤더가 있는지 확인
  const headerExists = await page.locator('header').isVisible();
  const navbarExists = await page.locator('nav').isVisible();
  console.log(`\n--- 구조 확인 ---`);
  console.log(`헤더 존재: ${headerExists}`);
  console.log(`네비게이션 존재: ${navbarExists}`);
  
  // 15초 더 대기
  console.log('\n--- 15초 더 대기 중... ---');
  await page.waitForTimeout(15000);
  
  console.log('\n--- 15초 후 최종 상태 ---');
  const finalSpinner = await page.locator('[size="large"]').isVisible();
  const finalSpinnerGeneric = await page.locator('.animate-spin').isVisible();
  const finalHeaderExists = await page.locator('header').isVisible();
  const finalNavbarExists = await page.locator('nav').isVisible();
  const finalLoginButton = await page.locator('text=로그인').isVisible();
  
  console.log(`대형 스피너 표시: ${finalSpinner}`);
  console.log(`회전 애니메이션 표시: ${finalSpinnerGeneric}`);
  console.log(`헤더 존재: ${finalHeaderExists}`);
  console.log(`네비게이션 존재: ${finalNavbarExists}`);
  console.log(`로그인 버튼 표시: ${finalLoginButton}`);
  
  // HTML 구조 덤프
  const htmlStructure = await page.evaluate(() => {
    const body = document.body;
    const children = Array.from(body.children);
    return children.map(child => ({
      tag: child.tagName,
      id: child.id,
      className: child.className,
      children: child.children.length
    }));
  });
  
  console.log('\n--- HTML 구조 ---');
  console.log(JSON.stringify(htmlStructure, null, 2));
  
  // 스크린샷 저장
  await page.screenshot({ 
    path: 'direct-spinner-check.png',
    fullPage: true 
  });
  console.log('✅ 스피너 체크 스크린샷 저장');
});