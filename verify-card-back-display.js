const { chromium } = require('playwright');
const fs = require('fs');

async function verifyCardBackDisplay() {
  console.log('🎯 전문가 페르소나: 카드 뒷면 표시 최종 검증');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000
  });
  
  const report = {
    timestamp: new Date().toISOString(),
    testName: 'Card Back Display Verification',
    results: []
  };
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ko-KR'
    });
    const page = await context.newPage();
    
    // 네트워크 요청 모니터링
    const imageRequests = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('tarot') && url.includes('.png')) {
        imageRequests.push({
          time: new Date().toISOString(),
          url: url,
          isBackImage: url.includes('back.png') || url.includes('back/back.png')
        });
      }
    });
    
    console.log('\n1️⃣ 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    
    console.log('\n2️⃣ 질문 입력...');
    await page.locator('textarea').first().fill('카드 뒷면 표시 검증 테스트');
    await page.screenshot({ path: 'verify-back-1-question.png' });
    
    console.log('\n3️⃣ 타로 읽기 시작...');
    await page.locator('button').filter({ hasText: '타로 읽기 시작' }).click();
    await page.waitForTimeout(2000);
    
    console.log('\n4️⃣ 쓰리카드 스프레드 선택...');
    await page.locator('button').filter({ hasText: '쓰리카드' }).click();
    await page.waitForTimeout(5000); // 카드 펼치기 애니메이션 대기
    
    console.log('\n5️⃣ 펼쳐진 카드 분석...');
    
    // 모든 이미지 태그 분석
    const allImages = await page.locator('img').all();
    let spreadCardAnalysis = [];
    
    for (const img of allImages) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const isVisible = await img.isVisible();
      
      if (src && src.includes('tarot') && isVisible) {
        const isBack = src.includes('back.png') || src.includes('back/back.png');
        spreadCardAnalysis.push({
          src,
          alt: alt || 'no-alt',
          isBack,
          type: isBack ? '🔵 뒷면' : '🔴 앞면'
        });
      }
    }
    
    console.log(`\n📊 펼쳐진 카드 상태:`);
    spreadCardAnalysis.forEach((card, idx) => {
      console.log(`  카드 ${idx + 1}: ${card.type}`);
      console.log(`    경로: ${card.src}`);
    });
    
    await page.screenshot({ path: 'verify-back-2-spread.png', fullPage: true });
    
    report.results.push({
      stage: 'Cards Spread',
      totalCards: spreadCardAnalysis.length,
      backCards: spreadCardAnalysis.filter(c => c.isBack).length,
      frontCards: spreadCardAnalysis.filter(c => !c.isBack).length
    });
    
    // 카드 하나 클릭
    console.log('\n6️⃣ 첫 번째 카드 클릭...');
    const clickableCards = await page.locator('.cursor-pointer img').all();
    if (clickableCards.length > 0) {
      await clickableCards[0].click();
      await page.waitForTimeout(3000);
      
      // 클릭 후 상태 재분석
      const afterClickImages = await page.locator('img[src*="tarot"]').all();
      let afterClickAnalysis = [];
      
      for (const img of afterClickImages) {
        const src = await img.getAttribute('src');
        if (await img.isVisible()) {
          const isBack = src.includes('back.png') || src.includes('back/back.png');
          afterClickAnalysis.push({
            src,
            isBack,
            type: isBack ? '🔵 뒷면' : '🔴 앞면'
          });
        }
      }
      
      console.log(`\n📊 클릭 후 카드 상태:`);
      afterClickAnalysis.forEach((card, idx) => {
        console.log(`  카드 ${idx + 1}: ${card.type}`);
      });
      
      await page.screenshot({ path: 'verify-back-3-after-click.png', fullPage: true });
      
      report.results.push({
        stage: 'After First Click',
        totalCards: afterClickAnalysis.length,
        backCards: afterClickAnalysis.filter(c => c.isBack).length,
        frontCards: afterClickAnalysis.filter(c => !c.isBack).length
      });
    }
    
    // 나머지 카드들도 클릭
    console.log('\n7️⃣ 나머지 카드 선택...');
    for (let i = 1; i < Math.min(3, clickableCards.length); i++) {
      await clickableCards[i].click();
      await page.waitForTimeout(1500);
    }
    
    await page.screenshot({ path: 'verify-back-4-all-selected.png', fullPage: true });
    
    // 최종 진단
    console.log('\n' + '=' .repeat(60));
    console.log('📊 최종 검증 결과:\n');
    
    report.results.forEach(result => {
      console.log(`[${result.stage}]`);
      console.log(`  - 전체 카드: ${result.totalCards}개`);
      console.log(`  - 뒷면 카드: ${result.backCards}개`);
      console.log(`  - 앞면 카드: ${result.frontCards}개`);
      
      if (result.stage === 'Cards Spread') {
        if (result.backCards > 0 && result.frontCards === 0) {
          console.log('  ✅ 성공: 모든 카드가 뒷면으로 펼쳐졌습니다!');
        } else if (result.frontCards > 0 && result.backCards === 0) {
          console.log('  ❌ 실패: 카드가 앞면으로 펼쳐지고 있습니다.');
        } else {
          console.log('  ⚠️ 경고: 일부 카드만 뒷면으로 표시됩니다.');
        }
      }
      console.log('');
    });
    
    // 네트워크 요청 분석
    console.log('📡 이미지 요청 분석:');
    const backImageRequests = imageRequests.filter(r => r.isBackImage);
    const frontImageRequests = imageRequests.filter(r => !r.isBackImage);
    console.log(`  - 카드 뒷면 요청: ${backImageRequests.length}회`);
    console.log(`  - 카드 앞면 요청: ${frontImageRequests.length}회`);
    
    // 보고서 저장
    report.networkAnalysis = {
      totalRequests: imageRequests.length,
      backImageRequests: backImageRequests.length,
      frontImageRequests: frontImageRequests.length
    };
    
    fs.writeFileSync('card-back-display-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 상세 보고서: card-back-display-report.json');
    console.log('📸 스크린샷: verify-back-*.png');
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    report.error = error.message;
  } finally {
    await browser.close();
  }
}

verifyCardBackDisplay().catch(console.error);