const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('브라우저 시작...');
  
  try {
    // 페이지 이동
    console.log('타로리딩 페이지로 이동 중...');
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 페이지 로딩 완료 후 3초 대기
    console.log('페이지 로딩 완료, 3초 대기 중...');
    await page.waitForTimeout(3000);
    
    // 타임스탬프 생성
    const timestamp = Date.now();
    const screenshotPath = `screenshots/reading-page-verification-${timestamp}.png`;
    
    // 풀페이지 스크린샷 촬영
    console.log('풀페이지 스크린샷 촬영 중...');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`스크린샷 저장 완료: ${screenshotPath}`);
    
    // 페이지 URL 확인
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);
    
    // 페이지 제목 확인
    const pageTitle = await page.title();
    console.log(`페이지 제목: ${pageTitle}`);
    
    // HTML 내용의 일부 확인
    const bodyText = await page.evaluate(() => {
      return document.body ? document.body.innerText.substring(0, 500) : 'No body content';
    });
    console.log(`페이지 내용 미리보기:\n${bodyText}...`);
    
    // 주요 요소 확인
    console.log('\n=== 주요 요소 확인 ===');
    
    // 1. 타로 카드 관련 요소 확인 (더 광범위한 선택자 사용)
    const allElements = await page.$$('*');
    console.log(`총 HTML 요소 개수: ${allElements.length}`);
    
    // 카드 관련 클래스들 확인
    const cardSelectors = [
      '.card', '.tarot-card', '.card-back', '.card-front',
      '[class*="card"]', '[class*="tarot"]', '[data-card]'
    ];
    
    for (const selector of cardSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`${selector}: ${elements.length}개 요소 발견`);
        }
      } catch (err) {
        // 선택자가 유효하지 않은 경우 무시
      }
    }
    
    // 2. 입력 필드 확인
    const inputSelectors = [
      'input', 'textarea', '[type="text"]', '[placeholder*="질문"]',
      '[placeholder*="question"]', '[placeholder*="입력"]'
    ];
    
    for (const selector of inputSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`입력 필드 ${selector}: ${elements.length}개 발견`);
        }
      } catch (err) {
        // 선택자가 유효하지 않은 경우 무시
      }
    }
    
    // 3. 버튼 요소 확인
    const buttons = await page.$$('button');
    console.log(`버튼 개수: ${buttons.length}개`);
    
    // 4. 이미지 요소 확인
    const images = await page.$$('img');
    console.log(`이미지 개수: ${images.length}개`);
    
    // 5. React 관련 요소 확인
    const reactElements = await page.$$('[data-reactroot], #__next, [id*="react"]');
    console.log(`React 관련 요소: ${reactElements.length}개`);
    
    // DOM 구조 확인
    const domStructure = await page.evaluate(() => {
      const getElementInfo = (element, depth = 0) => {
        if (depth > 3) return '...'; // 깊이 제한
        
        const tagName = element.tagName.toLowerCase();
        const className = element.className || '';
        const id = element.id || '';
        const children = Array.from(element.children);
        
        let info = '  '.repeat(depth) + `<${tagName}`;
        if (id) info += ` id="${id}"`;
        if (className) info += ` class="${className}"`;
        info += '>';
        
        if (children.length > 0 && depth < 3) {
          for (const child of children.slice(0, 5)) { // 최대 5개 자식만
            info += '\n' + getElementInfo(child, depth + 1);
          }
          if (children.length > 5) {
            info += '\n' + '  '.repeat(depth + 1) + '...';
          }
        }
        
        return info;
      };
      
      return getElementInfo(document.body);
    });
    
    console.log('\n=== DOM 구조 ===');
    console.log(domStructure);
    
  } catch (error) {
    console.error('오류 발생:', error);
    
    // 오류 시 스크린샷
    const errorScreenshot = `screenshots/reading-page-error-${Date.now()}.png`;
    await page.screenshot({ path: errorScreenshot, fullPage: true });
    console.log(`오류 스크린샷 저장: ${errorScreenshot}`);
  } finally {
    console.log('\n5초 후 브라우저 종료...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();