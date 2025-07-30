const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('\\n=== 타로 해석 플레이스홀더 수정 확인 ===\\n');
    
    // 1. 타로 리딩 페이지 접속
    console.log('1. 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력
    console.log('\\n2. 질문 입력...');
    // 더 구체적인 선택자 사용
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('마이너 아르카나 카드의 해석이 제대로 나오는지 확인합니다');
    console.log('   - 질문 입력 완료');
    
    // 3. 카드 섞기 버튼 클릭
    console.log('\\n3. 카드 섞기...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(2000);
      console.log('   - 카드 섞기 완료');
    }
    
    // 4. 카드 선택
    console.log('\\n4. 카드 3장 선택...');
    
    // 카드 뒷면들 찾기
    const cardBacks = await page.locator('img[alt*="뒷면"], .cursor-pointer').all();
    console.log('   - 선택 가능한 카드:', cardBacks.length, '장');
    
    if (cardBacks.length >= 30) {
      // 마이너 아르카나가 포함될 가능성이 높은 중간 부분 카드들 선택
      await cardBacks[15].click();
      await page.waitForTimeout(1000);
      console.log('   - 첫 번째 카드 선택');
      
      await cardBacks[25].click();
      await page.waitForTimeout(1000);
      console.log('   - 두 번째 카드 선택');
      
      await cardBacks[35].click();
      await page.waitForTimeout(1000);
      console.log('   - 세 번째 카드 선택');
    } else {
      throw new Error('충분한 카드가 없습니다');
    }
    
    // 선택된 카드 정보 확인
    await page.waitForTimeout(2000);
    const selectedCards = await page.locator('.selected-card, [data-selected="true"]').all();
    console.log('   - 선택된 카드 수:', selectedCards.length);
    
    // 5. 해석 받기
    console.log('\\n5. AI 해석 받기...');
    // 페이지 스크롤하여 버튼이 보이도록
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const interpretButton = await page.locator('button:has-text("해석"), button:has-text("AI")').last();
    await interpretButton.click();
    console.log('   - 해석 요청 전송');
    
    // 6. 해석 결과 대기
    console.log('\\n6. 해석 결과 대기 (최대 20초)...');
    
    // 다이얼로그 또는 해석 결과 대기
    const dialogSelector = '[role="dialog"], .fixed.inset-0, .interpretation-dialog';
    await page.waitForSelector(dialogSelector, { timeout: 20000 });
    
    await page.waitForTimeout(5000); // 추가 대기
    
    // 7. 해석 내용 확인
    console.log('\\n7. 해석 내용 분석...');
    
    // 해석 텍스트 찾기
    const interpretationContent = await page.locator('.prose, .whitespace-pre-wrap, [class*="interpretation"]').allTextContents();
    const fullText = interpretationContent.join(' ');
    
    console.log('   - 전체 해석 길이:', fullText.length, '문자');
    
    // [의미] 플레이스홀더 확인
    if (fullText.includes('[의미]')) {
      console.log('\\n   ❌ 실패: [의미] 플레이스홀더가 여전히 존재합니다!');
      
      // 어떤 카드에서 문제가 있는지 확인
      const lines = fullText.split('\\n');
      lines.forEach((line, idx) => {
        if (line.includes('[의미]')) {
          console.log(`   - 라인 ${idx + 1}: ${line.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('\\n   ✅ 성공: [의미] 플레이스홀더가 제거되었습니다!');
    }
    
    // 선택된 카드 정보 출력
    const cardNames = fullText.match(/(?:검|완드|컵|펜타클)\\s*\\d+|\\w+\\s+of\\s+\\w+/gi);
    if (cardNames) {
      console.log('\\n   - 해석에 포함된 카드들:');
      [...new Set(cardNames)].forEach(card => console.log('     *', card));
    }
    
    // 스크린샷 저장
    await page.screenshot({ path: 'tarot-interpretation-result.png', fullPage: true });
    console.log('\\n   - 결과 스크린샷: tarot-interpretation-result.png');
    
    console.log('\\n=== 테스트 완료 ===\\n');
    
  } catch (error) {
    console.error('\\n오류 발생:', error.message);
    await page.screenshot({ path: 'tarot-error-v2.png', fullPage: true });
    console.log('에러 스크린샷: tarot-error-v2.png');
  } finally {
    await browser.close();
  }
})();