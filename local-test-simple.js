const { chromium } = require('playwright');

async function testLocalSimple() {
  console.log('🔍 로컬 서버 (포트 4000) 간단 테스트\n');
  
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      viewport: { width: 1280, height: 720 }
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
    
    // 1. 홈페이지
    console.log('1️⃣ 홈페이지 접속');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'local-simple-1-home.png' });
    console.log('✅ 홈페이지 로드 완료');
    
    // 2. 직접 타로 리딩 페이지로 이동
    console.log('\n2️⃣ 타로 리딩 페이지 직접 접속');
    await page.goto('http://localhost:4000/tarot/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'local-simple-2-reading.png' });
    
    // 페이지 정보 수집
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasInput: !!document.querySelector('input, textarea'),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t),
        images: document.querySelectorAll('img').length,
        tarotImages: Array.from(document.querySelectorAll('img')).filter(img => img.src.includes('tarot')).length
      };
    });
    
    console.log('\n📊 페이지 정보:');
    console.log(`- 제목: ${pageInfo.title}`);
    console.log(`- URL: ${pageInfo.url}`);
    console.log(`- 입력 필드: ${pageInfo.hasInput ? '있음' : '없음'}`);
    console.log(`- 버튼: ${pageInfo.buttons.slice(0, 5).join(', ')}...`);
    console.log(`- 이미지: 총 ${pageInfo.images}개 (타로 ${pageInfo.tarotImages}개)`);
    
    // 3. 질문 입력 시도
    if (pageInfo.hasInput) {
      console.log('\n3️⃣ 질문 입력');
      const input = await page.$('input, textarea');
      await input.fill('오늘의 운세를 알려주세요');
      await page.screenshot({ path: 'local-simple-3-question.png' });
      console.log('✅ 질문 입력 완료');
    }
    
    // 4. 백과사전 페이지
    console.log('\n4️⃣ 타로 백과사전 페이지');
    await page.goto('http://localhost:4000/tarot/encyclopedia');
    await page.waitForTimeout(2000);
    const is404 = await page.$('text=404');
    await page.screenshot({ path: 'local-simple-4-encyclopedia.png' });
    console.log(is404 ? '❌ 404 에러 페이지' : '✅ 정상 페이지');
    
    // 5. 네트워크 상태
    console.log('\n5️⃣ 네트워크 상태 확인');
    const response = await page.goto('http://localhost:4000/api/health', { waitUntil: 'networkidle' }).catch(() => null);
    if (response) {
      console.log(`- Health API: ${response.status()} ${response.statusText()}`);
    } else {
      console.log('- Health API: 응답 없음');
    }
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (page) {
      await page.screenshot({ path: 'local-simple-error.png' });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
testLocalSimple().catch(console.error);