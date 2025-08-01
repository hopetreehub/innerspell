const { chromium } = require('playwright');

async function checkCardSpread() {
  console.log('🔍 카드 펼치기 상태 간단 확인\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000
  });
  
  try {
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    console.log('1️⃣ 페이지 접속...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 충분한 로딩 시간
    
    // 현재 페이지 상태 확인
    const pageTitle = await page.title();
    console.log(`   페이지 제목: ${pageTitle}`);
    
    // 질문 입력란 찾기
    const hasTextarea = await page.locator('textarea').count() > 0;
    console.log(`   질문 입력란: ${hasTextarea ? '있음' : '없음'}`);
    
    if (hasTextarea) {
      console.log('\n2️⃣ 질문 입력...');
      await page.locator('textarea').first().fill('테스트 질문');
      
      console.log('\n3️⃣ 타로 읽기 시작...');
      const startButton = page.locator('button').filter({ hasText: '타로 읽기 시작' });
      if (await startButton.count() > 0) {
        await startButton.click();
        await page.waitForTimeout(3000);
        
        console.log('\n4️⃣ 원카드 선택...');
        const oneCard = page.locator('button').filter({ hasText: '원카드' });
        if (await oneCard.count() > 0) {
          await oneCard.click();
          await page.waitForTimeout(5000);
          
          console.log('\n5️⃣ 카드 이미지 분석...');
          const images = await page.locator('img').all();
          
          let backCardCount = 0;
          let frontCardCount = 0;
          
          for (const img of images) {
            const src = await img.getAttribute('src');
            if (src && src.includes('tarot')) {
              if (src.includes('back')) {
                backCardCount++;
                console.log(`   🔵 뒷면 카드: ${src}`);
              } else if (src.includes('.png') || src.includes('.jpg')) {
                frontCardCount++;
                console.log(`   🔴 앞면 카드: ${src}`);
              }
            }
          }
          
          console.log(`\n📊 결과:`);
          console.log(`   - 뒷면 카드: ${backCardCount}개`);
          console.log(`   - 앞면 카드: ${frontCardCount}개`);
          
          if (frontCardCount > 0 && backCardCount === 0) {
            console.log('\n❌ 문제 발견: 카드가 앞면으로 펼쳐지고 있습니다!');
          } else if (backCardCount > 0) {
            console.log('\n✅ 정상: 카드가 뒷면으로 표시됩니다.');
          }
          
          await page.screenshot({ path: 'card-spread-check.png', fullPage: true });
          console.log('\n📸 스크린샷: card-spread-check.png');
        }
      }
    } else {
      // 페이지 내용 확인
      const pageContent = await page.locator('body').innerText();
      console.log('\n⚠️ 페이지 내용:');
      console.log(pageContent.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
}

checkCardSpread().catch(console.error);