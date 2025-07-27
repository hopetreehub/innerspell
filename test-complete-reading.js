const { chromium } = require('playwright');

async function testCompleteReading() {
  console.log('🎯 완전한 타로리딩 플로우 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 타로 지침 관련 로그만 별도로 추적
  const tarotGuidelineLogs = [];
  const allConsoleLogs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    allConsoleLogs.push({ type: msg.type(), text, timestamp: new Date().toISOString() });
    
    // 타로 지침, 스프레드, 스타일 관련 로그 필터링
    if (
      text.toLowerCase().includes('guideline') || 
      text.includes('지침') ||
      text.toLowerCase().includes('tarot') ||
      text.toLowerCase().includes('spread') ||
      text.toLowerCase().includes('style') ||
      text.toLowerCase().includes('interpretation') ||
      text.includes('해석') ||
      text.includes('스프레드') ||
      text.includes('스타일')
    ) {
      tarotGuidelineLogs.push({ type: msg.type(), text, timestamp: new Date().toISOString() });
      console.log(`🔥 타로 관련 로그: [${msg.type()}] ${text}`);
    } else {
      console.log(`🔍 일반 로그: [${msg.type()}] ${text}`);
    }
  });
  
  // 네트워크 요청 모니터링 (AI 해석 요청 추적)
  const aiRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/') && request.method() === 'POST') {
      aiRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
      console.log(`🌐 API 요청: ${request.method()} ${request.url()}`);
    }
  });
  
  // 에러 캡처
  page.on('pageerror', error => {
    console.error(`❌ 페이지 에러: ${error.message}`);
  });
  
  try {
    console.log('📍 1단계: /reading 페이지 접속');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.screenshot({ path: 'screenshots/complete-01-page-loaded.png', fullPage: true });
    console.log('✅ 페이지 로드 완료');
    
    // 충분한 로딩 대기
    await page.waitForTimeout(3000);
    
    console.log('📍 2단계: 질문 입력');
    await page.fill('textarea', '오늘의 운세와 앞으로의 연애운을 알려주세요');
    console.log('✅ 질문 입력 완료');
    await page.screenshot({ path: 'screenshots/complete-02-question-entered.png', fullPage: true });
    
    console.log('📍 3단계: 타로 스프레드 변경 (삼위일체 -> 켈틱 크로스)');
    // 스프레드 드롭다운 열기
    await page.click('[id="spread-type"]');
    await page.waitForTimeout(500);
    
    // 켈틱 크로스 선택 (더 복잡한 스프레드)
    await page.click('text=켈틱 크로스');
    console.log('✅ 켈틱 크로스 스프레드 선택됨');
    await page.screenshot({ path: 'screenshots/complete-03-spread-selected.png', fullPage: true });
    
    console.log('📍 4단계: 해석 스타일 변경 (전통 RWS -> 심리학적 접근)');
    // 스타일 드롭다운 열기
    await page.click('[id="interpretation-method"]');
    await page.waitForTimeout(500);
    
    // 심리학적 접근 선택
    await page.click('text=심리학적 접근');
    console.log('✅ 심리학적 접근 스타일 선택됨');
    await page.screenshot({ path: 'screenshots/complete-04-style-selected.png', fullPage: true });
    
    console.log('📍 5단계: 카드 섞기');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    console.log('✅ 카드 섞기 시작');
    
    // 섞기 애니메이션 완료 대기
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/complete-05-cards-shuffled.png', fullPage: true });
    
    console.log('📍 6단계: 카드 펼치기');
    const revealButton = page.locator('button:has-text("카드 펼치기")');
    await revealButton.click();
    console.log('✅ 카드 펼치기 완료');
    
    // 카드가 펼쳐질 때까지 대기
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/complete-06-cards-revealed.png', fullPage: true });
    
    console.log('📍 7단계: 켈틱 크로스 카드 선택 (10장)');
    // 켈틱 크로스는 10장 필요
    const revealedCards = page.locator('[role="button"]').filter({ hasText: /펼쳐진.*카드 선택/ });
    const cardCount = await revealedCards.count();
    console.log(`🎴 펼쳐진 카드 수: ${cardCount}장`);
    
    // 10장의 카드 순차적으로 선택
    for (let i = 0; i < Math.min(10, cardCount); i++) {
      await revealedCards.nth(i).click();
      console.log(`✅ ${i + 1}번째 카드 선택됨`);
      await page.waitForTimeout(500); // 선택 애니메이션 대기
    }
    
    await page.screenshot({ path: 'screenshots/complete-07-cards-selected.png', fullPage: true });
    
    console.log('📍 8단계: AI 해석 시작');
    const interpretButton = page.locator('button:has-text("AI 해석 받기")');
    await interpretButton.click();
    console.log('✅ AI 해석 요청 시작');
    
    // 해석이 생성될 때까지 최대 45초 대기
    await page.waitForTimeout(5000); // 초기 대기
    await page.screenshot({ path: 'screenshots/complete-08-interpretation-started.png', fullPage: true });
    
    console.log('📍 9단계: 해석 결과 대기 및 확인');
    try {
      // 해석 다이얼로그가 나타날 때까지 대기
      await page.waitForSelector('[role="dialog"]', { timeout: 40000 });
      console.log('✅ 해석 다이얼로그 나타남');
      
      // 해석이 완료될 때까지 추가 대기
      await page.waitForTimeout(10000);
      await page.screenshot({ path: 'screenshots/complete-09-interpretation-dialog.png', fullPage: true });
      
      // 해석 내용 확인
      const interpretationContent = await page.locator('[role="dialog"] .prose').textContent();
      console.log(`📖 해석 내용 길이: ${interpretationContent ? interpretationContent.length : 0} 자`);
      console.log(`📖 해석 내용 샘플: ${interpretationContent ? interpretationContent.substring(0, 200) + '...' : '내용 없음'}`);
      
    } catch (error) {
      console.log('⚠️ 해석 다이얼로그를 찾을 수 없음');
      await page.screenshot({ path: 'screenshots/complete-09-no-interpretation.png', fullPage: true });
    }
    
    console.log('📍 10단계: 타로 지침 관련 로그 분석');
    console.log(`🔍 총 수집된 로그: ${allConsoleLogs.length}개`);
    console.log(`🔥 타로 관련 로그: ${tarotGuidelineLogs.length}개`);
    console.log(`🌐 API 요청: ${aiRequests.length}개`);
    
    // 타로 지침 관련 로그 상세 분석
    if (tarotGuidelineLogs.length > 0) {
      console.log('\n🔥 타로 지침 관련 로그 상세:');
      tarotGuidelineLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. [${log.type}] ${log.text} (${log.timestamp})`);
      });
    } else {
      console.log('⚠️ 타로 지침 관련 로그가 발견되지 않았습니다.');
    }
    
    // API 요청 분석
    if (aiRequests.length > 0) {
      console.log('\n🌐 AI 해석 요청 상세:');
      aiRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url} (${req.timestamp})`);
      });
    }
    
    console.log('📍 11단계: 최종 페이지 상태 확인');
    await page.screenshot({ path: 'screenshots/complete-10-final-state.png', fullPage: true });
    
    // 페이지에서 타로 지침 관련 요소 확인
    const guidelineElements = await page.locator('[class*="guideline"], [data-guideline], [data-ai-hint*="guideline"]').count();
    console.log(`🔍 페이지 내 타로 지침 관련 요소: ${guidelineElements}개`);
    
    // 현재 선택된 설정 확인
    const currentSpread = await page.locator('#spread-type').inputValue().catch(() => '확인 불가');
    const currentStyle = await page.locator('#interpretation-method').inputValue().catch(() => '확인 불가');
    console.log(`🎯 최종 선택된 스프레드: ${currentSpread}`);
    console.log(`🎨 최종 선택된 스타일: ${currentStyle}`);
    
    // 브라우저를 15초 더 열어두어 수동 확인
    console.log('🔍 15초 후 브라우저가 종료됩니다. 수동 확인을 원하면 Ctrl+C로 중단하세요.');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'screenshots/complete-error.png', fullPage: true });
  } finally {
    console.log('\n📊 테스트 결과 요약:');
    console.log(`- 총 콘솔 로그: ${allConsoleLogs.length}개`);
    console.log(`- 타로 관련 로그: ${tarotGuidelineLogs.length}개`);
    console.log(`- API 요청: ${aiRequests.length}개`);
    
    await browser.close();
    console.log('✅ 완전한 타로리딩 플로우 테스트 완료!');
  }
}

testCompleteReading();