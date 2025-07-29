const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 저장 디렉토리 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'quick-ai-check');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function quickAICheck() {
  console.log('🚀 빠른 AI 해석 기능 확인...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1400,900']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 페이지 접속 (waitUntil 조건 완화)
    console.log('\n1️⃣ 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'load',
      timeout: 15000 
    });
    await page.waitForTimeout(5000); // 추가 로딩 대기
    
    await page.screenshot({ 
      path: path.join(screenshotDir, `01-page-${Date.now()}.png`),
      fullPage: true 
    });
    
    // 2. 질문 입력
    console.log('\n2️⃣ 질문 입력...');
    await page.waitForSelector('#question', { timeout: 10000 });
    await page.fill('#question', 'AI 해석이 작동하는지 확인합니다');
    await page.waitForTimeout(2000);
    
    // 3. 카드 섞기
    console.log('\n3️⃣ 카드 섞기...');
    await page.waitForSelector('button:has-text("카드 섞기")', { timeout: 10000 });
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(5000);
    
    // 4. 카드 펼치기
    console.log('\n4️⃣ 카드 펼치기...');
    await page.waitForSelector('button:has-text("카드 펼치기")', { timeout: 10000 });
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(6000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, `02-spread-${Date.now()}.png`),
      fullPage: true 
    });
    
    // 5. 카드 클릭 (좀 더 단순한 방법)
    console.log('\n5️⃣ 카드 클릭...');
    
    // 카드 컨테이너 영역 찾기
    const cardContainer = await page.locator('.flex.space-x-\\[-120px\\]').first();
    const containerBox = await cardContainer.boundingBox();
    
    if (containerBox) {
      console.log('카드 컨테이너 발견:', containerBox);
      
      // 컨테이너 내에서 3곳을 클릭
      const clicks = [
        { x: containerBox.x + 100, y: containerBox.y + containerBox.height / 2 },
        { x: containerBox.x + containerBox.width / 2, y: containerBox.y + containerBox.height / 2 },
        { x: containerBox.x + containerBox.width - 100, y: containerBox.y + containerBox.height / 2 }
      ];
      
      for (let i = 0; i < clicks.length; i++) {
        await page.mouse.click(clicks[i].x, clicks[i].y);
        await page.waitForTimeout(2000);
        console.log(`${i + 1}번째 카드 클릭 완료`);
        
        await page.screenshot({ 
          path: path.join(screenshotDir, `03-card${i + 1}-${Date.now()}.png`),
          fullPage: true 
        });
      }
    }
    
    // 6. AI 해석 버튼 확인
    console.log('\n6️⃣ AI 해석 버튼 확인...');
    await page.waitForTimeout(3000);
    
    // 페이지의 모든 버튼 확인
    const buttons = await page.locator('button').all();
    console.log(`총 ${buttons.length}개 버튼 발견`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      if (text && (text.includes('AI') || text.includes('해석'))) {
        console.log(`🎯 AI 관련 버튼 발견: "${text.trim()}" (visible: ${isVisible})`);
        
        if (isVisible && text.includes('AI 해석')) {
          console.log('AI 해석 버튼 클릭 시도...');
          await buttons[i].click();
          await page.waitForTimeout(5000);
          
          await page.screenshot({ 
            path: path.join(screenshotDir, `04-ai-clicked-${Date.now()}.png`),
            fullPage: true 
          });
          
          // 다이얼로그나 결과 확인
          await page.waitForTimeout(15000);
          
          await page.screenshot({ 
            path: path.join(screenshotDir, `05-final-result-${Date.now()}.png`),
            fullPage: true 
          });
          
          // 페이지 텍스트에서 해석 관련 내용 확인
          const pageText = await page.textContent('body');
          const hasInterpretation = pageText.includes('해석') && pageText.length > 1000;
          const hasError = pageText.includes('오류') || pageText.includes('에러');
          
          console.log('\n📊 결과 분석:');
          if (hasInterpretation && !hasError) {
            console.log('✅ AI 해석이 성공적으로 작동하는 것으로 보입니다!');
          } else if (hasError) {
            console.log('❌ 오류가 발생한 것으로 보입니다');
          } else {
            console.log('⚠️  결과를 명확히 확인할 수 없습니다');
          }
          
          break;
        }
      }
    }
    
    console.log(`\n📸 스크린샷 저장 위치: ${screenshotDir}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, `error-${Date.now()}.png`),
      fullPage: true 
    });
  }
  
  console.log('\n🔍 브라우저를 10초간 유지합니다...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('\n✅ 테스트 완료');
}

// 테스트 실행
quickAICheck().catch(console.error);