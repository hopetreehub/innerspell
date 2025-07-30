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
    const timestamp = new Date().getTime();
    const screenshotDir = path.join(__dirname, `verification-${timestamp}`);
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }
    
    console.log('=== 타로 리딩 AI 모델 오류 및 카드 간격 검증 시작 ===\n');
    console.log('1. 로컬 서버 접속 중...');
    
    try {
        // 메인 페이지 접속
        await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-main-page.png'),
            fullPage: true 
        });
        console.log('✓ 메인 페이지 접속 완료');
        
        // Reading 페이지로 이동
        console.log('\n2. Reading 페이지로 이동 중...');
        await page.click('a[href="/reading"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: path.join(screenshotDir, '02-reading-page.png'),
            fullPage: true 
        });
        console.log('✓ Reading 페이지 접속 완료');
        
        // 질문 입력
        console.log('\n3. 타로 리딩 질문 입력 중...');
        const textareaSelector = 'textarea[placeholder*="카드에게 무엇을 묻고 싶나요"]';
        await page.waitForSelector(textareaSelector, { timeout: 5000 });
        await page.fill(textareaSelector, 'AI 모델 오류가 해결되었는지 확인하고 싶습니다. 카드 간격도 확인해주세요.');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '03-question-entered.png'),
            fullPage: true 
        });
        console.log('✓ 질문 입력 완료');
        
        // 카드 펼치기 버튼 클릭
        console.log('\n4. 카드 펼치기 시작...');
        const shuffleButton = await page.waitForSelector('button:has-text("카드 펼치기"):not([disabled])', { timeout: 5000 });
        await shuffleButton.click();
        
        // 셔플링 애니메이션 대기
        console.log('   셔플링 애니메이션 진행 중...');
        await page.waitForTimeout(5000);
        
        // 카드가 펼쳐진 상태 확인
        await page.waitForSelector('.card-animate, .card', { timeout: 10000 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '04-cards-spread.png'),
            fullPage: true 
        });
        console.log('✓ 카드 펼치기 완료');
        
        // 카드 간격 측정
        console.log('\n5. 카드 간격 측정 중...');
        const cardMeasurements = await page.evaluate(() => {
            const cards = document.querySelectorAll('.card-animate, .card, [class*="card"]:not(.card-container)');
            const measurements = {
                totalCards: cards.length,
                cardPositions: [],
                computedStyles: [],
                actualGaps: []
            };
            
            // 카드 위치 정보 수집
            for (let i = 0; i < Math.min(5, cards.length); i++) {
                const rect = cards[i].getBoundingClientRect();
                const style = window.getComputedStyle(cards[i]);
                
                measurements.cardPositions.push({
                    index: i,
                    x: rect.x,
                    width: rect.width,
                    transform: style.transform,
                    marginLeft: style.marginLeft
                });
                
                // 인접 카드 간 실제 간격 계산
                if (i > 0) {
                    const gap = rect.x - (measurements.cardPositions[i-1].x + measurements.cardPositions[i-1].width);
                    measurements.actualGaps.push(gap);
                }
            }
            
            return measurements;
        });
        
        console.log('✓ 카드 간격 측정 결과:');
        console.log(`   - 총 카드 수: ${cardMeasurements.totalCards}`);
        console.log(`   - 첫 번째 카드 margin-left: ${cardMeasurements.cardPositions[1]?.marginLeft || 'N/A'}`);
        console.log(`   - 실제 카드 간격: ${cardMeasurements.actualGaps.map(g => g.toFixed(1) + 'px').join(', ')}`);
        console.log(`   - 평균 간격: ${(cardMeasurements.actualGaps.reduce((a,b) => a+b, 0) / cardMeasurements.actualGaps.length).toFixed(1)}px`);
        
        // 카드 3장 선택
        console.log('\n6. 카드 3장 선택 중...');
        const selectableCards = await page.$$('.card-animate:not(.selected), .card:not(.selected)');
        
        for (let i = 0; i < Math.min(3, selectableCards.length); i++) {
            await selectableCards[i].click();
            await page.waitForTimeout(500);
            console.log(`   ✓ ${i + 1}번째 카드 선택`);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '05-cards-selected.png'),
            fullPage: true 
        });
        console.log('✓ 카드 3장 선택 완료');
        
        // AI 해석 요청
        console.log('\n7. AI 해석 요청 중...');
        
        // API 모니터링 설정
        let apiCallDetected = false;
        let apiError = null;
        let apiSuccess = false;
        
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('/api/') && (url.includes('interpretation') || url.includes('reading') || url.includes('tarot'))) {
                apiCallDetected = true;
                console.log(`   API 호출: ${url}`);
                console.log(`   응답 상태: ${response.status()}`);
                
                if (response.status() !== 200) {
                    try {
                        const responseText = await response.text();
                        apiError = {
                            status: response.status(),
                            message: responseText,
                            isModelError: responseText.includes('NOT_FOUND') || responseText.includes('Model') || responseText.includes('gpt-3.5')
                        };
                        console.log(`   ❌ API 에러: ${responseText.substring(0, 200)}`);
                    } catch (e) {
                        apiError = { status: response.status(), message: 'Unknown error' };
                    }
                } else {
                    apiSuccess = true;
                    console.log('   ✅ API 응답 성공');
                }
            }
        });
        
        // 콘솔 에러 모니터링
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                if (text.includes('Model') || text.includes('NOT_FOUND') || text.includes('gpt-3.5')) {
                    console.log(`   ❌ 콘솔 에러 (모델 관련): ${text}`);
                }
            }
        });
        
        // AI 해석 버튼 클릭
        const interpretButton = await page.waitForSelector('button:has-text("AI 해석 보기"):not([disabled])', { timeout: 10000 });
        await interpretButton.click();
        
        console.log('   AI 응답 대기 중... (최대 30초)');
        
        // 결과 대기
        let interpretationSuccess = false;
        let errorMessageFound = false;
        let interpretationContent = null;
        
        try {
            // 에러 또는 성공 메시지 대기
            await Promise.race([
                page.waitForSelector('.error-message, [class*="error"]:not(.error-boundary)', { timeout: 30000 }),
                page.waitForSelector('.prose, .ai-interpretation, [class*="interpretation"], .reading-content', { timeout: 30000 })
            ]);
            
            await page.waitForTimeout(3000); // 컨텐츠 완전 로드 대기
            
            // 에러 확인
            const errorElement = await page.$('.error-message, [class*="error"]:not(.error-boundary):not(.error-state)');
            if (errorElement) {
                const errorText = await errorElement.textContent();
                if (errorText && errorText.length > 5) {
                    errorMessageFound = true;
                    console.log(`   ❌ 화면 에러 메시지: ${errorText}`);
                }
            }
            
            // 성공 확인
            if (!errorMessageFound) {
                interpretationContent = await page.evaluate(() => {
                    const selectors = ['.prose', '.ai-interpretation', '[class*="interpretation"]', '.reading-content'];
                    for (const selector of selectors) {
                        const el = document.querySelector(selector);
                        if (el && el.textContent && el.textContent.length > 100) {
                            return el.textContent.substring(0, 300);
                        }
                    }
                    return null;
                });
                
                if (interpretationContent) {
                    interpretationSuccess = true;
                    console.log('   ✅ AI 해석 생성 성공');
                    console.log(`   해석 내용 일부: ${interpretationContent.substring(0, 100)}...`);
                }
            }
            
        } catch (error) {
            console.log(`   ⏱️ 타임아웃 또는 예외: ${error.message}`);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '06-ai-interpretation-result.png'),
            fullPage: true 
        });
        console.log('✓ AI 해석 결과 스크린샷 촬영 완료');
        
        // 최종 검증 결과
        console.log('\n========== 🔍 최종 검증 결과 ==========');
        
        console.log('\n1. AI 해석 기능 검증:');
        console.log(`   - API 호출: ${apiCallDetected ? '✅ 감지됨' : '❌ 감지되지 않음'}`);
        console.log(`   - API 응답: ${apiSuccess ? '✅ 성공 (200 OK)' : '❌ 실패'}`);
        console.log(`   - 화면 표시: ${interpretationSuccess ? '✅ 정상 표시' : errorMessageFound ? '❌ 에러 표시' : '❓ 확인 필요'}`);
        
        if (apiError) {
            console.log(`\n   🚨 API 에러 상세:`);
            console.log(`   - 상태 코드: ${apiError.status}`);
            console.log(`   - 모델 오류: ${apiError.isModelError ? '예 (GPT-3.5-turbo 관련)' : '아니오'}`);
            console.log(`   - 메시지: ${apiError.message.substring(0, 150)}...`);
        }
        
        console.log('\n2. 타로 카드 간격 검증:');
        console.log(`   - 설정된 margin-left: ${cardMeasurements.cardPositions[1]?.marginLeft || '측정 실패'}`);
        console.log(`   - 실제 측정 간격: ${cardMeasurements.actualGaps[0]?.toFixed(1) || '측정 실패'}px`);
        console.log(`   - 기대값: -125px (이전: -120px)`);
        console.log(`   - 검증 결과: ${Math.abs(cardMeasurements.actualGaps[0] + 125) < 5 ? '✅ 정상' : '❌ 불일치'}`);
        
        console.log('\n3. 스크린샷 저장 위치:');
        console.log(`   ${screenshotDir}`);
        
        console.log('\n=======================================');
        
        // 전체 결과 요약
        const overallSuccess = apiSuccess && interpretationSuccess && !errorMessageFound;
        console.log(`\n📊 전체 검증 결과: ${overallSuccess ? '✅ 성공' : '❌ 실패'}`);
        
        if (!overallSuccess) {
            console.log('\n⚠️  주요 문제점:');
            if (apiError?.isModelError) {
                console.log('   - OpenAI GPT-3.5-turbo 모델을 찾을 수 없음');
                console.log('   - 해결 방법: 환경 변수 확인 또는 모델 이름 변경 필요');
            }
            if (!apiCallDetected) {
                console.log('   - API 호출이 발생하지 않음');
            }
            if (errorMessageFound) {
                console.log('   - 화면에 에러 메시지가 표시됨');
            }
        }
        
    } catch (error) {
        console.error('\n테스트 중 치명적 오류:', error.message);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'error-screenshot.png'),
            fullPage: true 
        });
    }
    
    // 브라우저 유지
    console.log('\n브라우저를 20초간 유지합니다. 직접 확인해보세요...');
    await page.waitForTimeout(20000);
    
    await browser.close();
    console.log('\n검증 완료');
}

// 실행
verifyChanges().catch(console.error);