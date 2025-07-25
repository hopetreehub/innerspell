const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false // 실제 브라우저 창을 띄워서 확인
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('1. 홈페이지 접속 테스트...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/01_homepage.png' });
    console.log('✓ 홈페이지 로드 완료');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    // 주요 요소들 확인
    console.log('\n2. 주요 요소 확인...');
    
    // 네비게이션 바 확인
    const navbar = await page.isVisible('nav');
    console.log(`네비게이션 바: ${navbar ? '있음' : '없음'}`);
    
    // 로그인/회원가입 버튼 확인
    const loginButton = await page.isVisible('text=로그인');
    const signUpButton = await page.isVisible('text=회원가입');
    console.log(`로그인 버튼: ${loginButton ? '있음' : '없음'}`);
    console.log(`회원가입 버튼: ${signUpButton ? '있음' : '없음'}`);
    
    // 타로 읽기 관련 요소 확인
    const tarotElements = await page.$$('text=/타로|Tarot/i');
    console.log(`타로 관련 요소: ${tarotElements.length}개 발견`);
    
    // 커뮤니티 링크 확인
    const communityLink = await page.isVisible('text=/커뮤니티|Community/i');
    console.log(`커뮤니티 링크: ${communityLink ? '있음' : '없음'}`);
    
    console.log('\n3. 타로 읽기 페이지 접속 테스트...');
    // 타로 읽기 페이지로 이동
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/02_reading_page.png' });
    console.log('✓ 타로 읽기 페이지 로드 완료');
    
    // 타로 읽기 페이지 요소 확인
    const questionInput = await page.isVisible('textarea, input[type="text"]');
    console.log(`질문 입력란: ${questionInput ? '있음' : '없음'}`);
    
    console.log('\n4. Firebase 연결 상태 확인...');
    // 콘솔 로그 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('콘솔 에러:', msg.text());
      }
    });
    
    // 네트워크 요청 확인 (Firebase 관련)
    const firebaseRequests = [];
    page.on('request', request => {
      if (request.url().includes('firebase') || request.url().includes('firebaseapp')) {
        firebaseRequests.push(request.url());
      }
    });
    
    // 페이지 새로고침하여 Firebase 요청 캡처
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log(`Firebase 관련 요청: ${firebaseRequests.length}개`);
    if (firebaseRequests.length > 0) {
      console.log('Firebase 연결 확인됨');
    }
    
    console.log('\n5. 현재 Git 상태에서 수정된 파일들 확인...');
    // Git status에서 확인된 수정된 파일들 중 주요 파일들
    const modifiedFiles = [
      'src/components/auth/SignInForm.tsx',
      'src/app/profile/page.tsx',
      'src/app/community/post/[postId]/page.tsx',
      'src/lib/firebase/client.ts'
    ];
    
    console.log('주요 수정 파일들:');
    modifiedFiles.forEach(file => console.log(`- ${file}`));
    
    console.log('\n테스트 완료!');
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'screenshots/error.png' });
  } finally {
    // 브라우저는 열어둔 상태로 유지 (수동 확인 가능)
    console.log('\n브라우저를 열어둔 상태입니다. 수동으로 확인 후 닫아주세요.');
    // await browser.close();
  }
})();