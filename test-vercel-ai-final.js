const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Vercel 배포 URL
const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

// 스크린샷 폴더 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'ai-final-test');
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
  
  // 페이지 타임아웃 설정
  page.setDefaultTimeout(60000); // 60초로 증가
  
  try {
    console.log('🚀 AI 해석 기능 최종 테스트 시작...\n');
    
    // 1. Vercel 메인 페이지 접속
    console.log('1️⃣ Vercel 메인 페이지 접속...');
    await page.goto(VERCEL_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // 페이지 안정화 대기
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-vercel-main.png'),
      fullPage: true 
    });
    console.log('✅ 메인 페이지 접속 완료\n');
    
    // 2. 타로 리딩 페이지로 이동
    console.log('2️⃣ 타로 리딩 페이지로 이동...');
    await page.click('a[href="/reading"]');
    await page.waitForURL('**/reading');
    await page.waitForTimeout(3000); // 페이지 안정화 대기
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-reading-page.png'),
      fullPage: true 
    });
    console.log('✅ 리딩 페이지 진입 완료\n');
    
    // 3. 질문 입력
    console.log('3️⃣ 타로 질문 입력...');
    // 먼저 모든 input 요소를 확인
    const inputs = await page.locator('input').all();
    console.log(`   찾은 입력 필드 개수: ${inputs.length}`);
    
    // 첫 번째 입력 필드에 질문 입력 (질문 입력란으로 추정)
    if (inputs.length > 0) {
      await inputs[0].fill('2025년 나의 운세는 어떻게 될까요?');
    }
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-question-input.png'),
      fullPage: true 
    });
    console.log('✅ 질문 입력 완료\n');
    
    // 4. 카드 섞기 시작
    console.log('4️⃣ 카드 섞기 시작...');
    const startButton = await page.locator('button:has-text("카드 섞기")');
    await startButton.click();
    await page.waitForTimeout(2000); // 애니메이션 대기
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-shuffling.png'),
      fullPage: true 
    });
    console.log('✅ 카드 섞기 시작됨\n');
    
    // 5. 카드 3장 선택
    console.log('5️⃣ 카드 3장 선택 중...');
    
    // 카드가 나타날 때까지 대기
    await page.waitForTimeout(3000);
    
    // 카드 뒷면 이미지를 찾아서 클릭
    const cardBacks = await page.locator('img[alt*="card back"], img[src*="card-back"]').all();
    console.log(`   찾은 카드 개수: ${cardBacks.length}`);
    
    if (cardBacks.length >= 3) {
      // 첫 번째 카드 선택
      await cardBacks[0].click();
      await page.waitForTimeout(1000);
      console.log('   - 첫 번째 카드 선택');
      
      // 두 번째 카드 선택
      await cardBacks[Math.floor(cardBacks.length / 2)].click();
      await page.waitForTimeout(1000);
      console.log('   - 두 번째 카드 선택');
      
      // 세 번째 카드 선택
      await cardBacks[cardBacks.length - 1].click();
      await page.waitForTimeout(1000);
      console.log('   - 세 번째 카드 선택');
    } else {
      console.log('⚠️ 카드를 찾을 수 없습니다. 현재 페이지 상태를 확인해주세요.');
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '05-cards-selected.png'),
      fullPage: true 
    });
    console.log('✅ 카드 3장 선택 완료\n');
    
    // 6. AI 해석 요청
    console.log('6️⃣ AI 해석 요청...');
    const interpretButton = await page.locator('button:has-text("해석 보기")');
    await interpretButton.click();
    
    // AI 응답 대기 (최대 30초)
    console.log('⏳ AI 응답 대기 중...');
    
    // 에러 메시지 또는 성공 메시지 확인
    try {
      // 성공적인 AI 해석이 나타나는지 확인
      await page.waitForSelector('.prose', { timeout: 30000 });
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '06-ai-interpretation-success.png'),
        fullPage: true 
      });
      
      // AI 해석 내용 추출
      const interpretation = await page.locator('.prose').textContent();
      console.log('\n✅ AI 해석 성공!');
      console.log('📝 AI 해석 내용:');
      console.log('-'.repeat(50));
      console.log(interpretation);
      console.log('-'.repeat(50));
      
    } catch (error) {
      // 에러 메시지 확인
      const errorMessage = await page.locator('text=/error|오류|실패/i').first();
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log('\n❌ 에러 발생:', errorText);
        
        await page.screenshot({ 
          path: path.join(screenshotDir, '06-ai-interpretation-error.png'),
          fullPage: true 
        });
      } else {
        console.log('\n⚠️ AI 해석이 나타나지 않음 (타임아웃)');
        await page.screenshot({ 
          path: path.join(screenshotDir, '06-ai-interpretation-timeout.png'),
          fullPage: true 
        });
      }
    }
    
    // 7. 네트워크 에러 확인 (개발자 도구)
    console.log('\n7️⃣ 네트워크 요청 상태 확인...');
    
    // 콘솔 에러 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 콘솔 에러:', msg.text());
      }
    });
    
    // 대시보드로 이동하여 저장된 리딩 확인
    console.log('\n8️⃣ 대시보드에서 저장된 리딩 확인...');
    await page.goto(`${VERCEL_URL}/dashboard`);
    await page.waitForTimeout(3000); // 페이지 안정화 대기
    await page.screenshot({ 
      path: path.join(screenshotDir, '07-dashboard-check.png'),
      fullPage: true 
    });
    
    console.log('\n✅ 테스트 완료!');
    console.log(`📸 스크린샷 저장 위치: ${screenshotDir}`);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error-final.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testAIInterpretation().catch(console.error);