const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Firebase Console 접속 시작...');
    
    // Firebase Console URL로 이동
    await page.goto('https://console.firebase.google.com/project/innerspell-an7ce/settings/serviceaccounts/adminsdk', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // 페이지 로드 대기
    await page.waitForTimeout(5000);

    // 현재 URL 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);

    // 로그인 페이지인지 확인
    const isLoginPage = currentUrl.includes('accounts.google.com') || currentUrl.includes('signin');
    console.log('로그인 페이지 여부:', isLoginPage);

    // 첫 번째 스크린샷 - 초기 상태
    await page.screenshot({ 
      path: 'firebase-console-initial.png',
      fullPage: true 
    });
    console.log('초기 상태 스크린샷 저장: firebase-console-initial.png');

    if (isLoginPage) {
      console.log('\n로그인이 필요합니다.');
      console.log('Google 계정으로 로그인해주세요.');
      
      // 로그인 양식 확인
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');
      
      if (emailInput) {
        console.log('이메일 입력 필드 발견');
      }
      if (passwordInput) {
        console.log('비밀번호 입력 필드 발견');
      }
    } else {
      console.log('\n Firebase Console 페이지 분석 중...');
      
      // 프로젝트 이름 확인
      const projectName = await page.$eval('*[data-project-id]', el => el.getAttribute('data-project-id')).catch(() => null);
      if (projectName) {
        console.log('프로젝트 ID:', projectName);
      }

      // 서비스 계정 관련 요소 찾기
      const serviceAccountElements = await page.$$('text=/서비스 계정|Service Account/i');
      console.log('서비스 계정 관련 요소 수:', serviceAccountElements.length);

      // "새 비공개 키 생성" 버튼 찾기
      const generateKeyButton = await page.$('button:has-text("새 비공개 키 생성"), button:has-text("Generate new private key")');
      if (generateKeyButton) {
        console.log('"새 비공개 키 생성" 버튼 발견');
        const buttonText = await generateKeyButton.textContent();
        console.log('버튼 텍스트:', buttonText);
      }

      // 페이지 제목 확인
      const pageTitle = await page.title();
      console.log('페이지 제목:', pageTitle);

      // 서비스 계정 이메일 찾기
      const serviceAccountEmails = await page.$$eval('*[data-email], *[aria-label*="service account"]', 
        elements => elements.map(el => el.textContent || el.getAttribute('data-email'))
      ).catch(() => []);
      
      if (serviceAccountEmails.length > 0) {
        console.log('서비스 계정 이메일:', serviceAccountEmails);
      }
    }

    // 페이지 구조 확인을 위한 주요 텍스트 추출
    const pageText = await page.evaluate(() => {
      const texts = [];
      const elements = document.querySelectorAll('h1, h2, h3, button, a[role="button"]');
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 0 && text.length < 100) {
          texts.push(text);
        }
      });
      return texts.slice(0, 20); // 상위 20개만
    });

    console.log('\n페이지 주요 텍스트:');
    pageText.forEach(text => console.log('- ' + text));

    // 추가 대기 시간
    console.log('\n추가 로딩 대기 중...');
    await page.waitForTimeout(3000);

    // 최종 스크린샷
    await page.screenshot({ 
      path: 'firebase-console-final.png',
      fullPage: true 
    });
    console.log('최종 스크린샷 저장: firebase-console-final.png');

    // 네트워크 에러 확인
    page.on('requestfailed', request => {
      console.log('요청 실패:', request.url());
    });

    console.log('\n분석 완료. 브라우저를 30초 후에 닫습니다...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ 
      path: 'firebase-console-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();