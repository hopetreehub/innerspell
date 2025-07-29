const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 저장 디렉토리 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'manual-final-check');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function manualFinalCheck() {
  console.log('🚀 수동 최종 AI 해석 기능 확인...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1600,1000']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    // 페이지 접속
    console.log('\n1️⃣ 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'load',
      timeout: 15000 
    });
    await page.waitForTimeout(5000);
    
    // 질문 입력
    console.log('\n2️⃣ 질문 입력...');
    await page.fill('#question', '수정된 AI 해석 기능이 정상 작동하는지 최종 확인합니다');
    await page.waitForTimeout(2000);
    
    // 카드 섞기
    console.log('\n3️⃣ 카드 섞기...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(5000);
    
    // 카드 펼치기
    console.log('\n4️⃣ 카드 펼치기...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(6000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'setup-complete.png'),
      fullPage: true 
    });
    
    console.log('\n✨ 설정 완료! 이제 수동으로 다음 단계를 진행하세요:');
    console.log('1. 화면에서 3장의 카드를 클릭하여 선택하세요');
    console.log('2. "AI 해석 받기" 버튼이 나타나면 클릭하세요');
    console.log('3. AI 해석 결과가 나오는지 확인하세요');
    console.log('4. 브라우저는 2분간 열려있을 예정입니다');
    
    // 2분간 대기하며 상태 모니터링
    const startTime = Date.now();
    const duration = 120000; // 2분
    
    while (Date.now() - startTime < duration) {
      await page.waitForTimeout(10000); // 10초마다 체크
      
      // 현재 상태 확인
      try {
        const selectedText = await page.locator('text=/선택된 카드 \\(\\d+\\/3\\)/').textContent({ timeout: 1000 });
        if (selectedText) {
          console.log(`📊 현재 상태: ${selectedText}`);
        }
        
        // AI 해석 버튼 확인
        const aiButton = page.locator('button:has-text("AI 해석")');
        if (await aiButton.isVisible({ timeout: 1000 })) {
          console.log('✅ AI 해석 버튼이 나타났습니다!');
        }
        
        // 다이얼로그 확인
        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible({ timeout: 1000 })) {
          console.log('✅ AI 해석 다이얼로그가 열렸습니다!');
          
          // 해석 텍스트 확인
          const dialogText = await dialog.textContent();
          if (dialogText.length > 500) {
            console.log('✅ AI 해석 텍스트가 생성되었습니다!');
            console.log(`📝 해석 텍스트 길이: ${dialogText.length}자`);
            
            // 성공 스크린샷
            await page.screenshot({ 
              path: path.join(screenshotDir, 'ai-interpretation-success.png'),
              fullPage: true 
            });
            
            console.log('\n🎉 AI 해석 기능이 성공적으로 작동합니다!');
            break;
          }
        }
        
      } catch (e) {
        // 상태 확인 중 에러는 무시하고 계속 모니터링
      }
      
      // 주기적 스크린샷
      if ((Date.now() - startTime) % 30000 === 0) { // 30초마다
        await page.screenshot({ 
          path: path.join(screenshotDir, `status-${Math.floor((Date.now() - startTime) / 1000)}s.png`),
          fullPage: true 
        });
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotDir, 'final-state.png'),
      fullPage: true 
    });
    
    console.log('\n📸 모든 스크린샷이 저장되었습니다');
    console.log(`📁 저장 위치: ${screenshotDir}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error.png'),
      fullPage: true 
    });
  }
  
  await browser.close();
  console.log('\n✅ 테스트 완료');
}

// 테스트 실행
manualFinalCheck().catch(console.error);