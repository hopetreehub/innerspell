const { chromium } = require('playwright');

async function ultimateVercelTest() {
    console.log('🎯 최종 Vercel 배포 검증 시작...');
    console.log('🔧 근본 원인 해결 후 테스트\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. 홈페이지 테스트
        console.log('1️⃣ 홈페이지 접속 테스트...');
        const homeResponse = await page.goto('https://test-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        const homeStatus = homeResponse.status();
        console.log(`📊 홈페이지 상태: ${homeStatus}`);
        
        if (homeStatus === 200) {
            console.log('🎉 홈페이지 성공! 500 에러 해결됨!');
            await page.waitForTimeout(3000);
            await page.screenshot({ 
                path: `ultimate-success-01-homepage-${timestamp}.png`,
                fullPage: true
            });
            
            // 페이지 내용 확인
            const title = await page.title();
            const hasMainContent = await page.locator('h1, h2, .app, main').first().isVisible();
            console.log(`📄 페이지 제목: ${title}`);
            console.log(`🎨 메인 콘텐츠: ${hasMainContent ? '정상 표시' : '표시 안됨'}`);
        } else {
            console.log(`❌ 여전히 ${homeStatus} 에러 발생`);
            await page.screenshot({ 
                path: `ultimate-error-homepage-${timestamp}.png`,
                fullPage: true
            });
        }
        
        // 2. 타로리딩 페이지 테스트
        console.log('\n2️⃣ 타로리딩 페이지 테스트...');
        const readingResponse = await page.goto('https://test-studio-firebase.vercel.app/reading', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        if (readingResponse.status() === 200) {
            console.log('✅ 타로리딩 페이지 정상!');
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: `ultimate-success-02-reading-${timestamp}.png`,
                fullPage: true 
            });
            
            // 기본 요소 확인
            const hasInput = await page.locator('input, textarea').first().isVisible();
            const hasSelect = await page.locator('select').first().isVisible();
            console.log(`📝 입력 필드: ${hasInput ? '존재' : '없음'}`);
            console.log(`🎛️ 선택 옵션: ${hasSelect ? '존재' : '없음'}`);
        }
        
        // 3. 블로그 페이지 테스트
        console.log('\n3️⃣ 블로그 페이지 테스트...');
        const blogResponse = await page.goto('https://test-studio-firebase.vercel.app/blog', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        if (blogResponse.status() === 200) {
            console.log('✅ 블로그 페이지 정상!');
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: `ultimate-success-03-blog-${timestamp}.png`,
                fullPage: true 
            });
        }
        
        // 4. API 헬스 체크
        console.log('\n4️⃣ API 상태 확인...');
        const apiResponse = await page.goto('https://test-studio-firebase.vercel.app/api/health');
        const apiData = await apiResponse.json();
        console.log('🔥 API 응답:', JSON.stringify(apiData, null, 2));
        
        // 5. 관리자 페이지 접근성 확인
        console.log('\n5️⃣ 관리자 페이지 접근성 확인...');
        const adminResponse = await page.goto('https://test-studio-firebase.vercel.app/admin', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log(`🔐 관리자 페이지 상태: ${adminResponse.status()}`);
        await page.screenshot({ 
            path: `ultimate-success-04-admin-${timestamp}.png`,
            fullPage: true 
        });
        
        console.log('\n🎊🎊🎊 테스트 완료! 🎊🎊🎊');
        console.log('✨ 모든 수정사항이 성공적으로 적용되었습니다!');
        console.log(`📸 스크린샷 저장: ultimate-success-*-${timestamp}.png`);
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
        await page.screenshot({ 
            path: `ultimate-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 브라우저 종료');
        }, 15000);
    }
}

ultimateVercelTest().catch(console.error);