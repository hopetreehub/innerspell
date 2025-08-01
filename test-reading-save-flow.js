const { chromium } = require('playwright');
const fs = require('fs');

async function testReadingSaveFlow() {
  console.log('🎯 타로 리딩 저장 기능 전체 플로우 테스트');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  const report = {
    timestamp: new Date().toISOString(),
    testName: 'Tarot Reading Save Flow Test',
    results: [],
    screenshots: []
  };
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ko-KR'
    });
    const page = await context.newPage();
    
    // 콘솔 로그 캡처
    const consoleMessages = [];
    page.on('console', msg => {
      const message = msg.text();
      consoleMessages.push(message);
      if (message.includes('저장') || message.includes('save') || message.includes('error')) {
        console.log(`📝 콘솔: ${message}`);
      }
    });
    
    // 네트워크 에러 캡처
    page.on('response', response => {
      if (!response.ok() && response.url().includes('api')) {
        console.log(`🚨 API 에러: ${response.url()} - ${response.status()}`);
      }
    });
    
    console.log('\n1️⃣ 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    
    // 로그인 상태 확인
    const hasLoginButton = await page.locator('button:has-text("로그인")').count() > 0;
    const hasUserMenu = await page.locator('[data-testid="user-menu"], button:has-text("회원가입")').count() > 0;
    
    console.log(`   로그인 상태: ${hasLoginButton ? '비로그인' : hasUserMenu ? '로그인됨' : '알 수 없음'}`);
    
    await page.screenshot({ path: 'save-test-1-initial.png' });
    report.screenshots.push('save-test-1-initial.png');
    
    console.log('\n2️⃣ 질문 입력...');
    const questionInput = page.locator('textarea[placeholder*="질문"]');
    await questionInput.fill('저장 기능 테스트를 위한 질문입니다');
    
    console.log('\n3️⃣ 타로 읽기 시작...');
    const startButton = page.locator('button:has-text("타로 읽기 시작")');
    await startButton.click();
    await page.waitForTimeout(2000);
    
    console.log('\n4️⃣ 원카드 스프레드 선택...');
    const oneCardButton = page.locator('button:has-text("원카드")');
    await oneCardButton.click();
    await page.waitForTimeout(5000); // 카드 펼치기 대기
    
    await page.screenshot({ path: 'save-test-2-cards-spread.png' });
    report.screenshots.push('save-test-2-cards-spread.png');
    
    console.log('\n5️⃣ 카드 선택...');
    const clickableCards = await page.locator('.cursor-pointer').all();
    if (clickableCards.length > 0) {
      await clickableCards[0].click();
      await page.waitForTimeout(3000);
      
      console.log('\n6️⃣ AI 해석 요청...');
      const interpretButton = page.locator('button:has-text("AI 해석 받기")');
      if (await interpretButton.count() > 0) {
        await interpretButton.click();
        console.log('   AI 해석 요청 중...');
        
        // 해석 완료 대기 (최대 30초)
        let interpretationComplete = false;
        for (let i = 0; i < 30; i++) {
          const hasInterpretation = await page.locator('text=/해석.*완료|리딩.*저장|저장.*완료/').count() > 0;
          const hasErrorMessage = await page.locator('text=/오류|에러|실패/').count() > 0;
          
          if (hasInterpretation || hasErrorMessage) {
            interpretationComplete = true;
            break;
          }
          
          await page.waitForTimeout(1000);
          if (i % 5 === 0) {
            console.log(`   해석 대기 중... (${i + 1}/30초)`);
          }
        }
        
        await page.screenshot({ path: 'save-test-3-interpretation.png', fullPage: true });
        report.screenshots.push('save-test-3-interpretation.png');
        
        console.log('\n7️⃣ 저장 기능 테스트...');
        
        // 저장 버튼 찾기
        const saveButtons = await page.locator('button:has-text("저장"), button:has-text("리딩 저장")').all();
        console.log(`   발견된 저장 버튼: ${saveButtons.length}개`);
        
        if (saveButtons.length > 0) {
          // 로그인 상태 재확인
          const isLoggedIn = await page.locator('button:has-text("로그인")').count() === 0;
          console.log(`   현재 로그인 상태: ${isLoggedIn ? '로그인됨' : '비로그인'}`);
          
          if (!isLoggedIn) {
            console.log('\n⚠️ 비로그인 상태에서 저장 시도...');
            await saveButtons[0].click();
            await page.waitForTimeout(2000);
            
            // 로그인 요구 메시지 확인
            const loginRequiredMessage = await page.locator('text=/로그인.*필요|로그인.*해주세요/').count() > 0;
            report.results.push({
              test: 'Save without login',
              result: loginRequiredMessage ? 'success' : 'failed',
              message: loginRequiredMessage ? '로그인 요구 메시지 표시됨' : '로그인 요구 메시지 없음'
            });
            
            console.log(`   결과: ${loginRequiredMessage ? '✅ 로그인 요구됨' : '❌ 로그인 체크 실패'}`);
            
          } else {
            console.log('\n✅ 로그인 상태에서 저장 시도...');
            await saveButtons[0].click();
            await page.waitForTimeout(3000);
            
            // 저장 결과 확인
            const saveSuccess = await page.locator('text=/저장.*완료|저장.*성공/').count() > 0;
            const saveError = await page.locator('text=/저장.*실패|저장.*오류/').count() > 0;
            
            report.results.push({
              test: 'Save with login',
              result: saveSuccess ? 'success' : saveError ? 'failed' : 'unknown',
              message: saveSuccess ? '저장 성공' : saveError ? '저장 실패' : '결과 불명'
            });
            
            console.log(`   결과: ${saveSuccess ? '✅ 저장 성공' : saveError ? '❌ 저장 실패' : '❓ 결과 불명'}`);
            
            if (saveSuccess) {
              // 내 리딩 보기 링크 확인
              const myReadingsLink = await page.locator('a:has-text("내 리딩"), a:has-text("리딩 보기")').count() > 0;
              console.log(`   내 리딩 링크: ${myReadingsLink ? '있음' : '없음'}`);
            }
          }
          
          await page.screenshot({ path: 'save-test-4-save-result.png', fullPage: true });
          report.screenshots.push('save-test-4-save-result.png');
          
        } else {
          console.log('❌ 저장 버튼을 찾을 수 없습니다.');
          report.results.push({
            test: 'Save button presence',
            result: 'failed',
            message: '저장 버튼 없음'
          });
        }
        
      } else {
        console.log('❌ AI 해석 버튼을 찾을 수 없습니다.');
      }
    } else {
      console.log('❌ 클릭 가능한 카드를 찾을 수 없습니다.');
    }
    
    // 최종 결과 요약
    console.log('\n' + '=' .repeat(60));
    console.log('📊 테스트 결과 요약:');
    report.results.forEach(result => {
      const icon = result.result === 'success' ? '✅' : result.result === 'failed' ? '❌' : '❓';
      console.log(`${icon} ${result.test}: ${result.message}`);
    });
    
    // 콘솔 메시지 분석
    const saveRelatedMessages = consoleMessages.filter(msg => 
      msg.includes('저장') || msg.includes('save') || msg.includes('Save')
    );
    
    if (saveRelatedMessages.length > 0) {
      console.log('\n📝 저장 관련 콘솔 메시지:');
      saveRelatedMessages.forEach(msg => console.log(`   - ${msg}`));
    }
    
    // 보고서 저장
    report.consoleMessages = saveRelatedMessages;
    fs.writeFileSync('reading-save-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📄 상세 보고서: reading-save-test-report.json');
    console.log('📸 스크린샷:', report.screenshots.join(', '));
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류:', error.message);
    report.error = error.message;
  } finally {
    await browser.close();
  }
}

testReadingSaveFlow().catch(console.error);