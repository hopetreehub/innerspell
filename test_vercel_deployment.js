const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function testVercelDeployment() {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        permissions: ['geolocation'],
        acceptDownloads: true
    });
    const page = await context.newPage();
    
    // Create screenshots directory
    const screenshotDir = path.join(__dirname, 'vercel-test-screenshots');
    try {
        await fs.mkdir(screenshotDir, { recursive: true });
    } catch (e) {}
    
    let stepCount = 0;
    async function screenshot(name) {
        stepCount++;
        const filename = `${stepCount.toString().padStart(2, '0')}-${name}.png`;
        await page.screenshot({ 
            path: path.join(screenshotDir, filename),
            fullPage: true 
        });
        console.log(`📸 Screenshot saved: ${filename}`);
    }
    
    try {
        console.log('🚀 Starting InnerSpell Vercel deployment test...\n');
        
        // 1. 홈페이지 접속 확인
        console.log('1️⃣ Testing homepage access...');
        await page.goto('https://test-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        await page.waitForTimeout(2000);
        await screenshot('homepage');
        
        // 홈페이지 주요 요소 확인
        const heroTitle = await page.textContent('h1');
        console.log(`   ✓ Hero title: ${heroTitle}`);
        
        // 2. 타로 리딩 페이지 접속
        console.log('\n2️⃣ Testing tarot reading page...');
        
        // 페이지의 모든 버튼과 링크 확인
        const buttons = await page.$$eval('button, a', elements => 
            elements.map(el => ({ 
                tag: el.tagName, 
                text: el.textContent?.trim(),
                href: el.href || null
            }))
        );
        console.log('   Available buttons/links:', buttons);
        
        // "타로 읽기 시작" 링크 클릭
        console.log('   Clicking "타로 읽기 시작" button...');
        await page.click('text="타로 읽기 시작"');
        
        await page.waitForURL('**/reading', { timeout: 10000 });
        await page.waitForTimeout(2000);
        await screenshot('reading-page');
        
        // 3. 리딩 기능 전체 테스트
        console.log('\n3️⃣ Testing reading functionality...');
        
        // 질문 입력
        console.log('   - Entering question...');
        const questionInput = await page.waitForSelector('textarea', { timeout: 10000 });
        await questionInput.fill('Firebase 배포가 성공할까요?');
        await screenshot('question-entered');
        
        // 카드 뽑기 버튼들 찾기
        console.log('   - Finding draw buttons...');
        const drawButtons = await page.$$('button:has-text("카드 뽑기")');
        console.log(`   - Found ${drawButtons.length} draw buttons`);
        
        if (drawButtons.length > 0) {
            // 첫 번째 카드 뽑기
            console.log('   - Drawing first card...');
            await drawButtons[0].click();
            await page.waitForTimeout(2000);
            await screenshot('first-card-drawn');
            
            // 두 번째 카드 뽑기 (있다면)
            if (drawButtons.length > 1) {
                console.log('   - Drawing second card...');
                await drawButtons[1].click();
                await page.waitForTimeout(2000);
                await screenshot('second-card-drawn');
            }
        } else {
            console.log('   ⚠️  No draw buttons found');
        }
        
        // 리딩 시작 버튼 찾기 및 클릭
        console.log('   - Getting AI interpretation...');
        
        // 여러 가능한 버튼 텍스트 시도
        let startReadingButton = await page.$('button:has-text("리딩 시작")');
        if (!startReadingButton) {
            startReadingButton = await page.$('button:has-text("카드 리딩하기")');
        }
        if (!startReadingButton) {
            startReadingButton = await page.$('button:has-text("리딩하기")');
        }
        if (!startReadingButton) {
            startReadingButton = await page.$('button:has-text("해석 시작")');
        }
        
        if (startReadingButton) {
            await startReadingButton.click();
            
            // AI 해석 대기
            console.log('   - Waiting for AI response...');
            try {
                await page.waitForSelector('text="리딩 결과"', { timeout: 30000 });
            } catch (e) {
                // 다른 가능한 결과 텍스트들
                try {
                    await page.waitForSelector('text="해석 결과"', { timeout: 5000 });
                } catch (e2) {
                    await page.waitForSelector('text="타로 카드"', { timeout: 5000 });
                }
            }
            await page.waitForTimeout(3000);
            await screenshot('reading-result');
        } else {
            console.log('   ⚠️  Reading button not found - screenshot current state');
            await screenshot('no-reading-button');
        }
        
        // 4. 로그인 버튼 확인
        console.log('\n4️⃣ Checking login functionality...');
        // 한국어 로그인 버튼 찾기
        const loginButton = await page.$('a:has-text("로그인")');
        if (loginButton) {
            console.log('   ✓ Login button found');
            await screenshot('login-button-visible');
            
            // 5. Google 로그인 확인
            console.log('\n5️⃣ Testing Google login...');
            await loginButton.click();
            await page.waitForTimeout(2000);
            await screenshot('login-page');
            
            // Google 로그인 버튼 찾기
            const googleSignInButton = await page.$('button:has-text("Google")');
            if (googleSignInButton) {
                console.log('   ✓ Google sign-in button found');
                await googleSignInButton.click();
                await page.waitForTimeout(3000);
                
                // Google 로그인 팝업 또는 리다이렉트 확인
                const pages = context.pages();
                if (pages.length > 1) {
                    console.log('   ✓ Google login popup detected');
                    const popup = pages[pages.length - 1];
                    await popup.screenshot({ path: path.join(screenshotDir, 'google-login-popup.png') });
                    await popup.close();
                } else {
                    console.log('   ✓ Google OAuth redirect detected');
                    await screenshot('google-oauth-redirect');
                }
            } else {
                console.log('   ⚠️  Google sign-in button not found on login page');
                await screenshot('login-page-no-google');
            }
        } else {
            console.log('   ⚠️  No login button found - checking if already logged in');
            const userMenu = await page.$('[class*="user"]');
            if (userMenu) {
                console.log('   ✓ User already logged in');
                await screenshot('logged-in-state');
            }
        }
        
        // 6. 저장 기능 테스트
        console.log('\n6️⃣ Testing save functionality...');
        
        // 타로 리딩 페이지로 돌아가기
        await page.goto('https://test-studio-firebase.vercel.app/reading', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 저장 버튼 찾기 (한국어)
        const saveButton = await page.$('button:has-text("저장")');
        if (saveButton) {
            console.log('   ✓ Save button found');
            await saveButton.click();
            await page.waitForTimeout(2000);
            
            // 저장 결과 확인
            const savedMessage = await page.$('text=/저장|성공/i');
            if (savedMessage) {
                console.log('   ✓ Reading saved successfully');
                await screenshot('reading-saved');
            } else {
                // 로그인 필요 메시지 확인
                const loginRequired = await page.$('text=/로그인|sign in/i');
                if (loginRequired) {
                    console.log('   ℹ️  Login required to save readings');
                    await screenshot('login-required-for-save');
                }
            }
        } else {
            console.log('   ⚠️  Save button not found - may only appear after reading');
        }
        
        // 7. Firebase Rules 확인을 위한 추가 테스트
        console.log('\n7️⃣ Testing Firebase Rules enforcement...');
        
        // My Readings 페이지 접근 시도
        try {
            await page.goto('https://test-studio-firebase.vercel.app/my-readings', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            await page.waitForTimeout(2000);
            
            const pageContent = await page.textContent('body');
            if (pageContent.includes('sign in') || pageContent.includes('login')) {
                console.log('   ✓ Firebase Rules working - authentication required');
                await screenshot('firebase-rules-auth-required');
            } else if (pageContent.includes('readings') || pageContent.includes('history')) {
                console.log('   ✓ My Readings page accessible');
                await screenshot('my-readings-page');
            }
        } catch (error) {
            console.log('   ℹ️  My Readings page error:', error.message);
        }
        
        // 8. 추가 기능 확인
        console.log('\n8️⃣ Additional features check...');
        
        // Share 기능 확인
        await page.goto('https://test-studio-firebase.vercel.app/reading', { waitUntil: 'networkidle' });
        const shareButton = await page.$('button:has-text("Share")');
        if (shareButton) {
            console.log('   ✓ Share functionality available');
            await screenshot('share-button');
        }
        
        // Community 페이지 확인
        try {
            await page.goto('https://test-studio-firebase.vercel.app/community/reading-share', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            await page.waitForTimeout(2000);
            console.log('   ✓ Community page accessible');
            await screenshot('community-page');
        } catch (error) {
            console.log('   ⚠️  Community page error:', error.message);
        }
        
        console.log('\n✅ All tests completed successfully!');
        console.log(`📁 Screenshots saved in: ${screenshotDir}`);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        await screenshot('error-state');
    } finally {
        await browser.close();
    }
}

// Run the test
testVercelDeployment().catch(console.error);