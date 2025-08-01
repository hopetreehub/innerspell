const { chromium } = require('playwright');
const fs = require('fs');

async function verifyCardSpreadIssue() {
  console.log('🎯 전문가 페르소나: 카드 펼치기 문제 심층 분석');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    testType: 'Card Spread Analysis',
    findings: []
  };
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ko-KR'
    });
    const page = await context.newPage();
    
    // 콘솔 로그 캡처
    page.on('console', msg => {
      if (msg.text().includes('card') || msg.text().includes('flip') || msg.text().includes('spread')) {
        console.log(`📝 콘솔: ${msg.text()}`);
      }
    });
    
    console.log('\n1️⃣ 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    
    // 질문 입력
    console.log('\n2️⃣ 질문 입력...');
    const questionInput = page.locator('textarea[placeholder*="질문"]');
    await questionInput.fill('카드 뒷면 표시 테스트');
    await page.screenshot({ path: 'spread-issue-1-question.png' });
    
    // 타로 읽기 시작
    console.log('\n3️⃣ 타로 읽기 시작...');
    await page.click('button:has-text("타로 읽기 시작")');
    await page.waitForTimeout(2000);
    
    // 쓰리카드 스프레드 선택 (더 명확한 테스트를 위해)
    console.log('\n4️⃣ 쓰리카드 스프레드 선택...');
    const threeCardButton = page.locator('button:has-text("쓰리카드")');
    if (await threeCardButton.count() > 0) {
      await threeCardButton.click();
      await page.waitForTimeout(3000);
      
      console.log('\n5️⃣ 카드 펼치기 상태 분석...');
      
      // 모든 이미지 요소 분석
      const allImages = await page.locator('img').all();
      console.log(`📊 전체 이미지 수: ${allImages.length}개`);
      
      const cardAnalysis = [];
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i];
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        const parent = await img.locator('..').getAttribute('class');
        
        if (src && (src.includes('tarot') || alt?.includes('타로'))) {
          const isBackImage = src.includes('back.png') || src.includes('back/back.png');
          const isFrontImage = !isBackImage && (src.includes('.png') || src.includes('.jpg'));
          
          cardAnalysis.push({
            index: i,
            src: src,
            alt: alt || 'no-alt',
            isBack: isBackImage,
            isFront: isFrontImage,
            parentClass: parent
          });
          
          console.log(`\n  카드 ${i + 1}:`);
          console.log(`    - 이미지: ${src}`);
          console.log(`    - 종류: ${isBackImage ? '🔵 뒷면' : isFrontImage ? '🔴 앞면' : '❓ 불명'}`);
          console.log(`    - Alt: ${alt || 'none'}`);
        }
      }
      
      await page.screenshot({ path: 'spread-issue-2-cards-spread.png', fullPage: true });
      
      // 카드 클릭 가능 여부 확인
      console.log('\n6️⃣ 카드 클릭 가능 요소 확인...');
      const clickableCards = await page.locator('.cursor-pointer').all();
      console.log(`🖱️ 클릭 가능한 요소: ${clickableCards.length}개`);
      
      // 첫 번째 카드 클릭 시도
      if (clickableCards.length > 0) {
        console.log('\n7️⃣ 첫 번째 카드 클릭...');
        await clickableCards[0].click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'spread-issue-3-after-click.png', fullPage: true });
        
        // 클릭 후 상태 재확인
        const afterClickImages = await page.locator('img[src*="tarot"]').all();
        console.log(`\n📊 클릭 후 타로 이미지 수: ${afterClickImages.length}개`);
      }
      
      // 문제 진단
      results.findings.push({
        stage: 'Card Spread Analysis',
        totalCards: cardAnalysis.length,
        backCards: cardAnalysis.filter(c => c.isBack).length,
        frontCards: cardAnalysis.filter(c => c.isFront).length,
        clickableElements: clickableCards.length
      });
      
      // CSS 클래스 분석
      console.log('\n8️⃣ CSS 클래스 및 스타일 분석...');
      const cardContainers = await page.locator('[class*="card"], [class*="tarot"]').all();
      console.log(`📦 카드 관련 컨테이너: ${cardContainers.length}개`);
      
      // 회전 상태 확인
      for (let i = 0; i < Math.min(3, cardContainers.length); i++) {
        const transform = await cardContainers[i].evaluate(el => 
          window.getComputedStyle(el).transform
        );
        console.log(`  컨테이너 ${i + 1} transform: ${transform}`);
      }
      
    } else {
      console.log('❌ 스프레드 선택 버튼을 찾을 수 없습니다.');
    }
    
    // 최종 진단
    console.log('\n' + '=' .repeat(60));
    console.log('🔍 진단 결과:');
    results.findings.forEach(finding => {
      console.log(`\n📌 ${finding.stage}`);
      console.log(`  - 전체 카드: ${finding.totalCards}개`);
      console.log(`  - 뒷면 카드: ${finding.backCards}개`);
      console.log(`  - 앞면 카드: ${finding.frontCards}개`);
      console.log(`  - 클릭 가능: ${finding.clickableElements}개`);
      
      if (finding.frontCards > 0 && finding.backCards === 0) {
        console.log('\n⚠️ 문제 확인: 카드가 뒷면이 아닌 앞면으로 펼쳐지고 있습니다!');
      } else if (finding.backCards > 0) {
        console.log('\n✅ 정상: 카드가 뒷면으로 펼쳐지고 있습니다.');
      }
    });
    
    // 결과 저장
    fs.writeFileSync('card-spread-analysis.json', JSON.stringify(results, null, 2));
    console.log('\n📄 상세 분석 결과: card-spread-analysis.json');
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    results.error = error.message;
  } finally {
    await browser.close();
  }
}

verifyCardSpreadIssue().catch(console.error);