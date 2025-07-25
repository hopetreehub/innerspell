const { chromium } = require('playwright');

async function verifyFirebaseFix() {
  console.log('🔧 Firebase 수정사항 검증 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 메시지 캡처 - Firebase 관련만
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Firebase') || text.includes('Auth') || text.includes('mock') || text.includes('real') || text.includes('데모') || text.includes('demo')) {
        console.log(`[브라우저] ${text}`);
      }
    });
    
    // 에러 캡처
    page.on('pageerror', error => {
      console.log(`[에러] ${error.message}`);
    });
    
    console.log('📍 홈페이지 로드...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📍 타로 리딩 페이지로 이동...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 페이지 텍스트에서 "데모 모드" 체크
    const bodyText = await page.locator('body').textContent();
    const hasDemoMode = bodyText.includes('데모 모드') || bodyText.includes('demo');
    
    console.log('🔍 페이지 분석:');
    console.log('  - 데모 모드 텍스트 발견:', hasDemoMode);
    
    // Google 로그인 시도
    console.log('📍 로그인 페이지로 이동...');
    await page.goto('http://localhost:4000/sign-in', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Google 로그인 버튼 클릭
    const googleButton = page.locator('button:has-text("Google")');
    const googleButtonExists = await googleButton.isVisible().catch(() => false);
    
    console.log('🔘 Google 로그인 버튼 존재:', googleButtonExists);
    
    if (googleButtonExists) {
      console.log('🔍 Google 로그인 클릭 시도...');
      
      // 팝업 대기
      const [popup] = await Promise.all([
        context.waitForEvent('page', { timeout: 10000 }).catch(() => null),
        googleButton.click().catch(e => console.log('클릭 실패:', e.message))
      ]);
      
      if (popup) {
        console.log('✅ Google OAuth 팝업 성공!');
        console.log('   팝업 URL:', popup.url());
        
        // Firebase OAuth인지 확인
        const isFirebaseOAuth = popup.url().includes('accounts.google.com') || popup.url().includes('firebase');
        console.log('   Firebase OAuth 확인:', isFirebaseOAuth);
        
        // 팝업 닫기
        await popup.close().catch(() => {});
      } else {
        console.log('❌ Google OAuth 팝업이 열리지 않음 (아직 Mock 모드일 수 있음)');
      }
    }
    
    // 다시 타로 리딩 페이지로 돌아가서 저장 기능 테스트
    console.log('📍 타로 리딩 저장 기능 테스트...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    
    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="카드에게"]');
    if (await questionInput.isVisible()) {
      await questionInput.fill('Firebase 연결 테스트 질문입니다');
      console.log('✅ 질문 입력 완료');
    }
    
    // 카드 섞기
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 카드 섞기 완료');
    }
    
    // 저장 버튼 찾기
    const saveButtons = await page.locator('button').allTextContents();
    const hasSaveButton = saveButtons.some(text => text.includes('저장'));
    console.log('💾 저장 버튼 발견:', hasSaveButton);
    
    // 최종 상태 확인
    const finalBodyText = await page.locator('body').textContent();
    const stillHasDemoMode = finalBodyText.includes('데모 모드') || finalBodyText.includes('demo');
    
    console.log('\n📊 최종 결과:');
    console.log('  - 데모 모드 여전히 존재:', stillHasDemoMode);
    console.log('  - Google OAuth 팝업:', popup ? '✅ 작동' : '❌ 실패');
    console.log('  - 저장 버튼 존재:', hasSaveButton);
    
    if (!stillHasDemoMode) {
      console.log('🎉 성공! 데모 모드가 해제되었습니다!');
    } else {
      console.log('⚠️  아직 데모 모드가 활성화되어 있습니다.');
    }
    
  } catch (error) {
    console.error('❌ 검증 중 오류:', error);
  } finally {
    await browser.close();
  }
}

verifyFirebaseFix();