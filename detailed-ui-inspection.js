const { chromium } = require('playwright');

async function detailedUIInspection() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 상세 UI 구조 분석 시작...');
    
    // 1. 페이지 로드
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    console.log('1. 페이지 로드 완료');

    // 2. 질문 입력
    const questionInput = page.locator('textarea').first();
    await questionInput.fill('상세 UI 검사 질문입니다.');
    console.log('2. 질문 입력 완료');

    // 3. 카드 섞기
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible({ timeout: 2000 })) {
      await shuffleButton.click();
      await page.waitForTimeout(2000);
      console.log('3. 카드 섞기 완료');
    }

    // 4. 모든 버튼과 클릭 가능한 요소 분석
    console.log('4. 전체 버튼 및 클릭 가능한 요소 분석...');
    
    // 모든 버튼
    const allButtons = await page.locator('button').all();
    console.log(`   전체 버튼 수: ${allButtons.length}`);
    
    for (let i = 0; i < allButtons.length; i++) {
      try {
        const buttonText = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        const isEnabled = await allButtons[i].isEnabled();
        const classList = await allButtons[i].getAttribute('class');
        
        if (buttonText && buttonText.trim()) {
          console.log(`   버튼 ${i + 1}: "${buttonText.trim()}" (보임: ${isVisible}, 활성: ${isEnabled})`);
          if (classList && classList.includes('disabled')) {
            console.log(`     CSS 클래스: ${classList}`);
          }
        }
      } catch (e) {
        console.log(`   버튼 ${i + 1}: 정보 읽기 실패`);
      }
    }

    // 5. 다른 클릭 가능한 요소들
    console.log('5. 기타 클릭 가능한 요소들...');
    
    const clickableSelectors = [
      '[role="button"]',
      '[onclick]',
      '.cursor-pointer',
      '.clickable',
      '[data-testid*="button"]',
      '[data-testid*="click"]'
    ];
    
    for (const selector of clickableSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`   ${selector}: ${elements.length}개`);
          
          for (let i = 0; i < Math.min(elements.length, 3); i++) {
            const text = await elements[i].textContent();
            const isVisible = await elements[i].isVisible();
            console.log(`     ${i + 1}. "${text ? text.trim() : 'no text'}" (보임: ${isVisible})`);
          }
        }
      } catch (e) {
        // 계속
      }
    }

    // 6. 특정 텍스트가 포함된 모든 요소 찾기
    console.log('6. AI/해석 관련 텍스트 요소 찾기...');
    
    const aiKeywords = ['AI', 'ai', '해석', '생성', '분석', 'interpret', '완료', '시작', '요청'];
    
    for (const keyword of aiKeywords) {
      try {
        const elements = await page.locator(`text=${keyword}`).all();
        if (elements.length > 0) {
          console.log(`   "${keyword}" 텍스트: ${elements.length}개`);
          
          for (let i = 0; i < Math.min(elements.length, 2); i++) {
            const tagName = await elements[i].evaluate(el => el.tagName);
            const classList = await elements[i].getAttribute('class');
            const isClickable = await elements[i].evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.cursor === 'pointer' || el.onclick !== null;
            });
            
            console.log(`     ${i + 1}. <${tagName}> 클릭가능: ${isClickable}, class: ${classList}`);
          }
        }
      } catch (e) {
        // 계속
      }
    }

    // 7. DOM 구조에서 hidden/invisible 요소 확인
    console.log('7. hidden/invisible 요소 중 AI 관련 요소 확인...');
    
    const hiddenElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const hiddenAIElements = [];
      
      for (const element of allElements) {
        const text = element.textContent || element.innerText || '';
        const style = window.getComputedStyle(element);
        
        if ((text.includes('AI') || text.includes('해석') || text.includes('interpret')) &&
            (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) {
          hiddenAIElements.push({
            tagName: element.tagName,
            text: text.substring(0, 100),
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            className: element.className
          });
        }
      }
      
      return hiddenAIElements;
    });
    
    if (hiddenElements.length > 0) {
      console.log(`   숨겨진 AI 관련 요소: ${hiddenElements.length}개`);
      hiddenElements.forEach((el, idx) => {
        console.log(`     ${idx + 1}. <${el.tagName}> "${el.text}" (display: ${el.display}, visibility: ${el.visibility}, opacity: ${el.opacity})`);
      });
    } else {
      console.log('   숨겨진 AI 관련 요소 없음');
    }

    // 8. 현재 페이지의 모든 텍스트 콘텐츠 스캔
    console.log('8. 페이지 전체 텍스트 콘텐츠 스캔...');
    
    const pageText = await page.evaluate(() => {
      return document.body.innerText || document.body.textContent || '';
    });
    
    const lines = pageText.split('\n').filter(line => line.trim());
    const relevantLines = lines.filter(line => 
      line.includes('AI') || line.includes('해석') || line.includes('interpret') || 
      line.includes('생성') || line.includes('분석') || line.includes('완료') ||
      line.includes('버튼') || line.includes('클릭')
    );
    
    console.log('   관련 텍스트:');
    relevantLines.forEach((line, idx) => {
      console.log(`     ${idx + 1}. ${line.trim()}`);
    });

    // 9. 스크린샷 찍고 특정 영역 확인
    await page.screenshot({ path: 'detailed-ui-inspection.png', fullPage: true });
    console.log('9. 전체 페이지 스크린샷 저장 완료');

    // 10. React 컴포넌트 상태 확인 (개발 도구가 있다면)
    console.log('10. React 개발 도구 정보 확인 시도...');
    
    const reactInfo = await page.evaluate(() => {
      // React DevTools 또는 React 관련 정보 확인
      if (window.React) {
        return { hasReact: true, version: window.React.version };
      }
      
      // React Fiber 확인
      const rootNode = document.querySelector('#__next') || document.querySelector('#root');
      if (rootNode && rootNode._reactInternalFiber) {
        return { hasReactFiber: true };
      }
      
      // React 18+ 확인
      if (rootNode && rootNode._reactInternalInstance) {
        return { hasReactInstance: true };
      }
      
      return { reactDetected: false };
    });
    
    console.log('   React 정보:', reactInfo);
    
    console.log('🏁 상세 UI 구조 분석 완료');
    
  } catch (error) {
    console.error('❌ 분석 중 오류 발생:', error);
    await page.screenshot({ path: 'detailed-ui-inspection-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// 분석 실행
detailedUIInspection().catch(console.error);