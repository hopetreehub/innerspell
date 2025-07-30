const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Vercel 배포 사이트 접속 중...');
    
    // Vercel 배포 URL로 접속
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('페이지 로드 완료');
    
    // 메인 페이지 스크린샷
    await page.screenshot({ path: 'vercel-main-page.png', fullPage: true });
    console.log('메인 페이지 스크린샷 저장: vercel-main-page.png');
    
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log('페이지 타이틀:', title);
    
    // 주요 요소들 확인
    const hasHeader = await page.locator('header').isVisible();
    console.log('헤더 존재:', hasHeader);
    
    const hasHeroSection = await page.locator('[data-testid="hero-section"], .hero-section, section:has-text("InnerSpell")').isVisible().catch(() => false);
    console.log('히어로 섹션 존재:', hasHeroSection);
    
    // AI 타로 관련 요소 확인
    const hasTarotSection = await page.locator('text=/AI.*타로|타로.*AI/i').isVisible().catch(() => false);
    console.log('AI 타로 섹션 존재:', hasTarotSection);
    
    // 네트워크 에러 확인
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // 잠시 대기하여 에러 수집
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('\\n콘솔 에러 발견:');
      errors.forEach(err => console.log(' -', err));
    } else {
      console.log('\\n콘솔 에러 없음');
    }
    
    // API 헬스체크
    console.log('\\nAPI 헬스체크 중...');
    const apiResponse = await page.goto('https://test-studio-firebase.vercel.app/api/health');
    console.log('API 상태 코드:', apiResponse.status());
    
    if (apiResponse.ok()) {
      const apiData = await apiResponse.json().catch(() => null);
      console.log('API 응답:', JSON.stringify(apiData, null, 2));
    }
    
  } catch (error) {
    console.error('에러 발생:', error.message);
  } finally {
    await browser.close();
  }
})();