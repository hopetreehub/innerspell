const { chromium } = require('playwright');

async function manualCommunityTest() {
  console.log('🎯 수동 "커뮤니티로 저장하기" 기능 확인');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    args: ['--disable-web-security']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('1️⃣ 타로 리딩 페이지 접속');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    console.log('2️⃣ 질문 입력');
    await page.fill('textarea', '경험 공유하기 버튼 테스트입니다.');
    
    console.log('3️⃣ 카드 섞기');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(4000);
    
    console.log('4️⃣ 카드 펼치기');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);
    
    console.log('5️⃣ 카드 3장 강제 선택');
    await page.evaluate(() => {
      const cards = document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]');
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        cards[i].click();
      }
    });
    await page.waitForTimeout(2000);
    
    console.log('6️⃣ AI 해석 버튼 클릭');
    const interpretButton = page.locator('button:has-text("AI 해석 받기")');
    if (await interpretButton.isVisible({ timeout: 5000 })) {
      await interpretButton.click();
      console.log('AI 해석 요청됨');
      
      // 해석 다이얼로그 대기
      await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
      console.log('해석 다이얼로그 열림');
      
      // 해석 완료 대기
      await page.waitForTimeout(15000);
      
      console.log('7️⃣ 경험 공유하기 버튼 찾기');
      
      const dialog = page.locator('[role="dialog"]');
      const shareButton = dialog.locator('button:has-text("경험 공유")').or(
        dialog.locator('button:has-text("공유하기")')
      ).or(
        page.locator('button:has-text("경험 공유")')
      ).first();
      
      if (await shareButton.isVisible({ timeout: 5000 })) {
        console.log('✅ 경험 공유하기 버튼 발견됨');
        
        // 버튼 하이라이트
        await shareButton.evaluate(el => {
          el.style.border = '3px solid red';
          el.style.backgroundColor = 'yellow';
        });
        
        console.log('🔍 버튼이 빨간 테두리와 노란 배경으로 하이라이트됨');
        console.log('📋 수동으로 버튼을 클릭해보세요!');
        console.log('⏰ 60초 후 자동으로 브라우저가 닫힙니다.');
        
        // URL 변화 모니터링
        let urlChanged = false;
        page.on('framenavigated', () => {
          urlChanged = true;
          console.log(`🔄 페이지 이동: ${page.url()}`);
        });
        
        // 토스트 메시지 모니터링
        page.on('console', msg => {
          if (msg.text().includes('커뮤니티') || msg.text().includes('공유') || msg.text().includes('이동')) {
            console.log(`📢 브라우저 메시지: ${msg.text()}`);
          }
        });
        
        // 60초 대기
        setTimeout(() => {
          if (urlChanged) {
            console.log('✅ 페이지 이동이 감지되었습니다.');
          } else {
            console.log('⚠️ 페이지 이동이 감지되지 않았습니다.');
          }
          browser.close();
        }, 60000);
        
      } else {
        console.log('❌ 경험 공유하기 버튼을 찾을 수 없음');
        
        // 다이얼로그 내 모든 버튼 출력
        const buttons = await dialog.locator('button').all();
        console.log('다이얼로그 내 버튼들:');
        for (let i = 0; i < buttons.length; i++) {
          const text = await buttons[i].textContent();
          console.log(`  ${i + 1}. "${text}"`);
        }
        
        // 5초 후 닫기
        setTimeout(() => browser.close(), 5000);
      }
      
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없음');
      setTimeout(() => browser.close(), 5000);
    }
    
  } catch (error) {
    console.error('오류:', error.message);
    setTimeout(() => browser.close(), 5000);
  }
}

manualCommunityTest().catch(console.error);