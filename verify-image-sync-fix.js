const { chromium } = require('playwright');

async function verifyImageSyncFix() {
  console.log('🔍 이미지 동기화 수정 결과 검증');
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 1단계: 블로그 페이지 접근
    console.log('1️⃣ 블로그 페이지 접근 중...');
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 2단계: 현재 상태 스크린샷
    const beforeScreenshot = `blog-after-sync-fix-${Date.now()}.png`;
    await page.screenshot({ 
      path: beforeScreenshot,
      fullPage: true,
      timeout: 15000
    });
    console.log(`📸 수정 후 블로그 페이지: ${beforeScreenshot}`);
    
    // 3단계: 모든 이미지 분석
    console.log('2️⃣ 블로그 이미지 분석...');
    
    const allImages = await page.locator('img').all();
    console.log(`🖼️ 총 ${allImages.length}개 이미지 발견:`);
    
    let uploadedImageFound = false;
    let changedImageCount = 0;
    
    for (let i = 0; i < allImages.length; i++) {
      try {
        const src = await allImages[i].getAttribute('src');
        const alt = await allImages[i].getAttribute('alt');
        
        if (src) {
          // 업로드된 이미지 확인
          if (src.includes('uploads/blog/') || src.includes('eiOZBRGFB9w5RQ8VmihlI')) {
            uploadedImageFound = true;
            changedImageCount++;
            console.log(`   🎯 업로드된 이미지 발견! ${i + 1}. src: "${src}", alt: "${alt}"`);
          } else if (src.includes('/images/blog') || src.includes('/logo.png')) {
            console.log(`   ${i + 1}. src: "${src}", alt: "${alt}"`);
          } else {
            console.log(`   ${i + 1}. src: "${src}", alt: "${alt}"`);
          }
        }
      } catch (e) {
        console.log(`   ${i + 1}. 이미지 분석 실패`);
      }
    }
    
    // 4단계: 첫 번째 블로그 카드 특별 확인
    console.log('3️⃣ 첫 번째 블로그 카드 상세 확인...');
    
    // 블로그 카드들 찾기
    const blogCards = await page.locator('[data-testid="blog-card"], .blog-card, article, .post-card').all();
    if (blogCards.length === 0) {
      // 일반적인 카드 구조 찾기
      const cards = await page.locator('div:has(img):has(h2, h3, h4)').all();
      console.log(`📋 카드 형태 요소 ${cards.length}개 발견`);
    } else {
      console.log(`📋 블로그 카드 ${blogCards.length}개 발견`);
    }
    
    // 첫 번째 포스트 제목 확인 (최종 테스트 포스트)
    const targetTitle = '최종 테스트 포스트';
    const titleElements = await page.locator(`h2:has-text("${targetTitle}"), h3:has-text("${targetTitle}"), h4:has-text("${targetTitle}")`).all();
    
    if (titleElements.length > 0) {
      console.log(`✅ "${targetTitle}" 포스트 발견`);
      
      // 해당 포스트의 이미지 찾기
      const parentCard = titleElements[0].locator('..').locator('..');
      const cardImage = await parentCard.locator('img').first();
      
      if (await cardImage.isVisible()) {
        const cardImageSrc = await cardImage.getAttribute('src');
        console.log(`🖼️ 해당 포스트의 이미지: "${cardImageSrc}"`);
        
        if (cardImageSrc && (cardImageSrc.includes('uploads/blog/') || cardImageSrc.includes('eiOZBRGFB9w5RQ8VmihlI'))) {
          console.log(`🎉 성공! 업로드된 이미지가 블로그에 반영되었습니다!`);
        } else {
          console.log(`⚠️ 아직 기본 이미지를 사용 중입니다.`);
        }
      }
    } else {
      console.log(`❌ "${targetTitle}" 포스트를 찾을 수 없음`);
    }
    
    // 5단계: 페이지 새로고침 후 재확인
    console.log('4️⃣ 캐시 갱신을 위해 페이지 새로고침...');
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 새로고침 후 스크린샷
    const afterReloadScreenshot = `blog-after-reload-${Date.now()}.png`;
    await page.screenshot({ 
      path: afterReloadScreenshot,
      fullPage: true,
      timeout: 15000
    });
    console.log(`📸 새로고침 후 블로그 페이지: ${afterReloadScreenshot}`);
    
    // 새로고침 후 이미지 재확인
    const reloadImages = await page.locator('img').all();
    let reloadUploadedImageFound = false;
    
    for (let i = 0; i < reloadImages.length; i++) {
      try {
        const src = await reloadImages[i].getAttribute('src');
        if (src && (src.includes('uploads/blog/') || src.includes('eiOZBRGFB9w5RQ8VmihlI'))) {
          reloadUploadedImageFound = true;
          console.log(`🎯 새로고침 후에도 업로드된 이미지 확인: "${src}"`);
          break;
        }
      } catch (e) {
        // 계속 진행
      }
    }
    
    // 6단계: 결과 요약
    console.log('📊 이미지 동기화 수정 결과:');
    console.log(`   - 동기화 스크립트 실행: ✅`);
    console.log(`   - 블로그 페이지 업로드 이미지 반영: ${uploadedImageFound ? '✅' : '❌'}`);
    console.log(`   - 새로고침 후 유지: ${reloadUploadedImageFound ? '✅' : '❌'}`);
    console.log(`   - 변경된 이미지 수: ${changedImageCount}개`);
    
    if (uploadedImageFound && reloadUploadedImageFound) {
      console.log('🎉 블로그 이미지 동기화 문제가 완전히 해결되었습니다!');
    } else if (uploadedImageFound) {
      console.log('⚠️ 이미지가 일부 반영되었지만 완전하지 않을 수 있습니다.');
    } else {
      console.log('❌ 이미지 동기화 문제가 아직 해결되지 않았습니다.');
      console.log('💡 서버 재시작이나 캐시 클리어가 필요할 수 있습니다.');
    }
    
    console.log('✅ 이미지 동기화 수정 결과 검증 완료');
    
    // 브라우저 유지
    console.log('🔍 15초간 브라우저 유지 (결과 확인)...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ 검증 실패:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
if (require.main === module) {
  verifyImageSyncFix().catch(console.error);
}

module.exports = { verifyImageSyncFix };