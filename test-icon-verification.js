const { chromium } = require('playwright');

async function verifyIconChanges() {
  console.log('🔍 아이콘 변경 상태 확인...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    console.log('📍 홈페이지 접속...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // SVG 아이콘 확인
    console.log('🔍 SVG 아이콘 검색...');
    
    // circle-user 클래스 검색
    const circleUserIcons = await page.locator('svg.lucide-circle-user').count();
    console.log(`  circle-user 아이콘 개수: ${circleUserIcons}`);
    
    // 일반 user 아이콘 검색
    const userIcons = await page.locator('svg.lucide-user').count();
    console.log(`  user 아이콘 개수: ${userIcons}`);
    
    // 모든 lucide 아이콘 클래스 확인
    const allLucideIcons = await page.locator('svg[class*="lucide"]').evaluateAll(elements => 
      elements.map(el => el.className.baseVal)
    );
    
    console.log('\\n📋 발견된 모든 Lucide 아이콘 클래스:');
    const uniqueClasses = [...new Set(allLucideIcons)];
    uniqueClasses.forEach(cls => {
      if (cls.includes('user') || cls.includes('circle')) {
        console.log(`  - ${cls}`);
      }
    });
    
    // 사용자 네비게이션 영역 확인
    console.log('\\n🔍 사용자 네비게이션 영역 확인...');
    
    // 로그인/회원가입 버튼 확인
    const loginButton = page.locator('button:has-text("로그인"), a:has-text("로그인")');
    const signupButton = page.locator('button:has-text("회원가입"), a:has-text("회원가입")');
    
    if (await loginButton.isVisible()) {
      console.log('🔐 로그인 버튼 발견');
      
      // 로그인 버튼 내 아이콘 확인
      const loginIconSVG = await loginButton.locator('svg').getAttribute('class').catch(() => null);
      console.log(`  로그인 버튼 아이콘: ${loginIconSVG || '없음'}`);
    }
    
    if (await signupButton.isVisible()) {
      console.log('👤 회원가입 버튼 발견');
      
      // 회원가입 버튼 내 아이콘 확인
      const signupIconSVG = await signupButton.locator('svg').getAttribute('class').catch(() => null);
      console.log(`  회원가입 버튼 아이콘: ${signupIconSVG || '없음'}`);
    }
    
    // 프로필 영역 확인 (로그인된 경우)
    const profileButton = page.locator('[data-testid="user-profile"]');
    if (await profileButton.isVisible().catch(() => false)) {
      console.log('👤 프로필 버튼 발견');
      
      // Avatar 내용 확인
      const avatarFallback = await profileButton.locator('.avatar-fallback').textContent().catch(() => null);
      console.log(`  Avatar Fallback 텍스트: ${avatarFallback || '없음'}`);
    }
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'icon-verification.png', 
      fullPage: false 
    });
    console.log('\\n📸 스크린샷 저장: icon-verification.png');
    
    // 결과 요약
    console.log('\\n📊 검증 결과:');
    if (circleUserIcons > 0) {
      console.log('❌ circle-user 아이콘이 여전히 존재합니다!');
    } else {
      console.log('✅ circle-user 아이콘이 모두 제거되었습니다!');
    }
    
    if (userIcons > 0) {
      console.log('✅ 일반 user 아이콘이 사용되고 있습니다.');
    }
    
    // 15초간 브라우저 유지
    console.log('\\n⏳ 15초간 수동 확인 시간...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ 검증 중 오류:', error);
  } finally {
    await browser.close();
  }
}

verifyIconChanges();