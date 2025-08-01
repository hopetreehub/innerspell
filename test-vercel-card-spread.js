const { chromium } = require('playwright');

async function testVercelCardSpread() {
  console.log('🔍 Vercel 환경에서 카드 뒷면 표시 테스트\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  try {
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    // 이미지 요청 모니터링
    const imageRequests = [];
    page.on('request', request => {
      if (request.url().includes('tarot') && request.url().includes('.png')) {
        const url = request.url();
        imageRequests.push({
          url,
          isBack: url.includes('back.png') || url.includes('back/back.png')
        });
        console.log(`📡 이미지 요청: ${url.includes('back') ? '🔵 뒷면' : '🔴 앞면'} - ${url}`);
      }
    });
    
    console.log('1️⃣ Vercel 배포 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n2️⃣ 질문 입력...');
    await page.fill('textarea[placeholder*="질문"]', '카드 뒷면 테스트');
    
    console.log('\n3️⃣ 타로 읽기 시작...');
    await page.click('button:has-text("타로 읽기 시작")');
    await page.waitForTimeout(3000);
    
    console.log('\n4️⃣ 원카드 선택...');
    await page.click('button:has-text("원카드")');
    
    // 카드가 펼쳐질 때까지 대기
    console.log('\n5️⃣ 카드 펼치기 대기...');
    await page.waitForTimeout(5000);
    
    // 스크린샷
    await page.screenshot({ path: 'vercel-card-spread-test.png', fullPage: true });
    
    // 이미지 분석
    const allImages = await page.locator('img[src*="tarot"]').all();
    console.log(`\n📊 타로 이미지 수: ${allImages.length}개`);
    
    let backCount = 0;
    let frontCount = 0;
    
    for (const img of allImages) {
      const src = await img.getAttribute('src');
      if (await img.isVisible()) {
        if (src.includes('back')) {
          backCount++;
          console.log(`   🔵 뒷면: ${src}`);
        } else {
          frontCount++;
          console.log(`   🔴 앞면: ${src}`);
        }
      }
    }
    
    console.log(`\n📈 결과:`);
    console.log(`   - 뒷면 카드: ${backCount}개`);
    console.log(`   - 앞면 카드: ${frontCount}개`);
    console.log(`   - 네트워크 요청: ${imageRequests.length}회`);
    
    if (backCount > 0 && frontCount === 0) {
      console.log('\n✅ 성공: 카드가 뒷면으로 펼쳐집니다!');
    } else if (frontCount > 0 && backCount === 0) {
      console.log('\n❌ 실패: 카드가 앞면으로 펼쳐집니다.');
    } else if (backCount > 0 && frontCount > 0) {
      console.log('\n⚠️ 혼재: 뒷면과 앞면이 함께 표시됩니다.');
    } else {
      console.log('\n❓ 알 수 없음: 카드를 찾을 수 없습니다.');
    }
    
    console.log('\n📸 스크린샷: vercel-card-spread-test.png');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testVercelCardSpread().catch(console.error);