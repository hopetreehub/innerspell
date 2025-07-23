const { chromium } = require('playwright');

(async () => {
  console.log('🎯 UI/UX 인터랙션 테스트 시작\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('1️⃣ 네비게이션 메뉴 테스트');
    const navItems = await page.$$eval('nav a, header a', links => 
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href
      }))
    );
    
    console.log(`  발견된 메뉴 항목: ${navItems.length}개`);
    navItems.forEach(item => {
      console.log(`    - ${item.text}: ${item.href}`);
    });
    
    // 2. 다크모드 토글 테스트
    console.log('\n2️⃣ 다크모드 전환 테스트');
    const darkModeToggle = await page.$('button[aria-label*="테마"], button[class*="theme"]');
    
    if (darkModeToggle) {
      const initialMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      console.log(`  초기 모드: ${initialMode ? '다크' : '라이트'}`);
      
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      const afterMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      console.log(`  전환 후: ${afterMode ? '다크' : '라이트'}`);
      console.log(`  전환 동작: ${initialMode !== afterMode ? '✅ 정상' : '❌ 실패'}`);
      
      // 스크린샷
      await page.screenshot({
        path: `tests/screenshots/theme-${afterMode ? 'dark' : 'light'}.png`
      });
    } else {
      console.log('  ❌ 다크모드 토글 버튼을 찾을 수 없습니다.');
    }
    
    // 3. 타로 리딩 페이지 테스트
    console.log('\n3️⃣ 타로 리딩 페이지 기능 테스트');
    await page.goto('http://localhost:4000/tarot');
    await page.waitForLoadState('networkidle');
    
    const tarotElements = await page.evaluate(() => {
      const cardImages = document.querySelectorAll('img[src*="tarot"], img[alt*="타로"]');
      const buttons = document.querySelectorAll('button');
      const forms = document.querySelectorAll('form');
      
      return {
        cardCount: cardImages.length,
        buttonCount: buttons.length,
        formCount: forms.length,
        hasCardFlipAnimation: !!document.querySelector('[class*="flip"], [class*="rotate"]')
      };
    });
    
    console.log(`  타로 카드 이미지: ${tarotElements.cardCount}개`);
    console.log(`  버튼: ${tarotElements.buttonCount}개`);
    console.log(`  폼: ${tarotElements.formCount}개`);
    console.log(`  카드 애니메이션: ${tarotElements.hasCardFlipAnimation ? '✅' : '❌'}`);
    
    // 4. 블로그 페이지 테스트
    console.log('\n4️⃣ 블로그 페이지 레이아웃 테스트');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    
    const blogLayout = await page.evaluate(() => {
      const posts = document.querySelectorAll('article, [class*="post"], [class*="blog-item"]');
      const sidebar = document.querySelector('aside, [class*="sidebar"]');
      const pagination = document.querySelector('[class*="pagination"], nav[aria-label*="페이지"]');
      
      const firstPost = posts[0];
      const postInfo = firstPost ? {
        hasTitle: !!firstPost.querySelector('h1, h2, h3'),
        hasImage: !!firstPost.querySelector('img'),
        hasExcerpt: !!firstPost.querySelector('p'),
        hasReadMore: !!firstPost.querySelector('a[href*="blog/"]')
      } : null;
      
      return {
        postCount: posts.length,
        hasSidebar: !!sidebar,
        hasPagination: !!pagination,
        postInfo
      };
    });
    
    console.log(`  게시물 수: ${blogLayout.postCount}개`);
    console.log(`  사이드바: ${blogLayout.hasSidebar ? '✅' : '❌'}`);
    console.log(`  페이지네이션: ${blogLayout.hasPagination ? '✅' : '❌'}`);
    
    if (blogLayout.postInfo) {
      console.log('  첫 번째 게시물 구성:');
      console.log(`    - 제목: ${blogLayout.postInfo.hasTitle ? '✅' : '❌'}`);
      console.log(`    - 이미지: ${blogLayout.postInfo.hasImage ? '✅' : '❌'}`);
      console.log(`    - 요약: ${blogLayout.postInfo.hasExcerpt ? '✅' : '❌'}`);
      console.log(`    - 더보기 링크: ${blogLayout.postInfo.hasReadMore ? '✅' : '❌'}`);
    }
    
    // 5. 백과사전 페이지 테스트
    console.log('\n5️⃣ 타로 백과사전 페이지 테스트');
    await page.goto('http://localhost:4000/encyclopedia');
    await page.waitForLoadState('networkidle');
    
    const encyclopediaLayout = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"], article');
      const filters = document.querySelectorAll('button[class*="filter"], select');
      const search = document.querySelector('input[type="search"], input[placeholder*="검색"]');
      
      return {
        cardCount: cards.length,
        hasFilters: filters.length > 0,
        hasSearch: !!search,
        displayType: cards.length > 0 ? (
          cards[0].parentElement.classList.contains('grid') ? 'grid' : 'list'
        ) : 'unknown'
      };
    });
    
    console.log(`  카드 수: ${encyclopediaLayout.cardCount}개`);
    console.log(`  필터 기능: ${encyclopediaLayout.hasFilters ? '✅' : '❌'}`);
    console.log(`  검색 기능: ${encyclopediaLayout.hasSearch ? '✅' : '❌'}`);
    console.log(`  표시 형식: ${encyclopediaLayout.displayType}`);
    
    // 6. 폼 상호작용 테스트
    console.log('\n6️⃣ 로그인 폼 상호작용 테스트');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    const formInteraction = await page.evaluate(() => {
      const form = document.querySelector('form');
      const inputs = form ? form.querySelectorAll('input') : [];
      const submitButton = form ? form.querySelector('button[type="submit"], button:last-child') : null;
      
      const inputInfo = Array.from(inputs).map(input => ({
        type: input.type,
        placeholder: input.placeholder,
        required: input.required,
        hasLabel: !!document.querySelector(`label[for="${input.id}"]`)
      }));
      
      return {
        hasForm: !!form,
        inputCount: inputs.length,
        hasSubmitButton: !!submitButton,
        inputs: inputInfo
      };
    });
    
    console.log(`  폼 존재: ${formInteraction.hasForm ? '✅' : '❌'}`);
    console.log(`  입력 필드: ${formInteraction.inputCount}개`);
    formInteraction.inputs.forEach((input, i) => {
      console.log(`    ${i + 1}. ${input.type} - ${input.placeholder || '플레이스홀더 없음'}`);
      console.log(`       필수: ${input.required ? '✅' : '❌'}, 레이블: ${input.hasLabel ? '✅' : '❌'}`);
    });
    console.log(`  제출 버튼: ${formInteraction.hasSubmitButton ? '✅' : '❌'}`);
    
    // 7. 반응 속도 테스트
    console.log('\n7️⃣ 페이지 전환 속도 테스트');
    const pages = [
      { name: '홈', url: 'http://localhost:4000' },
      { name: '블로그', url: 'http://localhost:4000/blog' },
      { name: '타로리딩', url: 'http://localhost:4000/tarot' },
      { name: '백과사전', url: 'http://localhost:4000/encyclopedia' }
    ];
    
    for (const pageInfo of pages) {
      const startTime = Date.now();
      await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;
      console.log(`  ${pageInfo.name}: ${loadTime}ms`);
    }
    
    // 최종 스크린샷
    await page.goto('http://localhost:4000');
    await page.screenshot({
      path: 'tests/screenshots/ui-test-final.png',
      fullPage: true
    });
    
    console.log('\n✅ 모든 UI/UX 테스트 완료!');
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    await browser.close();
  }
})();