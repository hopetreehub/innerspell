const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'ai-interpretation-test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testAIInterpretationManual() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000 // 더 천천히
    });
    
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🤖 AI 해석 기능 수동 테스트 시작...');
        
        // 페이지 접속
        await page.goto('http://localhost:4000/reading', { timeout: 90000 });
        await page.waitForLoadState('networkidle', { timeout: 90000 });
        
        // 질문 입력
        const questionInput = page.locator('textarea');
        await questionInput.fill('내 미래는 어떻게 될까요?');
        
        // 카드 섞기
        const shuffleButton = page.locator('button:has-text("섞기")').first();
        await shuffleButton.click();
        await page.waitForTimeout(2000);
        
        // 카드 펼치기
        const dealButton = page.locator('button:has-text("펼치기")').first();
        await dealButton.click();
        await page.waitForTimeout(3000);
        
        // 카드 3장 선택
        const cards = page.locator('.card, [class*="card"], div[role="button"]:has(img)');
        const cardCount = await cards.count();
        console.log(`찾은 카드 수: ${cardCount}`);
        
        const cardIndices = [8, 40, 72]; // 이전 테스트와 동일한 카드들
        
        for (let i = 0; i < cardIndices.length; i++) {
            const cardIndex = cardIndices[i];
            console.log(`${i + 1}번째 카드 선택 (인덱스: ${cardIndex})`);
            
            const card = cards.nth(cardIndex);
            await card.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await card.click({ force: true });
            await page.waitForTimeout(2000);
        }
        
        await page.screenshot({
            path: path.join(screenshotDir, '01_before_ai_interpretation.png'),
            fullPage: true
        });
        
        // AI 해석 버튼 클릭
        console.log('🤖 AI 해석 버튼 클릭...');
        const interpretButton = page.locator('button:has-text("AI 해석 받기")').first();
        await interpretButton.waitFor({ timeout: 10000 });
        await interpretButton.click();
        
        // 네트워크 요청 모니터링
        const requests = [];
        page.on('request', request => {
            if (request.url().includes('api') || request.url().includes('interpret')) {
                requests.push({
                    url: request.url(),
                    method: request.method(),
                    postData: request.postData()
                });
                console.log(`📡 API 요청: ${request.method()} ${request.url()}`);
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('api') || response.url().includes('interpret')) {
                console.log(`📨 API 응답: ${response.status()} ${response.url()}`);
            }
        });
        
        // 해석 결과를 더 오래 기다림
        console.log('⏳ AI 해석 결과 대기 중 (최대 60초)...');
        
        for (let i = 0; i < 12; i++) { // 60초 동안 5초마다 확인
            await page.waitForTimeout(5000);
            
            await page.screenshot({
                path: path.join(screenshotDir, `02_waiting_${i + 1}_${(i + 1) * 5}sec.png`),
                fullPage: true
            });
            
            // 해석 결과 확인
            const interpretationElements = await page.locator('.interpretation, [class*="interpretation"], .result, [class*="result"], div:has-text("해석"), div:has-text("의미")').count();
            if (interpretationElements > 0) {
                console.log(`✅ 해석 결과 발견! (${(i + 1) * 5}초 후)`);
                break;
            }
            
            // 에러 메시지 확인
            const errorElements = await page.locator('.error, [class*="error"], .alert-error, div:has-text("오류"), div:has-text("에러")').count();
            if (errorElements > 0) {
                console.log(`❌ 에러 메시지 발견! (${(i + 1) * 5}초 후)`);
                const errorText = await page.locator('.error, [class*="error"], .alert-error').first().textContent();
                console.log(`에러 내용: ${errorText}`);
                break;
            }
            
            console.log(`⏳ ${(i + 1) * 5}초 경과...`);
        }
        
        // 최종 스크린샷
        await page.screenshot({
            path: path.join(screenshotDir, '03_final_state.png'),
            fullPage: true
        });
        
        // 페이지 내용 확인
        const pageContent = await page.textContent('body');
        const hasInterpretation = pageContent.includes('해석') || pageContent.includes('의미') || pageContent.includes('타로');
        console.log(`페이지에 해석 관련 텍스트 포함: ${hasInterpretation}`);
        
        // API 요청 로그
        console.log('📊 API 요청 요약:');
        requests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.method} ${req.url}`);
            if (req.postData) {
                console.log(`   데이터: ${req.postData.substring(0, 200)}...`);
            }
        });
        
        console.log('✅ AI 해석 수동 테스트 완료!');
        
        // 브라우저를 열어둔 채로 사용자가 직접 확인할 수 있도록 대기
        console.log('🔍 브라우저가 열려있습니다. 직접 확인해보세요...');
        console.log('⏳ 60초 후 자동으로 종료됩니다.');
        await page.waitForTimeout(60000);
        
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
testAIInterpretationManual().catch(console.error);