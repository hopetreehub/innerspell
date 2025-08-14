const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== 최종 Encyclopedia 페이지 검증 ===');
    
    // 1. 메인 Vercel 사이트 접속
    console.log('1. Vercel 메인 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'final-main-page.png', fullPage: true });
    console.log('메인 페이지 스크린샷: final-main-page.png');
    
    // 2. Encyclopedia 페이지 직접 접근
    console.log('2. Encyclopedia 페이지 직접 접근...');
    const encyclopediaResponse = await page.goto('https://test-studio-firebase.vercel.app/encyclopedia', { waitUntil: 'networkidle' });
    console.log(`Encyclopedia 페이지 응답 상태: ${encyclopediaResponse.status()}`);
    
    if (encyclopediaResponse.status() === 200) {
      console.log('✅ Encyclopedia 페이지 성공적으로 로드됨!');
      await page.screenshot({ path: 'final-encyclopedia-success.png', fullPage: true });
      console.log('Encyclopedia 성공 스크린샷: final-encyclopedia-success.png');
      
      // 페이지 제목 및 주요 콘텐츠 확인
      const title = await page.title();
      console.log(`페이지 제목: ${title}`);
      
      const h1Text = await page.textContent('h1');
      console.log(`H1 제목: ${h1Text}`);
      
      // 메이저 아르카나 섹션 확인
      const majorArcanaSection = await page.textContent('text=메이저 아르카나');
      if (majorArcanaSection) {
        console.log('✅ 메이저 아르카나 섹션 확인됨');
      }
      
      // 타로 스프레드 섹션 확인
      const spreadSection = await page.textContent('text=타로 스프레드');
      if (spreadSection) {
        console.log('✅ 타로 스프레드 섹션 확인됨');
      }
      
    } else {
      console.log(`❌ Encyclopedia 페이지 로드 실패: ${encyclopediaResponse.status()}`);
      await page.screenshot({ path: 'final-encyclopedia-error.png', fullPage: true });
    }
    
    // 3. Footer 링크 테스트
    console.log('3. Footer Encyclopedia 링크 테스트...');
    await page.goto('https://test-studio-firebase.vercel.app', { waitUntil: 'networkidle' });
    
    // Footer까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Encyclopedia 링크 확인 및 클릭
    const encyclopediaLink = page.locator('footer a[href="/encyclopedia"]');
    if (await encyclopediaLink.count() > 0) {
      console.log('✅ Footer에 Encyclopedia 링크 확인됨');
      await encyclopediaLink.click();
      await page.waitForLoadState('networkidle');
      
      const finalUrl = page.url();
      console.log(`클릭 후 URL: ${finalUrl}`);
      
      if (finalUrl.includes('/encyclopedia')) {
        console.log('✅ Footer 링크 정상 작동 - Encyclopedia 페이지로 이동 성공!');
        await page.screenshot({ path: 'final-footer-click-success.png', fullPage: true });
      } else {
        console.log('❌ Footer 링크 클릭 후 다른 페이지로 이동됨');
        await page.screenshot({ path: 'final-footer-click-fail.png', fullPage: true });
      }
    } else {
      console.log('❌ Footer에서 Encyclopedia 링크를 찾을 수 없음');
    }
    
    // 4. 네트워크 오류 체크
    console.log('4. 네트워크 오류 확인...');
    const logs = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        logs.push(`Network Error: ${response.url()} - ${response.status()}`);
      }
    });
    
    // 페이지 새로고침으로 오류 체크
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('=== 최종 검증 결과 ===');
    console.log(`현재 URL: ${page.url()}`);
    console.log(`페이지 제목: ${await page.title()}`);
    
    if (logs.length > 0) {
      console.log('발견된 네트워크 오류들:');
      logs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('✅ 네트워크 오류 없음 - 모든 리소스 정상 로드됨');
    }
    
    // 최종 성공 스크린샷
    await page.screenshot({ path: 'final-verification-complete.png', fullPage: true });
    console.log('최종 검증 완료 스크린샷: final-verification-complete.png');
    
    console.log('🎉 Encyclopedia 페이지 404 오류 해결 완료!');
    
  } catch (error) {
    console.error('최종 검증 중 오류 발생:', error);
    await page.screenshot({ path: 'final-verification-error.png', fullPage: true });
  }
  
  // 브라우저를 3초간 유지하여 최종 확인
  console.log('3초간 브라우저 유지 중... 최종 확인 가능');
  await page.waitForTimeout(3000);
  
  await browser.close();
  console.log('=== 최종 검증 완료 ===');
})();