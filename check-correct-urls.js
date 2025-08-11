const { chromium } = require('playwright');

async function checkCorrectUrls() {
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
    { name: 'dream-interpretation', url: '/dream-interpretation', title: '꿈해몽 페이지 (올바른 경로)' },
    { name: 'sign-in', url: '/sign-in', title: '로그인 페이지 (올바른 경로)' },
    { name: 'reading', url: '/reading', title: '타로리딩 페이지' },
    { name: 'community', url: '/community', title: '커뮤니티 페이지' }
  ];

  console.log('🚀 배포된 사이트 전체 페이지 확인 시작...\n');

  let successCount = 0;
  let failCount = 0;

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
      
      if (status === 200) {
        successCount++;
        
        // 페이지 로딩 대기
        await page.waitForTimeout(2000);

        // 스크린샷 저장
        const screenshotPath = `/mnt/e/project/test-studio-firebase/screenshots/deployed-${pageInfo.name}-correct.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        console.log(`   - 스크린샷 저장: ${screenshotPath}`);

        // 페이지 타이틀 확인
        const title = await page.title();
        console.log(`   - 페이지 타이틀: ${title}`);

        // 주요 요소 확인
        if (pageInfo.name === 'dream-interpretation') {
          const dreamForm = await page.locator('form, .dream-form, [class*="dream"], textarea').count();
          console.log(`   - 꿈해몽 관련 폼/요소: ${dreamForm}개`);
        } else if (pageInfo.name === 'sign-in') {
          const loginForm = await page.locator('form, .login-form, [class*="login"], input[type="email"], button[type="submit"]').count();
          console.log(`   - 로그인 폼 요소: ${loginForm}개`);
        } else if (pageInfo.name === 'reading') {
          const readingElements = await page.locator('.reading, [class*="spread"], [class*="card"]').count();
          console.log(`   - 리딩 관련 요소: ${readingElements}개`);
        } else if (pageInfo.name === 'community') {
          const communityElements = await page.locator('.community, [class*="post"], [class*="discussion"]').count();
          console.log(`   - 커뮤니티 관련 요소: ${communityElements}개`);
        }

        console.log(`   ✅ ${pageInfo.title} 정상 접속\n`);
      } else {
        failCount++;
        console.log(`   ❌ ${pageInfo.title} 접속 실패 (HTTP ${status})\n`);
      }

    } catch (error) {
      failCount++;
      console.log(`   ❌ ${pageInfo.title} 접속 실패: ${error.message}\n`);
    }
  }

  console.log('📊 테스트 결과 요약:');
  console.log(`   - 성공: ${successCount}개`);
  console.log(`   - 실패: ${failCount}개`);
  console.log(`   - 전체: ${pages.length}개`);

  // 브라우저 열어둔 상태로 20초 대기
  console.log('\n⏰ 20초 후 브라우저가 자동으로 닫힙니다...');
  await page.waitForTimeout(20000);

  await browser.close();
  console.log('✅ 모든 페이지 확인 완료!');
}

checkCorrectUrls().catch(console.error);