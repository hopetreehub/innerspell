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
    const screenshotDir = path.join(__dirname, 'verification-screenshots-fixed');
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
        
        // 질문 입력
        console.log('\n3. 질문 입력 중...');
        await page.fill('textarea', 'AI 모델 오류가 해결되었는지 확인하고 싶습니다.');
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotDir, '03-question-entered.png'),
            fullPage: true 
        });
        console.log('✓ 질문 입력 완료');
        
        // 카드 펼치기 버튼 클릭
        console.log('\n4. 카드 펼치기 시작...');
        await page.click('button:has-text("카드 펼치기")');
        await page.waitForTimeout(3000); // 애니메이션 대기
        
        // 카드 간격 확인을 위한 스크린샷
        await page.screenshot({ 
            path: path.join(screenshotDir, '04-cards-spread.png'),
            fullPage: true 
        });
        console.log('✓ 카드 펼치기 완료 - 카드 간격 확인용 스크린샷 촬영');
        
        // 카드 간격 측정 (CSS 스타일 직접 확인)
        const cardStyles = await page.evaluate(() => {
            const cards = document.querySelectorAll('.card-animate');
            if (cards.length >= 2) {
                const computedStyle = window.getComputedStyle(cards[1]);
                return {
                    marginLeft: computedStyle.marginLeft,
                    transform: computedStyle.transform,
                    position: cards[1].getBoundingClientRect().x - cards[0].getBoundingClientRect().x
                };
            }
            return null;
        });
        
        if (cardStyles) {
            console.log(`✓ 카드 간격 스타일 정보:`);
            console.log(`  - margin-left: ${cardStyles.marginLeft}`);
            console.log(`  - 실제 위치 차이: ${cardStyles.position}px`);
        }
        
        // 카드 3장 선택
        console.log('\n5. 카드 3장 선택 중...');
        const cards = await page.$$('.card-animate');
        
        for (let i = 0; i < Math.min(3, cards.length); i++) {
            await cards[i].click();
            await page.waitForTimeout(500);
            console.log(`✓ ${i + 1}번째 카드 선택 완료`);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '05-cards-selected.png'),
            fullPage: true 
        });
        console.log('✓ 카드 선택 완료 스크린샷 촬영');
        
        // AI 해석 버튼 클릭
        console.log('\n6. AI 해석 요청 중...');
        
        // 버튼이 활성화될 때까지 대기
        await page.waitForSelector('button:has-text("AI 해석 보기"):not([disabled])', { timeout: 10000 });
        
        // 네트워크 요청 모니터링 설정
        let apiError = null;
        let apiResponse = null;
        
        page.on('response', async response => {
            if (response.url().includes('/api/') && response.url().includes('interpretation')) {
                console.log(`API 호출: ${response.url()} - Status: ${response.status()}`);
                
                if (response.status() !== 200) {
                    try {
                        const responseBody = await response.text();
                        apiError = `Status: ${response.status()}, Body: ${responseBody}`;
                        console.log(`❌ API 에러 응답: ${apiError}`);
                    } catch (e) {
                        apiError = `Status: ${response.status()}`;
                    }
                } else {
                    try {
                        apiResponse = await response.json();
                        console.log('✅ API 성공 응답 수신');
                    } catch (e) {
                        console.log('API 응답 파싱 실패');
                    }
                }
            }
        });
        
        // 콘솔 메시지 모니터링
        page.on('console', msg => {
            const text = msg.text();
            if (text.toLowerCase().includes('error') || text.includes('NOT_FOUND')) {
                console.log(`❌ 콘솔 에러: ${text}`);
            }
        });
        
        await page.click('button:has-text("AI 해석 보기")');
        
        // AI 응답 대기
        console.log('AI 응답 대기 중...');
        
        try {
            // AI 해석 결과가 나타날 때까지 대기
            await page.waitForSelector('.prose, .ai-interpretation, [class*="interpretation"], .text-content', { 
                timeout: 30000 
            });
            
            await page.waitForTimeout(2000); // 내용이 완전히 로드될 때까지 대기
            
            // AI 해석 내용 확인
            const interpretationText = await page.evaluate(() => {
                const elements = document.querySelectorAll('.prose, .ai-interpretation, [class*="interpretation"], .text-content');
                for (const el of elements) {
                    if (el.textContent && el.textContent.length > 100) {
                        return el.textContent.substring(0, 200) + '...';
                    }
                }
                return null;
            });
            
            if (interpretationText) {
                console.log('✅ AI 해석이 성공적으로 생성되었습니다!');
                console.log(`   해석 내용 미리보기: ${interpretationText}`);
            }
            
        } catch (error) {
            console.log(`❌ AI 해석 대기 중 오류: ${error.message}`);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '06-ai-interpretation-result.png'),
            fullPage: true 
        });
        console.log('✓ AI 해석 결과 스크린샷 촬영 완료');
        
        // 결과 요약
        console.log('\n========== 검증 결과 요약 ==========');
        console.log(`1. AI 해석 기능: ${apiResponse ? '✅ 정상 작동' : '❌ 오류 발생'}`);
        if (apiError) {
            console.log(`   - API 오류: ${apiError}`);
        }
        console.log(`2. 카드 간격: ${cardStyles ? cardStyles.marginLeft : '측정 실패'}`);
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