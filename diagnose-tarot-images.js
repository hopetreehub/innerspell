const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('=== 타로카드 이미지 진단 시작 ===\n');
  
  // 페이지 접속
  console.log('1. 타로카드 상세 페이지 접속...');
  await page.goto('http://localhost:4000/tarot/major-00-fool', { waitUntil: 'networkidle' });
  
  // 콘솔 메시지 수집
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push(`[Console Error] ${msg.text()}`);
    }
  });
  
  // 네트워크 에러 수집
  const networkErrors = [];
  page.on('requestfailed', request => {
    if (request.resourceType() === 'image') {
      networkErrors.push({
        url: request.url(),
        failure: request.failure().errorText
      });
    }
  });
  
  // 페이지 로드 대기
  await page.waitForTimeout(3000);
  
  // 메인 카드 이미지 확인
  console.log('\n2. 메인 타로카드 이미지 확인...');
  const mainImage = await page.locator('img[alt*="The Fool"]').first();
  if (await mainImage.count() > 0) {
    const mainImageSrc = await mainImage.getAttribute('src');
    const mainImageBounds = await mainImage.boundingBox();
    console.log(`   - 이미지 경로: ${mainImageSrc}`);
    console.log(`   - 표시 크기: ${mainImageBounds ? `${mainImageBounds.width}x${mainImageBounds.height}` : 'N/A'}`);
    
    // 실제 이미지 크기 확인
    const naturalSize = await mainImage.evaluate(img => ({
      width: img.naturalWidth,
      height: img.naturalHeight
    }));
    console.log(`   - 실제 크기: ${naturalSize.width}x${naturalSize.height}`);
  } else {
    console.log('   - 메인 이미지를 찾을 수 없습니다.');
  }
  
  // 관련 카드 이미지들 확인
  console.log('\n3. 관련 카드 이미지들 확인...');
  const relatedImages = await page.locator('img[src*="/cards/"]').all();
  console.log(`   - 총 ${relatedImages.length}개의 카드 이미지 발견`);
  
  for (let i = 0; i < Math.min(5, relatedImages.length); i++) {
    const img = relatedImages[i];
    const src = await img.getAttribute('src');
    const bounds = await img.boundingBox();
    console.log(`   - 이미지 ${i + 1}: ${src} (${bounds ? `${bounds.width}x${bounds.height}` : 'not visible'})`);
  }
  
  // 404 에러 확인
  console.log('\n4. 404 에러 이미지 경로들:');
  if (networkErrors.length > 0) {
    networkErrors.forEach(error => {
      console.log(`   - ${error.url} (${error.failure})`);
    });
  } else {
    console.log('   - 404 에러가 발견되지 않았습니다.');
  }
  
  // CSS 스타일 확인
  console.log('\n5. 이미지 CSS 스타일 확인:');
  const imageStyles = await page.evaluate(() => {
    const mainImg = document.querySelector('img[alt*="The Fool"]');
    if (mainImg) {
      const computed = window.getComputedStyle(mainImg);
      return {
        width: computed.width,
        height: computed.height,
        maxWidth: computed.maxWidth,
        maxHeight: computed.maxHeight,
        objectFit: computed.objectFit,
        display: computed.display
      };
    }
    return null;
  });
  
  if (imageStyles) {
    console.log('   메인 이미지 스타일:');
    Object.entries(imageStyles).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });
  }
  
  // 개발자 도구 열기
  await page.keyboard.press('F12');
  await page.waitForTimeout(2000);
  
  // 스크린샷 촬영
  console.log('\n6. 스크린샷 촬영 중...');
  await page.screenshot({ 
    path: '/mnt/e/project/test-studio-firebase/tarot-image-issue-diagnosis.png',
    fullPage: false
  });
  console.log('   - 스크린샷 저장 완료: tarot-image-issue-diagnosis.png');
  
  // 추가 진단 정보
  console.log('\n=== 추가 진단 정보 ===');
  
  // 이미지 로딩 상태 확인
  const imageLoadStatus = await page.evaluate(() => {
    const images = document.querySelectorAll('img');
    return Array.from(images).map(img => ({
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.offsetWidth,
      displayHeight: img.offsetHeight
    }));
  });
  
  console.log('\n이미지 로딩 상태:');
  imageLoadStatus.forEach((img, index) => {
    console.log(`이미지 ${index + 1}:`);
    console.log(`  - 경로: ${img.src}`);
    console.log(`  - 로딩 완료: ${img.complete}`);
    console.log(`  - 실제 크기: ${img.naturalWidth}x${img.naturalHeight}`);
    console.log(`  - 표시 크기: ${img.displayWidth}x${img.displayHeight}`);
  });
  
  // 콘솔 에러 출력
  if (consoleMessages.length > 0) {
    console.log('\n콘솔 에러:');
    consoleMessages.forEach(msg => console.log(msg));
  }
  
  console.log('\n진단 완료! 브라우저를 30초간 열어둡니다...');
  await page.waitForTimeout(30000);
  
  await browser.close();
})();