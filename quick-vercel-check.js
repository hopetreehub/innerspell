const { chromium } = require('playwright');

async function quickCheck() {
    console.log('⏳ Vercel 배포 상태 빠른 확인...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 30초마다 확인, 최대 10번
    for (let i = 0; i < 10; i++) {
        console.log(`\n📍 시도 ${i + 1}/10`);
        
        try {
            // 홈페이지 확인
            const response = await page.goto('https://test-studio-firebase.vercel.app', {
                timeout: 15000,
                waitUntil: 'domcontentloaded'
            });
            
            const status = response.status();
            console.log(`홈페이지 상태: ${status}`);
            
            if (status === 200) {
                console.log('✅ 배포 성공! 사이트가 정상 작동합니다.');
                
                // 스크린샷 저장
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await page.screenshot({ 
                    path: `quick-check-success-${timestamp}.png`,
                    fullPage: true 
                });
                console.log(`📸 스크린샷 저장됨: quick-check-success-${timestamp}.png`);
                break;
            } else if (status === 500) {
                const pageText = await page.textContent('body');
                if (pageText.includes('MIDDLEWARE_INVOCATION_FAILED')) {
                    console.log('⚠️  아직 미들웨어 오류 발생 중...');
                } else {
                    console.log('⚠️  다른 500 에러 발생');
                }
            }
        } catch (error) {
            console.log('⏳ 연결 실패... 배포 진행 중일 수 있습니다.');
        }
        
        if (i < 9) {
            console.log('⏳ 30초 후 다시 확인합니다...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
    
    await browser.close();
    console.log('\n🏁 확인 완료!');
}

quickCheck().catch(console.error);