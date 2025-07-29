const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Vercel 배포 URL
const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

// 스크린샷 폴더 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'ai-focus-test');
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
  page.setDefaultTimeout(30000);
  
  try {
    console.log('🚀 AI 타로 해석 핵심 기능 테스트\n');
    
    // 1. 타로 리딩 페이지 접속
    console.log('1️⃣ 타로 리딩 페이지 접속...');
    await page.goto(`${VERCEL_URL}/reading`);
    await page.waitForTimeout(3000);
    console.log('✅ 완료\n');
    
    // 2. 질문 입력
    console.log('2️⃣ 질문 입력...');
    await page.fill('input[type="text"]', '2025년 나의 행운과 기회는?');
    console.log('✅ 완료\n');
    
    // 3. 카드 섞기
    console.log('3️⃣ 카드 섞기...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    console.log('✅ 완료\n');
    
    // 4. 카드 펼치기
    console.log('4️⃣ 카드 펼치기...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-cards-spread.png'),
      fullPage: true 
    });
    console.log('✅ 완료\n');
    
    // 5. 카드 3장 선택 (뒷면 카드 클릭)
    console.log('5️⃣ 카드 3장 선택...');
    
    // 카드 선택을 위해 스크롤 가능한 영역 찾기
    const cardContainer = await page.locator('.overflow-x-auto').first();
    
    // 첫 번째 카드 클릭
    await page.locator('div[role="button"]').nth(5).click();
    await page.waitForTimeout(1000);
    console.log('   ✓ 1번째 카드 선택');
    
    // 두 번째 카드 클릭
    await page.locator('div[role="button"]').nth(15).click();
    await page.waitForTimeout(1000);
    console.log('   ✓ 2번째 카드 선택');
    
    // 세 번째 카드 클릭
    await page.locator('div[role="button"]').nth(25).click();
    await page.waitForTimeout(1000);
    console.log('   ✓ 3번째 카드 선택');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-cards-selected.png'),
      fullPage: true 
    });
    console.log('✅ 완료\n');
    
    // 6. 해석 보기 버튼 찾아서 클릭
    console.log('6️⃣ AI 해석 요청...');
    
    // 모든 버튼을 확인하여 해석 관련 버튼 찾기
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && (text.includes('해석') || text.includes('완료') || text.includes('확인'))) {
        console.log(`   → "${text}" 버튼 클릭`);
        await button.click();
        break;
      }
    }
    
    console.log('   ⏳ AI 응답 대기 중...\n');
    
    // 7. AI 해석 결과 확인 (최대 30초 대기)
    let interpretationFound = false;
    let attempts = 0;
    
    while (!interpretationFound && attempts < 6) {
      await page.waitForTimeout(5000);
      attempts++;
      
      // 다양한 셀렉터로 AI 해석 찾기
      const selectors = [
        '.prose',
        '.whitespace-pre-wrap',
        'div[class*="text-gray"]',
        'div[class*="p-4"]',
        'div[class*="rounded"]'
      ];
      
      for (const selector of selectors) {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          try {
            const text = await element.textContent();
            if (text && text.length > 200 && 
                (text.includes('카드') || text.includes('의미') || text.includes('당신') || 
                 text.includes('미래') || text.includes('운세') || text.includes('타로'))) {
              
              console.log('✅ AI 타로 해석 성공!\n');
              console.log('📮 AI 해석 내용:');
              console.log('━'.repeat(70));
              console.log(text);
              console.log('━'.repeat(70));
              
              interpretationFound = true;
              
              await page.screenshot({ 
                path: path.join(screenshotDir, '03-ai-interpretation.png'),
                fullPage: true 
              });
              
              break;
            }
          } catch (e) {
            // 계속 진행
          }
        }
        if (interpretationFound) break;
      }
      
      if (!interpretationFound) {
        console.log(`   ${attempts * 5}초 경과...`);
        
        // 에러 확인
        const errorElement = await page.locator('text=/error|오류|실패/i').first();
        if (await errorElement.isVisible()) {
          const errorText = await errorElement.textContent();
          console.log(`\n❌ 에러 발생: ${errorText}`);
          
          // 특히 OpenAI 모델 관련 에러 확인
          if (errorText.includes('Model') || errorText.includes('NOT_FOUND')) {
            console.log('\n🔍 OpenAI 모델 에러 감지됨');
            console.log('   → 환경 변수 확인 필요: OPENAI_API_KEY');
            console.log('   → 모델명 확인 필요: gpt-4o-mini');
          }
          
          await page.screenshot({ 
            path: path.join(screenshotDir, '03-error.png'),
            fullPage: true 
          });
          break;
        }
      }
    }
    
    if (!interpretationFound && attempts >= 6) {
      console.log('\n⚠️ 30초 동안 AI 해석을 받지 못했습니다.');
    }
    
    console.log('\n✅ 테스트 완료!');
    console.log(`📸 스크린샷: ${screenshotDir}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
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