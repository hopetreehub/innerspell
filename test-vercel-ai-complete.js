const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Vercel 배포 URL
const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

// 스크린샷 폴더 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'ai-complete-test');
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
  
  // 콘솔 에러 수집
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('🔴 콘솔 에러:', msg.text());
    }
  });
  
  // 네트워크 에러 수집
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()
    });
    console.log('🔴 네트워크 에러:', request.url(), request.failure());
  });
  
  try {
    console.log('🚀 AI 해석 기능 완전 테스트 시작...\n');
    
    // 1. 타로 리딩 페이지 직접 접속
    console.log('1️⃣ 타로 리딩 페이지 접속...');
    await page.goto(`${VERCEL_URL}/reading`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-reading-page-initial.png'),
      fullPage: true 
    });
    console.log('✅ 리딩 페이지 진입 완료\n');
    
    // 2. 질문 입력
    console.log('2️⃣ 타로 질문 입력...');
    const questionInput = await page.locator('input').first();
    await questionInput.fill('2025년 새해 나의 운세와 미래는 어떻게 될까요?');
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-question-entered.png'),
      fullPage: true 
    });
    console.log('✅ 질문 입력 완료\n');
    
    // 3. 카드 섞기 버튼 클릭
    console.log('3️⃣ 카드 섞기 시작...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-after-shuffle.png'),
      fullPage: true 
    });
    console.log('✅ 카드 섞기 완료\n');
    
    // 4. 카드 뽑기 버튼 클릭
    console.log('4️⃣ 카드 뽑기 버튼 클릭...');
    const drawButton = await page.locator('button:has-text("카드 뽑기")');
    await drawButton.click();
    await page.waitForTimeout(3000); // 애니메이션 대기
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-cards-revealed.png'),
      fullPage: true 
    });
    console.log('✅ 카드가 펼쳐졌습니다\n');
    
    // 5. 카드 3장 선택
    console.log('5️⃣ 카드 3장 선택...');
    
    // 카드 이미지 찾기 (앞면으로 뒤집힌 카드)
    await page.waitForTimeout(2000);
    
    // 클릭 가능한 카드 찾기 - 다양한 방법 시도
    const cardSelectors = [
      'img[alt*="Tarot card"]',
      'img[src*="tarot"]',
      'div[role="button"] img',
      '.cursor-pointer img',
      'button img'
    ];
    
    let cardsFound = false;
    for (const selector of cardSelectors) {
      const cards = await page.locator(selector).all();
      if (cards.length >= 3) {
        console.log(`   ${cards.length}개의 카드를 찾았습니다 (selector: ${selector})`);
        
        // 3장 선택
        await cards[0].click();
        await page.waitForTimeout(1500);
        console.log('   ✓ 첫 번째 카드 선택');
        
        await cards[Math.floor(cards.length / 2)].click();
        await page.waitForTimeout(1500);
        console.log('   ✓ 두 번째 카드 선택');
        
        await cards[cards.length - 1].click();
        await page.waitForTimeout(1500);
        console.log('   ✓ 세 번째 카드 선택');
        
        cardsFound = true;
        break;
      }
    }
    
    if (!cardsFound) {
      console.log('   ⚠️ 카드를 찾을 수 없습니다. 페이지 상태를 확인하세요.');
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '05-cards-selected.png'),
      fullPage: true 
    });
    console.log('✅ 카드 선택 완료\n');
    
    // 6. 해석 보기 버튼 찾기 및 클릭
    console.log('6️⃣ AI 해석 요청...');
    
    // 모든 버튼 확인
    const allButtons = await page.locator('button').all();
    console.log(`   총 ${allButtons.length}개의 버튼 발견`);
    
    let interpretationRequested = false;
    for (const button of allButtons) {
      const text = await button.textContent();
      console.log(`   버튼 텍스트: "${text}"`);
      
      if (text && (text.includes('해석') || text.includes('리딩 시작') || text.includes('확인'))) {
        await button.click();
        console.log(`   ✓ "${text}" 버튼 클릭!`);
        interpretationRequested = true;
        break;
      }
    }
    
    if (!interpretationRequested) {
      console.log('   ⚠️ 해석 버튼을 찾을 수 없습니다');
    }
    
    // 7. AI 응답 대기 (최대 30초)
    console.log('\n⏳ AI 응답 대기 중...');
    let aiResponseFound = false;
    
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(5000);
      
      // AI 해석 내용 찾기
      const interpretationSelectors = [
        '.prose',
        '[class*="whitespace-pre-wrap"]',
        '[class*="interpretation"]',
        'div[class*="result"]',
        'div[class*="reading"]',
        'div[class*="text-gray"]'
      ];
      
      for (const selector of interpretationSelectors) {
        try {
          const elements = await page.locator(selector).all();
          for (const element of elements) {
            const text = await element.textContent();
            if (text && text.length > 200 && 
                (text.includes('카드') || text.includes('의미') || text.includes('당신') || text.includes('미래'))) {
              console.log('\n✅ AI 해석 성공!');
              console.log('📝 AI 타로 해석 내용:');
              console.log('='.repeat(50));
              console.log(text);
              console.log('='.repeat(50));
              aiResponseFound = true;
              
              await page.screenshot({ 
                path: path.join(screenshotDir, '06-ai-interpretation-success.png'),
                fullPage: true 
              });
              break;
            }
          }
        } catch (e) {
          // 계속 진행
        }
        if (aiResponseFound) break;
      }
      
      if (aiResponseFound) break;
      console.log(`   ${(i+1)*5}초 경과...`);
    }
    
    if (!aiResponseFound) {
      console.log('\n❌ AI 해석을 받지 못했습니다.');
      
      // 에러 메시지 확인
      const errorMessages = await page.locator('text=/error|오류|실패|failed/i').all();
      if (errorMessages.length > 0) {
        console.log('\n발견된 에러 메시지:');
        for (const errorElement of errorMessages) {
          const errorText = await errorElement.textContent();
          console.log(`   - ${errorText}`);
        }
      }
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '06-ai-interpretation-failed.png'),
        fullPage: true 
      });
    }
    
    // 8. 콘솔 및 네트워크 에러 보고
    if (consoleErrors.length > 0) {
      console.log('\n📋 콘솔 에러 요약:');
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    }
    
    if (networkErrors.length > 0) {
      console.log('\n📋 네트워크 에러 요약:');
      networkErrors.forEach(err => console.log(`   - ${err.url}: ${err.failure}`));
    }
    
    console.log('\n✅ 테스트 완료!');
    console.log(`📸 스크린샷 저장 위치: ${screenshotDir}`);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error-screenshot.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testAIInterpretation().catch(console.error);