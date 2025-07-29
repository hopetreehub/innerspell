const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 저장 디렉토리 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'final-ai-check');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testFinalAICheck() {
  console.log('🚀 최종 AI 해석 기능 검증 시작...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000,
    args: ['--window-size=1600,1000']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 페이지 접속
    console.log('\n1️⃣ 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-page-loaded.png'),
      fullPage: true 
    });
    
    // 2. 질문 입력
    console.log('\n2️⃣ 질문 입력...');
    await page.fill('#question', 'AI 해석 기능이 수정된 후 정상 작동하는지 확인합니다');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-question-filled.png'),
      fullPage: true 
    });
    
    // 3. 카드 섞기
    console.log('\n3️⃣ 카드 섞기...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-shuffled.png'),
      fullPage: true 
    });
    
    // 4. 카드 펼치기
    console.log('\n4️⃣ 카드 펼치기...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(4000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-spread.png'),
      fullPage: true 
    });
    
    // 5. 카드 요소 찾기 (다양한 방법으로 시도)
    console.log('\n5️⃣ 카드 요소 분석...');
    
    // 페이지의 모든 클릭 가능한 요소 찾기
    const clickableElements = await page.locator('div, img, button').all();
    console.log(`클릭 가능한 요소 수: ${clickableElements.length}`);
    
    // 카드 영역에서 클릭 가능한 이미지나 div 찾기
    const cardArea = page.locator('.grid').first(); // 카드가 표시되는 영역
    const cardsInArea = await cardArea.locator('div, img').all();
    console.log(`카드 영역 내 요소 수: ${cardsInArea.length}`);
    
    // 직접 좌표로 카드 클릭 시도
    const cardAreaBox = await cardArea.boundingBox();
    if (cardAreaBox) {
      console.log('카드 영역 박스:', cardAreaBox);
      
      // 카드 영역을 3등분하여 클릭
      const cardWidth = cardAreaBox.width / 10; // 약 10개 정도의 카드가 있다고 가정
      
      // 첫 번째 카드 클릭 (왼쪽에서 2번째)
      const card1X = cardAreaBox.x + cardWidth * 1.5;
      const card1Y = cardAreaBox.y + cardAreaBox.height / 2;
      await page.mouse.click(card1X, card1Y);
      await page.waitForTimeout(1500);
      console.log('첫 번째 카드 클릭됨');
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '05-card1-selected.png'),
        fullPage: true 
      });
      
      // 두 번째 카드 클릭 (중앙)
      const card2X = cardAreaBox.x + cardWidth * 5;
      const card2Y = cardAreaBox.y + cardAreaBox.height / 2;
      await page.mouse.click(card2X, card2Y);
      await page.waitForTimeout(1500);
      console.log('두 번째 카드 클릭됨');
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '06-card2-selected.png'),
        fullPage: true 
      });
      
      // 세 번째 카드 클릭 (오른쪽)
      const card3X = cardAreaBox.x + cardWidth * 8;
      const card3Y = cardAreaBox.y + cardAreaBox.height / 2;
      await page.mouse.click(card3X, card3Y);
      await page.waitForTimeout(1500);
      console.log('세 번째 카드 클릭됨');
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '07-card3-selected.png'),
        fullPage: true 
      });
    }
    
    // 6. AI 해석 버튼 찾기
    console.log('\n6️⃣ AI 해석 버튼 찾기...');
    await page.waitForTimeout(2000);
    
    // 현재 페이지의 모든 버튼 확인
    const allButtons = await page.locator('button').all();
    console.log('현재 페이지의 모든 버튼:');
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const isVisible = await allButtons[i].isVisible();
      console.log(`  ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
    }
    
    // AI 해석 관련 버튼 찾기
    const aiButtonCandidates = ['AI 해석', 'AI로 해석', '해석하기', 'AI 분석', '타로 해석'];
    let aiButton = null;
    
    for (const buttonText of aiButtonCandidates) {
      try {
        const button = page.locator(`button:has-text("${buttonText}")`).first();
        if (await button.isVisible()) {
          aiButton = button;
          console.log(`✅ AI 해석 버튼 발견: "${buttonText}"`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (aiButton) {
      await page.screenshot({ 
        path: path.join(screenshotDir, '08-before-ai-interpretation.png'),
        fullPage: true 
      });
      
      // AI 해석 버튼 클릭
      console.log('\n7️⃣ AI 해석 요청...');
      await aiButton.click();
      console.log('AI 해석 버튼 클릭됨');
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '09-ai-clicked.png'),
        fullPage: true 
      });
      
      // AI 응답 대기
      console.log('AI 응답 대기 중... (30초)');
      await page.waitForTimeout(30000);
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '10-ai-response-wait.png'),
        fullPage: true 
      });
      
      // 8. 결과 확인
      console.log('\n8️⃣ AI 해석 결과 확인...');
      
      const pageText = await page.textContent('body');
      
      // AI 해석 관련 키워드 검색
      const aiKeywords = ['해석', '분석', '카드', '과거', '현재', '미래', '조언', '상징', '의미'];
      const foundKeywords = aiKeywords.filter(keyword => pageText.includes(keyword));
      
      // 오류 관련 키워드 검색  
      const errorKeywords = ['오류', '에러', 'Error', 'Failed', '실패'];
      const foundErrors = errorKeywords.filter(keyword => pageText.includes(keyword));
      
      console.log('\n📊 결과 분석:');
      console.log('='.repeat(50));
      
      if (foundKeywords.length > 0) {
        console.log(`✅ AI 해석 관련 키워드 발견: ${foundKeywords.join(', ')}`);
      }
      
      if (foundErrors.length > 0) {
        console.log(`❌ 오류 관련 키워드 발견: ${foundErrors.join(', ')}`);
      }
      
      // 페이지에서 긴 텍스트 블록 찾기 (해석 결과일 가능성)
      const textBlocks = await page.locator('div, p, span').all();
      for (const block of textBlocks) {
        try {
          const text = await block.textContent();
          if (text && text.trim().length > 100 && text.includes('카드')) {
            console.log('\n📝 발견된 긴 텍스트 (AI 해석 가능성):');
            console.log('-'.repeat(50));
            console.log(text.trim().substring(0, 300) + '...');
            console.log('-'.repeat(50));
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없습니다');
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotDir, '11-final-state.png'),
      fullPage: true 
    });
    
    console.log(`\n📸 모든 스크린샷 저장됨: ${screenshotDir}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, `error-${Date.now()}.png`),
      fullPage: true 
    });
  }
  
  // 수동 확인을 위해 브라우저 유지
  console.log('\n🔍 수동 확인을 위해 브라우저를 20초간 유지합니다...');
  await page.waitForTimeout(20000);
  
  await browser.close();
  console.log('\n✅ 테스트 완료');
}

// 테스트 실행
testFinalAICheck().catch(console.error);