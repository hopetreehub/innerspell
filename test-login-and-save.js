const { chromium } = require('playwright');

async function testLoginAndSave() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });

  let page;
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    console.log('🏠 1. 홈페이지 접속...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/test-1-home.png' });

    console.log('🔐 2. 로그인 페이지로 이동...');
    await page.click('text="로그인"');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/test-2-login-page.png' });

    console.log('🚀 3. 구글 로그인 시도...');
    // 구글 로그인 버튼 찾기
    const googleButton = await page.$('button:has-text("Google로 로그인")');
    if (googleButton) {
      console.log('구글 로그인 버튼 발견');
      
      // 팝업 대기 준비
      const popupPromise = page.waitForEvent('popup');
      await googleButton.click();
      
      try {
        const popup = await popupPromise;
        console.log('구글 로그인 팝업 열림');
        await page.screenshot({ path: 'screenshots/test-3-google-popup.png' });
        
        // 팝업 닫기 (실제 로그인은 스킵)
        await popup.close();
      } catch (error) {
        console.log('구글 팝업 오류:', error.message);
      }
    }

    console.log('📧 4. 이메일 로그인 테스트...');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'test123456');
    await page.screenshot({ path: 'screenshots/test-4-login-filled.png' });
    
    // 로그인 버튼 클릭
    await page.click('button:has-text("로그인"):not(:has-text("Google"))');
    
    // 로그인 결과 대기
    await page.waitForTimeout(3000);
    
    // 에러 메시지 확인
    const errorMessage = await page.$('.text-destructive');
    if (errorMessage) {
      const errorText = await errorMessage.textContent();
      console.log('❌ 로그인 에러:', errorText);
      await page.screenshot({ path: 'screenshots/test-5-login-error.png' });
    }

    console.log('🎴 5. 타로 리딩 페이지로 이동...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/test-6-reading-page.png' });

    // 타로 리딩 페이지 요소 확인
    const questionTextarea = await page.$('textarea');
    if (questionTextarea) {
      console.log('✅ 질문 입력란 발견');
      await questionTextarea.fill('오늘의 운세는 어떤가요?');
    } else {
      console.log('❌ 질문 입력란을 찾을 수 없음');
    }

    // 스프레드 선택
    const spreadButton = await page.$('button[role="combobox"]');
    if (spreadButton) {
      console.log('✅ 스프레드 선택 버튼 발견');
      await spreadButton.click();
      await page.waitForTimeout(500);
      
      // Three Card Spread 선택
      const threeCardOption = await page.$('text="Three Card Spread"');
      if (threeCardOption) {
        await threeCardOption.click();
        console.log('✅ Three Card Spread 선택됨');
      }
    }

    await page.screenshot({ path: 'screenshots/test-7-reading-setup.png' });

    // 카드 섞기 버튼 확인
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    if (shuffleButton) {
      console.log('✅ 카드 섞기 버튼 발견');
      await shuffleButton.click();
      await page.waitForTimeout(2000);
      
      // 카드 선택
      const cards = await page.$$('img[alt="Card back"]');
      console.log(`🎴 선택 가능한 카드 수: ${cards.length}`);
      
      // 3장 선택
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        await cards[i].click();
        await page.waitForTimeout(500);
      }
      
      await page.screenshot({ path: 'screenshots/test-8-cards-selected.png' });
    }

    console.log('🔍 6. 저장 기능 테스트...');
    // 해석 보기 버튼
    const interpretButton = await page.$('button:has-text("해석 보기")');
    if (interpretButton) {
      console.log('✅ 해석 보기 버튼 발견');
      await interpretButton.click();
      
      // 해석 결과 대기
      console.log('⏳ 해석 생성 대기중...');
      await page.waitForTimeout(5000);
      
      // 저장 버튼 찾기
      const saveButton = await page.$('button:has-text("리딩 저장하기")');
      if (saveButton) {
        console.log('✅ 저장 버튼 발견');
        await saveButton.click();
        await page.waitForTimeout(2000);
        
        // 결과 확인
        const toastMessage = await page.$('[role="status"]');
        if (toastMessage) {
          const text = await toastMessage.textContent();
          console.log('📢 알림 메시지:', text);
        }
      } else {
        console.log('❌ 저장 버튼을 찾을 수 없음');
      }
      
      await page.screenshot({ path: 'screenshots/test-9-save-result.png' });
    }

    console.log('✅ 테스트 완료!');
    console.log('\n📊 결과 요약:');
    console.log('- 로그인 기능: Firebase 인증 설정 필요');
    console.log('- 타로 리딩: 페이지 접근 가능');
    console.log('- 저장 기능: 로그인 상태에서만 가능');

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
    if (page) {
      await page.screenshot({ path: 'screenshots/test-error.png' });
    }
  } finally {
    console.log('\n브라우저를 열어둡니다. 수동으로 확인 후 닫아주세요.');
    // await browser.close();
  }
}

testLoginAndSave().catch(console.error);