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
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const screenshotDir = path.join(__dirname, `verification-${timestamp}`);
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
        await page.fill('textarea[placeholder*="질문을 입력하세요"]', 'AI 모델 오류가 해결되었는지 확인하고 싶습니다.');
        await page.waitForTimeout(1000);
        
        // 타로 스프레드 선택 (기본값이 아닌 경우)
        console.log('\n4. 타로 스프레드 확인...');
        const spreadSelect = await page.$('select');
        if (spreadSelect) {
            // 이미 선택되어 있는지 확인
            const selectedValue = await page.$eval('select', el => el.value);
            console.log(`현재 선택된 스프레드: ${selectedValue}`);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '03-form-filled.png'),
            fullPage: true 
        });
        console.log('✓ 폼 입력 완료');
        
        // 카드 펼치기 버튼 상태 확인
        const buttonDisabled = await page.$eval('button:has-text("카드 펼치기")', button => button.disabled);
        console.log(`카드 펼치기 버튼 상태: ${buttonDisabled ? '비활성화' : '활성화'}`);
        
        // 카드 펼치기 버튼 클릭
        console.log('\n5. 카드 펼치기 시작...');
        await page.click('button:has-text("카드 펼치기"):not([disabled])');
        await page.waitForTimeout(4000); // 애니메이션 대기
        
        // 카드 간격 확인을 위한 스크린샷
        await page.screenshot({ 
            path: path.join(screenshotDir, '04-cards-spread.png'),
            fullPage: true 
        });
        console.log('✓ 카드 펼치기 완료 - 카드 간격 확인용 스크린샷 촬영');
        
        // 카드 간격 측정
        const cardInfo = await page.evaluate(() => {
            const cards = document.querySelectorAll('.card-animate, .card');
            const result = {
                cardCount: cards.length,
                positions: [],
                marginLeft: null
            };
            
            if (cards.length >= 2) {
                // 각 카드의 위치 정보 수집
                for (let i = 0; i < Math.min(5, cards.length); i++) {
                    const rect = cards[i].getBoundingClientRect();
                    result.positions.push({
                        index: i,
                        x: rect.x,
                        width: rect.width
                    });
                }
                
                // margin-left 스타일 확인
                const computedStyle = window.getComputedStyle(cards[1]);
                result.marginLeft = computedStyle.marginLeft;
                
                // 실제 간격 계산
                result.actualGap = result.positions[1].x - (result.positions[0].x + result.positions[0].width);
            }
            
            return result;
        });
        
        console.log(`✓ 카드 정보:`);
        console.log(`  - 카드 개수: ${cardInfo.cardCount}`);
        console.log(`  - margin-left 스타일: ${cardInfo.marginLeft}`);
        console.log(`  - 실제 카드 간격: ${cardInfo.actualGap}px`);
        
        // 카드 3장 선택
        console.log('\n6. 카드 3장 선택 중...');
        const cards = await page.$$('.card-animate, .card');
        
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
        console.log('\n7. AI 해석 요청 중...');
        
        // 네트워크 요청 모니터링 설정
        let apiError = null;
        let apiSuccess = false;
        let apiResponseData = null;
        
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('/api/') && (url.includes('interpretation') || url.includes('reading'))) {
                console.log(`API 호출 감지: ${url}`);
                console.log(`응답 상태: ${response.status()}`);
                
                try {
                    const responseText = await response.text();
                    
                    if (response.status() !== 200) {
                        apiError = `Status: ${response.status()}, Response: ${responseText}`;
                        console.log(`❌ API 에러 응답: ${apiError}`);
                        
                        // 특정 에러 메시지 확인
                        if (responseText.includes('NOT_FOUND') || responseText.includes('Model')) {
                            console.log('❌ 모델 관련 에러 감지!');
                        }
                    } else {
                        apiSuccess = true;
                        try {
                            apiResponseData = JSON.parse(responseText);
                            console.log('✅ API 성공 응답 수신');
                        } catch (e) {
                            console.log('✅ API 응답 수신 (non-JSON)');
                        }
                    }
                } catch (e) {
                    console.log(`API 응답 읽기 실패: ${e.message}`);
                }
            }
        });
        
        // 콘솔 에러 모니터링
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`❌ 브라우저 콘솔 에러: ${msg.text()}`);
            }
        });
        
        // AI 해석 버튼 클릭
        await page.waitForSelector('button:has-text("AI 해석 보기"):not([disabled])');
        await page.click('button:has-text("AI 해석 보기")');
        
        console.log('AI 응답 대기 중... (최대 30초)');
        
        // AI 해석 결과 대기
        let interpretationFound = false;
        let errorFound = false;
        
        try {
            // 여러 가능한 선택자로 대기
            await page.waitForSelector('.prose, .ai-interpretation, [class*="interpretation"], .error-message, [class*="error"]', { 
                timeout: 30000 
            });
            
            await page.waitForTimeout(3000); // 내용 완전 로드 대기
            
            // 에러 메시지 확인
            const errorElements = await page.$$('.error-message, [class*="error"]:not(.error-boundary)');
            for (const el of errorElements) {
                const text = await el.textContent();
                if (text && text.length > 10) {
                    errorFound = true;
                    console.log(`❌ 화면에 에러 메시지 발견: ${text}`);
                }
            }
            
            // AI 해석 내용 확인
            if (!errorFound) {
                const interpretationText = await page.evaluate(() => {
                    const selectors = ['.prose', '.ai-interpretation', '[class*="interpretation"]', '.reading-content', '.text-content'];
                    for (const selector of selectors) {
                        const elements = document.querySelectorAll(selector);
                        for (const el of elements) {
                            if (el.textContent && el.textContent.length > 100) {
                                return el.textContent.substring(0, 300);
                            }
                        }
                    }
                    return null;
                });
                
                if (interpretationText) {
                    interpretationFound = true;
                    console.log('✅ AI 해석이 성공적으로 생성되었습니다!');
                    console.log(`   해석 내용 미리보기: ${interpretationText.substring(0, 150)}...`);
                }
            }
            
        } catch (error) {
            console.log(`⏱️ AI 해석 대기 타임아웃: ${error.message}`);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '06-ai-interpretation-result.png'),
            fullPage: true 
        });
        console.log('✓ AI 해석 결과 스크린샷 촬영 완료');
        
        // 최종 결과 요약
        console.log('\n========== 🔍 검증 결과 요약 ==========');
        console.log(`1. AI 해석 기능:`);
        console.log(`   - API 호출: ${apiSuccess ? '✅ 성공' : '❌ 실패'}`);
        console.log(`   - 화면 표시: ${interpretationFound ? '✅ 정상' : errorFound ? '❌ 에러 표시' : '❓ 확인 필요'}`);
        if (apiError) {
            console.log(`   - 에러 상세: ${apiError}`);
        }
        
        console.log(`\n2. 타로 카드 간격:`);
        console.log(`   - CSS margin-left: ${cardInfo.marginLeft || '측정 실패'}`);
        console.log(`   - 실제 간격: ${cardInfo.actualGap ? cardInfo.actualGap + 'px' : '측정 실패'}`);
        console.log(`   - 예상값: -125px (이전: -120px)`);
        
        console.log(`\n3. 스크린샷 저장 위치: ${screenshotDir}`);
        console.log('=========================================');
        
    } catch (error) {
        console.error('테스트 중 오류 발생:', error.message);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'error-screenshot.png'),
            fullPage: true 
        });
    }
    
    // 브라우저 유지
    console.log('\n브라우저를 15초간 유지합니다. 직접 확인해보세요...');
    await page.waitForTimeout(15000);
    
    await browser.close();
}

// 실행
verifyChanges().catch(console.error);