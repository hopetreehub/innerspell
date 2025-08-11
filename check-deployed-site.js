const { chromium } = require('playwright');

async function checkDeployedSite() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const baseUrl = 'https://test-studio-firebase.vercel.app';
  
  const pages = [
    { name: 'main', url: '/', title: '메인 페이지' },
    { name: 'tarot', url: '/tarot', title: '타로 페이지' },
    { name: 'blog', url: '/blog', title: '블로그 페이지' },
    { name: 'dreammeaning', url: '/dreammeaning', title: '꿈해몽 페이지' },
    { name: 'login', url: '/login', title: '로그인 페이지' }
  ];

  console.log('🚀 배포된 사이트 확인 시작...\n');

  for (const pageInfo of pages) {
    try {
      console.log(`📄 ${pageInfo.title} 확인 중...`);
      
      // 페이지 접속
      const response = await page.goto(`${baseUrl}${pageInfo.url}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 응답 상태 확인
      const status = response ? response.status() : 'unknown';
      console.log(`   - HTTP 상태 코드: ${status}`);
      
      // 페이지 로딩 대기
      await page.waitForTimeout(2000);

      // 스크린샷 저장
      const screenshotPath = `/mnt/e/project/test-studio-firebase/screenshots/deployed-${pageInfo.name}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`   - 스크린샷 저장: ${screenshotPath}`);

      // 페이지 타이틀 확인
      const title = await page.title();
      console.log(`   - 페이지 타이틀: ${title}`);

      // 주요 요소 확인
      if (pageInfo.name === 'main') {
        const heroTitle = await page.locator('h1').first().textContent().catch(() => null);
        console.log(`   - Hero 타이틀: ${heroTitle || '찾을 수 없음'}`);
      } else if (pageInfo.name === 'tarot') {
        const tarotCards = await page.locator('.tarot-card, [class*="card"]').count();
        console.log(`   - 타로 카드 개수: ${tarotCards}`);
      } else if (pageInfo.name === 'blog') {
        const blogPosts = await page.locator('article, .blog-post, [class*="post"]').count();
        console.log(`   - 블로그 포스트 개수: ${blogPosts}`);
      } else if (pageInfo.name === 'dreammeaning') {
        const dreamElements = await page.locator('.dream-item, [class*="dream"]').count();
        console.log(`   - 꿈 관련 요소 개수: ${dreamElements}`);
      } else if (pageInfo.name === 'login') {
        const loginForm = await page.locator('form, .login-form, [class*="login"]').count();
        console.log(`   - 로그인 폼 존재: ${loginForm > 0 ? '예' : '아니오'}`);
      }

      console.log(`   ✅ ${pageInfo.title} 정상 접속\n`);

    } catch (error) {
      console.log(`   ❌ ${pageInfo.title} 접속 실패: ${error.message}\n`);
    }
  }

  // 브라우저 열어둔 상태로 30초 대기
  console.log('⏰ 30초 후 브라우저가 자동으로 닫힙니다...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ 모든 페이지 확인 완료!');
}

checkDeployedSite().catch(console.error);