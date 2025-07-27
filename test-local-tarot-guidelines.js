const { chromium } = require('playwright');

async function testLocalTarotGuidelines() {
  console.log('로컬 타로지침 페이지 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 로컬 서버 접속 (포트 4000)
    console.log('1. 로컬 서버 접속 중 (http://localhost:4000)...');
    await page.goto('http://localhost:4000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(2000);
    
    // 스크린샷: 로컬 메인 페이지
    await page.screenshot({ 
      path: 'screenshots/local-01-main-page.png',
      fullPage: true 
    });
    console.log('✓ 로컬 메인 페이지 스크린샷 저장');
    
    // 2. 헤더 네비게이션 확인
    console.log('\n2. 헤더 네비게이션 확인 중...');
    const navItems = await page.$$eval('nav a, nav button', elements => 
      elements.map(el => el.textContent.trim())
    );
    console.log('네비게이션 메뉴:', navItems);
    
    // 3. 타로지침 메뉴 찾기 및 클릭
    console.log('\n3. 타로지침 메뉴 검색 중...');
    const hasGuidelines = navItems.some(item => item.includes('타로지침'));
    
    if (hasGuidelines) {
      console.log('✓ 타로지침 메뉴 발견!');
      const guidelinesLink = await page.locator('nav a:has-text("타로지침")').first();
      await guidelinesLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    } else {
      console.log('타로지침 메뉴가 없음. 직접 URL로 이동...');
      await page.goto('http://localhost:4000/tarot-guidelines', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      await page.waitForTimeout(2000);
    }
    
    // 스크린샷: 타로지침 페이지
    await page.screenshot({ 
      path: 'screenshots/local-02-tarot-guidelines.png',
      fullPage: true 
    });
    console.log('✓ 타로지침 페이지 스크린샷 저장');
    
    // 4. 페이지 요소 확인
    console.log('\n4. 타로지침 페이지 요소 확인 중...');
    
    // 페이지 제목
    const pageTitle = await page.textContent('h1').catch(() => 'N/A');
    console.log('페이지 제목:', pageTitle);
    
    // 진행률 텍스트
    const progressText = await page.textContent('text=/총.*개.*지침/').catch(() => 'N/A');
    console.log('진행률:', progressText);
    
    // 지침 카드 개수
    const cards = await page.$$('[class*="card"], article');
    console.log('표시된 카드 수:', cards.length);
    
    console.log('\n✅ 로컬 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    
    // 오류 시 현재 상태 스크린샷
    await page.screenshot({ 
      path: 'screenshots/local-error-state.png',
      fullPage: true 
    });
    
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testLocalTarotGuidelines().catch(console.error);