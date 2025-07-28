const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🎯 Vercel 배포에서 admin@innerspell.com 로그인 최종 테스트');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // Vercel 배포 URL 확인 (최신 배포를 사용)
        const vercelUrl = 'https://test-studio-firebase.vercel.app'; // 기본 도메인 사용
        
        console.log('\n1️⃣ Vercel 배포 사이트 접속...');
        console.log(`🌐 URL: ${vercelUrl}/sign-in`);
        
        await page.goto(`${vercelUrl}/sign-in`, { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        await page.screenshot({ 
            path: `vercel-admin-test-01-signin-${timestamp}.png`,
            fullPage: true
        });
        
        // 콘솔 메시지 수집
        page.on('console', (msg) => {
            if (msg.text().includes('🔥') || msg.text().includes('Firebase') || msg.text().includes('Auth') || msg.text().includes('🎉')) {
                console.log(`VERCEL: ${msg.text()}`);
            }
        });
        
        // 2. 관리자 계정 정보 입력
        console.log('\n2️⃣ 관리자 계정 정보 입력...');
        
        // 페이지 로딩 대기
        await page.waitForTimeout(3000);
        
        const emailInput = await page.locator('input[type="email"]').first();
        const passwordInput = await page.locator('input[type="password"]').first();
        
        if (await emailInput.isVisible()) {
            await emailInput.fill('admin@innerspell.com');
            console.log('   ✅ 이메일 입력: admin@innerspell.com');
        }
        
        if (await passwordInput.isVisible()) {
            await passwordInput.fill('admin123');
            console.log('   ✅ 비밀번호 입력: admin123');
        }
        
        await page.screenshot({ 
            path: `vercel-admin-test-02-filled-${timestamp}.png`,
            fullPage: true
        });
        
        // 3. 로그인 시도
        console.log('\n3️⃣ 로그인 시도...');
        const loginButton = await page.locator('button[type="submit"]').first();
        
        if (await loginButton.isVisible()) {
            await loginButton.click();
            console.log('   ✅ 로그인 버튼 클릭됨');
            
            // 로그인 처리 및 리다이렉션 대기
            console.log('   ⏳ 로그인 처리 및 리다이렉션 대기...');
            await page.waitForTimeout(5000);
            
            // 현재 URL 확인
            const currentUrl = page.url();
            console.log(`📍 현재 URL: ${currentUrl}`);
            
            await page.screenshot({ 
                path: `vercel-admin-test-03-after-login-${timestamp}.png`,
                fullPage: true
            });
            
            // 성공 여부 판단
            if (currentUrl.includes('/admin') || currentUrl === `${vercelUrl}/`) {
                console.log('🎉🎊🎉 Vercel에서 admin@innerspell.com 로그인 성공! 🎉🎊🎉');
                
                // 4. 관리자 페이지 접근 테스트
                if (!currentUrl.includes('/admin')) {
                    console.log('\n4️⃣ 관리자 페이지 직접 접근 테스트...');
                    await page.goto(`${vercelUrl}/admin`, { 
                        waitUntil: 'networkidle',
                        timeout: 30000 
                    });
                    
                    await page.waitForTimeout(3000);
                }
                
                await page.screenshot({ 
                    path: `vercel-admin-test-04-admin-page-${timestamp}.png`,
                    fullPage: true
                });
                
                // 관리자 페이지 내용 확인
                const pageContent = await page.textContent('body');
                if (pageContent.includes('관리자') || pageContent.includes('Admin') || pageContent.includes('Dashboard')) {
                    console.log('🎊🎊🎊 Vercel 관리자 페이지 접근 성공! 🎊🎊🎊');
                    console.log('✅✅✅ admin@innerspell.com 로그인 문제 완전 해결! ✅✅✅');
                    
                    // 관리자 기능 테스트
                    console.log('\n5️⃣ 관리자 기능 확인...');
                    
                    // 탭 버튼들 확인
                    const tabs = await page.locator('[role="tab"], button:has-text("블로그"), button:has-text("AI")').all();
                    console.log(`   📋 관리자 탭 수: ${tabs.length}개`);
                    
                    if (tabs.length > 0) {
                        console.log('   ✅ 관리자 인터페이스 정상 로드됨');
                    }
                    
                } else {
                    console.log('⚠️ 관리자 페이지 콘텐츠 확인 필요');
                    console.log('페이지 내용 미리보기:', pageContent.substring(0, 200));
                }
                
            } else {
                console.log('❌ 로그인 후 리다이렉션 실패');
                console.log(`Expected: ${vercelUrl}/admin or ${vercelUrl}/`);
                console.log(`Actual: ${currentUrl}`);
                
                // 에러 메시지 확인
                const errorElements = await page.locator('.text-destructive, [role="alert"], .error').all();
                for (const element of errorElements) {
                    const errorText = await element.textContent();
                    if (errorText && errorText.trim()) {
                        console.log(`🚨 에러 메시지: ${errorText}`);
                    }
                }
            }
            
        } else {
            console.log('❌ 로그인 버튼을 찾을 수 없음');
        }
        
        console.log('\n📋 Vercel 테스트 결과:');
        console.log('   🌐 배포 URL:', vercelUrl);
        console.log('   📧 계정: admin@innerspell.com');
        console.log('   🔐 비밀번호: admin123');
        console.log(`   📍 최종 URL: ${page.url()}`);
        console.log(`   🆔 UID: qdrcDKB0snXFawsAiaMNZW3nnRZ2`);
        
    } catch (error) {
        console.error('❌ Vercel 테스트 중 오류:', error.message);
        await page.screenshot({ 
            path: `vercel-admin-test-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        console.log('\n⏳ 결과 확인을 위해 브라우저를 2분간 열어둡니다...');
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 Vercel 테스트 완료');
        }, 120000);
    }
})();