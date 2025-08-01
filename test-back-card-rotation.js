const { chromium } = require('playwright');

async function testBackCardRotation() {
  console.log('🎯 뒷면 카드 회전 방지 테스트\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  try {
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    console.log('1️⃣ 로컬 4000번 포트 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000);
    
    console.log('2️⃣ 질문 입력...');
    await page.fill('textarea[placeholder*="질문"]', '뒷면 카드 회전 테스트');
    
    console.log('3️⃣ 타로 읽기 시작...');
    await page.click('button:has-text("타로 읽기 시작")');
    await page.waitForTimeout(2000);
    
    console.log('4️⃣ 쓰리카드 선택...');
    await page.click('button:has-text("쓰리카드")');
    
    console.log('5️⃣ 카드 펼치기 대기...');
    await page.waitForTimeout(5000);
    
    // 펼쳐진 카드들의 회전 상태 확인
    console.log('\n📊 뒷면 카드 회전 상태 분석:');
    
    // 모든 이미지 요소 찾기
    const cardImages = await page.locator('img[src*="back"]').all();
    
    let rotatedBackCards = 0;
    let normalBackCards = 0;
    
    for (let i = 0; i < cardImages.length; i++) {
      const img = cardImages[i];
      const className = await img.getAttribute('class');
      const src = await img.getAttribute('src');
      
      if (src && src.includes('back')) {
        const isRotated = className && className.includes('rotate-180');
        
        if (isRotated) {
          rotatedBackCards++;
          console.log(`   🔴 회전된 뒷면 카드 ${i + 1}: ${className}`);
        } else {
          normalBackCards++;
          console.log(`   🟢 정상 뒷면 카드 ${i + 1}: 회전 없음`);
        }
      }
    }
    
    await page.screenshot({ path: 'back-card-rotation-test.png', fullPage: true });
    
    console.log('\n📈 테스트 결과:');
    console.log(`   - 정상 방향 뒷면 카드: ${normalBackCards}개`);
    console.log(`   - 회전된 뒷면 카드: ${rotatedBackCards}개`);
    
    if (rotatedBackCards === 0 && normalBackCards > 0) {
      console.log('\n✅ 성공: 모든 뒷면 카드가 정상 방향입니다!');
    } else if (rotatedBackCards > 0) {
      console.log('\n❌ 실패: 일부 뒷면 카드가 회전되어 있습니다.');
    } else {
      console.log('\n❓ 뒷면 카드를 찾을 수 없습니다.');
    }
    
    // 카드 하나 클릭해서 앞면으로 뒤집기
    console.log('\n6️⃣ 카드 클릭하여 앞면으로 뒤집기...');
    const clickableCards = await page.locator('.cursor-pointer').all();
    if (clickableCards.length > 0) {
      await clickableCards[0].click();
      await page.waitForTimeout(2000);
      
      // 앞면 카드의 회전 상태 확인
      const frontImages = await page.locator('img:not([src*="back"])').all();
      let rotatedFrontCards = 0;
      let normalFrontCards = 0;
      
      console.log('\n📊 앞면 카드 회전 상태 분석:');
      for (let i = 0; i < frontImages.length; i++) {
        const img = frontImages[i];
        const className = await img.getAttribute('class');
        const src = await img.getAttribute('src');
        
        if (src && !src.includes('back') && src.includes('tarot')) {
          const isRotated = className && className.includes('rotate-180');
          
          if (isRotated) {
            rotatedFrontCards++;
            console.log(`   🔄 역방향 앞면 카드 ${i + 1}: 180도 회전`);
          } else {
            normalFrontCards++;
            console.log(`   ⬆️ 정방향 앞면 카드 ${i + 1}: 회전 없음`);
          }
        }
      }
      
      await page.screenshot({ path: 'front-card-rotation-test.png', fullPage: true });
      
      console.log('\n📈 앞면 카드 회전 결과:');
      console.log(`   - 정방향 앞면 카드: ${normalFrontCards}개`);
      console.log(`   - 역방향 앞면 카드: ${rotatedFrontCards}개`);
    }
    
    console.log('\n📸 저장된 스크린샷:');
    console.log('   - back-card-rotation-test.png (뒷면 카드 상태)');
    console.log('   - front-card-rotation-test.png (앞면 카드 상태)');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testBackCardRotation().catch(console.error);