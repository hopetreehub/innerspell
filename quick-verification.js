const { chromium } = require('playwright');

async function quickVerification() {
  console.log('🚀 빠른 검증 시작\n');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    // 1. 홈페이지
    console.log('1️⃣ 홈페이지 확인');
    await page.goto('https://test-studio-firebase.vercel.app/');
    await page.screenshot({ path: 'quick-1-home.png' });
    
    // 타로 리딩 버튼 찾기
    const readingLink = await page.$('a[href*="tarot"], button:has-text("타로")');
    if (readingLink) {
      await readingLink.click();
      console.log('✅ 타로 리딩 페이지로 이동');
    } else {
      // 직접 이동
      await page.goto('https://test-studio-firebase.vercel.app/tarot/reading');
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'quick-2-reading.png' });
    
    // 2. 카드 이미지 체크
    console.log('\n2️⃣ 카드 이미지 확인');
    const images = await page.$$eval('img', imgs => imgs.map(img => ({
      src: img.src,
      loaded: img.complete
    })));
    
    const tarotImages = images.filter(img => img.src.includes('tarot'));
    console.log(`✅ 타로 이미지: ${tarotImages.length}개`);
    console.log(`✅ 로드된 이미지: ${tarotImages.filter(img => img.loaded).length}개`);
    
    // 3. 주요 버튼 확인
    console.log('\n3️⃣ UI 요소 확인');
    const elements = await page.evaluate(() => {
      return {
        hasInput: !!document.querySelector('input, textarea'),
        hasShuffleButton: !!document.querySelector('button')?.textContent?.includes('섞'),
        hasCards: document.querySelectorAll('[class*="card"]').length,
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent)
      };
    });
    
    console.log(`✅ 입력 필드: ${elements.hasInput ? '있음' : '없음'}`);
    console.log(`✅ 카드 요소: ${elements.hasCards}개`);
    console.log(`✅ 버튼들: ${elements.buttons.join(', ')}`);
    
    // 4. 백과사전 페이지
    console.log('\n4️⃣ 백과사전 페이지 확인');
    await page.goto('https://test-studio-firebase.vercel.app/tarot/encyclopedia');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'quick-3-encyclopedia.png' });
    
    const encyclopediaCards = await page.$$eval('[class*="card"], img[alt*="카드"]', cards => cards.length);
    console.log(`✅ 백과사전 카드: ${encyclopediaCards}개`);
    
    console.log('\n✅ 검증 완료!');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

quickVerification().catch(console.error);