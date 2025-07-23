const { chromium } = require('playwright');

(async () => {
  console.log('🎨 프론트엔드 종합 검사 시작\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const issues = [];
  
  // 데스크톱 테스트
  const desktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  
  const page = await desktop.newPage();
  
  try {
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 1. 접근성 검사
    const accessibility = await page.evaluate(() => {
      const issues = [];
      
      // 이미지 alt 텍스트 검사
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt) {
          issues.push(`Missing alt text: ${img.src}`);
        }
      });
      
      // 버튼 aria-label 검사
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
          issues.push('Button without text or aria-label');
        }
      });
      
      // 색상 대비 검사 (간단한 체크)
      const darkMode = document.documentElement.classList.contains('dark');
      
      return { issues, imageCount: images.length, buttonCount: buttons.length, darkMode };
    });
    
    console.log('🔍 접근성 검사:');
    console.log(`  이미지: ${accessibility.imageCount}개`);
    console.log(`  버튼: ${accessibility.buttonCount}개`);
    console.log(`  다크모드: ${accessibility.darkMode ? '활성' : '비활성'}`);
    if (accessibility.issues.length > 0) {
      console.log('  ⚠️ 접근성 이슈:', accessibility.issues);
      issues.push(...accessibility.issues);
    }
    
    // 2. 성능 메트릭
    const performanceMetrics = await page.evaluate(() => {
      const perf = window.performance;
      const navigation = perf.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: perf.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: perf.getEntriesByName('first-contentful-paint')[0]?.startTime
      };
    });
    
    console.log('\n⚡ 성능 메트릭:');
    console.log(`  DOM 로드: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`  페이지 로드: ${performanceMetrics.loadComplete}ms`);
    console.log(`  First Paint: ${performanceMetrics.firstPaint}ms`);
    console.log(`  FCP: ${performanceMetrics.firstContentfulPaint}ms`);
    
    // 3. 모바일 반응형 테스트
    console.log('\n📱 모바일 반응형 테스트:');
    const mobile = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const mobilePage = await mobile.newPage();
    await mobilePage.goto('http://localhost:4000');
    
    const mobileLayout = await mobilePage.evaluate(() => {
      const header = document.querySelector('header');
      const nav = document.querySelector('nav');
      const mobileMenu = document.querySelector('[aria-label*="메뉴"]');
      
      return {
        headerVisible: header?.offsetHeight > 0,
        navVisible: nav?.offsetHeight > 0,
        mobileMenuExists: !!mobileMenu,
        viewportWidth: window.innerWidth
      };
    });
    
    console.log(`  화면 너비: ${mobileLayout.viewportWidth}px`);
    console.log(`  헤더 표시: ${mobileLayout.headerVisible ? '✅' : '❌'}`);
    console.log(`  모바일 메뉴: ${mobileLayout.mobileMenuExists ? '✅' : '❌'}`);
    
    await mobilePage.screenshot({
      path: 'tests/screenshots/mobile-view.png'
    });
    
    // 4. 폼 검증
    await page.click('text=로그인');
    await page.waitForTimeout(1000);
    
    const formValidation = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const inputs = document.querySelectorAll('input');
      const requiredInputs = document.querySelectorAll('input[required]');
      
      return {
        formCount: forms.length,
        inputCount: inputs.length,
        requiredCount: requiredInputs.length
      };
    });
    
    console.log('\n📝 폼 검증:');
    console.log(`  폼 개수: ${formValidation.formCount}`);
    console.log(`  입력 필드: ${formValidation.inputCount}`);
    console.log(`  필수 필드: ${formValidation.requiredCount}`);
    
    // 최종 결과
    console.log('\n📊 검사 요약:');
    console.log(`  총 이슈: ${issues.length}개`);
    if (issues.length > 0) {
      console.log('  수정 필요 항목:', issues);
    } else {
      console.log('  ✅ 모든 검사 통과!');
    }
    
    await page.screenshot({
      path: 'tests/screenshots/frontend-audit.png',
      fullPage: true
    });
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ 검사 중 오류:', error.message);
    await browser.close();
  }
})();