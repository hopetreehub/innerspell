const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Vercel 배포 URL
const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

// 스크린샷 폴더 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'ai-complete-flow');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testCompleteAIFlow() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  try {
    console.log('🚀 Vercel AI 타로 해석 전체 플로우 테스트\n');
    
    // 1. 메인 페이지 접속
    console.log('1️⃣ 메인 페이지 접속...');
    await page.goto(VERCEL_URL);
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-main-page.png'),
      fullPage: true 
    });
    console.log('✅ 메인 페이지 로드 완료\n');
    
    // 2. 타로 리딩 페이지로 이동
    console.log('2️⃣ 타로 리딩 페이지로 이동...');
    await page.click('a[href="/reading"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-reading-page.png'),
      fullPage: true 
    });
    console.log('✅ 리딩 페이지 진입\n');
    
    // 3. 질문 입력 찾기 - 다양한 방법 시도
    console.log('3️⃣ 질문 입력 시도...');
    
    // 방법 1: placeholder로 찾기
    let questionInputFound = false;
    try {
      const questionInput = await page.locator('[placeholder*="질문"], [placeholder*="카드에게"]').first();
      await questionInput.fill('2025년 새해, 나에게 찾아올 행운과 기회는 무엇일까요?');
      questionInputFound = true;
      console.log('✅ 질문 입력 완료 (placeholder 방식)\n');
    } catch (e) {
      console.log('   placeholder 방식 실패, 다른 방법 시도...');
    }
    
    // 방법 2: label 텍스트로 찾기
    if (!questionInputFound) {
      try {
        const label = await page.locator('text=당신의 질문').first();
        const input = await label.locator('..').locator('input, textarea').first();
        await input.fill('2025년 새해, 나에게 찾아올 행운과 기회는 무엇일까요?');
        questionInputFound = true;
        console.log('✅ 질문 입력 완료 (label 방식)\n');
      } catch (e) {
        console.log('   label 방식도 실패');
      }
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-question-input.png'),
      fullPage: true 
    });
    
    // 4. 카드 섞기
    console.log('4️⃣ 카드 섞기...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    console.log('✅ 카드 섞기 완료\n');
    
    // 5. 카드 펼치기
    console.log('5️⃣ 카드 펼치기...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-cards-spread.png'),
      fullPage: true 
    });
    console.log('✅ 카드 펼치기 완료\n');
    
    // 6. 카드 3장 선택
    console.log('6️⃣ 카드 3장 선택...');
    
    // 카드 선택을 위한 다양한 시도
    const cardSelectors = [
      'div[role="button"][aria-label*="카드"]',
      'div[role="button"]',
      '[class*="cursor-pointer"]',
      'img[alt*="카드 뒷면"]'
    ];
    
    let selectedCount = 0;
    for (const selector of cardSelectors) {
      if (selectedCount >= 3) break;
      
      const cards = await page.locator(selector).all();
      console.log(`   ${selector} -> ${cards.length}개 발견`);
      
      if (cards.length >= 3) {
        // 간격을 두고 3장 선택
        const indices = [2, Math.floor(cards.length/2), cards.length - 3];
        
        for (const index of indices) {
          if (index < cards.length) {
            try {
              await cards[index].click({ force: true });
              await page.waitForTimeout(1500);
              selectedCount++;
              console.log(`   ✓ ${selectedCount}번째 카드 선택`);
            } catch (e) {
              console.log(`   카드 ${index} 클릭 실패`);
            }
          }
        }
        break;
      }
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '05-cards-selected.png'),
      fullPage: true 
    });
    console.log('✅ 카드 선택 시도 완료\n');
    
    // 7. 해석 버튼 찾기
    console.log('7️⃣ AI 해석 요청...');
    
    // 모든 버튼 확인
    const allButtons = await page.locator('button').all();
    let interpretButtonClicked = false;
    
    for (const button of allButtons) {
      const text = await button.textContent();
      if (text && (text.includes('해석') || text.includes('완료') || text.includes('리딩 시작'))) {
        console.log(`   → "${text.trim()}" 버튼 발견`);
        try {
          await button.click();
          interpretButtonClicked = true;
          console.log('   ✓ 버튼 클릭 성공');
          break;
        } catch (e) {
          console.log('   버튼 클릭 실패');
        }
      }
    }
    
    if (!interpretButtonClicked) {
      console.log('   ⚠️ 해석 버튼을 찾을 수 없음');
    }
    
    // 8. AI 응답 대기 및 확인
    console.log('\n⏳ AI 타로 해석 대기중...');
    
    let aiInterpretationFound = false;
    const maxAttempts = 8; // 40초 대기
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await page.waitForTimeout(5000);
      console.log(`   ${attempt * 5}초 경과...`);
      
      // 에러 확인
      const errorElements = await page.locator('text=/error|오류|실패|failed/i').all();
      if (errorElements.length > 0) {
        for (const errorEl of errorElements) {
          const errorText = await errorEl.textContent();
          if (errorText.length > 10) {
            console.log(`\n❌ 에러 발생: ${errorText}`);
            
            // OpenAI 관련 에러 특별 처리
            if (errorText.includes('NOT_FOUND') && errorText.includes('Model')) {
              console.log('\n🔍 OpenAI API 에러 분석:');
              console.log('   - 에러 타입: 모델을 찾을 수 없음');
              console.log('   - 가능한 원인:');
              console.log('     1) 잘못된 모델명 (예: "openai/g" 대신 "gpt-4o-mini" 사용)');
              console.log('     2) API 키 문제');
              console.log('     3) 모델 접근 권한 부족');
              console.log('\n   💡 해결 방법:');
              console.log('     - getAIInterpretation 함수의 model 파라미터 확인');
              console.log('     - 올바른 모델명 사용: "gpt-4o-mini" 또는 "gpt-4-turbo-preview"');
            }
            
            await page.screenshot({ 
              path: path.join(screenshotDir, '06-error-occurred.png'),
              fullPage: true 
            });
            break;
          }
        }
      }
      
      // AI 해석 찾기
      const contentSelectors = [
        '.prose',
        '.whitespace-pre-wrap',
        'div[class*="rounded"][class*="p-"]',
        'div[class*="bg-"][class*="p-"]',
        'p'
      ];
      
      for (const selector of contentSelectors) {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          try {
            const text = await element.textContent();
            if (text && text.length > 300 && 
                (text.includes('카드') || text.includes('타로') || text.includes('의미') || 
                 text.includes('당신') || text.includes('미래') || text.includes('운세'))) {
              
              console.log('\n✅ AI 타로 해석 성공!');
              console.log('\n📮 AI 타로 해석 내용:');
              console.log('═'.repeat(70));
              console.log(text);
              console.log('═'.repeat(70));
              
              aiInterpretationFound = true;
              
              await page.screenshot({ 
                path: path.join(screenshotDir, '06-ai-interpretation-success.png'),
                fullPage: true 
              });
              break;
            }
          } catch (e) {
            // 계속
          }
        }
        if (aiInterpretationFound) break;
      }
      
      if (aiInterpretationFound || errorElements.length > 0) break;
    }
    
    if (!aiInterpretationFound && !errorElements.length) {
      console.log('\n⚠️ AI 해석을 받지 못했습니다.');
      await page.screenshot({ 
        path: path.join(screenshotDir, '06-no-interpretation.png'),
        fullPage: true 
      });
    }
    
    console.log('\n✅ 테스트 완료!');
    console.log(`📸 스크린샷 저장 위치: ${screenshotDir}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testCompleteAIFlow().catch(console.error);