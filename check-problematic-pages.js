const { chromium } = require('playwright');

async function checkProblematicPages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const baseUrl = 'https://test-studio-firebase.vercel.app';
  
  const pages = [
    { name: 'dreammeaning', url: '/dreammeaning', title: '꿈해몽 페이지' },
    { name: 'login', url: '/login', title: '로그인 페이지' }
  ];

  console.log('🔍 문제 페이지 재확인 시작...\n');

  for (const pageInfo of pages) {
    try {
      console.log(`📄 ${pageInfo.title} 재확인 중...`);
      
      // 페이지 접속 (더 관대한 옵션 사용)
      const response = await page.goto(`${baseUrl}${pageInfo.url}`, {
        waitUntil: 'domcontentloaded', // networkidle 대신 domcontentloaded 사용
        timeout: 60000 // 60초로 증가
      });

      // 응답 상태 확인
      const status = response ? response.status() : 'unknown';
      console.log(`   - HTTP 상태 코드: ${status}`);
      
      // 추가 대기
      await page.waitForTimeout(5000);

      // 현재 URL 확인
      const currentUrl = page.url();
      console.log(`   - 현재 URL: ${currentUrl}`);

      // 스크린샷 저장
      const screenshotPath = `/mnt/e/project/test-studio-firebase/screenshots/deployed-${pageInfo.name}-retry.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`   - 스크린샷 저장: ${screenshotPath}`);

      // 페이지 타이틀 확인
      const title = await page.title();
      console.log(`   - 페이지 타이틀: ${title}`);

      // 에러 메시지 확인
      const errorMessage = await page.locator('text=/404|error|not found/i').first().textContent().catch(() => null);
      if (errorMessage) {
        console.log(`   - 에러 메시지 발견: ${errorMessage}`);
      }

      // 페이지 내용 일부 확인
      const bodyText = await page.locator('body').innerText().catch(() => '');
      console.log(`   - 페이지 내용 (처음 100자): ${bodyText.substring(0, 100)}...`);

      console.log(`   ✅ ${pageInfo.title} 접속 완료\n`);

    } catch (error) {
      console.log(`   ❌ ${pageInfo.title} 접속 실패: ${error.message}`);
      
      // 에러 발생 시에도 현재 상태 스크린샷 시도
      try {
        const errorScreenshotPath = `/mnt/e/project/test-studio-firebase/screenshots/deployed-${pageInfo.name}-error.png`;
        await page.screenshot({ 
          path: errorScreenshotPath,
          fullPage: true 
        });
        console.log(`   - 에러 스크린샷 저장: ${errorScreenshotPath}`);
      } catch (screenshotError) {
        console.log(`   - 스크린샷 저장 실패: ${screenshotError.message}`);
      }
      console.log('\n');
    }
  }

  // 브라우저 열어둔 상태로 30초 대기
  console.log('⏰ 30초 후 브라우저가 자동으로 닫힙니다...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ 재확인 완료!');
}

checkProblematicPages().catch(console.error);