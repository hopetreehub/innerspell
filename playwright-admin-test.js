const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAdminPanel() {
  // 스크린샷 저장 디렉토리 생성
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 각 액션 사이에 1초 대기
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    console.log('1. 메인 사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotDir, '01-main-page.png') });
    console.log('✓ 메인 페이지 스크린샷 저장됨');

    console.log('2. /admin 경로로 이동 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotDir, '02-admin-page-initial.png') });
    console.log('✓ 관리자 페이지 초기 화면 스크린샷 저장됨');

    // 페이지 제목과 내용 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);

    // 로그인 관련 요소 확인
    const loginElements = await page.$$eval('*', elements => {
      return elements.filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        const id = el.id?.toLowerCase() || '';
        const className = (typeof el.className === 'string' ? el.className : '').toLowerCase();
        return text.includes('login') || text.includes('로그인') || 
               text.includes('sign in') || text.includes('google') ||
               id.includes('login') || className.includes('login');
      }).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim() || '',
        id: el.id || '',
        className: typeof el.className === 'string' ? el.className : ''
      }));
    });

    if (loginElements.length > 0) {
      console.log('3. 로그인 관련 요소 발견:');
      loginElements.forEach((el, i) => {
        console.log(`   ${i+1}. ${el.tag}: "${el.text}" (id: ${el.id}, class: ${el.className})`);
      });
    }

    // Google 로그인 버튼 찾기
    const googleLoginButton = await page.$('button:has-text("Google"), button:has-text("로그인"), [class*="google"], [id*="google"]');
    if (googleLoginButton) {
      console.log('4. Google 로그인 버튼 발견, 클릭 시도...');
      await googleLoginButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotDir, '03-after-login-attempt.png') });
      console.log('✓ 로그인 시도 후 스크린샷 저장됨');
    } else {
      console.log('4. 로그인 버튼을 찾을 수 없음, 현재 상태 확인...');
    }

    // 현재 페이지의 모든 텍스트 내용 확인
    const pageContent = await page.evaluate(() => {
      return {
        bodyText: document.body.innerText,
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent?.trim()),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()),
        links: Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.textContent?.trim(),
          href: a.href
        }))
      };
    });

    console.log('5. 페이지 내용 분석:');
    console.log('   제목들:', pageContent.headings.filter(h => h));
    console.log('   버튼들:', pageContent.buttons.filter(b => b));
    console.log('   링크들:', pageContent.links.filter(l => l.text).slice(0, 10)); // 처음 10개만

    // 타로 지침 관리 관련 요소 찾기
    const tarotElements = await page.$$eval('*', elements => {
      return elements.filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('타로') || text.includes('지침') || text.includes('관리') ||
               text.includes('tarot') || text.includes('guide');
      }).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim() || '',
        id: el.id || '',
        className: typeof el.className === 'string' ? el.className : ''
      }));
    });

    if (tarotElements.length > 0) {
      console.log('6. 타로 관련 요소 발견:');
      tarotElements.forEach((el, i) => {
        console.log(`   ${i+1}. ${el.tag}: "${el.text}"`);
      });

      // 타로 지침 관리 링크나 탭 클릭 시도
      const tarotManagementLink = await page.$('a:has-text("타로"), button:has-text("타로"), [href*="tarot"], [href*="guide"]');
      if (tarotManagementLink) {
        console.log('7. 타로 지침 관리 링크 클릭...');
        await tarotManagementLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: path.join(screenshotDir, '04-tarot-management.png') });
        console.log('✓ 타로 지침 관리 화면 스크린샷 저장됨');
      }
    } else {
      console.log('6. 타로 관련 요소를 찾을 수 없음');
    }

    // 통계 정보 찾기
    const statsElements = await page.$$eval('*', elements => {
      return elements.filter(el => {
        const text = el.textContent || '';
        return /\d+%/.test(text) || /\d+\/\d+/.test(text) || 
               text.includes('완성') || text.includes('진행') ||
               text.includes('개수') || text.includes('총');
      }).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim()
      }));
    });

    if (statsElements.length > 0) {
      console.log('8. 통계 정보 발견:');
      statsElements.forEach((el, i) => {
        console.log(`   ${i+1}. ${el.text}`);
      });
    }

    // 최종 스크린샷
    await page.screenshot({ path: path.join(screenshotDir, '05-final-state.png') });
    console.log('✓ 최종 상태 스크린샷 저장됨');

    // 현재 URL 확인
    console.log(`최종 URL: ${page.url()}`);

  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: path.join(screenshotDir, 'error-screenshot.png') });
  } finally {
    await browser.close();
  }
}

testAdminPanel().catch(console.error);