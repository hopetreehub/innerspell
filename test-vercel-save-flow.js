const { chromium } = require('playwright');

async function testVercelSaveFlow() {
  console.log('🔍 Vercel 환경에서 리딩 저장 기능 테스트\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  try {
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    // 콘솔 및 에러 모니터링
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('저장') || text.includes('save') || text.includes('error')) {
        console.log(`📝 콘솔: ${text}`);
      }
    });
    
    console.log('1️⃣ Vercel 배포 환경 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 충분한 로딩 시간
    
    // 로그인 상태 확인
    const loginButton = page.locator('button:has-text("로그인")');
    const isLoggedOut = await loginButton.count() > 0;
    console.log(`   로그인 상태: ${isLoggedOut ? '비로그인' : '로그인됨 또는 로딩 중'}`);
    
    console.log('\n2️⃣ 질문 입력...');
    const questionTextarea = page.locator('textarea[placeholder*="질문"]');
    await questionTextarea.waitFor({ timeout: 10000 });
    await questionTextarea.fill('Vercel에서 저장 기능 테스트');
    
    console.log('\n3️⃣ 타로 읽기 시작...');
    await page.click('button:has-text("타로 읽기 시작")');
    await page.waitForTimeout(3000);
    
    console.log('\n4️⃣ 원카드 선택...');
    await page.click('button:has-text("원카드")');
    await page.waitForTimeout(5000);
    
    // 카드 선택
    console.log('\n5️⃣ 카드 선택...');
    const cards = await page.locator('.cursor-pointer').all();
    if (cards.length > 0) {
      await cards[0].click();
      await page.waitForTimeout(3000);
      
      // AI 해석 버튼 클릭
      console.log('\n6️⃣ AI 해석 요청...');
      const interpretButton = page.locator('button:has-text("AI 해석 받기")');
      if (await interpretButton.count() > 0) {
        await interpretButton.click();
        
        // 해석 완료까지 대기 (최대 60초)
        console.log('   해석 진행 중...');
        try {
          await page.waitForSelector('text=/저장.*하기|리딩.*저장|저장.*완료/', { timeout: 60000 });
          console.log('✅ 해석 완료됨');
          
          await page.screenshot({ path: 'vercel-save-test-interpretation.png', fullPage: true });
          
          // 저장 버튼 테스트
          console.log('\n7️⃣ 저장 기능 테스트...');
          const saveButton = page.locator('button:has-text("저장"), button:has-text("리딩 저장")').first();
          
          if (await saveButton.count() > 0) {
            console.log('   저장 버튼 발견, 클릭 시도...');
            await saveButton.click();
            await page.waitForTimeout(3000);
            
            // 결과 확인
            const loginRequiredMsg = await page.locator('text=/로그인.*필요|로그인.*해주세요/').count() > 0;
            const saveSuccessMsg = await page.locator('text=/저장.*완료|저장.*성공/').count() > 0;
            const saveErrorMsg = await page.locator('text=/저장.*실패|저장.*오류/').count() > 0;
            
            if (loginRequiredMsg) {
              console.log('✅ 비로그인 사용자에게 로그인 요구 메시지 표시됨');
            } else if (saveSuccessMsg) {
              console.log('✅ 저장 성공');
              
              // 내 리딩 보기 링크 확인
              const myReadingsLink = await page.locator('a:has-text("내 리딩"), a:has-text("리딩 보기")').count() > 0;
              if (myReadingsLink) {
                console.log('✅ 내 리딩 보기 링크 확인됨');
              }
            } else if (saveErrorMsg) {
              console.log('❌ 저장 실패');
            } else {
              console.log('❓ 저장 결과 불명');
            }
            
            await page.screenshot({ path: 'vercel-save-test-result.png', fullPage: true });
            
          } else {
            console.log('❌ 저장 버튼을 찾을 수 없습니다');
          }
          
        } catch (timeoutError) {
          console.log('⏰ 해석 타임아웃 - 60초 경과');
          await page.screenshot({ path: 'vercel-save-test-timeout.png', fullPage: true });
        }
        
      } else {
        console.log('❌ AI 해석 버튼을 찾을 수 없습니다');
      }
      
    } else {
      console.log('❌ 클릭 가능한 카드를 찾을 수 없습니다');
    }
    
    console.log('\n📸 스크린샷 파일:');
    console.log('   - vercel-save-test-interpretation.png (해석 완료 시)');
    console.log('   - vercel-save-test-result.png (저장 결과)');
    console.log('   - vercel-save-test-timeout.png (타임아웃 시)');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testVercelSaveFlow().catch(console.error);