const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // API 응답 캡처
  let apiResponse = null;
  page.on('response', async response => {
    if (response.url().includes('/api/tarot/interpret')) {
      console.log(`\n[API 요청 감지] ${response.url()}`);
      console.log(`Status: ${response.status()} ${response.statusText()}`);
      
      try {
        const body = await response.text();
        apiResponse = {
          status: response.status(),
          statusText: response.statusText(),
          body: body
        };
        
        if (response.status() >= 400) {
          console.log(`\n⚠️  오류 응답:`);
          console.log(body);
        } else {
          console.log('✅ 성공 응답 받음');
        }
      } catch (e) {
        console.log('응답 본문을 읽을 수 없음');
      }
    }
  });
  
  // 콘솔 에러만 출력
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[브라우저 콘솔 에러] ${msg.text()}`);
    }
  });
  
  try {
    console.log('=== 타로 리딩 오류 점검 시작 ===\n');
    
    // 1. 페이지 이동
    console.log('1. 타로 리딩 페이지 이동...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 2. 질문 입력
    console.log('2. 질문 입력: "테스트 질문입니다"');
    await page.fill('textarea', '테스트 질문입니다');
    await page.waitForTimeout(500);
    
    // 3. 카드 섞기
    console.log('3. 카드 섞기 버튼 클릭...');
    await page.click('button:text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    // 4. 카드 펼치기
    console.log('4. 카드 펼치기 버튼 클릭...');
    await page.click('button:text("카드 펼치기")');
    await page.waitForTimeout(3000);
    
    // 5. 카드 선택
    console.log('5. 카드 3장 선택...');
    
    // JavaScript로 직접 카드 선택
    const selectedCards = await page.evaluate(() => {
      const cards = document.querySelectorAll('div[role="button"][aria-label*="카드 선택"]');
      const selected = [];
      
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        cards[i].click();
        selected.push(cards[i].getAttribute('aria-label'));
      }
      
      return selected;
    });
    
    console.log(`  선택된 카드: ${selectedCards.length}장`);
    selectedCards.forEach((card, i) => console.log(`  ${i + 1}. ${card}`));
    
    await page.waitForTimeout(1000);
    
    // 6. AI 해석 버튼 찾기 및 클릭
    console.log('\n6. AI 해석 받기 버튼 클릭...');
    
    // 버튼 찾기 및 상태 확인
    const buttonInfo = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const aiButton = buttons.find(btn => btn.textContent.includes('AI 해석 받기'));
      
      if (aiButton) {
        return {
          found: true,
          disabled: aiButton.disabled,
          text: aiButton.textContent.trim()
        };
      }
      return { found: false };
    });
    
    if (!buttonInfo.found) {
      console.log('❌ AI 해석 받기 버튼을 찾을 수 없습니다!');
      await page.screenshot({ path: 'no-button-found.png' });
      return;
    }
    
    console.log(`  버튼 상태: ${buttonInfo.disabled ? '비활성화' : '활성화'}`);
    
    // 버튼 클릭
    await page.click('button:text("AI 해석 받기")');
    console.log('  ✅ 버튼 클릭 완료');
    
    // 7. API 응답 대기
    console.log('\n7. AI 응답 대기중... (최대 15초)');
    await page.waitForTimeout(15000);
    
    // 8. 최종 스크린샷
    console.log('\n8. 최종 상태 스크린샷 저장...');
    await page.screenshot({ path: 'error-recheck.png', fullPage: true });
    
    // 9. 오류 메시지 확인
    console.log('\n9. 화면 오류 메시지 확인...');
    
    const pageErrors = await page.evaluate(() => {
      const errors = [];
      
      // Toast 메시지 확인
      document.querySelectorAll('[role="status"], [data-state="open"]').forEach(el => {
        const text = el.textContent?.trim();
        if (text && (text.includes('오류') || text.includes('실패') || text.includes('Error'))) {
          errors.push(`Toast: ${text}`);
        }
      });
      
      // 빨간색 오류 텍스트
      document.querySelectorAll('.text-red-500, .text-red-600, .text-destructive').forEach(el => {
        const text = el.textContent?.trim();
        if (text) errors.push(`Error Text: ${text}`);
      });
      
      // Alert 박스
      document.querySelectorAll('[role="alert"]').forEach(el => {
        const text = el.textContent?.trim();
        if (text) errors.push(`Alert: ${text}`);
      });
      
      return errors;
    });
    
    // 10. 결과 정리
    console.log('\n\n=== 📊 최종 분석 결과 ===');
    
    if (apiResponse) {
      console.log('\n[API 응답 결과]');
      console.log(`- Status Code: ${apiResponse.status}`);
      console.log(`- Status Text: ${apiResponse.statusText}`);
      
      if (apiResponse.status === 403) {
        console.log('\n🚨 403 Forbidden 오류 발생!');
        console.log('원인: CSRF 토큰 검증 실패 가능성이 높습니다.');
      }
      
      if (apiResponse.body.includes('CSRF') || apiResponse.body.includes('csrf')) {
        console.log('\n🚨 CSRF 토큰 오류 확인됨!');
        console.log('응답 내용:', apiResponse.body);
      }
    } else {
      console.log('\n❓ API 응답이 캡처되지 않았습니다.');
      console.log('가능한 원인:');
      console.log('- API 요청이 발생하지 않음');
      console.log('- 네트워크 오류');
      console.log('- 클라이언트 측 검증 실패');
    }
    
    if (pageErrors.length > 0) {
      console.log('\n[화면에 표시된 오류]');
      pageErrors.forEach(err => console.log(`- ${err}`));
    } else {
      console.log('\n✅ 화면에 표시된 오류 메시지가 없습니다.');
    }
    
    console.log('\n\n테스트 완료. 브라우저를 30초간 열어둡니다...');
    console.log('개발자 도구의 Network 탭에서 직접 확인해보세요.');
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ 테스트 실행 중 오류:', error.message);
    await page.screenshot({ path: 'test-error.png' });
  }
  
  await browser.close();
  console.log('\n테스트 종료');
})();