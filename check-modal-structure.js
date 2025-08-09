const { chromium } = require('playwright');

async function checkModalStructure() {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:4000/admin');
        await page.waitForLoadState('networkidle');
        
        await page.click('text=블로그 관리');
        await page.waitForTimeout(2000);
        
        await page.click('button:has-text("새 포스트 작성")');
        await page.waitForTimeout(2000);
        
        // 모달 스크린샷
        await page.screenshot({ path: 'modal-structure.png', fullPage: true });
        
        // DOM 구조 확인
        const modalContent = await page.evaluate(() => {
            const modal = document.querySelector('[role="dialog"]');
            return modal ? modal.innerHTML : 'Modal not found';
        });
        
        console.log('Modal HTML structure:');
        console.log(modalContent.substring(0, 2000)); // 처음 2000자만 출력
        
    } catch (error) {
        console.error('에러 발생:', error);
    } finally {
        await browser.close();
    }
}

checkModalStructure();