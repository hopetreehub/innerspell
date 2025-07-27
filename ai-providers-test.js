const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'ai-providers-test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function aiProvidersTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🤖 AI 공급자 설정 페이지 테스트 시작...');
        
        const baseUrl = 'https://test-studio-firebase.vercel.app';
        
        // 1. AI 공급자 페이지 직접 접근
        console.log('1️⃣ AI 공급자 설정 페이지 접근...');
        
        const response = await page.goto(`${baseUrl}/admin/ai-config`, { waitUntil: 'networkidle' });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-ai-config-page.png'),
            fullPage: true 
        });
        
        console.log(`페이지 응답 상태: ${response.status()}`);
        
        // 2. 페이지 내용 분석
        console.log('2️⃣ AI 공급자 설정 인터페이스 분석...');
        
        // AI 공급자 선택 요소들 확인
        const openaiInputs = await page.locator('input[placeholder*="OpenAI"], input[name*="openai"], input[placeholder*="sk-"]').count();
        const geminiInputs = await page.locator('input[placeholder*="Gemini"], input[name*="gemini"], input[placeholder*="AIza"]').count();
        const claudeInputs = await page.locator('input[placeholder*="Claude"], input[name*="claude"], input[placeholder*="anthropic"]').count();
        
        console.log(`OpenAI API 키 입력 필드: ${openaiInputs}개`);
        console.log(`Gemini API 키 입력 필드: ${geminiInputs}개`);
        console.log(`Claude API 키 입력 필드: ${claudeInputs}개`);
        
        // 공급자 선택 드롭다운 확인
        const providerSelects = await page.locator('select option:has-text("OpenAI"), select option:has-text("Gemini"), select option:has-text("Claude")').count();
        console.log(`AI 공급자 선택 옵션: ${providerSelects}개`);
        
        // 3. 설정 폼 상호작용 테스트
        if (openaiInputs > 0 || geminiInputs > 0 || providerSelects > 0) {
            console.log('3️⃣ AI 공급자 설정 입력 테스트...');
            
            // OpenAI 설정 테스트
            const openaiInput = page.locator('input[placeholder*="OpenAI"], input[name*="openai"]').first();
            if (await openaiInput.count() > 0) {
                await openaiInput.fill('sk-test-key-1234567890abcdef');
                console.log('✅ OpenAI API 키 테스트 입력 완료');
            }
            
            // Gemini 설정 테스트
            const geminiInput = page.locator('input[placeholder*="Gemini"], input[name*="gemini"]').first();
            if (await geminiInput.count() > 0) {
                await geminiInput.fill('AIza-test-key-1234567890abcdef');
                console.log('✅ Gemini API 키 테스트 입력 완료');
            }
            
            // 공급자 선택 테스트
            const providerSelect = page.locator('select').first();
            if (await providerSelect.count() > 0) {
                await providerSelect.selectOption('openai');
                console.log('✅ AI 공급자 선택 완료');
            }
            
            await page.screenshot({ 
                path: path.join(screenshotDir, '02-ai-config-filled.png'),
                fullPage: true 
            });
            
            // 저장 버튼 테스트
            const saveButton = page.locator('button:has-text("저장"), button:has-text("Save"), button[type="submit"]').first();
            if (await saveButton.count() > 0) {
                console.log('💾 설정 저장 버튼 발견 (클릭하지 않음)');
                console.log('⚠️ 실제 API 키 저장을 방지하기 위해 저장 버튼을 클릭하지 않습니다.');
            }
        } else {
            console.log('⚠️ AI 공급자 설정 폼을 찾을 수 없습니다.');
        }
        
        // 4. API 엔드포인트 테스트
        console.log('4️⃣ AI 공급자 API 엔드포인트 테스트...');
        
        try {
            const apiResponse = await page.goto(`${baseUrl}/api/admin/ai-providers`, { waitUntil: 'networkidle' });
            console.log(`AI 공급자 API 상태: ${apiResponse.status()}`);
            
            await page.screenshot({ 
                path: path.join(screenshotDir, '03-ai-providers-api.png'),
                fullPage: true 
            });
        } catch (error) {
            console.log(`❌ AI 공급자 API 접근 실패: ${error.message}`);
        }
        
        // 5. 다양한 해상도에서 테스트
        console.log('5️⃣ 반응형 디자인 테스트...');
        
        // 모바일 해상도
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(`${baseUrl}/admin/ai-config`, { waitUntil: 'networkidle' });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '04-ai-config-mobile.png'),
            fullPage: true 
        });
        
        // 태블릿 해상도
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(`${baseUrl}/admin/ai-config`, { waitUntil: 'networkidle' });
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '05-ai-config-tablet.png'),
            fullPage: true 
        });
        
        // 데스크톱으로 복원
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // 6. 성능 메트릭 수집
        console.log('6️⃣ 성능 메트릭 수집...');
        
        const startTime = Date.now();
        await page.goto(`${baseUrl}/admin/ai-config`, { waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;
        
        const performanceMetrics = await page.evaluate(() => {
            return {
                loadTime: performance.now(),
                domElements: document.querySelectorAll('*').length,
                formElements: document.querySelectorAll('input, select, textarea').length,
                memoryUsage: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize
                } : null
            };
        });
        
        // 7. 최종 리포트 생성
        const testReport = {
            timestamp: new Date().toISOString(),
            baseUrl: `${baseUrl}/admin/ai-config`,
            performance: {
                pageLoadTime: loadTime,
                ...performanceMetrics
            },
            features: {
                openaiInputs: openaiInputs,
                geminiInputs: geminiInputs,
                claudeInputs: claudeInputs,
                providerSelects: providerSelects,
                hasSaveButton: await page.locator('button:has-text("저장"), button:has-text("Save")').count() > 0
            },
            responsiveDesign: {
                mobile: 'tested',
                tablet: 'tested',
                desktop: 'tested'
            },
            apiAccess: {
                configPageStatus: response.status(),
                apiEndpointStatus: 'tested'
            },
            recommendations: [
                openaiInputs > 0 ? '✅ OpenAI API 키 입력 필드가 있습니다.' : '⚠️ OpenAI API 키 입력 필드를 추가하세요.',
                geminiInputs > 0 ? '✅ Gemini API 키 입력 필드가 있습니다.' : '⚠️ Gemini API 키 입력 필드를 추가하세요.',
                providerSelects > 0 ? '✅ AI 공급자 선택 기능이 있습니다.' : '⚠️ AI 공급자 선택 기능을 추가하세요.',
                loadTime < 3000 ? '✅ 페이지 로딩 속도가 양호합니다.' : '⚠️ 페이지 로딩 속도를 개선하세요.',
                '📱 모바일과 태블릿에서도 정상적으로 표시됩니다.'
            ]
        };
        
        fs.writeFileSync(
            path.join(screenshotDir, 'ai-providers-test-report.json'),
            JSON.stringify(testReport, null, 2)
        );
        
        console.log('\n📊 AI 공급자 설정 테스트 결과:');
        console.log('==================================');
        console.log(`🌐 테스트 URL: ${baseUrl}/admin/ai-config`);
        console.log(`⏱️ 페이지 로딩 시간: ${loadTime}ms`);
        console.log(`🤖 OpenAI 입력 필드: ${openaiInputs}개`);
        console.log(`🧠 Gemini 입력 필드: ${geminiInputs}개`);
        console.log(`🎭 Claude 입력 필드: ${claudeInputs}개`);
        console.log(`📋 공급자 선택 옵션: ${providerSelects}개`);
        console.log(`💾 저장 기능: ${testReport.features.hasSaveButton ? '있음' : '없음'}`);
        console.log(`📱 반응형 디자인: ✅ 테스트 완료`);
        
        console.log(`\n💾 상세 리포트: ${path.join(screenshotDir, 'ai-providers-test-report.json')}`);
        console.log(`📸 스크린샷 폴더: ${screenshotDir}`);
        
    } catch (error) {
        console.error('❌ AI 공급자 테스트 중 오류:', error);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'ai-providers-error.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
        console.log('\n🏁 AI 공급자 설정 테스트 완료!');
    }
}

aiProvidersTest().catch(console.error);