const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'share-functionality-test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testShareFunctionality() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🔗 공유 기능 완전 테스트 시작...');
        
        // 1-5단계: 타로 리딩 완료까지 (이전과 동일)
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
            path: path.join(screenshotDir, '01_interpretation_dialog.png'),
            fullPage: true
        });
        
        // 공유 기능 테스트
        console.log('🔗 공유 버튼 클릭');
        const shareButton = page.locator('button:has-text("리딩 공유하기"), button:has-text("공유하기"), button:has-text("공유")').first();
        
        try {
            await shareButton.waitFor({ timeout: 10000 });
            await shareButton.click();
            console.log('✅ 공유 버튼 클릭 성공');
            
            // 공유 처리 대기
            await page.waitForTimeout(5000);
            
            await page.screenshot({
                path: path.join(screenshotDir, '02_after_share_click.png'),
                fullPage: true
            });
            
            // 공유 URL 추출 시도
            let shareUrl = null;
            
            // 다양한 방법으로 공유 URL 찾기
            const urlSelectors = [
                'input[value*="/shared/"]',
                'input[value*="share"]',
                'textarea[value*="/shared/"]',
                '[data-testid="share-url"]',
                '.share-url',
                'input[readonly]',
                'input[type="text"][value*="http"]'
            ];
            
            for (const selector of urlSelectors) {
                try {
                    const urlElement = page.locator(selector);
                    if (await urlElement.count() > 0) {
                        shareUrl = await urlElement.inputValue();
                        if (shareUrl && (shareUrl.includes('/shared/') || shareUrl.includes('share'))) {
                            console.log(`📋 공유 URL 발견 (${selector}): ${shareUrl}`);
                            break;
                        }
                    }
                } catch (e) {
                    // 계속 시도
                }
            }
            
            // 페이지 텍스트에서 URL 검색
            if (!shareUrl) {
                const pageContent = await page.content();
                const urlMatches = pageContent.match(/https?:\/\/[^\s"'<>]+\/shared\/[a-zA-Z0-9-]+/g);
                if (urlMatches && urlMatches.length > 0) {
                    shareUrl = urlMatches[0];
                    console.log(`📄 페이지 소스에서 공유 URL 발견: ${shareUrl}`);
                }
            }
            
            // URL이 상대 경로인 경우 절대 경로로 변환
            if (shareUrl && shareUrl.startsWith('/')) {
                shareUrl = `http://localhost:4000${shareUrl}`;
            }
            
            if (shareUrl) {
                console.log(`🔗 최종 공유 URL: ${shareUrl}`);
                
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
                    const sharedCards = await sharePage.locator('img[alt*="카드"], img[src*="tarot"], .card').count();
                    console.log(`🃏 공유 페이지에서 발견된 카드 수: ${sharedCards}`);
                    
                    if (sharedCards > 0) {
                        console.log('✅ 공유 페이지에서 타로 카드가 정상적으로 표시됨');
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
                console.log('⚠️ 공유 URL을 찾을 수 없음');
                
                // 페이지의 모든 링크와 입력 필드 확인
                const allLinks = await page.locator('a[href*="shared"], a[href*="share"]').count();
                const allInputs = await page.locator('input').count();
                console.log(`🔗 페이지의 공유 관련 링크 수: ${allLinks}`);
                console.log(`📝 페이지의 입력 필드 수: ${allInputs}`);
                
                // 모든 입력 필드의 값 확인
                for (let i = 0; i < Math.min(allInputs, 5); i++) {
                    try {
                        const input = page.locator('input').nth(i);
                        const value = await input.inputValue();
                        const placeholder = await input.getAttribute('placeholder');
                        console.log(`입력 필드 ${i + 1}: 값="${value}", placeholder="${placeholder}"`);
                    } catch (e) {
                        // 무시
                    }
                }
            }
            
        } catch (error) {
            console.log(`❌ 공유 버튼 클릭 실패: ${error.message}`);
            
            // 사용 가능한 모든 버튼 확인
            const allButtons = await page.locator('button').count();
            console.log(`🔘 페이지의 전체 버튼 수: ${allButtons}`);
            
            for (let i = 0; i < Math.min(allButtons, 10); i++) {
                try {
                    const button = page.locator('button').nth(i);
                    const buttonText = await button.textContent();
                    console.log(`버튼 ${i + 1}: "${buttonText}"`);
                } catch (e) {
                    // 무시
                }
            }
        }
        
        // 최종 스크린샷
        await page.screenshot({
            path: path.join(screenshotDir, '04_final_state.png'),
            fullPage: true
        });
        
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
testShareFunctionality().catch(console.error);