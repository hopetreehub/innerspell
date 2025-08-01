import { test, expect } from '@playwright/test';

test.describe('긴급 진단: 포트 4000 화면 문제', () => {
  test('포트 4000 현재 상태 스크린샷', async ({ page }) => {
    test.setTimeout(120000);
    
    // 포트 4000 접속
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // 전체 페이지 스크린샷
    await page.screenshot({ 
      path: 'emergency-screenshots/port-4000-current-state.png', 
      fullPage: true 
    });
    
    // 콘솔 에러 수집
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 5초 대기하여 에러 수집
    await page.waitForTimeout(5000);
    
    console.log('🔴 콘솔 에러:', consoleErrors);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('📄 페이지 제목:', title);
    
    // 메인 컨텐츠 확인
    const bodyContent = await page.locator('body').innerHTML();
    console.log('📝 Body 내용 길이:', bodyContent.length);
    
    // CSS 로딩 상태 확인
    const styles = await page.locator('style, link[rel="stylesheet"]').count();
    console.log('🎨 CSS 파일 수:', styles);
  });

  test('Vercel vs 로컬 비교', async ({ page }) => {
    test.setTimeout(120000);
    
    // Vercel 사이트 스크린샷
    await page.goto('https://innerspell.vercel.app', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.screenshot({ 
      path: 'emergency-screenshots/vercel-current-state.png', 
      fullPage: true 
    });
    
    const vercelTitle = await page.title();
    console.log('🌐 Vercel 제목:', vercelTitle);
    
    // 로컬 포트 4000 스크린샷
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.screenshot({ 
      path: 'emergency-screenshots/localhost-4000-state.png', 
      fullPage: true 
    });
    
    const localTitle = await page.title();
    console.log('🏠 로컬 제목:', localTitle);
    
    console.log('📊 제목 비교 결과:', vercelTitle === localTitle ? '✅ 동일' : '❌ 다름');
  });

  test('카드펼치기 기능 테스트', async ({ page }) => {
    test.setTimeout(120000);
    
    // 타로 페이지로 이동
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    await page.screenshot({ 
      path: 'emergency-screenshots/tarot-page-initial.png', 
      fullPage: true 
    });
    
    // 카드펼치기 관련 요소 찾기
    const cardElements = await page.locator('[class*="card"], [data-testid*="card"], img[src*="tarot"]').count();
    console.log('🃏 카드 요소 개수:', cardElements);
    
    // 펼치기 버튼 찾기
    const spreadButtons = await page.locator('button:has-text("펼치"), button:has-text("draw"), button:has-text("카드")').count();
    console.log('🔘 펼치기 버튼 개수:', spreadButtons);
    
    // 첫 번째 펼치기 버튼 클릭 시도
    if (spreadButtons > 0) {
      const firstButton = page.locator('button').first();
      const buttonText = await firstButton.textContent();
      console.log('🔘 첫 번째 버튼 텍스트:', buttonText);
      
      try {
        await firstButton.click({ timeout: 5000 });
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'emergency-screenshots/after-button-click.png', 
          fullPage: true 
        });
        
        console.log('✅ 버튼 클릭 성공');
      } catch (e) {
        console.log('❌ 버튼 클릭 실패:', e.message);
      }
    }
  });

  test('네트워크 및 리소스 분석', async ({ page }) => {
    test.setTimeout(120000);
    
    const failedRequests = [];
    const slowRequests = [];
    
    page.on('response', response => {
      const timing = response.timing();
      if (!response.ok()) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
      if (timing && timing.responseEnd > 5000) {
        slowRequests.push({
          url: response.url(),
          time: timing.responseEnd
        });
      }
    });
    
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 60000 });
    
    console.log('❌ 실패한 요청들:', failedRequests);
    console.log('🐌 느린 요청들 (5초 이상):', slowRequests);
    
    // 현재 로드된 리소스 분석
    const scripts = await page.locator('script').count();
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    const images = await page.locator('img').count();
    
    console.log('📊 리소스 분석:');
    console.log(`  - 스크립트: ${scripts}개`);
    console.log(`  - 스타일시트: ${stylesheets}개`);
    console.log(`  - 이미지: ${images}개`);
  });
});