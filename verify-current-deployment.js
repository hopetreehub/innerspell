const { chromium } = require('playwright');

async function verifyCurrentDeployment() {
    console.log('🔍 Verifying Current Vercel Deployment...');
    console.log('📅 Test Date:', new Date().toISOString());
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 에러 추적
    const errors = [];
    const networkErrors = [];
    const consoleErrors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            console.log('❌ Console Error:', text);
            consoleErrors.push(text);
            errors.push({ type: 'console', message: text });
        }
    });
    
    page.on('pageerror', error => {
        const message = error.message;
        console.log('💥 Page Error:', message);
        errors.push({ type: 'page', message });
    });
    
    page.on('response', response => {
        if (response.status() >= 400) {
            const error = `${response.status()} ${response.url()}`;
            console.log('🌐 Network Error:', error);
            networkErrors.push(error);
            errors.push({ type: 'network', message: error });
        }
    });
    
    try {
        // 메인 Vercel URL
        const mainUrl = 'https://test-studio-firebase.vercel.app';
        
        console.log('\n1️⃣ Testing Main Vercel URL:', mainUrl);
        const mainResponse = await page.goto(mainUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        console.log('Response status:', mainResponse.status());
        console.log('Response URL:', mainResponse.url());
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'verify-01-main.png' });
        
        const title = await page.title();
        console.log('Page title:', title);
        
        // 페이지 내용 확인
        const bodyText = await page.locator('body').textContent();
        console.log('Page content length:', bodyText.length);
        
        // 타로 관련 링크 찾기
        console.log('\n2️⃣ Searching for Tarot functionality...');
        
        const tarotLinks = await page.locator('a').evaluateAll(links => 
            links.map(link => ({
                text: link.textContent?.trim(),
                href: link.href
            })).filter(link => 
                link.text?.includes('타로') || 
                link.text?.includes('읽기') || 
                link.href?.includes('reading') ||
                link.href?.includes('tarot')
            )
        );
        
        console.log('Found tarot-related links:', tarotLinks.length);
        tarotLinks.forEach((link, i) => {
            console.log(`  ${i + 1}. "${link.text}" -> ${link.href}`);
        });
        
        if (tarotLinks.length > 0) {
            // 첫 번째 타로 링크 클릭
            const firstTarotLink = page.locator(`a[href="${tarotLinks[0].href}"]`).first();
            await firstTarotLink.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'verify-02-tarot.png' });
            
            console.log('\n3️⃣ Checking AI interpretation functionality...');
            
            // AI 관련 버튼 찾기
            const aiButtons = await page.locator('button').evaluateAll(buttons => 
                buttons.map(btn => ({
                    text: btn.textContent?.trim(),
                    disabled: btn.disabled
                })).filter(btn => 
                    btn.text?.includes('AI') || 
                    btn.text?.includes('해석') ||
                    btn.text?.includes('인공지능')
                )
            );
            
            console.log('Found AI-related buttons:', aiButtons.length);
            aiButtons.forEach((btn, i) => {
                console.log(`  ${i + 1}. "${btn.text}" (disabled: ${btn.disabled})`);
            });
            
            if (aiButtons.length > 0 && !aiButtons[0].disabled) {
                const firstAIButton = page.locator('button').filter({ hasText: aiButtons[0].text }).first();
                await firstAIButton.click();
                console.log('Clicked AI button, waiting for response...');
                await page.waitForTimeout(5000);
                await page.screenshot({ path: 'verify-03-ai-click.png' });
                
                // AI 응답 확인
                const aiResponse = await page.locator('[class*="ai"], [class*="interpretation"], [data-testid*="ai"]').textContent().catch(() => null);
                if (aiResponse) {
                    console.log('AI Response found:', aiResponse.substring(0, 100) + '...');
                } else {
                    console.log('No AI response element found');
                }
            }
        }
        
        // 최종 상태 스크린샷
        await page.screenshot({ path: 'verify-04-final.png' });
        
        // 결과 요약
        console.log('\n📊 DEPLOYMENT VERIFICATION RESULTS:');
        console.log('===================================');
        console.log('URL:', mainUrl);
        console.log('Status:', mainResponse.status() === 200 ? '✅ ONLINE' : '❌ ERROR');
        console.log('Title:', title);
        console.log('Console Errors:', consoleErrors.length);
        console.log('Network Errors:', networkErrors.length);
        console.log('Total Errors:', errors.length);
        
        if (errors.length > 0) {
            console.log('\n❌ Error Details:');
            errors.forEach((error, i) => {
                console.log(`${i + 1}. [${error.type}] ${error.message}`);
            });
        } else {
            console.log('\n✅ No errors detected!');
        }
        
        // getActiveAIModels 관련 에러 체크
        const getActiveAIModelsErrors = errors.filter(e => 
            e.message.includes('getActiveAIModels')
        );
        
        if (getActiveAIModelsErrors.length > 0) {
            console.log('\n🚨 CRITICAL: getActiveAIModels errors found!');
        } else {
            console.log('\n✅ No getActiveAIModels errors!');
        }
        
    } catch (error) {
        console.log('\n💥 Test Failed:', error.message);
        await page.screenshot({ path: 'verify-error.png' });
    } finally {
        await browser.close();
        console.log('\n✅ Test completed');
    }
}

verifyCurrentDeployment().catch(console.error);