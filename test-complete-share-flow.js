const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'complete-share-flow-screenshots');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('디렉토리 생성 실패:', error);
  }
}

async function takeScreenshot(page, name, fullPage = false) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  await page.screenshot({ 
    path: path.join(screenshotDir, filename),
    fullPage: fullPage
  });
  console.log(`📸 스크린샷 저장: ${filename}`);
}

async function testCompleteShareFlow() {
  console.log('🎯 완전한 타로 리딩 및 공유 플로우 테스트...\n');
  
  await ensureDir(screenshotDir);
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 1. 홈페이지 접속 및 타로 리딩 시작
    console.log('1️⃣ 홈페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '01-homepage');
    
    // 타로리딩 버튼 클릭
    const tarotButton = await page.locator('button:has-text("타로리딩"), a:has-text("타로리딩")').first();
    if (await tarotButton.isVisible()) {
      await tarotButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 타로리딩 페이지로 이동');
    }
    
    await takeScreenshot(page, '02-reading-page');
    
    // 2. 질문 입력
    console.log('\n2️⃣ 질문 입력...');
    const questionInput = await page.locator('textarea').first();
    if (await questionInput.isVisible()) {
      await questionInput.fill('오늘의 운세와 앞으로의 방향성에 대해 알려주세요');
      await takeScreenshot(page, '03-question-entered');
      console.log('✅ 질문 입력 완료');
    }
    
    // 3. 카드 섞기
    console.log('\n3️⃣ 카드 섞기...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(4000); // 섞기 애니메이션 대기
      console.log('✅ 카드 섞기 완료');
    }
    
    // 4. 카드 펼치기
    console.log('\n4️⃣ 카드 펼치기...');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '04-cards-spread');
      console.log('✅ 카드 펼치기 완료');
    }
    
    // 5. 카드 선택 (Trinity View - 3장)
    console.log('\n5️⃣ 카드 선택 (3장)...');
    
    // 카드 선택 (3장까지)
    for (let i = 0; i < 3; i++) {
      try {
        // 펼쳐진 카드들 중에서 선택
        const cards = await page.locator('div[role="button"][aria-label*="펼쳐진"][aria-label*="카드 선택"]').all();
        
        if (cards.length > i) {
          console.log(`🃏 카드 ${i + 1} 선택 중...`);
          await cards[i].click();
          await page.waitForTimeout(1000);
          console.log(`✅ 카드 ${i + 1} 선택 완료`);
        }
      } catch (error) {
        console.log(`⚠️ 카드 ${i + 1} 선택 실패: ${error.message}`);
      }
    }
    
    await takeScreenshot(page, '05-cards-selected');
    
    // 6. AI 해석 받기
    console.log('\n6️⃣ AI 해석 받기...');
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    if (await interpretButton.isVisible()) {
      console.log('✅ AI 해석 받기 버튼 발견');
      await interpretButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ AI 해석 요청 완료');
      
      // 해석 모달이 열릴 때까지 대기
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      await takeScreenshot(page, '06-interpretation-started');
      
      // 해석이 완료될 때까지 대기 (최대 2분)
      console.log('\n⏳ AI 해석 완료 대기...');
      let interpretationComplete = false;
      
      for (let i = 0; i < 48; i++) { // 2분 = 48 * 2.5초
        await page.waitForTimeout(2500);
        
        try {
          // 공유 버튼이 나타났는지 확인 (해석 완료의 신호)
          const shareButton = await page.locator('button:has-text("리딩 공유하기"), button:has-text("공유")').first();
          if (await shareButton.isVisible()) {
            interpretationComplete = true;
            console.log('✅ AI 해석 완료 (공유 버튼 발견)');
            break;
          }
          
          // 진행 상황 표시
          console.log(`⏳ 해석 대기 중... (${i + 1}/48)`);
          
        } catch (error) {
          // 계속 대기
        }
      }
      
      await takeScreenshot(page, '07-interpretation-complete', true);
      
      if (interpretationComplete) {
        // 7. 공유 버튼 클릭
        console.log('\n7️⃣ 공유 버튼 클릭...');
        
        const shareButton = await page.locator('button:has-text("리딩 공유하기"), button:has-text("공유")').first();
        if (await shareButton.isVisible()) {
          console.log('✅ 공유 버튼 발견');
          await shareButton.click();
          await page.waitForTimeout(3000);
          await takeScreenshot(page, '08-share-clicked');
          
          // 공유 완료 토스트 메시지 확인
          const toastMessage = await page.locator('text="공유 링크 생성됨", text="클립보드에 복사"').first();
          if (await toastMessage.isVisible({ timeout: 5000 })) {
            console.log('✅ 공유 링크 생성 완료');
            await takeScreenshot(page, '09-share-success');
            
            // 클립보드에서 공유 링크 가져오기 시도
            try {
              const clipboardText = await page.evaluate(async () => {
                try {
                  return await navigator.clipboard.readText();
                } catch (error) {
                  return null;
                }
              });
              
              if (clipboardText && clipboardText.includes('http')) {
                console.log(`📎 공유 URL: ${clipboardText}`);
                
                // 8. 공유 링크 테스트
                console.log('\n8️⃣ 공유 링크 접속 테스트...');
                const newPage = await context.newPage();
                
                try {
                  await newPage.goto(clipboardText, {
                    waitUntil: 'domcontentloaded',
                    timeout: 20000
                  });
                  await newPage.waitForTimeout(5000);
                  await takeScreenshot(newPage, '10-shared-reading-page', true);
                  
                  // 공유된 페이지 내용 검증
                  const sharedTitle = await newPage.title();
                  const sharedContent = await newPage.textContent('body');
                  
                  console.log(`📄 공유 페이지 제목: ${sharedTitle}`);
                  
                  if (sharedContent.includes('타로') || sharedContent.includes('카드') || sharedContent.includes('해석')) {
                    console.log('✅ 공유된 페이지에 타로 리딩 내용 확인됨');
                  } else {
                    console.log('⚠️ 공유된 페이지 내용이 명확하지 않음');
                  }
                  
                } catch (error) {
                  console.log(`❌ 공유 링크 접속 실패: ${error.message}`);
                  await takeScreenshot(newPage, '10-shared-link-error');
                } finally {
                  await newPage.close();
                }
              } else {
                console.log('⚠️ 클립보드에서 공유 링크를 찾을 수 없음');
              }
            } catch (error) {
              console.log(`⚠️ 클립보드 읽기 실패: ${error.message}`);
            }
          } else {
            console.log('⚠️ 공유 완료 메시지를 찾을 수 없음');
          }
        } else {
          console.log('❌ 공유 버튼을 찾을 수 없습니다');
        }
      } else {
        console.log('❌ AI 해석이 시간 내에 완료되지 않았습니다');
      }
    } else {
      console.log('❌ AI 해석 받기 버튼을 찾을 수 없습니다');
    }
    
    // 9. 커뮤니티 공유 페이지 확인
    console.log('\n9️⃣ 커뮤니티 공유 페이지 확인...');
    
    try {
      await page.goto('https://test-studio-firebase.vercel.app/community/reading-share', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '11-community-share-page', true);
      console.log('✅ 커뮤니티 공유 페이지 접속');
      
      const communityContent = await page.textContent('body');
      if (communityContent.includes('공유') || communityContent.includes('리딩')) {
        console.log('✅ 커뮤니티 공유 기능 확인됨');
      }
    } catch (error) {
      console.log(`❌ 커뮤니티 공유 페이지 접속 실패: ${error.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await takeScreenshot(page, 'final-error', true);
  } finally {
    await browser.close();
    console.log('\n🎯 완전한 타로 리딩 및 공유 플로우 테스트 완료!');
    console.log(`📁 스크린샷 저장 위치: ${screenshotDir}`);
  }
}

// 테스트 실행
testCompleteShareFlow().catch(console.error);