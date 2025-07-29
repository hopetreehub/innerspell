const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 저장 디렉토리 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'real-card-test');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testRealCardSelection() {
  console.log('🚀 실제 카드 선택 테스트 시작...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000,
    args: ['--window-size=1600,1000']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🔴 콘솔 에러: ${msg.text()}`);
    } else if (msg.text().includes('선택') || msg.text().includes('카드')) {
      console.log(`🟢 관련 로그: ${msg.text()}`);
    }
  });
  
  try {
    // 1. 페이지 접속
    console.log('\n1️⃣ 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-loaded.png'),
      fullPage: true 
    });
    
    // 2. 질문 입력
    console.log('\n2️⃣ 질문 입력...');
    await page.fill('#question', 'AI 해석 기능이 수정된 후 정상 작동하는지 최종 확인합니다');
    await page.waitForTimeout(1000);
    
    // 3. 카드 섞기
    console.log('\n3️⃣ 카드 섞기...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(4000); // 섞기 애니메이션 대기
    
    // 4. 카드 펼치기
    console.log('\n4️⃣ 카드 펼치기...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(5000); // 펼치기 애니메이션 대기
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-cards-spread.png'),
      fullPage: true 
    });
    
    // 5. 실제 카드 요소 찾기
    console.log('\n5️⃣ 카드 요소 분석...');
    
    // motion.div 요소 찾기 (실제 카드 구조)
    const cardElements = await page.locator('div[role="button"][tabindex="0"]').all();
    console.log(`motion.div 카드 요소 개수: ${cardElements.length}`);
    
    if (cardElements.length >= 3) {
      // 첫 번째 카드 클릭
      console.log('첫 번째 카드 클릭 시도...');
      await cardElements[5].click(); // 중간쯤 카드 선택
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '03-card1-clicked.png'),
        fullPage: true 
      });
      
      // 두 번째 카드 클릭
      console.log('두 번째 카드 클릭 시도...');
      await cardElements[15].click(); // 다른 위치 카드 선택
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '04-card2-clicked.png'),
        fullPage: true 
      });
      
      // 세 번째 카드 클릭
      console.log('세 번째 카드 클릭 시도...');
      await cardElements[25].click(); // 또 다른 위치 카드 선택
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '05-card3-clicked.png'),
        fullPage: true 
      });
      
      // 6. 선택 상태 확인
      console.log('\n6️⃣ 선택 상태 확인...');
      
      // 선택된 카드 수 텍스트 확인
      const selectedText = await page.locator('text=/\\(\\d+\\/3 선택됨\\)/')
      if (await selectedText.isVisible()) {
        const text = await selectedText.textContent();
        console.log(`선택 상태: ${text}`);
      }
      
      // 7. AI 해석 버튼 찾기
      console.log('\n7️⃣ AI 해석 버튼 확인...');
      await page.waitForTimeout(2000);
      
      // 가능한 AI 해석 버튼들
      const aiButtonSelectors = [
        'button:has-text("AI 해석")',
        'button:has-text("AI 해석 받기")',
        'button:has-text("해석 받기")',
        'button:has-text("해석하기")',
        'text=AI 해석 받기'
      ];
      
      let aiButtonFound = false;
      for (const selector of aiButtonSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible()) {
            console.log(`✅ AI 해석 버튼 발견: ${selector}`);
            
            await page.screenshot({ 
              path: path.join(screenshotDir, '06-ai-button-found.png'),
              fullPage: true 
            });
            
            // AI 해석 버튼 클릭
            await button.click();
            console.log('AI 해석 버튼 클릭됨!');
            
            await page.screenshot({ 
              path: path.join(screenshotDir, '07-ai-clicked.png'),
              fullPage: true 
            });
            
            // 8. AI 응답 대기
            console.log('\n8️⃣ AI 해석 결과 대기 중...');
            
            // 해석 중 상태 확인
            const interpretingButton = page.locator('button:has-text("해석 중...")');
            if (await interpretingButton.isVisible({ timeout: 5000 })) {
              console.log('✅ "해석 중..." 상태 확인됨');
              await page.screenshot({ 
                path: path.join(screenshotDir, '08-interpreting.png'),
                fullPage: true 
              });
            }
            
            // 다이얼로그 출현 대기
            const dialog = page.locator('[role="dialog"]');
            await dialog.waitFor({ state: 'visible', timeout: 30000 });
            console.log('✅ AI 해석 다이얼로그 열림');
            
            await page.screenshot({ 
              path: path.join(screenshotDir, '09-dialog-opened.png'),
              fullPage: true 
            });
            
            // AI 해석 텍스트 대기 (최대 30초)
            console.log('AI 해석 텍스트 생성 대기 중...');
            await page.waitForTimeout(30000);
            
            await page.screenshot({ 
              path: path.join(screenshotDir, '10-ai-result.png'),
              fullPage: true 
            });
            
            // 9. 해석 결과 분석
            console.log('\n9️⃣ AI 해석 결과 분석...');
            
            // 다이얼로그 내 텍스트 확인
            const dialogText = await dialog.textContent();
            
            // AI 해석 관련 키워드 확인
            const interpretationKeywords = ['해석', '카드', '과거', '현재', '미래', '조언', '의미', '상징'];
            const foundKeywords = interpretationKeywords.filter(keyword => dialogText.includes(keyword));
            
            // 오류 관련 키워드 확인
            const errorKeywords = ['오류', '에러', 'Error', '실패', 'Failed'];
            const foundErrors = errorKeywords.filter(keyword => dialogText.includes(keyword));
            
            console.log('\n📊 최종 결과 분석:');
            console.log('='.repeat(60));
            
            if (foundKeywords.length > 0 && foundErrors.length === 0) {
              console.log('🎉 SUCCESS: AI 해석이 성공적으로 작동합니다!');
              console.log(`✅ 발견된 해석 키워드: ${foundKeywords.join(', ')}`);
              console.log(`📝 해석 텍스트 길이: ${dialogText.length}자`);
              
              // 해석 내용 미리보기 (처음 200자)
              const preview = dialogText.substring(0, 200).replace(/\n/g, ' ');
              console.log(`📖 해석 내용 미리보기: ${preview}...`);
              
            } else if (foundErrors.length > 0) {
              console.log('❌ FAILURE: AI 해석 중 오류가 발생했습니다');
              console.log(`🚨 발견된 오류 키워드: ${foundErrors.join(', ')}`);
              
            } else {
              console.log('⚠️  WARNING: AI 해석 결과를 명확히 확인할 수 없습니다');
              console.log(`📝 다이얼로그 텍스트 길이: ${dialogText.length}자`);
            }
            
            aiButtonFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!aiButtonFound) {
        console.log('❌ AI 해석 버튼을 찾을 수 없습니다');
        
        // 현재 페이지의 모든 버튼 확인
        const allButtons = await page.locator('button').all();
        console.log('\n현재 페이지의 모든 버튼:');
        for (let i = 0; i < allButtons.length; i++) {
          const text = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          console.log(`  ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
        }
      }
      
    } else {
      console.log(`❌ 충분한 카드 요소를 찾을 수 없습니다 (발견: ${cardElements.length}개)`);
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
  console.log('\n🔍 브라우저를 20초간 유지합니다. 수동으로 확인해보세요...');
  await page.waitForTimeout(20000);
  
  await browser.close();
  console.log('\n✅ 테스트 완료');
}

// 테스트 실행
testRealCardSelection().catch(console.error);