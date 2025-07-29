const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Vercel 배포 URL
const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

// 스크린샷 폴더 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'ai-actual-test');
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
    }
  });
  
  try {
    console.log('🚀 AI 타로 해석 기능 실제 테스트 시작...\n');
    
    // 1. 타로 리딩 페이지 접속
    console.log('1️⃣ Vercel 타로 리딩 페이지 접속...');
    await page.goto(`${VERCEL_URL}/reading`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-reading-page.png'),
      fullPage: true 
    });
    console.log('✅ 리딩 페이지 접속 완료\n');
    
    // 2. 질문 입력
    console.log('2️⃣ 타로 질문 입력...');
    const questionInput = await page.locator('input').first();
    await questionInput.fill('2025년 나의 운세와 행운은 어떻게 될까요?');
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-question-input.png'),
      fullPage: true 
    });
    console.log('✅ 질문: "2025년 나의 운세와 행운은 어떻게 될까요?"\n');
    
    // 3. 카드 섞기
    console.log('3️⃣ 카드 섞기 시작...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    console.log('✅ 카드 섞기 완료\n');
    
    // 4. 카드 펼치기 버튼 클릭
    console.log('4️⃣ 카드 펼치기...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000); // 애니메이션 대기
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-cards-spread.png'),
      fullPage: true 
    });
    console.log('✅ 카드가 펼쳐졌습니다\n');
    
    // 5. 카드 3장 선택
    console.log('5️⃣ 카드 3장 선택...');
    
    // 펼쳐진 카드를 클릭 (이미지 또는 카드 컨테이너)
    const cardElements = await page.locator('img[alt*="card"], img[src*="/tarot/"], .cursor-pointer').all();
    console.log(`   발견된 카드 요소: ${cardElements.length}개`);
    
    if (cardElements.length >= 3) {
      // 첫 번째 카드
      await cardElements[2].click();
      await page.waitForTimeout(1000);
      console.log('   ✓ 1번째 카드 선택');
      
      // 두 번째 카드
      await cardElements[10].click();
      await page.waitForTimeout(1000);
      console.log('   ✓ 2번째 카드 선택');
      
      // 세 번째 카드
      await cardElements[20].click();
      await page.waitForTimeout(1000);
      console.log('   ✓ 3번째 카드 선택');
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-cards-selected.png'),
      fullPage: true 
    });
    console.log('✅ 카드 3장 선택 완료\n');
    
    // 6. 해석 보기 버튼 클릭
    console.log('6️⃣ AI 해석 요청...');
    
    // 버튼 찾기
    const interpretButton = await page.locator('button:has-text("해석"), button:has-text("리딩"), button:has-text("확인")').first();
    await interpretButton.click();
    console.log('   ✓ 해석 버튼 클릭\n');
    
    // 7. AI 응답 대기
    console.log('⏳ AI 타로 해석 생성 대기 중...');
    
    // 최대 30초 동안 AI 응답 확인
    let aiInterpretation = null;
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(5000);
      
      // AI 해석 텍스트 찾기
      const interpretationElement = await page.locator('.prose, .whitespace-pre-wrap, [class*="text-gray"]').first();
      
      try {
        const text = await interpretationElement.textContent();
        if (text && text.length > 100) {
          aiInterpretation = text;
          break;
        }
      } catch (e) {
        // 계속 대기
      }
      
      console.log(`   ${(i+1)*5}초 경과...`);
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotDir, '05-final-result.png'),
      fullPage: true 
    });
    
    // 결과 출력
    if (aiInterpretation) {
      console.log('\n✅ AI 타로 해석 성공!');
      console.log('\n📮 AI 타로 해석 내용:');
      console.log('='.repeat(70));
      console.log(aiInterpretation);
      console.log('='.repeat(70));
    } else {
      console.log('\n❌ AI 해석을 받지 못했습니다.');
      
      // 에러 메시지 확인
      const errorElement = await page.locator('text=/error|오류|실패/i').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log('🔴 에러 메시지:', errorText);
      }
    }
    
    // 콘솔 에러 출력
    if (consoleErrors.length > 0) {
      console.log('\n📋 콘솔 에러:');
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    }
    
    console.log('\n✅ 테스트 완료!');
    console.log(`📸 스크린샷 저장 위치: ${screenshotDir}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
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