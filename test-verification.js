const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function verifyChanges() {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 스크린샷 디렉토리 생성
    const screenshotDir = path.join(__dirname, 'verification-screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }
    
    console.log('1. 로컬 서버 접속 중...');
    
    try {
        // 메인 페이지 접속
        await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-main-page.png'),
            fullPage: true 
        });
        console.log('✓ 메인 페이지 스크린샷 촬영 완료');
        
        // Reading 페이지로 이동
        console.log('\n2. Reading 페이지로 이동 중...');
        await page.click('a[href="/reading"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: path.join(screenshotDir, '02-reading-page.png'),
            fullPage: true 
        });
        console.log('✓ Reading 페이지 스크린샷 촬영 완료');
        
        // 카드 펼치기 버튼 클릭
        console.log('\n3. 카드 펼치기 시작...');
        await page.click('button:has-text("카드 펼치기")');
        await page.waitForTimeout(3000); // 애니메이션 대기
        
        // 카드 간격 확인을 위한 스크린샷
        await page.screenshot({ 
            path: path.join(screenshotDir, '03-cards-spread.png'),
            fullPage: true 
        });
        console.log('✓ 카드 펼치기 완료 - 카드 간격 확인용 스크린샷 촬영');
        
        // 카드 간격 측정
        const cardElements = await page.$$('.card');
        if (cardElements.length >= 2) {
            const card1Box = await cardElements[0].boundingBox();
            const card2Box = await cardElements[1].boundingBox();
            const gap = card2Box.x - (card1Box.x + card1Box.width);
            console.log(`✓ 측정된 카드 간격: ${gap}px`);
        }
        
        // 카드 3장 선택
        console.log('\n4. 카드 3장 선택 중...');
        const cards = await page.$$('.card');
        
        for (let i = 0; i < Math.min(3, cards.length); i++) {
            await cards[i].click();
            await page.waitForTimeout(500);
            console.log(`✓ ${i + 1}번째 카드 선택 완료`);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '04-cards-selected.png'),
            fullPage: true 
        });
        console.log('✓ 카드 선택 완료 스크린샷 촬영');
        
        // AI 해석 버튼 클릭
        console.log('\n5. AI 해석 요청 중...');
        
        // 버튼이 활성화될 때까지 대기
        await page.waitForSelector('button:has-text("AI 해석 보기"):not([disabled])', { timeout: 10000 });
        await page.click('button:has-text("AI 해석 보기")');
        
        // AI 응답 대기 (최대 30초)
        console.log('AI 응답 대기 중...');
        let aiError = null;
        let aiSuccess = false;
        
        // 에러 메시지 감지
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('NOT_FOUND') || text.includes('Model') || text.includes('error')) {
                aiError = text;
                console.log(`❌ 콘솔 에러 감지: ${text}`);
            }
        });
        
        // 네트워크 요청 모니터링
        page.on('response', response => {
            if (response.url().includes('/api/') && response.status() !== 200) {
                console.log(`❌ API 에러: ${response.url()} - Status: ${response.status()}`);
            }
        });
        
        try {
            // AI 해석 결과 대기
            await page.waitForSelector('.ai-interpretation, .error-message, [class*="error"]', { 
                timeout: 30000 
            });
            
            // 에러 메시지 확인
            const errorElement = await page.$('.error-message, [class*="error"]');
            if (errorElement) {
                const errorText = await errorElement.textContent();
                console.log(`❌ AI 해석 에러: ${errorText}`);
                aiError = errorText;
            } else {
                // AI 해석 성공 확인
                const interpretationElement = await page.$('.ai-interpretation, [class*="interpretation"]');
                if (interpretationElement) {
                    aiSuccess = true;
                    console.log('✅ AI 해석이 성공적으로 생성되었습니다!');
                }
            }
        } catch (error) {
            console.log(`❌ AI 해석 타임아웃 또는 에러: ${error.message}`);
            aiError = error.message;
        }
        
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: path.join(screenshotDir, '05-ai-interpretation-result.png'),
            fullPage: true 
        });
        console.log('✓ AI 해석 결과 스크린샷 촬영 완료');
        
        // 결과 요약
        console.log('\n========== 검증 결과 요약 ==========');
        console.log(`1. AI 해석 기능: ${aiSuccess ? '✅ 정상 작동' : '❌ 오류 발생'}`);
        if (aiError) {
            console.log(`   - 오류 내용: ${aiError}`);
        }
        console.log(`2. 카드 간격: 시각적으로 확인 필요 (스크린샷 참조)`);
        console.log(`3. 스크린샷 저장 위치: ${screenshotDir}`);
        console.log('=====================================');
        
    } catch (error) {
        console.error('테스트 중 오류 발생:', error);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'error-screenshot.png'),
            fullPage: true 
        });
    }
    
    // 브라우저 유지 (수동 확인용)
    console.log('\n브라우저를 10초간 유지합니다. 직접 확인해보세요...');
    await page.waitForTimeout(10000);
    
    await browser.close();
}

// 실행
verifyChanges().catch(console.error);