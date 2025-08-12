const { chromium } = require('playwright');

(async () => {
  console.log('=== 🎲 수동 타로리딩 테스트 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // 각 동작을 천천히 수행
  });
  const page = await browser.newPage();
  
  try {
    // 1. 타로리딩 페이지 접속
    console.log('1️⃣ 타로리딩 페이지 접속');
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('- 페이지 로드 완료');
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력
    console.log('\n2️⃣ 질문 입력');
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('오늘의 운세는 어떤가요?');
    console.log('- 질문 입력 완료: "오늘의 운세는 어떤가요?"');
    
    // 3. 스프레드 선택 (1장 카드)
    console.log('\n3️⃣ 스프레드 선택');
    const spreadSelect = await page.locator('select').first();
    await spreadSelect.selectOption({ index: 0 }); // 첫 번째 옵션 선택
    console.log('- 1장 카드 스프레드 선택 완료');
    
    await page.waitForTimeout(2000);
    
    // 4. 해석 스타일 선택 (있다면)
    const styleSelect = await page.locator('select').nth(1);
    if (await styleSelect.isVisible()) {
      await styleSelect.selectOption({ index: 0 });
      console.log('- 해석 스타일 선택 완료');
    }
    
    // 5. 리딩 진행 버튼 상태 확인
    console.log('\n4️⃣ 리딩 버튼 상태 확인');
    const readingButton = await page.locator('button:has-text("리딩 진행")').first();
    const isDisabled = await readingButton.isDisabled();
    console.log(`- 리딩 버튼 상태: ${isDisabled ? '❌ 비활성화' : '✅ 활성화'}`);
    
    if (!isDisabled) {
      // 6. 리딩 시작
      console.log('\n5️⃣ 리딩 시작');
      
      // 네트워크 요청 모니터링
      const apiPromise = page.waitForResponse(response => 
        response.url().includes('/api/generate-tarot-interpretation'),
        { timeout: 30000 }
      );
      
      await readingButton.click();
      console.log('- 리딩 버튼 클릭');
      
      // API 응답 대기
      try {
        console.log('- API 응답 대기 중...');
        const response = await apiPromise;
        console.log(`- API 응답: ${response.status()}`);
        
        if (response.status() === 200) {
          const responseData = await response.json();
          console.log('✅ API 응답 성공!');
          console.log(`- 해석 길이: ${responseData.interpretation?.length || 0}자`);
        } else {
          console.log('❌ API 응답 실패');
          const errorData = await response.json();
          console.log('- 에러:', errorData.error);
        }
      } catch (error) {
        console.log('❌ API 호출 타임아웃 또는 오류');
        console.log('- 에러:', error.message);
      }
      
      // 결과 대기
      await page.waitForTimeout(5000);
      
      // 해석 결과 확인
      const interpretation = await page.locator('.interpretation, [class*="interpretation"], .reading-result').first();
      if (await interpretation.isVisible()) {
        console.log('\n✅ 해석 결과 표시됨!');
        const text = await interpretation.textContent();
        console.log(`📝 해석 미리보기: ${text?.substring(0, 100)}...`);
      } else {
        console.log('\n❌ 해석 결과가 표시되지 않음');
      }
    } else {
      console.log('\n⚠️ 리딩 버튼이 비활성화되어 있어 진행할 수 없습니다.');
      console.log('API 키 설정을 확인해주세요.');
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'manual-tarot-test-result.png', fullPage: true });
    console.log('\n📸 최종 스크린샷 저장: manual-tarot-test-result.png');
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
  }
  
  // 브라우저는 열어둠 (수동 확인 가능)
  console.log('\n🔍 브라우저를 열어두었습니다. 수동으로 확인하시고 종료해주세요.');
})();