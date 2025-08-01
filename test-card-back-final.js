const { chromium } = require('playwright');

async function testCardBackFinal() {
  console.log('🎯 최종 카드 뒷면 표시 테스트 (캐시 클리어 후)\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000
  });
  
  try {
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    // 이미지 요청 모니터링
    page.on('request', request => {
      const url = request.url();
      if (url.includes('tarot') && url.includes('.png')) {
        const isBack = url.includes('back.png') || url.includes('back/back.png');
        console.log(`📡 이미지 요청: ${isBack ? '🔵 뒷면' : '🔴 앞면'} - ${url}`);
      }
    });
    
    console.log('1️⃣ 로컬 4000번 포트 접속...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n2️⃣ 질문 입력...');
    await page.fill('textarea[placeholder*="질문"]', '카드 뒷면 최종 테스트');
    
    console.log('\n3️⃣ 타로 읽기 시작...');
    await page.click('button:has-text("타로 읽기 시작")');
    await page.waitForTimeout(2000);
    
    console.log('\n4️⃣ 쓰리카드 선택...');
    await page.click('button:has-text("쓰리카드")');
    
    console.log('\n5️⃣ 카드 펼치기 대기...');
    await page.waitForTimeout(5000);
    
    // 펼쳐진 카드 분석
    const allImages = await page.locator('img[src*="tarot"]').all();
    let backCount = 0;
    let frontCount = 0;
    
    console.log('\n📊 펼쳐진 카드 분석:');
    for (const img of allImages) {
      const src = await img.getAttribute('src');
      if (await img.isVisible()) {
        if (src.includes('back')) {
          backCount++;
          console.log(`   🔵 뒷면 카드: ${src}`);
        } else {
          frontCount++;
          console.log(`   🔴 앞면 카드: ${src}`);
        }
      }
    }
    
    await page.screenshot({ path: 'final-card-back-test.png', fullPage: true });
    
    console.log('\n📈 최종 결과:');
    console.log(`   - 뒷면 카드: ${backCount}개`);
    console.log(`   - 앞면 카드: ${frontCount}개`);
    console.log('   - 총 표시된 카드:', backCount + frontCount);
    
    if (backCount > 0 && frontCount === 0) {
      console.log('\n✅ 성공: 모든 카드가 뒷면으로 펼쳐졌습니다!');
    } else if (frontCount > 0 && backCount === 0) {
      console.log('\n❌ 실패: 카드가 여전히 앞면으로 펼쳐집니다.');
    } else if (backCount > 0 && frontCount > 0) {
      console.log('\n⚠️ 혼재: 일부는 뒷면, 일부는 앞면으로 표시됩니다.');
    } else {
      console.log('\n❓ 카드를 찾을 수 없습니다.');
    }
    
    // 카드 하나 클릭해서 뒤집기 테스트
    console.log('\n6️⃣ 카드 클릭 테스트...');
    const clickableCards = await page.locator('.cursor-pointer').all();
    if (clickableCards.length > 0) {
      console.log('   첫 번째 카드 클릭...');
      await clickableCards[0].click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'final-card-clicked.png', fullPage: true });
      console.log('   카드 클릭 후 스크린샷: final-card-clicked.png');
    }
    
    console.log('\n📸 저장된 스크린샷:');
    console.log('   - final-card-back-test.png (카드 펼치기)');
    console.log('   - final-card-clicked.png (카드 클릭 후)');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testCardBackFinal().catch(console.error);