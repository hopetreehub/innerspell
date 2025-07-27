const { chromium } = require('playwright');

async function testTarotGuidelines() {
  console.log('타로지침 페이지 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Vercel 페이지 접속 (최대 3분 대기)
    console.log('1. Vercel 페이지 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 180000 // 3분
    });
    
    // 페이지 로드 대기
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 스크린샷: 메인 페이지
    await page.screenshot({ 
      path: 'screenshots/01-main-page.png',
      fullPage: true 
    });
    console.log('✓ 메인 페이지 스크린샷 저장');
    
    // 2. 헤더 네비게이션 확인
    console.log('\n2. 헤더 네비게이션 확인 중...');
    const navItems = await page.$$eval('nav a, nav button', elements => 
      elements.map(el => el.textContent.trim())
    );
    console.log('네비게이션 메뉴:', navItems);
    
    // 3. 타로지침 메뉴 클릭
    console.log('\n3. 타로지침 메뉴 클릭...');
    // 네비게이션 메뉴가 여러 개 있을 수 있으므로 더 구체적인 선택자 사용
    const tarotGuidelinesLink = await page.locator('nav a:has-text("타로지침")').first();
    await tarotGuidelinesLink.click();
    await page.waitForURL('**/tarot-guidelines');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 스크린샷: 타로지침 페이지
    await page.screenshot({ 
      path: 'screenshots/02-tarot-guidelines-page.png',
      fullPage: true 
    });
    console.log('✓ 타로지침 페이지 스크린샷 저장');
    
    // 4. 타로지침 페이지 요소 확인
    console.log('\n4. 타로지침 페이지 요소 확인 중...');
    
    // 페이지 제목 확인
    const pageTitle = await page.textContent('h1');
    console.log('페이지 제목:', pageTitle);
    
    // 진행률 확인
    const progressText = await page.textContent('text=/총.*개.*지침.*완성/');
    console.log('진행률:', progressText);
    
    // 필터 섹션 확인
    const hasSearchInput = await page.isVisible('input[placeholder*="검색"]');
    const hasSpreadFilter = await page.isVisible('select:has-text("모든 스프레드")');
    const hasStyleFilter = await page.isVisible('select:has-text("모든 해석 스타일")');
    console.log('검색 입력:', hasSearchInput);
    console.log('스프레드 필터:', hasSpreadFilter);
    console.log('스타일 필터:', hasStyleFilter);
    
    // 지침 카드 개수 확인
    const guidelineCards = await page.$$('[class*="guideline-card"], [class*="card"]:has-text("자세히 보기")');
    console.log('표시된 지침 카드 수:', guidelineCards.length);
    
    // 5. 필터 기능 테스트
    console.log('\n5. 필터 기능 테스트...');
    
    // 5-1. 켈틱 크로스 스프레드 필터
    console.log('- 켈틱 크로스 스프레드 선택...');
    await page.selectOption('select:has-text("모든 스프레드")', { label: '켈틱 크로스' });
    await page.waitForTimeout(1000);
    
    const celticCards = await page.$$('[class*="guideline-card"], [class*="card"]:has-text("자세히 보기")');
    console.log('켈틱 크로스 필터 후 카드 수:', celticCards.length);
    
    await page.screenshot({ 
      path: 'screenshots/03-celtic-cross-filter.png',
      fullPage: true 
    });
    console.log('✓ 켈틱 크로스 필터 스크린샷 저장');
    
    // 5-2. 전통 라이더-웨이트 해석 스타일 필터
    console.log('- 전통 라이더-웨이트 스타일 선택...');
    await page.selectOption('select:has-text("모든 해석 스타일")', { label: '전통 라이더-웨이트' });
    await page.waitForTimeout(1000);
    
    const traditionalCards = await page.$$('[class*="guideline-card"], [class*="card"]:has-text("자세히 보기")');
    console.log('전통 스타일 필터 후 카드 수:', traditionalCards.length);
    
    await page.screenshot({ 
      path: 'screenshots/04-traditional-style-filter.png',
      fullPage: true 
    });
    console.log('✓ 전통 스타일 필터 스크린샷 저장');
    
    // 필터 초기화
    await page.selectOption('select:has-text("켈틱 크로스")', { label: '모든 스프레드' });
    await page.selectOption('select:has-text("전통 라이더-웨이트")', { label: '모든 해석 스타일' });
    await page.waitForTimeout(1000);
    
    // 5-3. 검색 기능 테스트
    console.log('- "관계" 키워드 검색...');
    await page.fill('input[placeholder*="검색"]', '관계');
    await page.waitForTimeout(1000);
    
    const searchResults = await page.$$('[class*="guideline-card"], [class*="card"]:has-text("자세히 보기")');
    console.log('"관계" 검색 결과 카드 수:', searchResults.length);
    
    await page.screenshot({ 
      path: 'screenshots/05-search-relationship.png',
      fullPage: true 
    });
    console.log('✓ 검색 결과 스크린샷 저장');
    
    // 검색 초기화
    await page.fill('input[placeholder*="검색"]', '');
    await page.waitForTimeout(1000);
    
    // 6. 카드 상세 기능 테스트
    console.log('\n6. 카드 상세 보기 테스트...');
    
    // 첫 번째 카드의 "자세히 보기" 클릭
    const firstCard = await page.$('[class*="guideline-card"], [class*="card"]:has-text("자세히 보기")');
    if (firstCard) {
      await firstCard.click('text=자세히 보기');
      await page.waitForTimeout(2000);
      
      // 상세 정보 확인
      const hasPositionGuide = await page.isVisible('text=/포지션별.*가이드/');
      const hasInterpretationTips = await page.isVisible('text=/해석.*팁/');
      console.log('포지션별 가이드:', hasPositionGuide);
      console.log('해석 팁:', hasInterpretationTips);
      
      await page.screenshot({ 
        path: 'screenshots/06-card-detail-view.png',
        fullPage: true 
      });
      console.log('✓ 카드 상세 보기 스크린샷 저장');
      
      // 닫기 버튼 찾아서 클릭
      const closeButton = await page.$('button:has-text("닫기"), button:has-text("X"), button[aria-label*="close"], button[aria-label*="Close"]');
      if (closeButton) {
        await closeButton.click();
        await page.waitForTimeout(1000);
      } else {
        // ESC 키로 닫기 시도
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    }
    
    // 최종 전체 페이지 스크린샷
    await page.screenshot({ 
      path: 'screenshots/07-final-overview.png',
      fullPage: true 
    });
    console.log('✓ 최종 전체 페이지 스크린샷 저장');
    
    console.log('\n✅ 모든 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    
    // 오류 시 현재 상태 스크린샷
    await page.screenshot({ 
      path: 'screenshots/error-state.png',
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testTarotGuidelines().catch(console.error);