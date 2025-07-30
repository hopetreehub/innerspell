const { chromium } = require('playwright');
const fs = require('fs').promises;

async function debugDomInspection() {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 로그 모니터링
    page.on('console', msg => {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    // 에러 모니터링
    page.on('pageerror', error => {
        console.error('[PAGE ERROR]', error.message);
        console.error('[STACK]', error.stack);
    });
    
    try {
        console.log('[DEBUG] Vercel 사이트 접속...');
        await page.goto('https://tarot-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        // 페이지 완전 로드 대기
        await page.waitForTimeout(5000);
        
        // 초기 스크린샷
        await page.screenshot({ path: 'debug-screenshots/dom-initial.png' });
        
        // DOM 전체 구조 분석
        const domAnalysis = await page.evaluate(() => {
            return {
                title: document.title,
                bodyClasses: document.body.className,
                allButtons: Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent?.trim(),
                    className: btn.className,
                    id: btn.id,
                    disabled: btn.disabled
                })),
                allLinks: Array.from(document.querySelectorAll('a')).map(link => ({
                    text: link.textContent?.trim(),
                    href: link.href,
                    className: link.className
                })),
                mainContent: document.querySelector('main')?.innerHTML || 'No main element',
                errorElements: Array.from(document.querySelectorAll('[class*="error"], .text-red-500')).map(el => ({
                    text: el.textContent,
                    className: el.className
                }))
            };
        });
        
        console.log('[DOM ANALYSIS]', JSON.stringify(domAnalysis, null, 2));
        
        // Firebase 스크립트 로드 상태 확인
        const scriptAnalysis = await page.evaluate(() => {
            return {
                firebaseScripts: Array.from(document.querySelectorAll('script')).filter(script => 
                    script.src?.includes('firebase') || script.innerHTML?.includes('firebase')
                ).map(script => ({
                    src: script.src,
                    hasInlineCode: script.innerHTML.length > 0
                })),
                windowFirebase: typeof window.firebase,
                consoleLogs: []
            };
        });
        
        console.log('[SCRIPT ANALYSIS]', JSON.stringify(scriptAnalysis, null, 2));
        
        // 네트워크 상태 확인
        const networkState = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/test', { method: 'GET' });
                return {
                    testApiStatus: response.status,
                    testApiText: await response.text()
                };
            } catch (error) {
                return {
                    testApiError: error.message
                };
            }
        });
        
        console.log('[NETWORK STATE]', networkState);
        
        // 가능한 버튼 텍스트 찾기
        const possibleButtons = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'));
            return buttons.map(btn => ({
                text: btn.textContent?.trim(),
                tagName: btn.tagName,
                className: btn.className,
                onClick: btn.onclick?.toString(),
                href: btn.href
            })).filter(btn => btn.text);
        });
        
        console.log('[POSSIBLE BUTTONS]', possibleButtons);
        
        // 실제로 존재하는 버튼 클릭 시도
        const startButton = possibleButtons.find(btn => 
            btn.text?.includes('시작') || 
            btn.text?.includes('타로') ||
            btn.text?.includes('Start') ||
            btn.text?.includes('시작하기')
        );
        
        if (startButton) {
            console.log(`[DEBUG] Found start button: ${startButton.text}`);
            try {
                await page.click(`text=${startButton.text}`);
                await page.waitForTimeout(3000);
                await page.screenshot({ path: 'debug-screenshots/after-click.png' });
                
                // 클릭 후 상태 확인
                const afterClickState = await page.evaluate(() => {
                    return {
                        url: window.location.href,
                        newButtons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()),
                        forms: Array.from(document.querySelectorAll('form, textarea, input')).map(el => ({
                            tagName: el.tagName,
                            type: el.type,
                            placeholder: el.placeholder,
                            value: el.value
                        }))
                    };
                });
                
                console.log('[AFTER CLICK STATE]', afterClickState);
                
            } catch (clickError) {
                console.error('[CLICK ERROR]', clickError.message);
            }
        } else {
            console.log('[WARNING] No start button found');
        }
        
        // 최종 보고서 생성
        const debugReport = {
            timestamp: new Date().toISOString(),
            domAnalysis,
            scriptAnalysis,
            networkState,
            possibleButtons,
            foundStartButton: startButton
        };
        
        await fs.writeFile(
            'debug-dom-report.json',
            JSON.stringify(debugReport, null, 2)
        );
        
        console.log('\n[DEBUG COMPLETE] DOM report saved');
        
        // 브라우저 열어둠
        console.log('\n[INFO] Browser inspection ready. Check the screenshots and report.');
        
    } catch (error) {
        console.error('[DEBUG ERROR]', error);
        await page.screenshot({ path: 'debug-screenshots/dom-error.png' });
    }
}

debugDomInspection();