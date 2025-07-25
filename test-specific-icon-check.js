const { chromium } = require('playwright');

async function checkSpecificIcons() {
  console.log('🔍 특정 아이콘 위치 정밀 확인...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    console.log('📍 1. 홈페이지 네비게이션 확인...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 네비게이션 바의 로그인/회원가입 버튼 확인
    const navLoginButton = page.locator('nav a:has-text("로그인")').first();
    const navSignupButton = page.locator('nav a:has-text("회원가입")').first();
    
    if (await navLoginButton.isVisible()) {
      console.log('🔐 네비게이션 로그인 버튼:');
      const loginSvg = await navLoginButton.locator('svg').first();
      if (await loginSvg.count() > 0) {
        const loginClasses = await loginSvg.getAttribute('class');
        console.log(`  아이콘 클래스: ${loginClasses}`);
        
        // circle 포함 여부 확인
        if (loginClasses && loginClasses.includes('circle')) {
          console.log('  ❌ circle 아이콘 발견!');
        } else {
          console.log('  ✅ circle 아이콘 아님');
        }
      }
    }
    
    if (await navSignupButton.isVisible()) {
      console.log('👤 네비게이션 회원가입 버튼:');
      const signupSvg = await navSignupButton.locator('svg').first();
      if (await signupSvg.count() > 0) {
        const signupClasses = await signupSvg.getAttribute('class');
        console.log(`  아이콘 클래스: ${signupClasses}`);
        
        if (signupClasses && signupClasses.includes('circle')) {
          console.log('  ❌ circle 아이콘 발견!');
        } else {
          console.log('  ✅ circle 아이콘 아님');
        }
      }
    }
    
    console.log('\\n📍 2. 로그인 페이지 확인...');
    await page.goto('http://localhost:4000/sign-in', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 페이지의 모든 SVG 확인
    const allSvgs = await page.locator('svg').evaluateAll(elements => 
      elements.map(el => ({
        class: el.className.baseVal,
        viewBox: el.getAttribute('viewBox'),
        html: el.outerHTML.substring(0, 100)
      }))
    );
    
    console.log(`\\n🔍 발견된 SVG 총 ${allSvgs.length}개`);
    allSvgs.forEach((svg, index) => {
      if (svg.class.includes('user') || svg.class.includes('circle')) {
        console.log(`\\nSVG ${index + 1}:`);
        console.log(`  클래스: ${svg.class}`);
        console.log(`  viewBox: ${svg.viewBox}`);
        
        if (svg.class.includes('circle') && svg.class.includes('user')) {
          console.log('  ❌ circle-user 아이콘!');
        }
      }
    });
    
    console.log('\\n📍 3. 프로필 페이지 확인...');
    await page.goto('http://localhost:4000/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 프로필 페이지의 아이콘 확인
    const profileIcons = await page.locator('svg[class*="user"]').evaluateAll(elements =>
      elements.map(el => el.className.baseVal)
    );
    
    console.log('\\n프로필 페이지 user 관련 아이콘:');
    profileIcons.forEach(cls => {
      console.log(`  - ${cls}`);
      if (cls.includes('circle')) {
        console.log('    ❌ circle 포함!');
      }
    });
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'specific-icon-check.png', 
      fullPage: false 
    });
    
    console.log('\\n📸 스크린샷 저장됨');
    
    // 최종 결과
    console.log('\\n📊 정밀 검사 완료');
    console.log('circle-user 아이콘을 찾고 있습니다...');
    
    // 20초간 유지
    console.log('\\n⏳ 20초간 수동 확인...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ 검사 중 오류:', error);
  } finally {
    await browser.close();
  }
}

checkSpecificIcons();