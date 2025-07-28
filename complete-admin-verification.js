const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    console.log('🎯 3개 관리자 계정 완전 검증 - 크로미움 테스트');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 관리자 계정 정보
    const adminAccounts = [
        {
            email: 'admin1@innerspell.com',
            password: 'admin123',
            uid: 'gNFwHI2Z8Ofj7UgMPpPqG5Z58H73',
            name: 'Admin1'
        },
        {
            email: 'ceo@innerspell.com', 
            password: 'admin123',
            uid: 'MM9WwSWyUjQYhsGthtSOn3I8kdM2',
            name: 'CEO'
        },
        {
            email: 'admin@innerspell.com',
            password: 'admin123', 
            uid: 'qdrcDKB0snXFawsAiaMNZW3nnRZ2',
            name: 'Admin'
        }
    ];
    
    const vercelUrl = 'https://test-studio-firebase.vercel.app';
    const results = [];
    
    try {
        for (let i = 0; i < adminAccounts.length; i++) {
            const account = adminAccounts[i];
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🔍 ${i + 1}️⃣ ${account.name} 계정 검증 시작`);
            console.log(`📧 이메일: ${account.email}`);
            console.log(`🆔 UID: ${account.uid}`);
            console.log(`${'='.repeat(60)}`);
            
            const page = await context.newPage();
            const testResult = {
                account: account.name,
                email: account.email,
                uid: account.uid,
                success: false,
                details: {},
                errors: []
            };
            
            try {
                // 콘솔 메시지 수집
                const consoleMessages = [];
                page.on('console', (msg) => {
                    const text = msg.text();
                    if (text.includes('🔥') || text.includes('🎉') || text.includes('Firebase') || text.includes('Auth')) {
                        consoleMessages.push(`${msg.type()}: ${text}`);
                        console.log(`   BROWSER: ${text}`);
                    }
                });
                
                // 에러 수집
                page.on('pageerror', (error) => {
                    testResult.errors.push(error.message);
                    console.log(`   ERROR: ${error.message}`);
                });
                
                // 1. 로그인 페이지 접속
                console.log(`\n📱 1️⃣ Vercel 로그인 페이지 접속...`);
                await page.goto(`${vercelUrl}/sign-in`, { 
                    waitUntil: 'networkidle',
                    timeout: 30000 
                });
                
                await page.screenshot({ 
                    path: `verify-${account.name.toLowerCase()}-01-signin-${timestamp}.png`,
                    fullPage: true
                });
                
                console.log(`   ✅ ${account.name} 로그인 페이지 로드 완료`);
                
                // 2. 로그인 정보 입력
                console.log(`\n📝 2️⃣ ${account.name} 로그인 정보 입력...`);
                await page.waitForTimeout(2000);
                
                // 이메일 입력
                const emailInput = page.locator('input[type="email"], input[name="email"]').first();
                if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await emailInput.clear();
                    await emailInput.fill(account.email);
                    console.log(`   📧 이메일 입력: ${account.email}`);
                } else {
                    throw new Error('이메일 입력 필드를 찾을 수 없음');
                }
                
                // 비밀번호 입력
                const passwordInput = page.locator('input[type="password"]').first();
                if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await passwordInput.clear();
                    await passwordInput.fill(account.password);
                    console.log(`   🔐 비밀번호 입력: ${account.password}`);
                } else {
                    throw new Error('비밀번호 입력 필드를 찾을 수 없음');
                }
                
                await page.screenshot({ 
                    path: `verify-${account.name.toLowerCase()}-02-filled-${timestamp}.png`,
                    fullPage: true
                });
                
                // 3. 로그인 시도
                console.log(`\n🚀 3️⃣ ${account.name} 로그인 시도...`);
                
                const loginButton = page.locator('button[type="submit"]').first();
                if (await loginButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await loginButton.click();
                    console.log(`   🔄 로그인 버튼 클릭됨`);
                    
                    // 로그인 처리 대기
                    console.log(`   ⏳ Firebase 인증 및 리다이렉션 대기...`);
                    await page.waitForTimeout(10000);
                    
                    const currentUrl = page.url();
                    console.log(`   📍 로그인 후 URL: ${currentUrl}`);
                    
                    testResult.details.loginUrl = currentUrl;
                    
                    await page.screenshot({ 
                        path: `verify-${account.name.toLowerCase()}-03-after-login-${timestamp}.png`,
                        fullPage: true
                    });
                    
                    // 4. 로그인 성공 여부 확인
                    if (currentUrl.includes('/admin')) {
                        console.log(`   🎉 ${account.name} 관리자 페이지 리다이렉션 성공!`);
                        testResult.success = true;
                        testResult.details.redirectedToAdmin = true;
                        
                    } else if (currentUrl === `${vercelUrl}/` || currentUrl === vercelUrl) {
                        console.log(`   🎉 ${account.name} 메인 페이지 리다이렉션 성공!`);
                        testResult.details.redirectedToHome = true;
                        
                        // 관리자 페이지 수동 접근 시도
                        console.log(`   🔄 관리자 페이지 수동 접근 시도...`);
                        await page.goto(`${vercelUrl}/admin`, { 
                            waitUntil: 'networkidle',
                            timeout: 30000 
                        });
                        
                        await page.waitForTimeout(3000);
                        const adminUrl = page.url();
                        
                        if (adminUrl.includes('/admin')) {
                            console.log(`   ✅ ${account.name} 관리자 페이지 접근 성공!`);
                            testResult.success = true;
                            testResult.details.adminPageAccess = true;
                        } else {
                            console.log(`   ❌ ${account.name} 관리자 페이지 접근 실패`);
                            testResult.details.adminPageAccess = false;
                        }
                        
                    } else if (currentUrl.includes('/sign-in')) {
                        console.log(`   ❌ ${account.name} 로그인 실패 - 페이지 리다이렉션 안됨`);
                        testResult.details.loginFailed = true;
                        
                        // 에러 메시지 확인
                        const errorElements = await page.locator('.text-destructive, [role="alert"]').all();
                        for (const element of errorElements) {
                            const errorText = await element.textContent();
                            if (errorText && errorText.trim()) {
                                console.log(`   🚨 에러: ${errorText}`);
                                testResult.errors.push(errorText);
                            }
                        }
                        
                    } else {
                        console.log(`   🤔 ${account.name} 예상치 못한 리다이렉션: ${currentUrl}`);
                        testResult.details.unexpectedRedirect = currentUrl;
                    }
                    
                    // 5. 관리자 기능 확인 (성공한 경우)
                    if (testResult.success) {
                        console.log(`\n🎊 4️⃣ ${account.name} 관리자 기능 확인...`);
                        
                        // 현재 페이지가 /admin이 아니면 이동
                        if (!page.url().includes('/admin')) {
                            await page.goto(`${vercelUrl}/admin`);
                            await page.waitForTimeout(3000);
                        }
                        
                        await page.screenshot({ 
                            path: `verify-${account.name.toLowerCase()}-04-admin-page-${timestamp}.png`,
                            fullPage: true
                        });
                        
                        // 관리자 페이지 내용 확인
                        const pageContent = await page.textContent('body');
                        const hasAdminContent = pageContent.includes('관리자') || 
                                              pageContent.includes('Admin') || 
                                              pageContent.includes('Dashboard');
                        
                        testResult.details.hasAdminContent = hasAdminContent;
                        
                        if (hasAdminContent) {
                            console.log(`   ✅ ${account.name} 관리자 대시보드 콘텐츠 확인됨`);
                            
                            // 관리자 탭들 확인
                            const tabs = await page.locator('[role="tab"], button:has-text("블로그"), button:has-text("AI")').all();
                            testResult.details.adminTabsCount = tabs.length;
                            console.log(`   📋 ${account.name} 관리자 탭 수: ${tabs.length}개`);
                            
                        } else {
                            console.log(`   ⚠️ ${account.name} 관리자 페이지 콘텐츠 확인 필요`);
                        }
                    }
                    
                } else {
                    throw new Error('로그인 버튼을 찾을 수 없음');
                }
                
                testResult.details.consoleMessages = consoleMessages;
                
            } catch (error) {
                console.log(`   ❌ ${account.name} 테스트 중 오류: ${error.message}`);
                testResult.errors.push(error.message);
                
                await page.screenshot({ 
                    path: `verify-${account.name.toLowerCase()}-error-${timestamp}.png`,
                    fullPage: true 
                });
            }
            
            results.push(testResult);
            await page.close();
            
            console.log(`\n📊 ${account.name} 테스트 완료 - 성공: ${testResult.success ? '✅' : '❌'}`);
        }
        
        // 6. 종합 결과 분석 및 보고
        console.log(`\n${'='.repeat(80)}`);
        console.log('🎯 3개 관리자 계정 완전 검증 결과');
        console.log(`${'='.repeat(80)}`);
        
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        console.log(`\n📊 전체 성공률: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
        
        results.forEach((result, index) => {
            console.log(`\n${index + 1}️⃣ ${result.account} (${result.email}):`);
            console.log(`   🆔 UID: ${result.uid}`);
            console.log(`   ✅ 성공: ${result.success ? '성공' : '실패'}`);
            
            if (result.success) {
                console.log(`   🎊 상태: 로그인 및 관리자 기능 정상 작동`);
                if (result.details.redirectedToAdmin) {
                    console.log(`   🚀 자동 /admin 리다이렉션: 성공`);
                }
                if (result.details.adminPageAccess) {
                    console.log(`   🔑 관리자 페이지 접근: 성공`);
                }
                if (result.details.hasAdminContent) {
                    console.log(`   📋 관리자 콘텐츠 로드: 성공`);
                }
                if (result.details.adminTabsCount > 0) {
                    console.log(`   🎛️ 관리자 탭 수: ${result.details.adminTabsCount}개`);
                }
            } else {
                console.log(`   ❌ 문제점:`);
                if (result.details.loginFailed) {
                    console.log(`     - 로그인 실패`);
                }
                if (result.details.unexpectedRedirect) {
                    console.log(`     - 예상치 못한 리다이렉션: ${result.details.unexpectedRedirect}`);
                }
                if (result.errors.length > 0) {
                    console.log(`     - 에러들:`);
                    result.errors.forEach(error => {
                        console.log(`       * ${error}`);
                    });
                }
            }
        });
        
        console.log(`\n${'='.repeat(80)}`);
        
        if (successCount === totalCount) {
            console.log('🎊🎊🎊 모든 관리자 계정 로그인 완전 성공! 🎊🎊🎊');
            console.log('✅✅✅ admin@innerspell.com 로그인 문제 완전 해결! ✅✅✅');
            console.log('\n🎯 검증 완료된 관리자 계정들:');
            results.forEach(result => {
                if (result.success) {
                    console.log(`   ✅ ${result.email} (UID: ${result.uid})`);
                }
            });
        } else if (successCount > 0) {
            console.log(`🎉 ${successCount}개 계정 로그인 성공!`);
            console.log(`⚠️ ${totalCount - successCount}개 계정에서 문제 발견`);
        } else {
            console.log('❌ 모든 계정에서 로그인 실패');
            console.log('🔧 추가 디버깅이 필요합니다');
        }
        
        console.log(`\n📋 테스트 정보:`);
        console.log(`   🌐 테스트 URL: ${vercelUrl}`);
        console.log(`   ⏰ 테스트 시간: ${new Date().toLocaleString()}`);
        console.log(`   🔍 스크린샷: verify-*.png 파일들 확인`);
        
    } catch (error) {
        console.error('❌ 전체 검증 과정에서 오류:', error.message);
    } finally {
        console.log('\n⏳ 결과 확인을 위해 브라우저를 3분간 열어둡니다...');
        console.log('🔍 각 계정별로 추가 수동 테스트를 진행하세요.');
        
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 3개 관리자 계정 완전 검증 완료');
        }, 180000); // 3분
    }
})();