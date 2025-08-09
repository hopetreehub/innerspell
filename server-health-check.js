const { chromium } = require('playwright');
const { spawn } = require('child_process');

async function startServerAndCheck() {
    console.log('🚀 서버 시작 및 상태 확인 스크립트');
    console.log('=====================================');
    
    // 1. 서버 시작
    console.log('📍 1. Next.js 서버 시작...');
    const serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
    });
    
    let serverReady = false;
    let serverOutput = '';
    
    // 서버 출력 모니터링
    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        serverOutput += output;
        console.log('서버 출력:', output.trim());
        
        if (output.includes('Ready') || output.includes('compiled successfully')) {
            serverReady = true;
        }
    });
    
    serverProcess.stderr.on('data', (data) => {
        console.error('서버 에러:', data.toString().trim());
    });
    
    // 서버 준비 대기 (최대 60초)
    console.log('⏳ 서버 준비 대기 중...');
    for (let i = 0; i < 60; i++) {
        if (serverReady) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (i % 5 === 0) {
            console.log(`   ${i}초 경과 - 서버 준비 대기 중...`);
        }
    }
    
    if (!serverReady) {
        console.log('⚠️ 서버가 60초 내에 준비되지 않았습니다. 강제로 테스트 진행...');
    } else {
        console.log('✅ 서버 준비 완료!');
    }
    
    // 2. Playwright로 서버 접속 테스트
    console.log('\n📍 2. Playwright 서버 접속 테스트');
    
    let browser;
    try {
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        
        const page = await context.newPage();
        
        // 홈페이지 접속 시도
        console.log('🔍 홈페이지 접속 시도...');
        
        try {
            await page.goto('http://localhost:4000', { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            await page.waitForTimeout(3000);
            
            // 스크린샷 촬영
            await page.screenshot({ 
                path: `server-restart-success-${Date.now()}.png`, 
                fullPage: false 
            });
            
            console.log('✅ 홈페이지 접속 성공!');
            console.log('📸 스크린샷 저장 완료');
            
            // 간단한 상호작용 테스트
            const title = await page.title();
            console.log(`📄 페이지 제목: ${title}`);
            
            return { success: true, message: '서버 재시작 및 접속 성공!' };
            
        } catch (pageError) {
            console.error('❌ 페이지 접속 실패:', pageError.message);
            
            await page.screenshot({ 
                path: `server-restart-error-${Date.now()}.png`, 
                fullPage: true 
            });
            
            return { success: false, error: pageError.message };
        }
        
    } catch (browserError) {
        console.error('❌ 브라우저 시작 실패:', browserError.message);
        return { success: false, error: browserError.message };
        
    } finally {
        if (browser) {
            await browser.close();
        }
        
        // 서버 프로세스 정리
        if (serverProcess && !serverProcess.killed) {
            console.log('🛑 서버 프로세스 종료...');
            serverProcess.kill('SIGTERM');
        }
    }
}

// 스크립트 실행
startServerAndCheck()
    .then(result => {
        console.log('\n' + '='.repeat(40));
        if (result.success) {
            console.log('🎉 서버 재시작 성공!');
            console.log('📄', result.message);
        } else {
            console.log('❌ 서버 재시작 실패');
            console.log('📄 오류:', result.error);
        }
        console.log('='.repeat(40));
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('스크립트 실행 오류:', error);
        process.exit(1);
    });