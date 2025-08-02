const puppeteer = require('puppeteer');

(async () => {
    console.log('🧪 Testing Dream Interpretation Fallback System...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    try {
        // Step 1: Navigate and take initial screenshot
        console.log('📱 Loading dream interpretation page...');
        await page.goto('https://test-studio-firebase.vercel.app/dream-interpretation', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await page.screenshot({ path: 'fallback-test-01-initial.png', fullPage: true });
        console.log('✅ Page loaded successfully');
        
        // Step 2: Enter dream description
        console.log('✍️ Entering dream description...');
        await page.waitForSelector('#dream-description', { timeout: 10000 });
        await page.type('#dream-description', '하늘을 나는 꿈을 꾸었습니다. 자유롭게 구름 위를 날아다니며 아름다운 풍경을 보았습니다.');
        
        await page.screenshot({ path: 'fallback-test-02-dream-entered.png', fullPage: true });
        console.log('✅ Dream description entered');
        
        // Step 3: Click next step button
        console.log('⏭️ Clicking next step button...');
        await page.click('button:contains("다음 단계")');
        
        // Step 4: Wait and monitor the process
        console.log('⏳ Waiting for AI questions or fallback...');
        
        // Wait for either questions to appear or loading to complete
        let attempts = 0;
        let questionsFound = false;
        
        while (attempts < 12 && !questionsFound) { // Wait up to 60 seconds (12 * 5)
            await page.waitForTimeout(5000);
            attempts++;
            
            // Take periodic screenshots
            await page.screenshot({ path: `fallback-test-03-waiting-${attempts}.png`, fullPage: true });
            
            // Check for questions
            const radioButtons = await page.$$('input[type="radio"]');
            const questionElements = await page.$$eval('*', elements => 
                elements.filter(el => el.textContent && el.textContent.includes('질문')).length
            );
            
            console.log(`Attempt ${attempts}: Found ${radioButtons.length} radio buttons, ${questionElements} question elements`);
            
            if (radioButtons.length > 0) {
                questionsFound = true;
                console.log('✅ Questions appeared (AI or fallback)');
                
                // Answer the questions
                console.log('📝 Answering questions...');
                for (let i = 0; i < Math.min(radioButtons.length, 12); i += 4) {
                    await radioButtons[i].click();
                    await page.waitForTimeout(500);
                }
                
                await page.screenshot({ path: 'fallback-test-04-questions-answered.png', fullPage: true });
                
                // Look for interpretation button
                const buttons = await page.$$('button');
                for (let button of buttons) {
                    const text = await page.evaluate(el => el.textContent, button);
                    if (text && (text.includes('해몽') || text.includes('AI') || text.includes('완료'))) {
                        console.log('🔮 Clicking interpretation button...');
                        await button.click();
                        break;
                    }
                }
                
                // Wait for interpretation result
                console.log('⏳ Waiting for interpretation result...');
                await page.waitForTimeout(10000);
                await page.screenshot({ path: 'fallback-test-05-interpretation.png', fullPage: true });
                
                // Check for results
                const pageText = await page.evaluate(() => document.body.textContent);
                if (pageText.includes('해몽') || pageText.includes('해석') || pageText.includes('꿈은') || pageText.includes('의미')) {
                    console.log('✅ Interpretation result found');
                } else {
                    console.log('❌ No interpretation result found');
                }
                
                break;
            }
        }
        
        if (!questionsFound) {
            console.log('❌ No questions appeared after waiting');
            
            // Check if we're stuck in loading
            const loadingElements = await page.$$eval('*', elements => 
                elements.filter(el => el.textContent && 
                    (el.textContent.includes('질문을') || el.textContent.includes('로딩') || el.textContent.includes('생성'))).length
            );
            
            if (loadingElements > 0) {
                console.log('⚠️ Seems to be stuck in loading state - fallback should have activated');
            }
        }
        
        await page.screenshot({ path: 'fallback-test-06-final.png', fullPage: true });
        
        console.log('✅ Dream interpretation fallback test completed!');
        console.log('📸 Screenshots saved with prefix: fallback-test-');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'fallback-test-error.png', fullPage: true });
    }
    
    // Keep browser open for inspection
    console.log('🔍 Browser kept open for manual inspection. Close when done.');
    
    // Uncomment to close automatically after 30 seconds
    // setTimeout(async () => { await browser.close(); }, 30000);
})();