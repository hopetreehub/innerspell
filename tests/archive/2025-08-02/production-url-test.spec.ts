import { test, expect } from '@playwright/test';

/**
 * 🚨 Production URL 테스트
 * 올바른 앱이 로드되는지 확인
 */

const PRODUCTION_URL = 'https://test-studio-firebase-8ey9md1ec-johns-projects-bf5e60f3.vercel.app';
const PREVIEW_URL = 'https://test-studio-firebase-a4f0upaeh-johns-projects-bf5e60f3.vercel.app';

test('Production 및 Preview URL 모두 테스트', async ({ page }) => {
  console.log('🚨 Production 및 Preview URL 테스트 시작');
  
  // Production URL 먼저 테스트
  console.log('\n--- Production URL 테스트 ---');
  await page.goto(PRODUCTION_URL);
  await page.waitForLoadState('networkidle');
  
  const prodBodyContent = await page.evaluate(() => {
    return document.body.innerText.substring(0, 300);
  });
  
  console.log('Production Body 내용:', prodBodyContent);
  
  const prodHasInnerSpell = prodBodyContent.includes('InnerSpell');
  const prodHasVercelLogin = prodBodyContent.includes('Continue with Email');
  
  console.log(`Production - InnerSpell 포함: ${prodHasInnerSpell}`);
  console.log(`Production - Vercel 로그인 페이지: ${prodHasVercelLogin}`);
  
  // Preview URL 테스트
  console.log('\n--- Preview URL 테스트 ---');
  await page.goto(PREVIEW_URL);
  await page.waitForLoadState('networkidle');
  
  const previewBodyContent = await page.evaluate(() => {
    return document.body.innerText.substring(0, 300);
  });
  
  console.log('Preview Body 내용:', previewBodyContent);
  
  const previewHasInnerSpell = previewBodyContent.includes('InnerSpell');
  const previewHasVercelLogin = previewBodyContent.includes('Continue with Email');
  
  console.log(`Preview - InnerSpell 포함: ${previewHasInnerSpell}`);
  console.log(`Preview - Vercel 로그인 페이지: ${previewHasVercelLogin}`);
  
  // 실제 앱이 로드되는 URL 확인
  let workingUrl = null;
  if (prodHasInnerSpell && !prodHasVercelLogin) {
    workingUrl = PRODUCTION_URL;
    console.log('✅ Production URL이 정상 작동');
  } else if (previewHasInnerSpell && !previewHasVercelLogin) {
    workingUrl = PREVIEW_URL;
    console.log('✅ Preview URL이 정상 작동');
  } else {
    console.log('❌ 두 URL 모두 문제가 있음');
  }
  
  // 정상 작동하는 URL이 있다면 추가 테스트
  if (workingUrl) {
    console.log(`\n--- ${workingUrl} 추가 테스트 ---`);
    await page.goto(workingUrl);
    await page.waitForLoadState('networkidle');
    
    // 콘솔 로그 캡처
    const authLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔍') || text.includes('🔥') || text.includes('AuthContext') || text.includes('UserNav') || text.includes('RootLayoutClient')) {
        authLogs.push(text);
        console.log(`[BROWSER] ${text}`);
      }
    });
    
    // 5초 대기
    await page.waitForTimeout(5000);
    
    const loginButton = await page.locator('text=로그인').isVisible();
    const spinner = await page.locator('.animate-spin').isVisible();
    const header = await page.locator('header').isVisible();
    
    console.log(`로그인 버튼: ${loginButton}`);
    console.log(`스피너: ${spinner}`);
    console.log(`헤더: ${header}`);
    console.log(`Auth 로그 개수: ${authLogs.length}`);
    
    if (authLogs.length > 0) {
      console.log('\n--- Auth 로그들 ---');
      authLogs.forEach(log => console.log(`  ${log}`));
    }
  }
  
  // 스크린샷 저장
  await page.screenshot({ 
    path: 'production-url-test.png',
    fullPage: true 
  });
  console.log('✅ URL 테스트 스크린샷 저장');
});