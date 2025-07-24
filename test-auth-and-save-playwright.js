const { chromium } = require('playwright');

async function testAuthAndSave() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  let page;
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    page = await context.newPage();

    console.log('🔍 InnerSpell 타로리딩 저장 기능 테스트\n');
    console.log('📌 테스트 항목:');
    console.log('  1. 홈페이지 접속');
    console.log('  2. 로그인 페이지 이동');
    console.log('  3. 구글 로그인 시도');
    console.log('  4. 타로 리딩 페이지 접속');
    console.log('  5. 타로 리딩 진행');
    console.log('  6. 리딩 저장 테스트\n');

    // 1. 홈페이지 접속
    console.log('🏠 1. 홈페이지 접속 중...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/auth-test-1-home.png' });

    // 네비게이션 메뉴 확인
    const loginButton = await page.$('a:has-text("로그인")');
    if (loginButton) {
      console.log('✅ 로그인 버튼 발견');
      await loginButton.click();
      await page.waitForLoadState('networkidle');
    } else {
      console.log('❌ 로그인 버튼을 찾을 수 없음 - 직접 이동');
      await page.goto('http://localhost:4000/sign-in');
    }

    await page.screenshot({ path: 'screenshots/auth-test-2-signin.png' });

    // 2. 구글 로그인 테스트
    console.log('\n🔐 2. 구글 로그인 테스트...');
    const googleLoginButton = await page.$('button:has-text("Google로 로그인")');
    if (googleLoginButton) {
      console.log('✅ 구글 로그인 버튼 발견');
      
      // 팝업 이벤트 리스너 설정
      const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
      
      await googleLoginButton.click();
      console.log('⏳ 구글 로그인 팝업 대기 중...');
      
      const popup = await popupPromise;
      if (popup) {
        console.log('✅ 구글 로그인 팝업 열림');
        await page.waitForTimeout(2000);
        await popup.close();
        console.log('📌 실제 로그인은 수동으로 진행해주세요');
      } else {
        console.log('⚠️ 구글 팝업이 차단되었거나 열리지 않음');
      }
    }

    // 3. 타로 리딩 페이지로 이동
    console.log('\n🎴 3. 타로 리딩 페이지로 이동...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/auth-test-3-reading.png' });

    // 4. 타로 리딩 진행
    console.log('\n🔮 4. 타로 리딩 진행 중...');
    
    // 질문 입력
    const questionTextarea = await page.$('textarea[placeholder*="질문"]');
    if (questionTextarea) {
      await questionTextarea.fill('오늘의 운세와 조언을 부탁드립니다.');
      console.log('✅ 질문 입력 완료');
    }

    // 스프레드 선택
    const spreadSelect = await page.$('button[role="combobox"]').catch(() => null);
    if (spreadSelect) {
      await spreadSelect.click();
      await page.waitForTimeout(500);
      
      const threeCardOption = await page.$('text="Three Card Spread"');
      if (threeCardOption) {
        await threeCardOption.click();
        console.log('✅ Three Card Spread 선택');
      }
    }

    // 해석 스타일 선택
    const styleSelects = await page.$$('button[role="combobox"]');
    if (styleSelects.length > 1) {
      await styleSelects[1].click();
      await page.waitForTimeout(500);
      
      const deepOption = await page.$('text="깊이 있는 분석"');
      if (deepOption) {
        await deepOption.click();
        console.log('✅ 깊이 있는 분석 스타일 선택');
      }
    }

    await page.screenshot({ path: 'screenshots/auth-test-4-setup.png' });

    // 카드 섞기
    const shuffleButton = await page.$('button:has-text("카드 섞기")');
    if (shuffleButton) {
      await shuffleButton.click();
      console.log('🔄 카드 섞는 중...');
      await page.waitForTimeout(3000);
    }

    // 카드 펼치기
    const spreadButton = await page.$('button:has-text("카드 펼치기")');
    if (spreadButton) {
      await spreadButton.click();
      console.log('📋 카드 펼치기 완료');
      await page.waitForTimeout(1000);
    }

    // 카드 선택
    const cards = await page.$$('img[alt="Card back"]');
    console.log(`🎴 선택 가능한 카드: ${cards.length}장`);
    
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
      console.log(`✅ 카드 ${i + 1} 선택`);
    }

    await page.screenshot({ path: 'screenshots/auth-test-5-cards.png' });

    // AI 해석 받기
    const interpretButton = await page.$('button:has-text("AI 해석 받기")');
    if (interpretButton) {
      await interpretButton.click();
      console.log('🤖 AI 해석 요청 중...');
      
      // 해석 다이얼로그 대기
      await page.waitForSelector('text="AI 타로 해석"', { timeout: 30000 }).catch(() => null);
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'screenshots/auth-test-6-interpretation.png' });
    }

    // 5. 저장 기능 테스트
    console.log('\n💾 5. 리딩 저장 테스트...');
    
    // 저장 버튼 찾기
    const saveButton = await page.$('button:has-text("리딩 저장하기")');
    if (saveButton) {
      console.log('✅ 저장 버튼 발견');
      
      // 버튼이 보이는지 확인
      const isVisible = await saveButton.isVisible();
      if (!isVisible) {
        console.log('⚠️ 저장 버튼이 숨겨져 있음 - 로그인 필요');
      } else {
        await saveButton.click();
        console.log('📝 저장 시도 중...');
        
        await page.waitForTimeout(3000);
        
        // Toast 메시지 확인
        const toastMessage = await page.$('[role="status"]');
        if (toastMessage) {
          const message = await toastMessage.textContent();
          console.log(`📢 결과: ${message}`);
        }
        
        await page.screenshot({ path: 'screenshots/auth-test-7-save-result.png' });
      }
    } else {
      console.log('❌ 저장 버튼을 찾을 수 없음 - 로그인 상태 확인 필요');
    }

    // 6. 공유 기능 테스트
    console.log('\n🔗 6. 공유 기능 테스트...');
    const shareButton = await page.$('button:has-text("공유하기")');
    if (shareButton) {
      await shareButton.click();
      await page.waitForTimeout(2000);
      
      const shareToast = await page.$('[role="status"]');
      if (shareToast) {
        const shareMessage = await shareToast.textContent();
        console.log(`📢 공유 결과: ${shareMessage}`);
      }
      
      await page.screenshot({ path: 'screenshots/auth-test-8-share.png' });
    }

    console.log('\n✅ 테스트 완료!\n');
    console.log('📊 테스트 결과 요약:');
    console.log('1. Firebase Rules 배포 여부에 따라 저장 기능 작동');
    console.log('2. 로그인하지 않으면 저장 버튼이 표시되지 않음');
    console.log('3. Mock 사용자는 데모 모드 안내 메시지 표시');
    console.log('\n⚠️ 주의사항:');
    console.log('- Firebase Console에서 Rules 배포 필요');
    console.log('- 실제 Google 계정으로 로그인 필요');

  } catch (error) {
    console.error('\n❌ 테스트 중 오류:', error);
    if (page) {
      await page.screenshot({ path: 'screenshots/auth-test-error.png' });
    }
  } finally {
    console.log('\n브라우저를 열어둡니다. 수동 테스트 후 닫아주세요.');
  }
}

testAuthAndSave().catch(console.error);