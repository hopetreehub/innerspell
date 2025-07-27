const { chromium } = require('playwright');

async function testLocalGuidelinesFeatures() {
  console.log('로컬 타로지침 페이지 기능 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 타로지침 페이지로 직접 이동
    console.log('1. 타로지침 페이지 접속 중...');
    await page.goto('http://localhost:4000/tarot-guidelines', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);
    
    // 지침 카드 수 확인 (더 구체적인 선택자 사용)
    const initialCards = await page.$$('div[class*="grid"] > div');
    console.log('초기 표시된 지침 카드 수:', initialCards.length);
    
    // 2. 필터 기능 테스트
    console.log('\n2. 필터 기능 테스트...');
    
    // 2-1. 켈틱 크로스 스프레드 필터
    console.log('- 켈틱 크로스 스프레드 필터 적용...');
    const spreadSelect = await page.$('select:has-text("모든 스프레드")');
    if (spreadSelect) {
      await spreadSelect.selectOption({ label: '켈틱 크로스' });
      await page.waitForTimeout(1000);
      
      const celticCards = await page.$$('div[class*="grid"] > div');
      console.log('켈틱 크로스 필터 후 카드 수:', celticCards.length);
      
      await page.screenshot({ 
        path: 'screenshots/local-03-celtic-filter.png',
        fullPage: true 
      });
      console.log('✓ 켈틱 크로스 필터 스크린샷 저장');
    }
    
    // 2-2. 전통 라이더-웨이트 해석 스타일 필터
    console.log('- 전통 라이더-웨이트 스타일 필터 추가...');
    const styleSelect = await page.$('select:has-text("모든 해석 스타일")');
    if (styleSelect) {
      await styleSelect.selectOption({ label: '전통 라이더-웨이트' });
      await page.waitForTimeout(1000);
      
      const traditionalCards = await page.$$('div[class*="grid"] > div');
      console.log('전통 스타일 추가 필터 후 카드 수:', traditionalCards.length);
      
      await page.screenshot({ 
        path: 'screenshots/local-04-both-filters.png',
        fullPage: true 
      });
      console.log('✓ 두 필터 적용 스크린샷 저장');
    }
    
    // 필터 초기화
    console.log('- 필터 초기화...');
    await page.reload();
    await page.waitForTimeout(2000);
    
    // 2-3. 검색 기능 테스트
    console.log('- "관계" 키워드 검색...');
    const searchInput = await page.$('input[placeholder*="검색"]');
    if (searchInput) {
      await searchInput.fill('관계');
      await page.waitForTimeout(1000);
      
      const searchResults = await page.$$('div[class*="grid"] > div');
      console.log('"관계" 검색 결과 카드 수:', searchResults.length);
      
      await page.screenshot({ 
        path: 'screenshots/local-05-search-results.png',
        fullPage: true 
      });
      console.log('✓ 검색 결과 스크린샷 저장');
      
      // 검색 초기화
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }
    
    // 3. 상세 보기 기능 테스트
    console.log('\n3. 상세 보기 기능 테스트...');
    
    // 첫 번째 카드의 "상세 보기" 버튼 클릭
    const detailButtons = await page.$$('button:has-text("상세 보기")');
    if (detailButtons.length > 0) {
      console.log(`총 ${detailButtons.length}개의 상세 보기 버튼 발견`);
      
      // 첫 번째 카드의 제목 가져오기
      const firstCardTitle = await page.$$eval('div[class*="grid"] > div', cards => {
        return cards[0]?.textContent || '';
      });
      console.log('첫 번째 카드:', firstCardTitle);
      
      // 상세 보기 클릭
      await detailButtons[0].click();
      await page.waitForTimeout(2000);
      
      // 모달이나 상세 정보 확인
      const hasModal = await page.isVisible('[role="dialog"], [class*="modal"], [class*="dialog"]');
      const hasDetailContent = await page.isVisible('text=/포지션별.*가이드/') || 
                              await page.isVisible('text=/해석.*팁/') ||
                              await page.isVisible('text=/주의.*사항/');
      
      console.log('모달 표시:', hasModal);
      console.log('상세 내용 표시:', hasDetailContent);
      
      await page.screenshot({ 
        path: 'screenshots/local-06-detail-view.png',
        fullPage: true 
      });
      console.log('✓ 상세 보기 스크린샷 저장');
      
      // 닫기 시도
      const closeButton = await page.$('button:has-text("닫기"), button:has-text("X"), button[aria-label*="close"], button[aria-label*="Close"]');
      if (closeButton) {
        await closeButton.click();
        console.log('✓ 상세 보기 닫기 완료');
      } else {
        await page.keyboard.press('Escape');
        console.log('✓ ESC 키로 닫기 시도');
      }
      await page.waitForTimeout(1000);
    } else {
      console.log('상세 보기 버튼을 찾을 수 없음');
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'screenshots/local-07-final-state.png',
      fullPage: true 
    });
    console.log('✓ 최종 상태 스크린샷 저장');
    
    console.log('\n✅ 모든 기능 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    
    await page.screenshot({ 
      path: 'screenshots/local-error-features.png',
      fullPage: true 
    });
    
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testLocalGuidelinesFeatures().catch(console.error);