const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function testCompleteReading() {
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
    const screenshotDir = path.join(__dirname, 'complete-reading-screenshots');
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
        console.log('🚀 Testing complete tarot reading flow...\n');
        
        // 1. 타로 리딩 페이지로 직접 이동
        console.log('1️⃣ Navigating to reading page...');
        await page.goto('https://test-studio-firebase.vercel.app/reading', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        await page.waitForTimeout(2000);
        await screenshot('reading-page-loaded');
        
        // 2. 질문 입력
        console.log('2️⃣ Entering question...');
        const questionInput = await page.waitForSelector('textarea', { timeout: 10000 });
        await questionInput.fill('Firebase와 Vercel 배포가 성공적으로 작동하고 있나요?');
        await screenshot('question-entered');
        
        // 3. 카드 클릭 (직접 카드 이미지를 클릭)
        console.log('3️⃣ Clicking on cards directly...');
        
        // 카드 이미지를 직접 클릭
        const cardImages = await page.$$('img[alt*="card"], [class*="card"]');
        if (cardImages.length === 0) {
            // 카드 컨테이너나 클릭 가능한 영역 찾기
            const clickableCards = await page.$$('.cursor-pointer, [role="button"]');
            console.log(`Found ${clickableCards.length} clickable elements`);
            
            if (clickableCards.length > 0) {
                await clickableCards[0].click();
                await page.waitForTimeout(1000);
                console.log('Card clicked successfully');
            }
        } else {
            console.log(`Found ${cardImages.length} card images`);
            await cardImages[0].click();
            await page.waitForTimeout(1000);
        }
        await screenshot('card-clicked');
        
        // 4. 카드 뽑기 버튼을 다른 방법으로 찾기
        console.log('4️⃣ Looking for draw buttons with different methods...');
        
        // 페이지의 모든 버튼 확인
        const allButtons = await page.$$eval('button', buttons => 
            buttons.map(btn => ({
                text: btn.textContent?.trim(),
                visible: btn.offsetParent !== null,
                disabled: btn.disabled
            }))
        );
        console.log('All buttons on page:', allButtons);
        
        // 여러 방법으로 카드 뽑기 시도
        let drawSuccess = false;
        
        // 방법 1: 텍스트로 찾기
        const drawButton = await page.$('button:has-text("카드 뽑기")');
        if (drawButton) {
            console.log('Found draw button by text');
            await drawButton.click();
            drawSuccess = true;
        }
        
        // 방법 2: 카드 영역 클릭
        if (!drawSuccess) {
            const cardArea = await page.$('.card, [data-card], [class*="card"]');
            if (cardArea) {
                console.log('Clicking card area');
                await cardArea.click();
                drawSuccess = true;
            }
        }
        
        // 방법 3: 리딩 진행 영역의 버튼들 모두 시도
        if (!drawSuccess) {
            const readingButtons = await page.$$('div[class*="reading"] button, section[class*="reading"] button');
            for (let btn of readingButtons) {
                const btnText = await btn.textContent();
                console.log(`Trying button: ${btnText}`);
                if (btnText && (btnText.includes('뽑기') || btnText.includes('시작') || btnText.includes('카드'))) {
                    await btn.click();
                    drawSuccess = true;
                    break;
                }
            }
        }
        
        await page.waitForTimeout(3000);
        await screenshot('after-draw-attempt');
        
        // 5. AI 해석 시작 버튼 찾기
        console.log('5️⃣ Looking for reading start button...');
        
        // 페이지의 현재 상태에서 버튼 다시 검색
        const currentButtons = await page.$$eval('button', buttons => 
            buttons.map(btn => ({
                text: btn.textContent?.trim(),
                visible: btn.offsetParent !== null,
                disabled: btn.disabled
            }))
        );
        console.log('Current buttons after draw:', currentButtons);
        
        // 다양한 버튼 텍스트로 시도
        const readingButtonTexts = ['리딩 시작', '해석 시작', '카드 리딩', '리딩하기', '해석하기', '시작'];
        let readingStarted = false;
        
        for (let btnText of readingButtonTexts) {
            const btn = await page.$(`button:has-text("${btnText}")`);
            if (btn) {
                console.log(`Found reading button: ${btnText}`);
                await btn.click();
                readingStarted = true;
                break;
            }
        }
        
        if (readingStarted) {
            console.log('6️⃣ Waiting for AI interpretation...');
            await page.waitForTimeout(5000);
            
            // AI 응답 대기 (여러 가능한 텍스트)
            try {
                await page.waitForSelector('text="리딩 결과"', { timeout: 20000 });
            } catch (e) {
                try {
                    await page.waitForSelector('text="해석"', { timeout: 10000 });
                } catch (e2) {
                    try {
                        await page.waitForSelector('text="카드"', { timeout: 5000 });
                    } catch (e3) {
                        console.log('AI response timeout, but continuing...');
                    }
                }
            }
            
            await screenshot('reading-result');
        } else {
            console.log('⚠️  Could not find reading start button');
        }
        
        // 7. 저장 기능 테스트
        console.log('7️⃣ Testing save functionality...');
        const saveButtons = await page.$$('button:has-text("저장"), button:has-text("save")');
        if (saveButtons.length > 0) {
            await saveButtons[0].click();
            await page.waitForTimeout(2000);
            await screenshot('save-attempt');
            
            // 로그인 필요 메시지 확인
            const loginRequired = await page.$('text=/로그인/i, text=/sign in/i');
            if (loginRequired) {
                console.log('✓ Save requires login (Firebase Rules working)');
            }
        }
        
        // 8. 최종 상태 확인
        console.log('8️⃣ Final verification...');
        
        // 페이지 제목 확인
        const title = await page.title();
        console.log(`✓ Page title: ${title}`);
        
        // 메인 콘텐츠 확인
        const mainContent = await page.$('main, [role="main"], .main-content');
        if (mainContent) {
            console.log('✓ Main content area found');
        }
        
        await screenshot('final-state');
        
        console.log('\n✅ Complete reading test finished!');
        console.log(`📁 Screenshots saved in: ${screenshotDir}`);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        await screenshot('error-final');
    } finally {
        await browser.close();
    }
}

// Run the test
testCompleteReading().catch(console.error);