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
  await page.waitForTimeout(5000);

  // 페이지 내용 확인
  const pageContent = await page.content();
  console.log('\n페이지 로드 상태 확인...');

  // 다양한 셀렉터로 포스트 찾기
  const selectors = [
    'article',
    '[class*="post"]',
    '[class*="card"]',
    'div.grid > div',
    'main article',
    'main [class*="grid"] > div'
  ];

  let posts = [];
  let foundSelector = '';

  for (const selector of selectors) {
    try {
      const elements = await page.$$(selector);
      console.log(`셀렉터 "${selector}" 결과: ${elements.length}개`);
      
      if (elements.length > 0) {
        // 텍스트 내용이 있는지 확인
        const hasContent = await page.$eval(selector, el => el.textContent.trim().length > 0);
        if (hasContent) {
          foundSelector = selector;
          break;
        }
      }
    } catch (e) {
      console.log(`셀렉터 "${selector}" 실패`);
    }
  }

  if (foundSelector) {
    console.log(`\n사용할 셀렉터: ${foundSelector}`);
    
    posts = await page.$$eval(foundSelector, elements => {
      return elements.map(el => {
        const title = el.querySelector('h1, h2, h3, [class*="title"]')?.textContent?.trim() || 
                     el.querySelector('a')?.textContent?.trim() || '';
        const image = el.querySelector('img');
        const hasImage = !!image;
        const imageUrl = image?.src || '';
        const altText = image?.alt || '';
        return { title, hasImage, imageUrl, altText };
      }).filter(post => post.title.length > 0);
    });
  }

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
      console.log(`✅ "${expectedTitle}"`);
      console.log(`   - 이미지: ${found.hasImage ? '있음' : '없음'}`);
      if (found.hasImage) {
        console.log(`   - Alt: ${found.altText}`);
      }
    } else {
      console.log(`❌ "${expectedTitle}" - 찾을 수 없음`);
    }
  });

  console.log('\n전체 포스트 목록:');
  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   - 이미지: ${post.hasImage ? '있음' : '없음'}`);
    if (post.hasImage) {
      console.log(`   - Alt: ${post.altText}`);
    }
  });

  // 스크린샷 촬영
  const timestamp = new Date().toISOString();
  const screenshotPath = `blog-update-verification-${timestamp}.png`;
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  });
  console.log(`\n스크린샷 저장: ${screenshotPath}`);

  // 콘솔 에러 확인
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('브라우저 콘솔 에러:', msg.text());
    }
  });

  // 네트워크 에러 확인
  page.on('requestfailed', request => {
    console.log('요청 실패:', request.url(), request.failure().errorText);
  });

  await page.waitForTimeout(3000);

  await browser.close();
  console.log('\n검증 완료!');
}

verifyBlogUpdate().catch(console.error);