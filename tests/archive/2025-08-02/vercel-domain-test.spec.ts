import { test, expect } from '@playwright/test';

/**
 * 🚨 다양한 Vercel 도메인 테스트
 * 올바른 도메인 찾기
 */

const DOMAINS_TO_TEST = [
  'https://test-studio-firebase.vercel.app',
  'https://test-studio-firebase-johns-projects-bf5e60f3.vercel.app',
  'https://test-studio-firebase-git-clean-main-johns-projects-bf5e60f3.vercel.app',
  'https://test-studio-firebase-8ey9md1ec-johns-projects-bf5e60f3.vercel.app', // Latest production
  'https://test-studio-firebase-a4f0upaeh-johns-projects-bf5e60f3.vercel.app'  // Latest preview
];

test('다양한 Vercel 도메인으로 앱 접근 테스트', async ({ page }) => {
  console.log('🚨 다양한 Vercel 도메인 테스트 시작');
  
  const results: Array<{url: string, works: boolean, content: string, error?: string}> = [];
  
  for (const url of DOMAINS_TO_TEST) {
    console.log(`\n--- 테스트 중: ${url} ---`);
    
    try {
      await page.goto(url, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const bodyContent = await page.evaluate(() => {
        return document.body.innerText.substring(0, 200);
      });
      
      const hasInnerSpell = bodyContent.includes('InnerSpell');
      const hasVercelLogin = bodyContent.includes('Continue with Email');
      const hasError = bodyContent.includes('404') || bodyContent.includes('Error');
      
      console.log(`내용 (첫 200자): ${bodyContent}`);
      console.log(`InnerSpell 포함: ${hasInnerSpell}`);
      console.log(`Vercel 로그인: ${hasVercelLogin}`);
      console.log(`에러 페이지: ${hasError}`);
      
      const works = hasInnerSpell && !hasVercelLogin && !hasError;
      
      results.push({
        url,
        works,
        content: bodyContent
      });
      
      if (works) {
        console.log('✅ 이 URL이 정상 작동합니다!');
        
        // 정상 작동하는 URL에서 Auth 테스트
        console.log('\n--- Auth 상태 확인 ---');
        
        const authLogs: string[] = [];
        page.on('console', msg => {
          const text = msg.text();
          if (text.includes('🔍') || text.includes('🔥') || text.includes('AuthContext')) {
            authLogs.push(text);
            console.log(`[AUTH] ${text}`);
          }
        });
        
        await page.waitForTimeout(5000);
        
        const loginButton = await page.locator('text=로그인').isVisible();
        const spinner = await page.locator('.animate-spin').isVisible();
        const header = await page.locator('header').isVisible();
        
        console.log(`로그인 버튼: ${loginButton}`);
        console.log(`스피너: ${spinner}`);
        console.log(`헤더: ${header}`);
        console.log(`Auth 로그 개수: ${authLogs.length}`);
        
        // 스크린샷 저장
        await page.screenshot({ 
          path: `working-domain-${url.split('.')[0].split('//')[1]}.png`,
          fullPage: true 
        });
      }
      
    } catch (error) {
      console.log(`❌ 에러: ${error}`);
      results.push({
        url,
        works: false,
        content: '',
        error: String(error)
      });
    }
  }
  
  console.log('\n--- 최종 결과 요약 ---');
  results.forEach(result => {
    console.log(`${result.works ? '✅' : '❌'} ${result.url}`);
    if (result.error) {
      console.log(`   에러: ${result.error}`);
    }
  });
  
  const workingUrls = results.filter(r => r.works);
  console.log(`\n정상 작동하는 URL 개수: ${workingUrls.length}`);
  
  if (workingUrls.length > 0) {
    console.log('정상 작동하는 URL들:');
    workingUrls.forEach(r => console.log(`  - ${r.url}`));
  } else {
    console.log('❌ 정상 작동하는 URL이 없습니다!');
  }
});