const { chromium } = require('playwright');

async function verifyBlogUpdate() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('Vercel 배포 사이트 접속 중...');
  await page.goto('https://test-studio-firebase.vercel.app/blog', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });

  // 페이지 로드 대기
  await page.waitForTimeout(3000);

  // 블로그 포스트 확인
  const posts = await page.$$eval('.grid > article', elements => {
    return elements.map(el => {
      const title = el.querySelector('h2')?.textContent?.trim() || '';
      const imageUrl = el.querySelector('img')?.src || '';
      const hasImage = !!el.querySelector('img');
      return { title, hasImage, imageUrl };
    });
  });

  console.log('\n=== 블로그 포스트 확인 결과 ===');
  console.log(`총 포스트 개수: ${posts.length}개`);
  
  // 새로 추가된 포스트 확인
  const newPosts = [
    '2025년 타로 신년 운세: 새해 목표 달성을 위한 완벽 가이드',
    'AI 타로의 미래: 디지털 시대 영성과 전통의 만남',
    '꿈의 심리학: 무의식이 전하는 메시지 해독법',
    '타로 명상: 카드와 함께하는 내면 여행',
    '현대인을 위한 영성 가이드: 바쁜 일상 속 영적 성장법'
  ];

  console.log('\n새로 추가된 포스트 확인:');
  newPosts.forEach(expectedTitle => {
    const found = posts.find(post => post.title === expectedTitle);
    if (found) {
      console.log(`✅ "${expectedTitle}" - 이미지: ${found.hasImage ? '있음' : '없음'}`);
    } else {
      console.log(`❌ "${expectedTitle}" - 찾을 수 없음`);
    }
  });

  console.log('\n전체 포스트 목록:');
  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title} - 이미지: ${post.hasImage ? '있음' : '없음'}`);
  });

  // 스크린샷 촬영
  const timestamp = new Date().toISOString();
  const screenshotPath = `blog-update-verification-${timestamp}.png`;
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  });
  console.log(`\n스크린샷 저장: ${screenshotPath}`);

  // 각 포스트의 이미지 로드 상태 확인
  console.log('\n이미지 로드 상태 확인:');
  const imageLoadErrors = await page.$$eval('img', images => {
    return images.map(img => ({
      src: img.src,
      loaded: img.complete && img.naturalHeight !== 0,
      alt: img.alt
    })).filter(img => !img.loaded);
  });

  if (imageLoadErrors.length > 0) {
    console.log('❌ 로드 실패한 이미지:');
    imageLoadErrors.forEach(img => {
      console.log(`  - ${img.alt || 'No alt text'}: ${img.src}`);
    });
  } else {
    console.log('✅ 모든 이미지가 정상적으로 로드되었습니다.');
  }

  // 개별 포스트 클릭하여 상세 확인
  console.log('\n첫 번째 새 포스트 상세 페이지 확인...');
  const firstNewPost = await page.$('article:has-text("2025년 타로 신년 운세")');
  if (firstNewPost) {
    await firstNewPost.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const detailScreenshot = `blog-post-detail-${timestamp}.png`;
    await page.screenshot({ path: detailScreenshot, fullPage: true });
    console.log(`포스트 상세 페이지 스크린샷: ${detailScreenshot}`);
  }

  await browser.close();
  console.log('\n검증 완료!');
}

verifyBlogUpdate().catch(console.error);