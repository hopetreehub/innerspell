const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== Vercel 배포 상태 검증 시작 ===');
    
    // 1. 메인 페이지 접속
    console.log('1. 메인 페이지 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'main-page.png', fullPage: true });
    console.log('메인 페이지 스크린샷 저장: main-page.png');
    
    // 2. Encyclopedia 페이지 직접 접근
    console.log('2. Encyclopedia 페이지 직접 접근 중...');
    const encyclopediaResponse = await page.goto('https://test-studio-firebase.vercel.app/encyclopedia', { waitUntil: 'networkidle' });
    console.log(`Encyclopedia 페이지 응답 상태: ${encyclopediaResponse.status()}`);
    await page.screenshot({ path: 'encyclopedia-direct.png', fullPage: true });
    console.log('Encyclopedia 직접 접근 스크린샷 저장: encyclopedia-direct.png');
    
    // 3. Footer 링크 테스트를 위해 메인 페이지로 돌아가기
    console.log('3. Footer 링크 테스트를 위해 메인 페이지로 이동...');
    await page.goto('https://test-studio-firebase.vercel.app', { waitUntil: 'networkidle' });
    
    // Footer까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Footer의 Encyclopedia 링크 찾기 및 클릭
    const encyclopediaLink = page.locator('footer a[href="/encyclopedia"]');
    if (await encyclopediaLink.count() > 0) {
      console.log('Footer에서 Encyclopedia 링크 발견, 클릭 중...');
      await encyclopediaLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'encyclopedia-from-footer.png', fullPage: true });
      console.log('Footer에서 접근한 Encyclopedia 스크린샷 저장: encyclopedia-from-footer.png');
    } else {
      console.log('Footer에서 Encyclopedia 링크를 찾을 수 없음');
    }
    
    // 4. 네트워크 오류 확인
    console.log('4. 페이지에서 콘솔 오류 확인...');
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`Console Error: ${msg.text()}`);
      }
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        logs.push(`Network Error: ${response.url()} - ${response.status()}`);
      }
    });
    
    // 5. 최종 상태 확인
    await page.waitForTimeout(3000);
    
    console.log('=== 검증 결과 ===');
    console.log(`현재 URL: ${page.url()}`);
    console.log(`페이지 제목: ${await page.title()}`);
    
    if (logs.length > 0) {
      console.log('발견된 오류들:');
      logs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('오류 없음 - 정상 작동 중');
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'final-state.png', fullPage: true });
    console.log('최종 상태 스크린샷 저장: final-state.png');
    
  } catch (error) {
    console.error('검증 중 오류 발생:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  }
  
  // 브라우저를 5초간 유지하여 수동 확인 가능하도록
  console.log('5초간 브라우저 유지 중... 수동 확인 가능');
  await page.waitForTimeout(5000);
  
  await browser.close();
  console.log('=== 검증 완료 ===');
})();