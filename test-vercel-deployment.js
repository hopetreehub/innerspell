const { chromium } = require('playwright');

async function testVercelDeployment() {
  console.log('🌐 Vercel 배포 확인 및 로컬 비교 테스트\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  try {
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    console.log('1️⃣ Vercel 배포 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(8000);
    
    console.log('📸 Vercel 배포 버전 스크린샷...');
    await page.screenshot({ path: 'vercel-deployment.png', fullPage: true });
    
    // 뒷면 카드 확인
    const backImages = await page.locator('img[src*="back"]').all();
    let vercelBackCount = 0;
    for (const img of backImages) {
      if (await img.isVisible()) {
        vercelBackCount++;
      }
    }
    
    console.log(`📊 Vercel 배포 상태:`);
    console.log(`   - 뒷면 카드 개수: ${vercelBackCount}개`);
    
    // 로컬 4000번 포트와 비교
    console.log('\n2️⃣ 로컬 4000번 포트 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(8000);
    
    console.log('📸 로컬 버전 스크린샷...');
    await page.screenshot({ path: 'local-4000.png', fullPage: true });
    
    // 로컬 뒷면 카드 확인
    const localBackImages = await page.locator('img[src*="back"]').all();
    let localBackCount = 0;
    for (const img of localBackImages) {
      if (await img.isVisible()) {
        localBackCount++;
      }
    }
    
    console.log(`📊 로컬 4000번 포트 상태:`);
    console.log(`   - 뒷면 카드 개수: ${localBackCount}개`);
    
    console.log('\n🔄 동기화 결과:');
    if (vercelBackCount === localBackCount && vercelBackCount > 0) {
      console.log('✅ Vercel과 로컬이 동일하게 동기화됨');
    } else {
      console.log('⚠️ Vercel과 로컬 간 차이 발견');
      console.log(`   - Vercel: ${vercelBackCount}개`);
      console.log(`   - 로컬: ${localBackCount}개`);
    }
    
    console.log('\n📸 저장된 스크린샷:');
    console.log('   - vercel-deployment.png (Vercel 배포판)');
    console.log('   - local-4000.png (로컬 4000번 포트)');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testVercelDeployment().catch(console.error);