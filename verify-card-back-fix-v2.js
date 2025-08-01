const { chromium } = require('playwright');

async function verifyCardBackFix() {
  console.log('🔍 카드 뒷면 이미지 수정 확인 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ko-KR'
    });
    const page = await context.newPage();
    
    // 네트워크 요청 모니터링
    const imageRequests = [];
    page.on('request', request => {
      if (request.url().includes('back.png') || request.url().includes('back/back.png')) {
        imageRequests.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`📡 이미지 요청 감지: ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('back.png') || response.url().includes('back/back.png')) {
        console.log(`📡 이미지 응답: ${response.url()} - 상태: ${response.status()}`);
      }
    });
    
    // 1. 타로 리딩 페이지 접속 (올바른 경로)
    console.log('📍 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력
    console.log('\n📝 질문 입력...');
    const questionInput = page.locator('textarea[placeholder*="질문"]');
    if (await questionInput.count() > 0) {
      await questionInput.fill('오늘의 운세를 알려주세요');
      console.log('✅ 질문 입력 완료');
    } else {
      console.log('❌ 질문 입력란을 찾을 수 없습니다');
    }
    
    await page.screenshot({ path: 'card-back-fix-v2-1-question.png' });
    
    // 3. 타로 읽기 시작
    console.log('\n🎴 타로 읽기 시작...');
    const startButton = page.locator('button:has-text("타로 읽기 시작")');
    if (await startButton.count() > 0) {
      await startButton.click();
      console.log('✅ 타로 읽기 버튼 클릭');
      
      // 스프레드 선택 대기
      await page.waitForTimeout(3000);
      
      // 4. 원카드 스프레드 선택
      const oneCardButton = page.locator('button:has-text("원카드")');
      if (await oneCardButton.count() > 0) {
        console.log('\n🃏 원카드 스프레드 선택...');
        await oneCardButton.click();
        await page.waitForTimeout(3000);
        
        // 카드 뒷면 이미지 확인
        console.log('\n🔍 카드 뒷면 이미지 확인...');
        
        // 모든 이미지 태그 확인
        const allImages = await page.locator('img').all();
        console.log(`📊 전체 이미지 수: ${allImages.length}개`);
        
        for (let i = 0; i < allImages.length; i++) {
          const src = await allImages[i].getAttribute('src');
          if (src && (src.includes('back.png') || src.includes('back/back.png'))) {
            console.log(`  ✅ 카드 뒷면 이미지 발견: ${src}`);
          }
        }
        
        await page.screenshot({ path: 'card-back-fix-v2-2-spread.png', fullPage: true });
        
        // 5. 카드 클릭하여 뒤집기
        console.log('\n🎯 카드 클릭하여 뒤집기...');
        const clickableCard = page.locator('.cursor-pointer img').first();
        if (await clickableCard.count() > 0) {
          await clickableCard.click();
          console.log('✅ 카드 클릭 완료');
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'card-back-fix-v2-3-flipped.png', fullPage: true });
        }
      } else {
        console.log('❌ 원카드 버튼을 찾을 수 없습니다');
      }
    } else {
      console.log('❌ 타로 읽기 시작 버튼을 찾을 수 없습니다');
    }
    
    // 결과 요약
    console.log('\n📊 테스트 결과 요약:');
    console.log('='.repeat(50));
    console.log(`🌐 테스트 URL: http://localhost:4000/reading`);
    console.log(`📡 카드 뒷면 이미지 요청 수: ${imageRequests.length}`);
    imageRequests.forEach(req => {
      console.log(`  - ${req.url}`);
    });
    console.log('='.repeat(50));
    
    // 새 경로가 사용되는지 확인
    const hasNewPath = imageRequests.some(req => req.url.includes('/back/back.png'));
    const hasOldPath = imageRequests.some(req => req.url.includes('/back.png') && !req.url.includes('/back/back.png'));
    
    if (hasNewPath) {
      console.log('\n✅ 성공: 새로운 카드 뒷면 경로(/images/tarot-spread/back/back.png)가 사용되고 있습니다!');
    } else if (hasOldPath) {
      console.log('\n⚠️ 주의: 아직 이전 경로(/images/tarot-spread/back.png)를 사용 중입니다.');
      console.log('서버 재시작이 필요할 수 있습니다.');
    } else {
      console.log('\n❓ 카드 뒷면 이미지 요청을 감지하지 못했습니다.');
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류:', error.message);
    await page.screenshot({ path: 'card-back-fix-v2-error.png' });
  } finally {
    await browser.close();
  }
}

verifyCardBackFix().catch(console.error);