const { chromium } = require('playwright');

async function verifyBlogPosts() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🚀 Vercel 배포 사이트 접속 중...');
  await page.goto('https://test-studio-firebase.vercel.app/blog', { 
    waitUntil: 'networkidle',
    timeout: 60000 
  });

  // 페이지 로드 대기
  await page.waitForTimeout(5000);

  console.log('\n📸 현재 페이지 스크린샷 촬영...');
  const timestamp = new Date().toISOString();
  await page.screenshot({ 
    path: `blog-verification-${timestamp}.png`,
    fullPage: true 
  });

  // 페이지 소스 확인
  const pageSource = await page.content();
  console.log('\n📄 페이지 로드 완료');

  // 다양한 방법으로 포스트 찾기
  console.log('\n🔍 블로그 포스트 검색 중...');

  // 방법 1: 텍스트로 직접 검색
  const newPostTitles = [
    '2025년 타로 신년 운세: 새해 목표 달성을 위한 완벽 가이드',
    'AI 타로의 미래: 디지털 시대 영성과 전통의 만남',
    '꿈의 심리학: 무의식이 전하는 메시지 해독법',
    '타로 명상: 카드와 함께하는 내면 여행',
    '현대인을 위한 영성 가이드: 바쁜 일상 속 영적 성장법'
  ];

  console.log('\n=== 새로운 포스트 확인 ===');
  for (const title of newPostTitles) {
    try {
      const element = await page.locator(`text="${title}"`).first();
      const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (isVisible) {
        console.log(`✅ "${title}"`);
      } else {
        console.log(`❌ "${title}" - 찾을 수 없음`);
      }
    } catch (e) {
      console.log(`❌ "${title}" - 찾을 수 없음`);
    }
  }

  // 방법 2: 카드 요소 개수 확인
  const cardSelectors = [
    '[class*="card"]',
    'article',
    'div[class*="post"]',
    'a[href^="/blog/"]'
  ];

  let totalCards = 0;
  for (const selector of cardSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`\n📊 "${selector}" 셀렉터로 찾은 요소: ${count}개`);
      totalCards = Math.max(totalCards, count);
    }
  }

  console.log(`\n📈 총 블로그 카드 개수: ${totalCards}개`);
  console.log('예상: 11개 (기존 6개 + 새로운 5개)');

  // 방법 3: 모든 링크 확인
  const blogLinks = await page.$$eval('a[href^="/blog/"]', links => 
    links.map(link => ({
      href: link.href,
      text: link.textContent?.trim() || ''
    }))
  );

  console.log(`\n🔗 블로그 링크 수: ${blogLinks.length}개`);
  
  // 네트워크 요청 확인
  console.log('\n🌐 API 호출 확인...');
  page.on('response', response => {
    if (response.url().includes('/api/') && response.url().includes('blog')) {
      console.log(`API 응답: ${response.url()} - ${response.status()}`);
    }
  });

  // 콘솔 에러 확인
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ 콘솔 에러:', msg.text());
    }
  });

  await page.waitForTimeout(3000);

  // 개별 포스트 페이지 테스트
  console.log('\n📖 개별 포스트 페이지 테스트...');
  const testSlugs = [
    'tarot-2025-new-year-guide',
    'ai-tarot-future',
    'dream-psychology-unconscious'
  ];

  for (const slug of testSlugs) {
    try {
      console.log(`\n테스트: /blog/${slug}`);
      await page.goto(`https://test-studio-firebase.vercel.app/blog/${slug}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      await page.waitForTimeout(2000);
      
      const title = await page.locator('h1').first().textContent().catch(() => '제목 없음');
      const hasContent = await page.locator('article, [class*="content"], main').first().isVisible().catch(() => false);
      
      console.log(`- 제목: ${title}`);
      console.log(`- 콘텐츠 표시: ${hasContent ? '✅' : '❌'}`);
      
      if (hasContent) {
        await page.screenshot({ 
          path: `blog-post-${slug}-${timestamp}.png`,
          fullPage: true 
        });
      }
    } catch (e) {
      console.log(`❌ 페이지 로드 실패: ${e.message}`);
    }
  }

  await browser.close();
  
  console.log('\n✅ 검증 완료!');
  console.log('\n💡 추가 확인사항:');
  console.log('1. Vercel 대시보드에서 배포 브랜치 확인');
  console.log('2. 환경 변수 설정 확인');
  console.log('3. 빌드 로그에서 에러 확인');
}

verifyBlogPosts().catch(console.error);