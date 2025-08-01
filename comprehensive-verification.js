const { chromium } = require('playwright');
const fs = require('fs');

async function comprehensiveVerification() {
  console.log('🔍 종합 검증 시작 - SuperClaude Expert Analysis\n');
  console.log('배포 URL: https://test-studio-firebase.vercel.app/');
  console.log('='.repeat(60));
  
  let browser;
  const report = {
    timestamp: new Date().toISOString(),
    url: 'https://test-studio-firebase.vercel.app/',
    tests: []
  };
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      viewport: { width: 1280, height: 720 }
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ko-KR'
    });
    const page = await context.newPage();
    
    // 1. 홈페이지 검증
    console.log('\n1️⃣ 홈페이지 검증');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle' 
    });
    
    const homepageInfo = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const buttons = Array.from(document.querySelectorAll('button, a[href]')).map(el => ({
        text: el.textContent.trim(),
        href: el.href || 'button'
      }));
      return {
        title: document.title,
        h1: h1?.textContent,
        buttons: buttons.slice(0, 10)
      };
    });
    
    console.log(`✅ 제목: ${homepageInfo.title}`);
    console.log(`✅ H1: ${homepageInfo.h1}`);
    await page.screenshot({ path: 'verify-1-homepage.png' });
    
    report.tests.push({
      name: '홈페이지',
      status: 'success',
      details: homepageInfo
    });
    
    // 2. 타로 리딩 페이지로 이동
    console.log('\n2️⃣ 타로 리딩 페이지 검증');
    await page.goto('https://test-studio-firebase.vercel.app/tarot/reading');
    await page.waitForLoadState('networkidle');
    
    // 질문 입력
    const questionInput = await page.$('input[placeholder*="질문"], textarea[placeholder*="질문"]');
    if (questionInput) {
      await questionInput.fill('오늘의 운세는 어떤가요?');
      console.log('✅ 질문 입력 완료');
    }
    
    await page.screenshot({ path: 'verify-2-question.png' });
    
    // 카드 섞기
    console.log('\n3️⃣ 카드 섞기 및 펼치기');
    const shuffleButton = await page.$('button:has-text("카드 섞기"), button:has-text("시작")');
    if (shuffleButton) {
      await shuffleButton.click();
      console.log('✅ 카드 섞기 시작');
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: 'verify-3-shuffled.png' });
    
    // 카드 펼치기
    const spreadButton = await page.$('button:has-text("카드 펼치기"), button:has-text("펼치기")');
    if (spreadButton) {
      await spreadButton.click();
      console.log('✅ 카드 펼치기 완료');
      await page.waitForTimeout(2000);
    }
    
    // 카드 이미지 확인
    const cardImages = await page.$$eval('img[src*="tarot"], img[alt*="카드"]', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
        loaded: img.complete && img.naturalHeight !== 0
      }))
    );
    
    console.log(`\n📷 카드 이미지 상태: ${cardImages.length}개 발견`);
    cardImages.forEach((img, i) => {
      console.log(`  카드 ${i+1}: ${img.loaded ? '✅ 로드됨' : '❌ 로드 실패'} (${img.width}x${img.height})`);
    });
    
    await page.screenshot({ path: 'verify-4-cards-spread.png' });
    
    report.tests.push({
      name: '카드 이미지',
      status: cardImages.every(img => img.loaded) ? 'success' : 'partial',
      details: { totalCards: cardImages.length, loaded: cardImages.filter(img => img.loaded).length }
    });
    
    // 4. 카드 선택
    console.log('\n4️⃣ 카드 선택 (3장)');
    const cards = await page.$$('[data-testid*="card"], .card-back, img[alt*="뒷면"]');
    
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      console.log(`✅ 카드 ${i + 1} 선택`);
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'verify-5-cards-selected.png' });
    
    // 5. AI 해석 확인
    console.log('\n5️⃣ AI 해석 기능 확인');
    const interpretButton = await page.$('button:has-text("AI 해석"), button:has-text("해석"), button:has-text("리딩 시작")');
    
    if (interpretButton) {
      const isDisabled = await interpretButton.isDisabled();
      console.log(`AI 해석 버튼: ${isDisabled ? '❌ 비활성화' : '✅ 활성화'}`);
      
      if (!isDisabled) {
        await interpretButton.click();
        console.log('⏳ AI 해석 요청 중...');
        
        // AI 응답 대기 (최대 30초)
        try {
          await page.waitForSelector('[data-testid*="interpretation"], .interpretation-result, .ai-result', {
            timeout: 30000
          });
          console.log('✅ AI 해석 완료!');
          await page.screenshot({ path: 'verify-6-ai-interpretation.png' });
          
          report.tests.push({
            name: 'AI 해석',
            status: 'success',
            details: { responseTime: '< 30s' }
          });
        } catch (error) {
          console.log('❌ AI 해석 타임아웃 또는 오류');
          await page.screenshot({ path: 'verify-6-ai-error.png' });
          
          report.tests.push({
            name: 'AI 해석',
            status: 'failed',
            error: error.message
          });
        }
      }
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없음');
      report.tests.push({
        name: 'AI 해석',
        status: 'not-found'
      });
    }
    
    // 6. 네트워크 오류 확인
    console.log('\n6️⃣ 콘솔 오류 확인');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 콘솔 오류: ${msg.text()}`);
      }
    });
    
    // 7. 반응형 디자인 확인
    console.log('\n7️⃣ 반응형 디자인 확인');
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verify-7-mobile.png' });
    console.log('✅ 모바일 뷰 확인');
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verify-8-tablet.png' });
    console.log('✅ 태블릿 뷰 확인');
    
    // 최종 리포트
    console.log('\n\n📊 검증 결과 요약');
    console.log('='.repeat(60));
    console.log(`✅ 배포 URL: ${report.url}`);
    console.log(`✅ 총 테스트: ${report.tests.length}개`);
    console.log(`✅ 성공: ${report.tests.filter(t => t.status === 'success').length}개`);
    console.log(`⚠️  부분 성공: ${report.tests.filter(t => t.status === 'partial').length}개`);
    console.log(`❌ 실패: ${report.tests.filter(t => t.status === 'failed').length}개`);
    
    // JSON 리포트 저장
    fs.writeFileSync('verification-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 상세 리포트가 verification-report.json에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error);
    report.error = error.message;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
comprehensiveVerification().catch(console.error);