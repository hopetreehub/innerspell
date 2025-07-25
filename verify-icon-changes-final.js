const { chromium } = require('playwright');

async function verifyIconChangesFinal() {
  console.log('🔍 최종 아이콘 변경 확인...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    console.log('📍 로그인 페이지 접속...');
    await page.goto('http://localhost:4000/sign-in', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 페이지의 모든 SVG 아이콘 정보 수집
    const iconInfo = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      const icons = [];
      
      svgs.forEach((svg) => {
        const classes = svg.className.baseVal || svg.className;
        if (typeof classes === 'string' && (classes.includes('user') || classes.includes('circle'))) {
          // SVG의 path 데이터로 실제 아이콘 모양 확인
          const paths = svg.querySelectorAll('path');
          const pathData = Array.from(paths).map(p => p.getAttribute('d'));
          
          // circle 요소 확인 (circle-user 아이콘의 특징)
          const circles = svg.querySelectorAll('circle');
          const hasCircles = circles.length > 0;
          
          icons.push({
            class: classes,
            viewBox: svg.getAttribute('viewBox'),
            hasCircles: hasCircles,
            circleCount: circles.length,
            pathCount: paths.length,
            isCircleUser: classes.includes('circle-user') || hasCircles && classes.includes('user')
          });
        }
      });
      
      return icons;
    });
    
    console.log(`\\n발견된 user/circle 관련 아이콘: ${iconInfo.length}개`);
    
    let circleUserFound = false;
    iconInfo.forEach((icon, index) => {
      console.log(`\\n아이콘 ${index + 1}:`);
      console.log(`  클래스: ${icon.class}`);
      console.log(`  viewBox: ${icon.viewBox}`);
      console.log(`  circle 요소: ${icon.circleCount}개`);
      console.log(`  path 요소: ${icon.pathCount}개`);
      
      if (icon.isCircleUser || icon.class.includes('circle-user')) {
        console.log('  ❌ circle-user 아이콘으로 추정됨!');
        circleUserFound = true;
      } else if (icon.class.includes('user') && !icon.hasCircles) {
        console.log('  ✅ 일반 user 아이콘');
      }
    });
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'icon-final-check.png', 
      fullPage: false 
    });
    
    console.log('\\n📸 스크린샷 저장: icon-final-check.png');
    
    // 결과 요약
    console.log('\\n📊 최종 검증 결과:');
    if (circleUserFound) {
      console.log('❌ circle-user 아이콘이 여전히 존재합니다!');
      console.log('브라우저에서 직접 확인해보세요.');
    } else if (iconInfo.length === 0) {
      console.log('⚠️ user 관련 아이콘을 찾을 수 없습니다.');
    } else {
      console.log('✅ circle-user 아이콘이 모두 제거되었습니다!');
      console.log('✅ 일반 user 아이콘만 사용 중입니다.');
    }
    
    console.log('\\n💡 팁: 브라우저 개발자 도구(F12)에서 다음을 검색해보세요:');
    console.log('  - Elements 탭에서 "circle-user" 검색');
    console.log('  - Elements 탭에서 "lucide-circle-user" 검색');
    
    // 30초간 브라우저 유지
    console.log('\\n⏳ 30초간 수동 확인 시간...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ 검증 중 오류:', error);
  } finally {
    await browser.close();
  }
}

verifyIconChangesFinal();