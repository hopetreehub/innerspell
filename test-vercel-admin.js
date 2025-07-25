const { chromium } = require('playwright');
const path = require('path');

async function testVercelAdmin() {
    console.log('🚀 Vercel 배포 관리자 기능 테스트 시작');
    console.log('📅 테스트 시작 시간:', new Date().toLocaleString('ko-KR'));
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true
    });
    
    const page = await context.newPage();
    
    // 콘솔 로그 캡처
    page.on('console', msg => {
        console.log(`🖥️  Console [${msg.type()}]:`, msg.text());
    });
    
    page.on('pageerror', error => {
        console.error('❌ Page Error:', error.message);
    });
    
    try {
        console.log('\n📍 Step 1: Vercel 홈페이지 접속 테스트');
        await page.goto('https://test-studio-firebase-dv6t222z9-johns-projects-bf5e60f3.vercel.app/', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/vercel-test-01-homepage.png',
            fullPage: true 
        });
        console.log('✅ 홈페이지 접속 성공');
        
        console.log('\n📍 Step 2: 로그인 페이지로 이동');
        // 로그인 버튼 찾기
        const loginButton = await page.locator('text=로그인').or(page.locator('text=Login')).or(page.locator('[href*="login"]')).first();
        if (await loginButton.isVisible({ timeout: 5000 })) {
            await loginButton.click();
            await page.waitForLoadState('networkidle');
        } else {
            // 직접 로그인 페이지로 이동
            await page.goto('https://test-studio-firebase-dv6t222z9-johns-projects-bf5e60f3.vercel.app/login');
            await page.waitForLoadState('networkidle');
        }
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/vercel-test-02-login-page.png',
            fullPage: true 
        });
        console.log('✅ 로그인 페이지 접속 성공');
        
        console.log('\n📍 Step 3: 관리자 계정으로 로그인');
        // Firebase Auth UI 확인
        await page.waitForSelector('[data-testid="email-input"], input[type="email"], #email', { timeout: 10000 });
        
        // 이메일 입력
        const emailInput = await page.locator('[data-testid="email-input"], input[type="email"], #email').first();
        await emailInput.fill('admin@innerspell.com');
        console.log('✅ 관리자 이메일 입력 완료');
        
        // 비밀번호 입력
        const passwordInput = await page.locator('[data-testid="password-input"], input[type="password"], #password').first();
        await passwordInput.fill('admin123!');
        console.log('✅ 관리자 비밀번호 입력 완료');
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/vercel-test-03-login-form.png',
            fullPage: true 
        });
        
        // 로그인 버튼 클릭
        const submitButton = await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').first();
        await submitButton.click();
        
        // 로그인 완료 대기
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/vercel-test-04-after-login.png',
            fullPage: true 
        });
        console.log('✅ 로그인 시도 완료');
        
        console.log('\n📍 Step 4: 관리자 페이지 직접 접속');
        await page.goto('https://test-studio-firebase-dv6t222z9-johns-projects-bf5e60f3.vercel.app/admin', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/vercel-test-05-admin-page.png',
            fullPage: true 
        });
        
        // 관리자 페이지 요소 확인
        const pageTitle = await page.title();
        console.log('📄 페이지 제목:', pageTitle);
        
        const currentUrl = page.url();
        console.log('🔗 현재 URL:', currentUrl);
        
        // 관리자 권한 확인 요소들 체크
        console.log('\n📍 Step 5: 관리자 권한 확인');
        
        const adminElements = [
            'text=관리자',
            'text=Admin',
            'text=사용자 관리',
            'text=User Management',
            'text=시스템 설정',
            'text=System Settings',
            '[data-testid="admin-panel"]',
            '.admin-dashboard',
            '#admin-content'
        ];
        
        let adminAccessConfirmed = false;
        for (const selector of adminElements) {
            try {
                const element = await page.locator(selector).first();
                if (await element.isVisible({ timeout: 2000 })) {
                    console.log(`✅ 관리자 요소 발견: ${selector}`);
                    adminAccessConfirmed = true;
                    break;
                }
            } catch (e) {
                // 요소를 찾지 못한 경우 무시
            }
        }
        
        if (!adminAccessConfirmed) {
            console.log('⚠️  관리자 전용 요소를 찾지 못했습니다. 일반 사용자로 로그인되었을 수 있습니다.');
        }
        
        console.log('\n📍 Step 6: 환경변수 및 Firebase 연결 테스트');
        
        // 개발자 도구에서 환경변수 확인
        const envCheck = await page.evaluate(() => {
            return {
                hasFirebaseConfig: !!window.firebaseConfig,
                currentUser: window.firebase?.auth?.currentUser?.email || 'No user',
                timestamp: new Date().toISOString()
            };
        });
        
        console.log('🔧 환경 확인:', envCheck);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/vercel-test-final.png',
            fullPage: true 
        });
        
        console.log('\n✅ Vercel 배포 관리자 기능 테스트 완료');
        console.log('📸 스크린샷이 저장되었습니다:');
        console.log('  - vercel-test-01-homepage.png');
        console.log('  - vercel-test-02-login-page.png');
        console.log('  - vercel-test-03-login-form.png');
        console.log('  - vercel-test-04-after-login.png');
        console.log('  - vercel-test-05-admin-page.png');
        console.log('  - vercel-test-final.png');
        
        // 5초 대기 후 브라우저 종료
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/vercel-test-error.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
        console.log('🔚 브라우저 종료 완료');
    }
}

testVercelAdmin().catch(console.error);