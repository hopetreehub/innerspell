const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'complete-tarot-test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testCompleteTarotFunctionality() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // 사용자가 볼 수 있도록 천천히
    });
    
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🎯 완전한 타로 리딩 기능 테스트 시작...');
        
        // 단계 1: 타로 리딩 페이지 접속
        console.log('1️⃣ 타로 리딩 페이지 접속');
        await page.goto('http://localhost:4000/reading', { timeout: 90000 });
        await page.waitForLoadState('networkidle', { timeout: 90000 });
        await page.screenshot({
            path: path.join(screenshotDir, '01_reading_page_initial.png'),
            fullPage: true
        });
        
        // 단계 2: 질문 입력
        console.log('2️⃣ 질문 입력');
        const questionInput = page.locator('textarea[placeholder*="카드에게"], textarea[placeholder*="무엇을"], textarea, input[type="text"]');
        await questionInput.waitFor({ timeout: 10000 });
        await questionInput.fill('내 미래는 어떻게 될까요?');
        await page.screenshot({
            path: path.join(screenshotDir, '02_question_input.png'),
            fullPage: true
        });
        
        // 단계 3: 카드 섞기
        console.log('3️⃣ 카드 섞기');
        const shuffleButton = page.locator('button:has-text("섞기"), button:has-text("shuffle"), button[class*="shuffle"]').first();
        await shuffleButton.waitFor({ timeout: 10000 });
        await shuffleButton.click();
        await page.waitForTimeout(2000); // 섞기 애니메이션 대기
        await page.screenshot({
            path: path.join(screenshotDir, '03_cards_shuffled.png'),
            fullPage: true
        });
        
        // 단계 4: 카드 펼치기
        console.log('4️⃣ 카드 펼치기');
        const dealButton = page.locator('button:has-text("펼치기"), button:has-text("deal"), button[class*="deal"]').first();
        await dealButton.waitFor({ timeout: 10000 });
        await dealButton.click();
        await page.waitForTimeout(3000); // 카드 펼치기 애니메이션 대기
        await page.screenshot({
            path: path.join(screenshotDir, '04_cards_dealt.png'),
            fullPage: true
        });
        
        // 단계 5: 3장의 카드 선택
        console.log('5️⃣ 3장의 카드 선택');
        const cards = page.locator('.card, [class*="card"], div[role="button"]:has(img)');
        await cards.first().waitFor({ timeout: 10000 });
        
        const cardCount = await cards.count();
        console.log(`찾은 카드 수: ${cardCount}`);
        
        // 카드 3장 선택 (충분한 간격으로 분배)
        const cardIndices = [
            Math.floor(cardCount * 0.1),  // 첫 번째: 10% 지점
            Math.floor(cardCount * 0.5),  // 두 번째: 50% 지점
            Math.floor(cardCount * 0.9)   // 세 번째: 90% 지점
        ];
        
        for (let i = 0; i < cardIndices.length; i++) {
            const cardIndex = cardIndices[i];
            console.log(`${i + 1}번째 카드 선택 (인덱스: ${cardIndex})`);
            
            // 카드를 먼저 스크롤해서 보이게 하고 force 클릭 사용
            const card = cards.nth(cardIndex);
            await card.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            
            // force 클릭으로 overlapping 요소 무시
            await card.click({ force: true });
            await page.waitForTimeout(2000); // 카드 선택 애니메이션 대기
            
            await page.screenshot({
                path: path.join(screenshotDir, `05_card_${i + 1}_selected.png`),
                fullPage: true
            });
        }
        
        // 단계 6: AI 해석 받기
        console.log('6️⃣ AI 해석 받기');
        const interpretButton = page.locator('button:has-text("AI 해석 받기")').first();
        await interpretButton.waitFor({ timeout: 10000 });
        await interpretButton.click();
        
        // AI 해석 결과 대기 (최대 60초)
        console.log('AI 해석 결과 대기 중...');
        await page.waitForTimeout(5000); // 초기 로딩 대기
        
        await page.screenshot({
            path: path.join(screenshotDir, '06_ai_interpretation_loading.png'),
            fullPage: true
        });
        
        // AI 해석 완료까지 최대 60초 대기
        for (let i = 0; i < 12; i++) { // 60초 동안 5초마다 확인
            await page.waitForTimeout(5000);
            
            // 해석 완료 상태인지 확인 (버튼이 "해석 중..."에서 다른 상태로 변경됨)
            const buttonText = await interpretButton.textContent();
            console.log(`버튼 상태 확인 (${(i + 1) * 5}초): ${buttonText}`);
            
            if (buttonText && !buttonText.includes('해석 중')) {
                console.log(`✅ AI 해석 완료! (${(i + 1) * 5}초 후)`);
                break;
            }
            
            if (i === 11) {
                console.log('⚠️ 60초 대기 후에도 해석이 완료되지 않음');
            }
        }
        
        await page.screenshot({
            path: path.join(screenshotDir, '07_ai_interpretation_complete.png'),
            fullPage: true
        });
        
        // 단계 7: 공유 버튼 클릭
        console.log('7️⃣ 공유 버튼 클릭');
        const shareButton = page.locator('button:has-text("공유"), button:has-text("share"), button[class*="share"]').first();
        
        // 공유 버튼이 나타날 때까지 대기
        try {
            await shareButton.waitFor({ timeout: 15000 });
            await shareButton.click();
            
            // 공유 링크 생성 대기
            await page.waitForTimeout(3000);
            await page.screenshot({
                path: path.join(screenshotDir, '08_share_button_clicked.png'),
                fullPage: true
            });
            
            // 공유 링크 추출 시도
            let shareUrl = null;
            try {
                // 다양한 공유 URL 선택자 시도
                const urlSelectors = [
                    'input[value*="/shared/"]',
                    'input[value*="share"]',
                    '.share-url input',
                    '[class*="share"] input',
                    'textarea[value*="/shared/"]'
                ];
                
                for (const selector of urlSelectors) {
                    try {
                        const urlElement = page.locator(selector);
                        if (await urlElement.count() > 0) {
                            shareUrl = await urlElement.inputValue();
                            if (shareUrl && shareUrl.includes('/shared/')) {
                                console.log(`공유 URL 발견: ${shareUrl}`);
                                break;
                            }
                        }
                    } catch (e) {
                        // 선택자를 찾지 못한 경우 계속
                    }
                }
                
                // URL을 찾지 못한 경우 페이지 텍스트에서 검색
                if (!shareUrl) {
                    const pageContent = await page.textContent('body');
                    const urlMatch = pageContent.match(/https?:\/\/[^\s]+\/shared\/[a-zA-Z0-9-]+/);
                    if (urlMatch) {
                        shareUrl = urlMatch[0];
                        console.log(`페이지 텍스트에서 공유 URL 발견: ${shareUrl}`);
                    }
                }
                
            } catch (error) {
                console.log('공유 URL 추출 중 오류:', error.message);
            }
            
            // 단계 8: 공유 링크로 접속하여 확인
            if (shareUrl) {
                console.log('8️⃣ 공유 링크로 접속하여 확인');
                const shareUrlToTest = shareUrl.startsWith('http') ? shareUrl : `http://localhost:4000${shareUrl}`;
                
                // 새 탭에서 공유 링크 열기
                const sharePage = await context.newPage();
                await sharePage.goto(shareUrlToTest);
                await sharePage.waitForLoadState('networkidle');
                await sharePage.screenshot({
                    path: path.join(screenshotDir, '09_shared_reading_page.png'),
                    fullPage: true
                });
                
                console.log(`✅ 공유된 리딩 페이지 접속 성공: ${shareUrlToTest}`);
                await sharePage.close();
            } else {
                console.log('⚠️  공유 URL을 찾을 수 없어 공유 페이지 테스트를 건너뜁니다.');
            }
            
        } catch (error) {
            console.log('공유 버튼을 찾지 못함 또는 클릭 실패:', error.message);
            await page.screenshot({
                path: path.join(screenshotDir, '08_share_button_not_found.png'),
                fullPage: true
            });
        }
        
        // 최종 스크린샷
        await page.screenshot({
            path: path.join(screenshotDir, '10_final_complete_state.png'),
            fullPage: true
        });
        
        console.log('✅ 완전한 타로 리딩 기능 테스트 완료!');
        console.log(`📸 스크린샷이 ${screenshotDir} 폴더에 저장되었습니다.`);
        
        // 페이지 내용 로그
        const pageTitle = await page.title();
        const currentUrl = page.url();
        console.log(`📄 페이지 제목: ${pageTitle}`);
        console.log(`🔗 현재 URL: ${currentUrl}`);
        
        // 에러 메시지 확인
        const errorElements = await page.locator('.error, [class*="error"], .alert-error').count();
        if (errorElements > 0) {
            console.log(`⚠️  ${errorElements}개의 에러 메시지가 발견되었습니다.`);
        }
        
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
testCompleteTarotFunctionality().catch(console.error);