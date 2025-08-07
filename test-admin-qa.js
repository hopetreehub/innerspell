const { chromium } = require('playwright');
const path = require('path');

async function testAdminPage() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    
    const screenshotDir = path.join(__dirname, 'qa-screenshots');
    const fs = require('fs');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    try {
        console.log('\n=== QA 테스트 시작 ===\n');
        
        // 1. 관리자 페이지 직접 접속
        console.log('1. 관리자 페이지 접속 테스트');
        console.log('   - URL: http://localhost:4000/admin');
        await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Mock 인증 확인
        const mockBadge = await page.locator('text=/Mock Mode/i').isVisible();
        console.log(`   - Mock 인증 배지 표시: ${mockBadge ? '✅ 정상' : '❌ 실패'}`);
        
        // 페이지 로드 확인
        const adminTitle = await page.locator('h1:has-text("관리자 대시보드")').isVisible();
        console.log(`   - 관리자 대시보드 타이틀: ${adminTitle ? '✅ 정상' : '❌ 실패'}`);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, 'admin-main.png'),
            fullPage: true 
        });
        console.log('   - 스크린샷 저장: admin-main.png\n');

        // 2. 사용통계 탭 확인
        console.log('2. 사용통계 탭 확인');
        
        // 사용통계 탭 클릭
        const statsTab = await page.locator('button:has-text("사용통계")');
        const isStatsTabVisible = await statsTab.isVisible();
        console.log(`   - 사용통계 탭 표시: ${isStatsTabVisible ? '✅ 정상' : '❌ 실패'}`);
        
        if (isStatsTabVisible) {
            await statsTab.click();
            await page.waitForTimeout(2000);
            
            // Mock 데이터 배지 확인
            const mockDataBadges = await page.locator('.bg-yellow-100:has-text("Mock 데이터")').count();
            console.log(`   - Mock 데이터 배지 개수: ${mockDataBadges}개`);
            
            // 차트 렌더링 확인
            const charts = await page.locator('canvas').count();
            console.log(`   - 렌더링된 차트 개수: ${charts}개`);
            
            // 통계 카드 확인
            const statCards = await page.locator('.bg-card').count();
            console.log(`   - 통계 카드 개수: ${statCards}개`);
            
            await page.screenshot({ 
                path: path.join(screenshotDir, 'usage-stats-tab.png'),
                fullPage: true 
            });
            console.log('   - 스크린샷 저장: usage-stats-tab.png\n');
        }

        // 3. 실시간 모니터링 탭 확인
        console.log('3. 실시간 모니터링 탭 확인');
        
        // 실시간 모니터링 탭 클릭
        const monitoringTab = await page.locator('button:has-text("실시간 모니터링")');
        const isMonitoringTabVisible = await monitoringTab.isVisible();
        console.log(`   - 실시간 모니터링 탭 표시: ${isMonitoringTabVisible ? '✅ 정상' : '❌ 실패'}`);
        
        if (isMonitoringTabVisible) {
            await monitoringTab.click();
            await page.waitForTimeout(2000);
            
            // 실시간 데이터 표시 확인
            const realtimeStats = await page.locator('.text-2xl.font-bold').count();
            console.log(`   - 실시간 통계 표시 개수: ${realtimeStats}개`);
            
            // 활성 사용자 수 확인
            const activeUsersText = await page.locator('text=/활성 사용자/i').isVisible();
            console.log(`   - 활성 사용자 표시: ${activeUsersText ? '✅ 정상' : '❌ 실패'}`);
            
            // 자동 새로고침 상태 확인
            const autoRefreshButton = await page.locator('button:has-text("자동 새로고침")');
            const isAutoRefreshVisible = await autoRefreshButton.isVisible();
            console.log(`   - 자동 새로고침 버튼: ${isAutoRefreshVisible ? '✅ 정상' : '❌ 실패'}`);
            
            await page.screenshot({ 
                path: path.join(screenshotDir, 'realtime-monitoring-tab.png'),
                fullPage: true 
            });
            console.log('   - 스크린샷 저장: realtime-monitoring-tab.png\n');
        }

        // 4. 기능 상호작용 테스트
        console.log('4. 기능 상호작용 테스트');
        
        // 탭 전환 기능
        console.log('   a) 탭 전환 기능 테스트');
        const tabs = ['대시보드', '사용통계', '실시간 모니터링', '타로 지침'];
        
        for (const tabName of tabs) {
            const tab = await page.locator(`button:has-text("${tabName}")`);
            if (await tab.isVisible()) {
                await tab.click();
                await page.waitForTimeout(1000);
                console.log(`      - ${tabName} 탭 전환: ✅ 정상`);
            }
        }
        
        // 사용통계 탭으로 다시 이동
        await page.locator('button:has-text("사용통계")').click();
        await page.waitForTimeout(1000);
        
        // 새로고침 버튼 테스트
        console.log('   b) 새로고침 버튼 테스트');
        const refreshButtons = await page.locator('button:has-text("새로고침")');
        const refreshCount = await refreshButtons.count();
        
        if (refreshCount > 0) {
            await refreshButtons.first().click();
            await page.waitForTimeout(1000);
            console.log(`      - 새로고침 버튼 클릭: ✅ 정상 (${refreshCount}개 발견)`);
        }
        
        // 반응형 확인
        console.log('   c) 반응형 디자인 테스트');
        
        // 태블릿 사이즈
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'admin-tablet-view.png'),
            fullPage: true 
        });
        console.log('      - 태블릿 뷰 (768x1024): ✅ 스크린샷 저장');
        
        // 모바일 사이즈
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'admin-mobile-view.png'),
            fullPage: true 
        });
        console.log('      - 모바일 뷰 (375x812): ✅ 스크린샷 저장');
        
        // 데스크톱으로 복귀
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        console.log('\n=== QA 테스트 완료 ===\n');
        console.log('모든 스크린샷은 qa-screenshots 폴더에 저장되었습니다.');
        
    } catch (error) {
        console.error('테스트 중 오류 발생:', error);
        await page.screenshot({ 
            path: path.join(screenshotDir, 'error-screenshot.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
}

testAdminPage();