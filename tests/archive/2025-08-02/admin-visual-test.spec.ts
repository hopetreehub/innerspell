import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';
const SCREENSHOTS_DIR = 'screenshots/admin-visual';

// 스크린샷 디렉토리 생성
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test.describe('관리자 대시보드 시각적 확인', () => {
  test('관리자 페이지 UI 요소 캡처', async ({ page }) => {
    console.log('=== 관리자 대시보드 시각적 테스트 시작 ===\n');
    
    // 1. 메인 페이지
    console.log('1. 메인 페이지 접속...');
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '01-main-page.png'),
      fullPage: true 
    });
    console.log('✅ 메인 페이지 스크린샷 저장\n');
    
    // 2. 관리자 페이지 (로그인 화면)
    console.log('2. 관리자 페이지 접속...');
    await page.goto(`${VERCEL_URL}/admin`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '02-admin-login.png'),
      fullPage: true 
    });
    console.log('✅ 관리자 로그인 페이지 스크린샷 저장');
    console.log('   - "다시 오신 것을 환영합니다" 메시지 확인');
    console.log('   - 이메일/비밀번호 입력 폼 확인');
    console.log('   - Google 로그인 버튼 확인\n');
    
    // 3. 기타 공개 페이지들
    const publicPages = [
      { path: '/about', name: '소개' },
      { path: '/blog', name: '블로그' },
      { path: '/faq', name: 'FAQ' }
    ];
    
    for (const pageInfo of publicPages) {
      console.log(`${publicPages.indexOf(pageInfo) + 3}. ${pageInfo.name} 페이지 접속...`);
      await page.goto(`${VERCEL_URL}${pageInfo.path}`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `0${publicPages.indexOf(pageInfo) + 3}-${pageInfo.path.substring(1)}-page.png`),
        fullPage: true 
      });
      console.log(`✅ ${pageInfo.name} 페이지 스크린샷 저장\n`);
    }
    
    // 4. 모바일 반응형 확인
    console.log('6. 모바일 반응형 디자인 확인...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${VERCEL_URL}/admin`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '06-admin-mobile.png'),
      fullPage: true 
    });
    console.log('✅ 모바일 뷰 스크린샷 저장\n');
    
    console.log('=== 테스트 완료 ===\n');
    console.log('📸 스크린샷 저장 위치:', SCREENSHOTS_DIR);
    console.log('\n생성된 스크린샷:');
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    files.forEach(file => {
      console.log(`  - ${file}`);
    });
    
    console.log('\n💡 관리자 대시보드 접근 방법:');
    console.log('   1. Firebase Console에서 관리자 계정 생성');
    console.log('   2. Firestore에서 해당 사용자의 role을 "admin"으로 설정');
    console.log('   3. 관리자 계정으로 로그인하여 대시보드 접근');
  });
});