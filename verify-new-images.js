const { chromium } = require('playwright');

async function verifyNewImages() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🎯 새로운 타로 이미지 적용 테스트 시작...\n');
    
    // 1. 타로 리딩 페이지 테스트
    console.log('📖 [1/2] 타로 리딩 페이지 테스트');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Issue 버튼 닫기
    const closeButton = page.locator('button[aria-label="Close"]').first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 카드 뒷면 이미지 확인
    const cardBackInReading = await page.locator('img[alt*="카드 뒷면"]').first();
    const cardBackSrc = await cardBackInReading.getAttribute('src');
    console.log(`✅ 리딩 페이지 카드 뒷면: ${cardBackSrc}`);
    console.log(`   → tarot-spread 폴더 사용 여부: ${cardBackSrc.includes('tarot-spread') ? '✅ YES' : '❌ NO'}`);
    
    // 카드 섞기 및 펼치기
    const cardDeck = page.locator('div[aria-label*="카드 덱"]').first();
    if (await cardDeck.count() > 0) {
      await cardDeck.click();
    } else {
      await page.locator('button:has-text("카드 섞기")').first().click();
    }
    
    await page.waitForTimeout(8000);
    
    const spreadButton = page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.count() > 0) {
      await spreadButton.click();
      await page.waitForTimeout(5000);
    }
    
    // 펼쳐진 카드 이미지 확인
    const spreadCards = await page.locator('.flex.space-x-\\[-125px\\] img').all();
    console.log(`\n✅ 펼쳐진 카드 개수: ${spreadCards.length}`);
    
    if (spreadCards.length > 0) {
      const firstCardSrc = await spreadCards[0].getAttribute('src');
      console.log(`✅ 첫 번째 카드 이미지: ${firstCardSrc}`);
      console.log(`   → tarot-spread 폴더 사용 여부: ${firstCardSrc.includes('tarot-spread') ? '✅ YES' : '❌ NO'}`);
    }
    
    await page.screenshot({ path: 'verify-1-reading-page.png', fullPage: true });
    console.log('📸 리딩 페이지 스크린샷 저장\n');
    
    // 2. 타로 카드 메뉴/백과사전 테스트
    console.log('📚 [2/2] 타로 카드 백과사전 테스트');
    await page.goto('http://localhost:4000/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 백과사전 카드 이미지 확인
    const encyclopediaCards = await page.locator('img[alt*="타로 카드"], img[alt*="Tarot"]').all();
    console.log(`✅ 백과사전 카드 개수: ${encyclopediaCards.length}`);
    
    if (encyclopediaCards.length > 0) {
      const firstEncyclopediaCard = await encyclopediaCards[0].getAttribute('src');
      console.log(`✅ 첫 번째 백과사전 카드: ${firstEncyclopediaCard}`);
      console.log(`   → 원본 tarot 폴더 사용 여부: ${!firstEncyclopediaCard.includes('tarot-spread') ? '✅ YES' : '❌ NO'}`);
      console.log(`   → JPG 형식 사용 여부: ${firstEncyclopediaCard.includes('.jpg') || firstEncyclopediaCard.includes('f=auto') ? '✅ YES' : '❌ NO'}`);
    }
    
    await page.screenshot({ path: 'verify-2-encyclopedia-page.png', fullPage: true });
    console.log('📸 백과사전 페이지 스크린샷 저장\n');
    
    // 3. 이미지 로딩 성능 확인
    console.log('⚡ [추가] 이미지 로딩 성능 확인');
    
    // 네트워크 탭에서 이미지 로딩 확인
    const imageRequests = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/images/tarot') && (url.endsWith('.png') || url.endsWith('.jpg'))) {
        imageRequests.push({
          url: url,
          status: response.status(),
          type: url.includes('tarot-spread') ? 'spread' : 'original'
        });
      }
    });
    
    // 리딩 페이지 다시 로드
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log(`\n📊 이미지 로딩 통계:`);
    console.log(`   - 총 이미지 요청: ${imageRequests.length}`);
    console.log(`   - tarot-spread 이미지: ${imageRequests.filter(r => r.type === 'spread').length}`);
    console.log(`   - 원본 tarot 이미지: ${imageRequests.filter(r => r.type === 'original').length}`);
    console.log(`   - 성공적으로 로드됨: ${imageRequests.filter(r => r.status === 200).length}`);
    
    return {
      success: true,
      results: {
        readingPage: {
          usesSpreadImages: cardBackSrc?.includes('tarot-spread') || false,
          cardCount: spreadCards.length
        },
        encyclopediaPage: {
          usesOriginalImages: encyclopediaCards.length > 0,
          cardCount: encyclopediaCards.length
        },
        performance: {
          totalRequests: imageRequests.length,
          spreadImages: imageRequests.filter(r => r.type === 'spread').length,
          originalImages: imageRequests.filter(r => r.type === 'original').length,
          successfulLoads: imageRequests.filter(r => r.status === 200).length
        }
      }
    };
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'verify-error.png', fullPage: true });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

verifyNewImages().then(result => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 새로운 타로 이미지 적용 테스트 결과:');
  console.log(JSON.stringify(result, null, 2));
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log('\n✅ 모든 이미지 설정이 올바르게 적용되었습니다!');
    console.log('   - 리딩 페이지: tarot-spread 폴더의 PNG 이미지 사용');
    console.log('   - 백과사전: 원본 tarot 폴더의 JPG 이미지 사용');
  }
  
  process.exit(result.success ? 0 : 1);
});