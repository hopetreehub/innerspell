const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('\\n=== 타로 해석 수정 테스트 ===\\n');
    
    // 1. 타로 리딩 페이지 접속
    console.log('1. 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력
    console.log('\\n2. 질문 입력...');
    const questionInput = await page.locator('textarea[placeholder*="질문"]').first();
    await questionInput.fill('테스트 질문입니다 - 플레이스홀더 수정 확인');
    
    // 3. 타로 스프레드 선택 (기본값 사용)
    console.log('\\n3. 타로 스프레드 선택 (기본값: 삼위일체)...');
    
    // 4. 카드 선택
    console.log('\\n4. 카드 선택...');
    
    // 카드 덱 영역 찾기
    const cardDeck = await page.locator('.card-deck, [data-testid="card-deck"], .grid').first();
    if (!await cardDeck.isVisible()) {
      throw new Error('카드 덱을 찾을 수 없습니다');
    }
    
    // 카드 3장 선택 (마이너 아르카나 포함하도록)
    const cards = await page.locator('.card-back, [data-testid*="card"], .cursor-pointer').all();
    console.log('   - 사용 가능한 카드 수:', cards.length);
    
    if (cards.length >= 3) {
      // 의도적으로 마이너 아르카나 숫자 카드가 포함되도록 선택
      await cards[10].click(); // 10번째 카드
      await page.waitForTimeout(500);
      await cards[20].click(); // 20번째 카드
      await page.waitForTimeout(500);
      await cards[30].click(); // 30번째 카드
      await page.waitForTimeout(1000);
      console.log('   - 3장의 카드 선택 완료');
    } else {
      throw new Error('충분한 카드가 없습니다');
    }
    
    // 5. 해석 받기 버튼 클릭
    console.log('\\n5. 해석 받기 버튼 클릭...');
    const interpretButton = await page.locator('button:has-text("해석 받기"), button:has-text("AI 해석 받기")').first();
    await interpretButton.click();
    
    // 6. 해석 결과 대기
    console.log('\\n6. AI 해석 결과 대기...');
    await page.waitForTimeout(10000); // 10초 대기
    
    // 7. 해석 다이얼로그 확인
    const interpretationDialog = await page.locator('[role="dialog"], .fixed.inset-0').first();
    if (await interpretationDialog.isVisible()) {
      console.log('   - 해석 다이얼로그가 열렸습니다');
      
      // 해석 텍스트 확인
      const interpretationText = await page.locator('[role="dialog"] .prose, [role="dialog"] .whitespace-pre-wrap').textContent();
      
      console.log('\\n7. 해석 내용 분석...');
      console.log('   - 해석 길이:', interpretationText.length, '문자');
      
      // [의미] 플레이스홀더 체크
      if (interpretationText.includes('[의미]')) {
        console.log('   ❌ 오류: 여전히 [의미] 플레이스홀더가 포함되어 있습니다!');
        console.log('   - 플레이스홀더 위치:', interpretationText.indexOf('[의미]'));
      } else {
        console.log('   ✅ 성공: [의미] 플레이스홀더가 제거되었습니다!');
      }
      
      // 선택된 카드 정보 확인
      const cardInfo = await page.locator('text=/검.*[0-9]|완드.*[0-9]|컵.*[0-9]|펜타클.*[0-9]/').allTextContents();
      console.log('\\n   - 선택된 카드들:');
      cardInfo.forEach(card => console.log('     *', card));
      
      // 스크린샷 저장
      await interpretationDialog.screenshot({ path: 'tarot-interpretation-fixed.png' });
      console.log('\\n   - 스크린샷 저장: tarot-interpretation-fixed.png');
      
    } else {
      console.log('   - 해석 다이얼로그를 찾을 수 없습니다');
    }
    
    console.log('\\n=== 테스트 완료 ===\\n');
    
  } catch (error) {
    console.error('\\n테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'tarot-test-error.png', fullPage: true });
    console.log('에러 스크린샷 저장: tarot-test-error.png');
  } finally {
    await browser.close();
  }
})();