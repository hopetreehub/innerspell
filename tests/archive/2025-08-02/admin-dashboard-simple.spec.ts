import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';
const SCREENSHOTS_DIR = 'screenshots/admin-dashboard-simple';

// 스크린샷 디렉토리 생성
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test.describe('관리자 대시보드 간단 테스트', () => {
  test('관리자 로그인 및 대시보드 확인', async ({ page }) => {
    console.log('테스트 시작: 관리자 로그인 및 대시보드 확인');
    
    // 1. 관리자 페이지로 이동
    await page.goto(`${VERCEL_URL}/admin`);
    await page.waitForLoadState('networkidle');
    
    // 로그인 페이지 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '01-login-page.png'),
      fullPage: true 
    });
    console.log('✅ 로그인 페이지 스크린샷 저장');
    
    // 2. 이메일 입력
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('admin@test.com');
    
    // 3. 비밀번호 입력
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('test123');
    
    // 입력 완료 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '02-login-filled.png'),
      fullPage: true 
    });
    console.log('✅ 로그인 정보 입력 완료');
    
    // 4. 로그인 버튼 클릭
    const loginButton = page.locator('button', { hasText: '로그인' });
    await loginButton.click();
    
    // 로그인 후 대기
    await page.waitForTimeout(3000);
    
    // 5. 로그인 후 페이지 확인
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);
    
    // 로그인 후 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '03-after-login.png'),
      fullPage: true 
    });
    
    // 6. 관리자 대시보드 요소 확인
    try {
      // 대시보드 제목 확인
      const dashboardTitle = page.locator('h1', { hasText: '관리자 대시보드' });
      if (await dashboardTitle.count() > 0) {
        console.log('✅ 관리자 대시보드 접근 성공');
        
        // 탭 확인
        const tabs = ['통계', 'AI 공급자', '환경변수', '시스템', '타로 지침'];
        for (const tabName of tabs) {
          const tab = page.locator('button[role="tab"]', { hasText: tabName });
          if (await tab.count() > 0) {
            console.log(`  ✓ ${tabName} 탭 확인됨`);
          }
        }
        
        // 각 탭 클릭하여 스크린샷 저장
        for (let i = 0; i < tabs.length; i++) {
          const tabName = tabs[i];
          const tab = page.locator('button[role="tab"]', { hasText: tabName });
          
          if (await tab.count() > 0) {
            await tab.click();
            await page.waitForTimeout(1000);
            
            await page.screenshot({ 
              path: path.join(SCREENSHOTS_DIR, `04-tab-${i + 1}-${tabName}.png`),
              fullPage: true 
            });
            console.log(`✅ ${tabName} 탭 스크린샷 저장`);
          }
        }
      } else {
        console.log('❌ 관리자 대시보드를 찾을 수 없습니다');
        
        // 에러 메시지 확인
        const errorMessages = await page.locator('text=/error|오류|권한/i').all();
        for (const error of errorMessages) {
          const errorText = await error.textContent();
          console.log(`  에러 메시지: ${errorText}`);
        }
      }
    } catch (error) {
      console.error('대시보드 확인 중 에러:', error);
    }
    
    // 7. 최종 상태 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '05-final-state.png'),
      fullPage: true 
    });
    
    console.log('테스트 완료');
  });
});

test.afterAll(async () => {
  console.log('\n=== 테스트 요약 ===');
  console.log(`스크린샷 저장 위치: ${SCREENSHOTS_DIR}`);
  
  // 생성된 스크린샷 목록 출력
  const files = fs.readdirSync(SCREENSHOTS_DIR);
  console.log('생성된 스크린샷:');
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
});