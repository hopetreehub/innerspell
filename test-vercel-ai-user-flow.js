const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Vercel 배포 URL
const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

// 스크린샷 폴더 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'ai-user-flow');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testUserFlow() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 사용자 플로우 기반 AI 타로 테스트\n');
    
    // 1. 리딩 페이지 접속
    console.log('1️⃣ 타로 리딩 페이지 접속...');
    await page.goto(`${VERCEL_URL}/reading`);
    await page.waitForTimeout(3000);
    console.log('✅ 페이지 로드 완료\n');
    
    // 2. 질문 입력 (클릭 후 입력)
    console.log('2️⃣ 질문 입력...');
    const questionField = await page.locator('input, textarea').first();
    await questionField.click();
    await questionField.fill('2025년 나에게 주어질 기회와 행운은?');
    console.log('✅ 질문 입력 완료\n');
    
    // 3. 카드 섞기
    console.log('3️⃣ 카드 섞기...');
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(2000);
    console.log('✅ 섞기 완료\n');
    
    // 4. 카드 펼치기
    console.log('4️⃣ 카드 펼치기...');
    await page.locator('button:has-text("카드 펼치기")').click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-cards-spread.png'),
      fullPage: true 
    });
    console.log('✅ 카드 펼침 완료\n');
    
    // 5. 카드 선택 (이미지를 직접 클릭)
    console.log('5️⃣ 카드 3장 선택 시도...');
    
    // 카드 뒷면 이미지들을 찾아서 클릭
    const cardImages = await page.locator('img[alt="카드 뒷면"]').all();
    console.log(`   발견된 카드 이미지: ${cardImages.length}개`);
    
    if (cardImages.length >= 3) {
      // 스크롤 가능한 컨테이너로 이동
      const container = await page.locator('.overflow-x-auto').first();
      
      // 첫 번째 카드 클릭
      try {
        await cardImages[3].scrollIntoViewIfNeeded();
        await cardImages[3].click({ force: true });
        await page.waitForTimeout(1500);
        console.log('   ✓ 1번째 카드 선택');
      } catch (e) {
        console.log('   첫 번째 카드 선택 실패');
      }
      
      // 두 번째 카드 클릭
      try {
        await cardImages[10].scrollIntoViewIfNeeded();
        await cardImages[10].click({ force: true });
        await page.waitForTimeout(1500);
        console.log('   ✓ 2번째 카드 선택');
      } catch (e) {
        console.log('   두 번째 카드 선택 실패');
      }
      
      // 세 번째 카드 클릭
      try {
        await cardImages[20].scrollIntoViewIfNeeded();
        await cardImages[20].click({ force: true });
        await page.waitForTimeout(1500);
        console.log('   ✓ 3번째 카드 선택');
      } catch (e) {
        console.log('   세 번째 카드 선택 실패');
      }
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-cards-selected.png'),
      fullPage: true 
    });
    
    // 선택된 카드 수 확인
    const bodyText = await page.locator('body').textContent();
    const selectedMatch = bodyText.match(/\((\d+)\/3 선택됨\)/);
    if (selectedMatch) {
      console.log(`✅ 선택된 카드: ${selectedMatch[1]}/3\n`);
    }
    
    // 6. AI 해석 받기
    console.log('6️⃣ AI 해석 버튼 찾기...');
    
    // 모든 버튼 확인
    const buttons = await page.locator('button').all();
    let aiButtonFound = false;
    
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.includes('AI 해석')) {
        console.log(`   → "${text}" 버튼 발견!`);
        await button.click();
        aiButtonFound = true;
        console.log('   ✓ AI 해석 요청 전송\n');
        break;
      }
    }
    
    if (!aiButtonFound) {
      console.log('   ⚠️ AI 해석 버튼을 찾을 수 없습니다\n');
    }
    
    // 7. 결과 대기
    console.log('⏳ AI 응답 대기중...');
    
    for (let i = 1; i <= 8; i++) {
      await page.waitForTimeout(5000);
      console.log(`   ${i * 5}초 경과...`);
      
      // 스크린샷 (마지막)
      if (i === 8) {
        await page.screenshot({ 
          path: path.join(screenshotDir, '03-final-state.png'),
          fullPage: true 
        });
      }
      
      // 에러 체크
      const errors = await page.locator('text=/error|오류|실패|NOT_FOUND/i').all();
      if (errors.length > 0) {
        for (const error of errors) {
          const errorText = await error.textContent();
          if (errorText && errorText.length > 20) {
            console.log(`\n❌ 에러 감지: ${errorText}`);
            
            if (errorText.includes('NOT_FOUND: Model')) {
              console.log('\n💡 해결책:');
              console.log('   1. app/actions/tarot.ts 파일 열기');
              console.log('   2. getAIInterpretation 함수에서 model: "openai/g" 찾기');
              console.log('   3. model: "gpt-4o-mini"로 변경');
              console.log('   4. Git 커밋 후 Vercel 재배포');
            }
          }
        }
        break;
      }
      
      // AI 해석 찾기
      const contents = await page.locator('div, p').all();
      for (const content of contents) {
        try {
          const text = await content.textContent();
          if (text && text.length > 500 && text.includes('카드')) {
            console.log('\n✅ AI 해석 발견!');
            console.log('━'.repeat(60));
            console.log(text.substring(0, 800) + '...');
            console.log('━'.repeat(60));
            return;
          }
        } catch (e) {
          // 계속
        }
      }
    }
    
    console.log('\n⚠️ AI 해석을 받지 못했습니다.');
    
  } catch (error) {
    console.error('\n❌ 오류:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error.png'),
      fullPage: true 
    });
  } finally {
    console.log('\n✅ 테스트 종료');
    console.log(`📸 스크린샷: ${screenshotDir}`);
    await browser.close();
  }
}

// 실행
testUserFlow().catch(console.error);