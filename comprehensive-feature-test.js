const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('\\n=== InnerSpell Vercel 배포 전체 기능 테스트 ===\\n');
    
    // 1. 메인 페이지 완전 로드
    console.log('1. 메인 페이지 접속 (완전 로드 대기)...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 90000 
    });
    
    // 추가 대기 시간으로 모든 요소 로드 확인
    await page.waitForTimeout(5000);
    
    // 메인 페이지 스크린샷
    await page.screenshot({ path: 'main-page-full.png', fullPage: true });
    console.log('   ✓ 메인 페이지 스크린샷: main-page-full.png');
    
    // 2. 타로 리딩 페이지 테스트
    console.log('\\n2. 타로 리딩 페이지 이동...');
    await page.click('a[href="/reading"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tarot-reading-page.png', fullPage: true });
    console.log('   ✓ 타로 리딩 페이지 스크린샷: tarot-reading-page.png');
    
    // 타로 카드 선택 요소 확인
    const hasCardSelection = await page.locator('.card-deck, [data-testid="card-deck"], .tarot-card').isVisible().catch(() => false);
    console.log('   - 카드 선택 영역:', hasCardSelection ? '있음' : '없음');
    
    // 3. 로그인 페이지 테스트
    console.log('\\n3. 로그인 페이지 이동...');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    console.log('   ✓ 로그인 페이지 스크린샷: login-page.png');
    
    // 로그인 폼 요소 확인
    const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').isVisible().catch(() => false);
    const hasPasswordInput = await page.locator('input[type="password"], input[name="password"]').isVisible().catch(() => false);
    console.log('   - 이메일 입력:', hasEmailInput ? '있음' : '없음');
    console.log('   - 비밀번호 입력:', hasPasswordInput ? '있음' : '없음');
    
    // 4. 블로그 페이지 테스트
    console.log('\\n4. 블로그 페이지 이동...');
    await page.goto('https://test-studio-firebase.vercel.app/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'blog-page.png', fullPage: true });
    console.log('   ✓ 블로그 페이지 스크린샷: blog-page.png');
    
    // 5. 다크모드 토글 테스트
    console.log('\\n5. 다크모드 토글 테스트...');
    await page.goto('https://test-studio-firebase.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    const themeToggle = await page.locator('button:has-text("테마"), button[aria-label*="theme"], button[aria-label*="테마"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'dark-mode.png', fullPage: false });
      console.log('   ✓ 다크모드 스크린샷: dark-mode.png');
    } else {
      console.log('   - 테마 토글 버튼을 찾을 수 없음');
    }
    
    // 6. 모바일 반응형 테스트
    console.log('\\n6. 모바일 반응형 테스트...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'mobile-view.png', fullPage: false });
    console.log('   ✓ 모바일 뷰 스크린샷: mobile-view.png');
    
    // 모바일 메뉴 버튼 확인
    const hasMobileMenu = await page.locator('button:has-text("메뉴"), button[aria-label*="menu"], button[aria-label*="Menu"]').isVisible().catch(() => false);
    console.log('   - 모바일 메뉴 버튼:', hasMobileMenu ? '있음' : '없음');
    
    // 7. API 엔드포인트 테스트
    console.log('\\n7. API 엔드포인트 테스트...');
    
    // Health check
    const healthResponse = await fetch('https://test-studio-firebase.vercel.app/api/health');
    console.log('   - /api/health 상태:', healthResponse.status);
    
    // AI providers check
    const aiResponse = await fetch('https://test-studio-firebase.vercel.app/api/debug/ai-providers');
    console.log('   - /api/debug/ai-providers 상태:', aiResponse.status);
    
    console.log('\\n=== 테스트 완료 ===\\n');
    
  } catch (error) {
    console.error('\\n테스트 중 에러 발생:', error.message);
  } finally {
    await browser.close();
  }
})();