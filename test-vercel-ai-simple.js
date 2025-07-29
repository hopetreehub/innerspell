const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Vercel 배포 URL
const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

// 스크린샷 폴더 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'ai-simple-test');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testAIInterpretation() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  
  try {
    console.log('🚀 AI 해석 기능 간단 테스트 시작...\n');
    
    // 1. 타로 리딩 페이지 직접 접속
    console.log('1️⃣ 타로 리딩 페이지 접속...');
    await page.goto(`${VERCEL_URL}/reading`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-reading-page.png'),
      fullPage: true 
    });
    console.log('✅ 리딩 페이지 진입 완료\n');
    
    // 2. 질문 입력
    console.log('2️⃣ 타로 질문 입력...');
    const inputs = await page.locator('input').all();
    if (inputs.length > 0) {
      await inputs[0].fill('2025년 새해 나의 운세는 어떻게 될까요?');
      console.log('✅ 질문 입력 완료');
    }
    
    // 3. 카드 섞기 버튼 클릭
    console.log('\n3️⃣ 카드 섞기 시작...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-after-shuffle.png'),
      fullPage: true 
    });
    
    // 4. 카드 뽑기 버튼 클릭 (카드가 펼쳐짐)
    console.log('\n4️⃣ 카드 뽑기...');
    try {
      await page.click('button:has-text("카드 뽑기")');
      await page.waitForTimeout(3000);
      console.log('✅ 카드가 펼쳐졌습니다');
    } catch (e) {
      console.log('ℹ️ 카드 뽑기 버튼을 찾을 수 없습니다. 계속 진행합니다.');
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-cards-spread.png'),
      fullPage: true 
    });
    
    // 5. 카드 3장 선택
    console.log('\n5️⃣ 카드 3장 선택...');
    
    // 다양한 방법으로 카드 찾기
    let cardsToClick = [];
    
    // 방법 1: 이미지로 찾기
    const cardImages = await page.locator('img[alt*="card"], img[src*="card"]').all();
    if (cardImages.length >= 3) {
      cardsToClick = cardImages;
      console.log(`   이미지로 ${cardImages.length}개 카드 발견`);
    }
    
    // 방법 2: 클릭 가능한 요소로 찾기
    if (cardsToClick.length < 3) {
      const clickables = await page.locator('[role="button"], .cursor-pointer').all();
      if (clickables.length >= 3) {
        cardsToClick = clickables;
        console.log(`   클릭 가능한 요소로 ${clickables.length}개 발견`);
      }
    }
    
    // 카드 선택
    if (cardsToClick.length >= 3) {
      await cardsToClick[0].click();
      await page.waitForTimeout(1000);
      console.log('   ✓ 첫 번째 카드 선택');
      
      await cardsToClick[Math.floor(cardsToClick.length / 2)].click();
      await page.waitForTimeout(1000);
      console.log('   ✓ 두 번째 카드 선택');
      
      await cardsToClick[cardsToClick.length - 1].click();
      await page.waitForTimeout(1000);
      console.log('   ✓ 세 번째 카드 선택');
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-cards-selected.png'),
      fullPage: true 
    });
    
    // 6. AI 해석 요청
    console.log('\n6️⃣ AI 해석 요청...');
    const interpretButtons = await page.locator('button').all();
    let interpretClicked = false;
    
    for (const button of interpretButtons) {
      const text = await button.textContent();
      if (text && (text.includes('해석') || text.includes('리딩'))) {
        await button.click();
        interpretClicked = true;
        console.log(`   ✓ "${text}" 버튼 클릭`);
        break;
      }
    }
    
    if (!interpretClicked) {
      console.log('   ⚠️ 해석 버튼을 찾을 수 없습니다');
    }
    
    // 7. AI 응답 대기
    console.log('\n⏳ AI 응답 대기 중...');
    await page.waitForTimeout(5000);
    
    // 결과 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotDir, '05-final-result.png'),
      fullPage: true 
    });
    
    // AI 해석 내용 찾기
    const possibleSelectors = [
      '.prose',
      '[class*="interpretation"]',
      '[class*="result"]',
      '[class*="reading"]',
      'div:has-text("카드")',
      'p'
    ];
    
    let interpretationFound = false;
    for (const selector of possibleSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          const text = await element.textContent();
          if (text && text.length > 100 && (text.includes('카드') || text.includes('운세') || text.includes('미래'))) {
            console.log('\n✅ AI 해석 발견!');
            console.log('📝 해석 내용:');
            console.log('-'.repeat(50));
            console.log(text.substring(0, 500) + '...');
            console.log('-'.repeat(50));
            interpretationFound = true;
            break;
          }
        }
        if (interpretationFound) break;
      } catch (e) {
        // 계속 진행
      }
    }
    
    if (!interpretationFound) {
      console.log('\n⚠️ AI 해석을 찾을 수 없습니다.');
      
      // 에러 메시지 확인
      const errorTexts = await page.locator('text=/error|오류|실패/i').all();
      for (const errorElement of errorTexts) {
        const errorText = await errorElement.textContent();
        console.log('❌ 에러 메시지:', errorText);
      }
    }
    
    console.log('\n✅ 테스트 완료!');
    console.log(`📸 스크린샷 저장 위치: ${screenshotDir}`);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testAIInterpretation().catch(console.error);