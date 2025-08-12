const { chromium } = require('playwright');

(async () => {
  console.log('=== PM: 전체 페이지 이미지 전수 검사 시작 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  const prodUrl = 'https://test-studio-firebase.vercel.app';
  const imageReport = {
    homepage: { total: 0, success: 0, failed: [] },
    blog: { total: 0, success: 0, failed: [] },
    blogDetail: { total: 0, success: 0, failed: [] },
    tarotReading: { total: 0, success: 0, failed: [] },
    tarotCards: { total: 0, success: 0, failed: [] },
    encyclopedia: { total: 0, success: 0, failed: [] }
  };
  
  // 이미지 검사 함수
  async function checkImages(pageName) {
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || 'no-alt',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        currentSrc: img.currentSrc
      }))
    );
    
    imageReport[pageName].total = images.length;
    images.forEach(img => {
      if (img.naturalWidth > 0) {
        imageReport[pageName].success++;
      } else {
        imageReport[pageName].failed.push({
          src: img.src,
          alt: img.alt
        });
      }
    });
    
    return images;
  }
  
  try {
    // 1. 홈페이지
    console.log('1. 홈페이지 검사...');
    await page.goto(prodUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await checkImages('homepage');
    await page.screenshot({ path: 'check-homepage.png', fullPage: true });
    
    // 2. 블로그 목록
    console.log('\n2. 블로그 목록 페이지 검사...');
    await page.goto(`${prodUrl}/blog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await checkImages('blog');
    await page.screenshot({ path: 'check-blog-list.png', fullPage: true });
    
    // 3. 블로그 상세 (첫 번째 포스트)
    console.log('\n3. 블로그 상세 포스트 검사...');
    const firstPostLink = await page.$('a[href*="/blog/"]');
    if (firstPostLink) {
      await firstPostLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      await checkImages('blogDetail');
      await page.screenshot({ path: 'check-blog-detail.png', fullPage: true });
    }
    
    // 4. 타로 리딩 페이지
    console.log('\n4. 타로 리딩 페이지 검사...');
    await page.goto(`${prodUrl}/reading`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 카드 섞기 버튼 클릭
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    if (shuffleButton) {
      await shuffleButton.click();
      await page.waitForTimeout(2000);
      
      // 카드 펼치기 버튼 클릭
      const spreadButton = await page.$('button:has-text("카드 펼치기")');
      if (spreadButton) {
        await spreadButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    await checkImages('tarotReading');
    await page.screenshot({ path: 'check-tarot-reading.png', fullPage: true });
    
    // 5. 타로 카드 백과사전
    console.log('\n5. 타로 카드 백과사전 검사...');
    await page.goto(`${prodUrl}/tarot`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await checkImages('tarotCards');
    await page.screenshot({ path: 'check-tarot-cards.png', fullPage: true });
    
    // 6. 백과사전 (encyclopedia)
    console.log('\n6. 백과사전 페이지 검사...');
    await page.goto(`${prodUrl}/encyclopedia`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await checkImages('encyclopedia');
    await page.screenshot({ path: 'check-encyclopedia.png', fullPage: true });
    
    // 최종 보고서
    console.log('\n\n=== 🔍 PM 전체 이미지 검사 보고서 ===\n');
    
    for (const [pageName, data] of Object.entries(imageReport)) {
      const successRate = data.total > 0 ? Math.round((data.success / data.total) * 100) : 0;
      console.log(`📄 ${pageName}:`);
      console.log(`   총 이미지: ${data.total}개`);
      console.log(`   성공: ${data.success}개 (${successRate}%)`);
      console.log(`   실패: ${data.failed.length}개`);
      
      if (data.failed.length > 0) {
        console.log('   실패한 이미지:');
        data.failed.forEach(img => {
          console.log(`     - ${img.alt}: ${img.src}`);
        });
      }
      console.log('');
    }
    
    // 누락된 이미지 파악
    const allFailedImages = [];
    for (const [pageName, data] of Object.entries(imageReport)) {
      allFailedImages.push(...data.failed);
    }
    
    if (allFailedImages.length > 0) {
      console.log('⚠️  전체 누락된 이미지 목록:');
      const uniqueImages = [...new Set(allFailedImages.map(img => img.src))];
      uniqueImages.forEach(src => {
        console.log(`   ${src}`);
      });
    } else {
      console.log('✅ 모든 페이지의 이미지가 정상적으로 로드되었습니다!');
    }
    
  } catch (error) {
    console.error('\n❌ 검사 중 오류:', error.message);
  }
  
  console.log('\n브라우저를 15초 후 닫습니다...');
  await page.waitForTimeout(15000);
  await browser.close();
})();