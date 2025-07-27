const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Vercel 배포 사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'step1-homepage.png', fullPage: true });
    console.log('홈페이지 스크린샷 저장: step1-homepage.png');

    // 페이지 로드 대기
    await page.waitForTimeout(3000);

    console.log('\n2. /admin 경로로 이동 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'step2-admin-page.png', fullPage: true });
    console.log('관리자 페이지 스크린샷 저장: step2-admin-page.png');

    // Google 로그인 버튼 확인
    console.log('\n3. Google 로그인 버튼 찾는 중...');
    const googleLoginButton = await page.locator('button:has-text("Google로 로그인")').first();
    
    if (await googleLoginButton.isVisible()) {
      console.log('Google 로그인 버튼 발견!');
      await page.screenshot({ path: 'step3-login-button.png', fullPage: true });
      
      // 로그인 전 상태에서 타로 지침 정보 확인
      console.log('\n로그인 전 상태에서 타로 지침 정보 확인 중...');
      
      // 타로 지침 관련 텍스트 찾기
      const guidelineTexts = await page.locator('text=/타로 지침|지침 개수|완성도/i').all();
      console.log(`타로 지침 관련 텍스트 ${guidelineTexts.length}개 발견`);
      
      // 36개 지침 텍스트 확인
      const totalGuidelinesText = await page.locator('text=/36개|총 36개/').first();
      if (await totalGuidelinesText.isVisible()) {
        console.log('✓ 36개 지침 표시 확인!');
        const text = await totalGuidelinesText.textContent();
        console.log(`  표시된 텍스트: "${text}"`);
      }
      
      // 100% 완성도 확인
      const completionText = await page.locator('text=/100%|완성도.*100/').first();
      if (await completionText.isVisible()) {
        console.log('✓ 100% 완성도 표시 확인!');
        const text = await completionText.textContent();
        console.log(`  표시된 텍스트: "${text}"`);
      }
      
      // 스프레드별 지침 개수 확인
      console.log('\n스프레드별 지침 개수 확인 중...');
      const spreadTexts = [
        '위치별 상세 의미',
        '카드 간 관계성',
        '시간적 흐름',
        '에너지 패턴',
        '조언과 해결책',
        '종합 메시지'
      ];
      
      for (const spread of spreadTexts) {
        const spreadElement = await page.locator(`text=/${spread}/`).first();
        if (await spreadElement.isVisible()) {
          // 근처의 "6개" 텍스트 찾기
          const parent = await spreadElement.locator('..').first();
          const countText = await parent.locator('text=/6개/').first();
          if (await countText.isVisible()) {
            console.log(`✓ "${spread}": 6개 확인`);
          } else {
            console.log(`✗ "${spread}": 개수 확인 불가`);
          }
        }
      }
      
      await page.screenshot({ path: 'step4-guideline-info.png', fullPage: true });
      console.log('\n지침 정보 스크린샷 저장: step4-guideline-info.png');
      
      // Google 로그인 시도
      console.log('\n4. Google 로그인 시도 중...');
      try {
        await googleLoginButton.click();
        console.log('Google 로그인 버튼 클릭됨');
        
        // 새 창이나 팝업 대기
        await page.waitForTimeout(3000);
        
        // 로그인 후 상태 확인
        const isLoggedIn = await page.locator('button:has-text("로그아웃")').isVisible();
        if (isLoggedIn) {
          console.log('✓ 로그인 성공!');
          await page.screenshot({ path: 'step5-logged-in.png', fullPage: true });
          
          // 타로 지침 관리 시스템 재확인
          console.log('\n5. 로그인 후 타로 지침 관리 시스템 확인 중...');
          await page.screenshot({ path: 'step6-admin-logged-in.png', fullPage: true });
        } else {
          console.log('✗ 로그인 실패 또는 추가 인증 필요');
          await page.screenshot({ path: 'step5-login-failed.png', fullPage: true });
        }
      } catch (error) {
        console.log('Google 로그인 중 오류:', error.message);
        await page.screenshot({ path: 'step5-login-error.png', fullPage: true });
      }
    } else {
      console.log('Google 로그인 버튼을 찾을 수 없음');
      
      // 이미 로그인된 상태일 수 있으므로 관리자 기능 확인
      console.log('\n관리자 페이지 요소 확인 중...');
      const adminElements = await page.locator('text=/관리자|타로 지침 관리/').all();
      console.log(`관리자 관련 요소 ${adminElements.length}개 발견`);
      
      await page.screenshot({ path: 'step3-no-login-button.png', fullPage: true });
    }
    
    // 최종 페이지 상태 캡처
    console.log('\n최종 페이지 상태 캡처 중...');
    await page.screenshot({ path: 'final-page-state.png', fullPage: true });
    
    // 페이지의 모든 텍스트 내용 추출
    const pageText = await page.locator('body').textContent();
    console.log('\n페이지에 표시된 주요 내용:');
    if (pageText.includes('36개')) {
      console.log('✓ "36개" 텍스트 발견');
    }
    if (pageText.includes('100%')) {
      console.log('✓ "100%" 텍스트 발견');
    }
    if (pageText.includes('타로 지침')) {
      console.log('✓ "타로 지침" 텍스트 발견');
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    console.log('\n브라우저 종료 중...');
    await browser.close();
  }
})();