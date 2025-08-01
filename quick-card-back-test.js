const { chromium } = require('playwright');

async function quickCardBackTest() {
  console.log('🔍 카드 뒷면 이미지 빠른 테스트...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // 네트워크 로그
    page.on('response', response => {
      if (response.url().includes('back') && response.url().includes('.png')) {
        console.log(`📡 카드 뒷면 응답: ${response.url()} - ${response.status()}`);
      }
    });
    
    console.log('1️⃣ 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    console.log('2️⃣ 질문 입력...');
    await page.fill('textarea[placeholder*="질문"]', '테스트 질문');
    
    console.log('3️⃣ 타로 읽기 시작...');
    await page.click('button:has-text("타로 읽기 시작")');
    await page.waitForTimeout(2000);
    
    console.log('4️⃣ 원카드 선택...');
    await page.click('button:has-text("원카드")');
    await page.waitForTimeout(3000);
    
    // 이미지 확인
    const images = await page.locator('img').all();
    console.log(`\n📊 전체 이미지 수: ${images.length}`);
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src && src.includes('back')) {
        console.log(`✅ 카드 뒷면 발견: ${src}`);
        
        // 새 경로 확인
        if (src.includes('back/back.png')) {
          console.log('🎉 새로운 경로 사용 확인됨!');
        } else if (src.includes('back.png')) {
          console.log('⚠️ 아직 이전 경로 사용 중');
        }
      }
    }
    
    await page.screenshot({ path: 'quick-card-back-test.png', fullPage: true });
    console.log('\n📸 스크린샷: quick-card-back-test.png');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
}

quickCardBackTest().catch(console.error);