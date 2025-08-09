const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. 홈페이지 접속 중...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'admin-step-1-homepage.png' });

    // 로그인 페이지로 이동
    console.log('2. 로그인 페이지로 이동 중...');
    await page.goto('http://localhost:4000/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'admin-step-2-login-page.png' });

    // 로그인 수행 - 더 구체적인 선택자 사용
    console.log('3. 로그인 시도 중...');
    
    // 이메일 입력
    const emailInput = await page.locator('input[placeholder*="email"], input[name="email"], input#email').first();
    await emailInput.fill('admin@teststudio.com');
    
    // 비밀번호 입력
    const passwordInput = await page.locator('input[type="password"]').first();
    await passwordInput.fill('admin123!@#');
    
    await page.screenshot({ path: 'admin-step-3-login-filled.png' });
    
    // 로그인 버튼 클릭
    await page.click('button:has-text("로그인")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'admin-step-4-after-login.png' });

    // 관리자 페이지로 이동
    console.log('4. 관리자 페이지로 이동 중...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'admin-step-5-admin-page.png' });

    // 현재 페이지 URL 확인
    console.log('현재 URL:', page.url());

    // 블로그 관리 탭 찾기 - 다양한 선택자 시도
    console.log('5. 블로그 관리 탭 찾기...');
    const blogTabSelectors = [
      'text=블로그 관리',
      'button:has-text("블로그 관리")',
      'a:has-text("블로그 관리")',
      '[href*="blog"]',
      'nav >> text=블로그'
    ];

    let blogTabFound = false;
    for (const selector of blogTabSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ 블로그 관리 요소 발견: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          blogTabFound = true;
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    if (blogTabFound) {
      await page.screenshot({ path: 'admin-step-6-blog-management.png' });
      console.log('✅ 블로그 관리 탭 클릭 완료');
    } else {
      console.log('❌ 블로그 관리 탭을 찾을 수 없습니다');
      // 현재 페이지의 모든 버튼과 링크 출력
      const buttons = await page.locator('button').allTextContents();
      const links = await page.locator('a').allTextContents();
      console.log('현재 페이지의 버튼들:', buttons);
      console.log('현재 페이지의 링크들:', links);
    }

    // 블로그 목록 확인
    console.log('6. 블로그 관련 요소 확인 중...');
    
    // 다양한 블로그 포스트 선택자 시도
    const postSelectors = [
      '[data-testid="blog-post-item"]',
      '.blog-post-item',
      'table tbody tr',
      '[class*="blog"]',
      '[class*="post"]'
    ];

    let postsCount = 0;
    for (const selector of postSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`포스트 발견 (${selector}): ${count}개`);
        postsCount = count;
        break;
      }
    }

    // CRUD 버튼 확인
    console.log('7. CRUD 버튼 확인 중...');
    
    // 생성 버튼
    const createButtons = await page.locator('button').filter({ 
      hasText: /새|작성|추가|create|add|new/i 
    }).count();
    console.log(`생성 관련 버튼: ${createButtons}개`);

    // 편집 버튼
    const editButtons = await page.locator('button').filter({ 
      hasText: /편집|수정|edit|update/i 
    }).count();
    console.log(`편집 관련 버튼: ${editButtons}개`);

    // 삭제 버튼
    const deleteButtons = await page.locator('button').filter({ 
      hasText: /삭제|delete|remove/i 
    }).count();
    console.log(`삭제 관련 버튼: ${deleteButtons}개`);

    // 전체 페이지 스크린샷
    await page.screenshot({ path: 'admin-step-7-full-page.png', fullPage: true });

    // 현재 페이지 구조 분석
    console.log('\n=== 현재 페이지 구조 분석 ===');
    const pageTitle = await page.title();
    console.log('페이지 제목:', pageTitle);
    
    const h1Text = await page.locator('h1').first().textContent().catch(() => '없음');
    console.log('H1 제목:', h1Text);

    const navItems = await page.locator('nav a, nav button').allTextContents();
    console.log('네비게이션 항목들:', navItems);

    console.log('\n=== 블로그 CRUD 기능 검증 결과 ===');
    console.log(`✅ 관리자 페이지 접속: ${page.url().includes('/admin') ? '성공' : '실패'}`);
    console.log(`✅ 블로그 관리 탭: ${blogTabFound ? '발견' : '미발견'}`);
    console.log(`✅ 블로그 포스트: ${postsCount}개`);
    console.log(`✅ CRUD 버튼 - 생성: ${createButtons}, 편집: ${editButtons}, 삭제: ${deleteButtons}`);

  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'admin-error-screenshot.png' });
  }

  // 브라우저는 열어둠
  console.log('\n브라우저를 열어두었습니다. 수동으로 확인하실 수 있습니다.');
  console.log('종료하려면 Ctrl+C를 누르세요.');
})();