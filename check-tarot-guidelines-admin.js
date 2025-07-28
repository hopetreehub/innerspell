const { chromium } = require('playwright');

(async () => {
  console.log('🔍 타로 지침 관리 페이지 확인 시작...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    viewport: { width: 1920, height: 1080 } 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 홈페이지 접속
    console.log('📍 홈페이지 접속 중...');
    await page.goto('http://localhost:4000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.screenshot({ 
      path: 'tarot-guidelines-01-homepage.png',
      fullPage: true 
    });
    console.log('📸 홈페이지 스크린샷 저장');
    
    // 2. 관리자 페이지로 이동
    console.log('📍 관리자 페이지로 이동...');
    await page.goto('http://localhost:4000/admin', {
      waitUntil: 'networkidle'
    });
    
    await page.screenshot({ 
      path: 'tarot-guidelines-02-admin-page.png',
      fullPage: true 
    });
    console.log('📸 관리자 페이지 스크린샷 저장');
    
    // 3. 로그인 필요 시 처리
    if (page.url().includes('/sign-in')) {
      console.log('🔐 로그인이 필요합니다. Mock 로그인 수행...');
      
      // Mock 로그인
      await page.evaluate(() => {
        localStorage.setItem('mockAuth', JSON.stringify({
          user: {
            id: 'admin-test',
            email: 'admin@test.com',
            role: 'admin',
            displayName: 'Test Admin'
          }
        }));
      });
      
      // 다시 관리자 페이지로
      await page.goto('http://localhost:4000/admin');
      await page.waitForLoadState('networkidle');
    }
    
    // 4. 타로 지침 탭 클릭
    console.log('📍 타로 지침 탭 찾기...');
    const tarotTab = await page.locator('button:has-text("타로 지침")').first();
    
    if (await tarotTab.isVisible()) {
      await tarotTab.click();
      console.log('✅ 타로 지침 탭 클릭 완료');
      
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'tarot-guidelines-03-tarot-tab.png',
        fullPage: true 
      });
      console.log('📸 타로 지침 탭 스크린샷 저장');
      
      // 5. 스프레드와 스타일 선택 요소 확인
      const spreadSelect = await page.locator('button[role="combobox"]:has-text("스프레드를 선택하세요")');
      const styleSelect = await page.locator('button[role="combobox"]:has-text("해석 스타일을 선택하세요")');
      
      console.log('🔍 UI 요소 확인:');
      console.log(`  - 스프레드 선택: ${await spreadSelect.isVisible() ? '✅ 있음' : '❌ 없음'}`);
      console.log(`  - 스타일 선택: ${await styleSelect.isVisible() ? '✅ 있음' : '❌ 없음'}`);
      
      // 6. 스프레드 선택
      if (await spreadSelect.isVisible()) {
        await spreadSelect.click();
        await page.waitForTimeout(1000);
        
        // 삼위일체 스프레드 선택
        const pastPresentFuture = await page.locator('text=/삼위일체.*과거-현재-미래/').first();
        if (await pastPresentFuture.isVisible()) {
          await pastPresentFuture.click();
          console.log('✅ 삼위일체 스프레드 선택');
        }
      }
      
      // 7. 스타일 선택
      if (await styleSelect.isVisible()) {
        await styleSelect.click();
        await page.waitForTimeout(1000);
        
        // 전통 라이더-웨이트 선택
        const traditionalRWS = await page.locator('text=/전통 라이더-웨이트/').first();
        if (await traditionalRWS.isVisible()) {
          await traditionalRWS.click();
          console.log('✅ 전통 라이더-웨이트 스타일 선택');
        }
      }
      
      // 8. 지침 찾기 버튼 클릭
      const findButton = await page.locator('button:has-text("지침 찾기")');
      if (await findButton.isVisible()) {
        await findButton.click();
        console.log('✅ 지침 찾기 버튼 클릭');
        
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'tarot-guidelines-04-guideline-result.png',
          fullPage: true 
        });
        console.log('📸 지침 결과 스크린샷 저장');
      }
      
      // 9. GEO 가이드 관련 텍스트 확인
      const geoTexts = await page.locator('text=/geo|GEO|Geo/i').count();
      console.log(`\n🔍 GEO 가이드 관련 텍스트 발견: ${geoTexts}개`);
      
      if (geoTexts === 0) {
        console.log('✅ GEO 가이드가 성공적으로 제거되었습니다!');
      } else {
        console.log('⚠️ 아직 GEO 가이드 관련 텍스트가 남아있습니다.');
      }
      
      // 10. 타로 지침 데이터 확인
      const guidelines = await page.evaluate(() => {
        const cards = document.querySelectorAll('[class*="card"]');
        const data = [];
        cards.forEach(card => {
          const title = card.querySelector('h4, h5')?.textContent;
          if (title && title.includes('지침')) {
            data.push(title);
          }
        });
        return data;
      });
      
      console.log('\n📋 발견된 타로 지침:');
      guidelines.forEach(g => console.log(`  - ${g}`));
      
    } else {
      console.log('❌ 타로 지침 탭을 찾을 수 없습니다!');
    }
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    
    await page.screenshot({ 
      path: 'tarot-guidelines-error.png',
      fullPage: true 
    });
    console.log('📸 에러 스크린샷 저장');
  } finally {
    // 브라우저는 열어둡니다
    console.log('\n🏁 검증 완료 - 브라우저를 수동으로 닫아주세요');
  }
})();