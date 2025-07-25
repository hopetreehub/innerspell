const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'share-clipboard-test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testShareWithClipboard() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 },
        // 클립보드 권한 부여
        permissions: ['clipboard-read', 'clipboard-write']
    });
    
    const page = await context.newPage();
    
    try {
        console.log('📋 클립보드 기반 공유 기능 테스트 시작...');
        
        // 1-5단계: 타로 리딩 완료까지
        await page.goto('http://localhost:4000/reading', { timeout: 90000 });
        await page.waitForLoadState('networkidle', { timeout: 90000 });
        
        const questionInput = page.locator('textarea');
        await questionInput.fill('내 미래는 어떻게 될까요?');
        
        const shuffleButton = page.locator('button:has-text("섞기")').first();
        await shuffleButton.click();
        await page.waitForTimeout(2000);
        
        const dealButton = page.locator('button:has-text("펼치기")').first();
        await dealButton.click();
        await page.waitForTimeout(3000);
        
        const cards = page.locator('.card, [class*="card"], div[role="button"]:has(img)');
        const cardCount = await cards.count();
        console.log(`찾은 카드 수: ${cardCount}`);
        
        const cardIndices = [8, 40, 72];
        for (let i = 0; i < cardIndices.length; i++) {
            const cardIndex = cardIndices[i];
            console.log(`${i + 1}번째 카드 선택 (인덱스: ${cardIndex})`);
            
            const card = cards.nth(cardIndex);
            await card.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await card.click({ force: true });
            await page.waitForTimeout(2000);
        }
        
        // AI 해석 받기
        console.log('🤖 AI 해석 받기');
        const interpretButton = page.locator('button:has-text("AI 해석 받기")').first();
        await interpretButton.click();
        await page.waitForTimeout(10000); // 해석 완료 대기
        
        await page.screenshot({
            path: path.join(screenshotDir, '01_before_share.png'),
            fullPage: true
        });
        
        // 토스트 메시지 관찰을 위한 리스너 설정
        const toastMessages = [];
        page.on('console', msg => {
            if (msg.type() === 'log' || msg.type() === 'info') {
                console.log(`[BROWSER LOG] ${msg.text()}`);
            }
        });
        
        // 공유 버튼 클릭
        console.log('🔗 공유 버튼 클릭');
        const shareButton = page.locator('button:has-text("리딩 공유하기")').first();
        await shareButton.click();
        
        // 공유 처리 완료 대기
        console.log('⏳ 공유 처리 대기 중...');
        await page.waitForTimeout(5000);
        
        await page.screenshot({
            path: path.join(screenshotDir, '02_after_share_click.png'),
            fullPage: true
        });
        
        // 토스트 메시지 확인
        const toastSelector = '[class*="toast"], [role="status"], .sonner-toast, .toast';
        const toastCount = await page.locator(toastSelector).count();
        console.log(`🍞 토스트 메시지 수: ${toastCount}`);
        
        if (toastCount > 0) {
            for (let i = 0; i < toastCount; i++) {
                try {
                    const toastText = await page.locator(toastSelector).nth(i).textContent();
                    console.log(`토스트 ${i + 1}: ${toastText}`);
                } catch (e) {
                    // 무시
                }
            }
        }
        
        // 클립보드에서 공유 URL 가져오기
        console.log('📋 클립보드에서 공유 URL 가져오기');
        try {
            const clipboardContent = await page.evaluate(async () => {
                try {
                    return await navigator.clipboard.readText();
                } catch (e) {
                    return null;
                }
            });
            
            console.log(`📋 클립보드 내용: ${clipboardContent}`);
            
            if (clipboardContent && (clipboardContent.includes('/shared/') || clipboardContent.includes('localhost:4000'))) {
                console.log('✅ 클립보드에서 공유 URL 발견!');
                
                let shareUrl = clipboardContent.trim();
                
                // 상대 경로인 경우 절대 경로로 변환
                if (shareUrl.startsWith('/')) {
                    shareUrl = `http://localhost:4000${shareUrl}`;
                }
                
                console.log(`🔗 공유 URL: ${shareUrl}`);
                
                // 공유 URL로 새 탭에서 접속
                console.log('🌐 공유 URL로 새 탭에서 접속');
                const sharePage = await context.newPage();
                
                try {
                    await sharePage.goto(shareUrl, { timeout: 30000 });
                    await sharePage.waitForLoadState('networkidle', { timeout: 30000 });
                    
                    await sharePage.screenshot({
                        path: path.join(screenshotDir, '03_shared_reading_page.png'),
                        fullPage: true
                    });
                    
                    // 공유 페이지 내용 확인
                    const sharedPageTitle = await sharePage.title();
                    const sharedPageContent = await sharePage.textContent('body');
                    
                    console.log(`📄 공유 페이지 제목: ${sharedPageTitle}`);
                    console.log(`📝 공유 페이지에 타로 관련 내용 포함: ${sharedPageContent.includes('타로') || sharedPageContent.includes('카드')}`);
                    
                    // 공유 페이지에서 카드들이 보이는지 확인
                    const sharedCards = await sharePage.locator('img[alt*="카드"], img[src*="tarot"], .card, img[alt*="Card"]').count();
                    console.log(`🃏 공유 페이지에서 발견된 카드 수: ${sharedCards}`);
                    
                    // 질문이 표시되는지 확인
                    const hasQuestion = sharedPageContent.includes('내 미래는 어떻게 될까요?');
                    console.log(`❓ 질문이 공유 페이지에 표시됨: ${hasQuestion}`);
                    
                    if (sharedCards > 0 && hasQuestion) {
                        console.log('✅ 공유 페이지에서 타로 리딩이 정상적으로 표시됨');
                    }
                    
                    await sharePage.close();
                    
                } catch (error) {
                    console.log(`❌ 공유 URL 접속 실패: ${error.message}`);
                    await sharePage.screenshot({
                        path: path.join(screenshotDir, '03_shared_page_error.png'),
                        fullPage: true
                    });
                    await sharePage.close();
                }
                
            } else {
                console.log('⚠️ 클립보드에 공유 URL이 없거나 인식할 수 없음');
            }
            
        } catch (error) {
            console.log(`❌ 클립보드 읽기 실패: ${error.message}`);
        }
        
        // 최종 스크린샷
        await page.screenshot({
            path: path.join(screenshotDir, '04_final_state.png'),
            fullPage: true
        });
        
        console.log('✅ 클립보드 기반 공유 기능 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
        await page.screenshot({
            path: path.join(screenshotDir, 'error_screenshot.png'),
            fullPage: true
        });
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testShareWithClipboard().catch(console.error);