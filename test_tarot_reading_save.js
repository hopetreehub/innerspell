const { chromium } = require('playwright');

async function testTarotReadingSave() {
  const browser = await chromium.launch({
    headless: false, // UI를 볼 수 있도록 설정
    slowMo: 100 // 각 동작을 천천히 수행
  });

  let page;

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    console.log('1. 홈페이지 접속...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 저장
    await page.screenshot({ path: 'screenshots/01_homepage.png' });
    
    console.log('2. 타로 리딩 페이지로 직접 이동...');
    // 직접 리딩 페이지로 이동
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'screenshots/02_reading_page.png' });
    
    console.log('3. 질문 입력...');
    await page.fill('textarea[placeholder*="질문을 입력하세요"]', '오늘 하루는 어떻게 흘러갈까요?');
    
    console.log('4. 스프레드 선택...');
    await page.click('button[role="combobox"]');
    await page.click('text="Three Card Spread"');
    
    console.log('5. 해석 스타일 선택...');
    const interpretationSelects = await page.$$('button[role="combobox"]');
    if (interpretationSelects.length > 1) {
      await interpretationSelects[1].click();
      await page.click('text="깊이 있는 분석"');
    }
    
    await page.screenshot({ path: 'screenshots/03_question_entered.png' });
    
    console.log('6. 카드 셔플...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000); // 셔플 애니메이션 대기
    
    console.log('7. 카드 선택...');
    const cards = await page.$$('.cursor-pointer img[alt="Card back"]');
    console.log(`발견된 카드 수: ${cards.length}`);
    
    // 3장의 카드 선택
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: 'screenshots/04_cards_selected.png' });
    
    console.log('8. 해석 생성...');
    await page.click('button:has-text("해석 보기")');
    
    // 해석이 생성될 때까지 대기 (최대 30초)
    await page.waitForSelector('text="해석 결과"', { timeout: 30000 });
    await page.waitForTimeout(2000); // 해석이 완전히 로드될 때까지 대기
    
    await page.screenshot({ path: 'screenshots/05_interpretation_ready.png' });
    
    console.log('9. 저장 버튼 클릭...');
    const saveButton = await page.$('button:has-text("리딩 저장하기")');
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(2000); // 저장 응답 대기
      
      // Toast 메시지나 에러 메시지 확인
      const toastMessage = await page.$('[role="status"]');
      if (toastMessage) {
        const toastText = await toastMessage.textContent();
        console.log('Toast 메시지:', toastText);
      }
      
      await page.screenshot({ path: 'screenshots/06_save_attempted.png' });
    } else {
      console.log('저장 버튼을 찾을 수 없습니다.');
    }
    
    console.log('10. 공유 버튼 테스트...');
    const shareButton = await page.$('button:has-text("공유하기")');
    if (shareButton) {
      await shareButton.click();
      await page.waitForTimeout(2000);
      
      // 공유 다이얼로그나 에러 메시지 확인
      await page.screenshot({ path: 'screenshots/07_share_attempted.png' });
    }
    
    console.log('테스트 완료!');
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    if (page) {
      await page.screenshot({ path: 'screenshots/error_screenshot.png' });
    }
  } finally {
    await browser.close();
  }
}

// 스크린샷 디렉토리 생성
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// 테스트 실행
testTarotReadingSave();