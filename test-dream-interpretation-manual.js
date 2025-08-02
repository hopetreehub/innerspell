const puppeteer = require('puppeteer');

(async () => {
    console.log('🧪 Starting Manual Dream Interpretation Test...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    try {
        // Step 1: Navigate to dream interpretation page
        console.log('📱 Navigating to dream interpretation page...');
        await page.goto('https://test-studio-firebase.vercel.app/dream-interpretation', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await page.screenshot({ path: 'dream-manual-01-initial.png', fullPage: true });
        
        // Step 2: Enter dream description
        console.log('✍️ Entering dream description...');
        const dreamInput = await page.$('#dream-description');
        if (dreamInput) {
            await dreamInput.type('어젯밤 아름다운 정원에서 나비들과 함께 춤을 추는 꿈을 꾸었습니다. 색색의 꽃들이 피어있었고 따뜻한 햇살이 내리쬐었습니다.');
            console.log('✅ Dream description entered successfully');
        } else {
            console.log('❌ Dream input field not found');
        }
        
        await page.screenshot({ path: 'dream-manual-02-description-entered.png', fullPage: true });
        
        // Step 3: Click next step button
        console.log('⏭️ Clicking next step button...');
        const nextButton = await page.$('button:contains("다음 단계")');
        if (!nextButton) {
            const buttons = await page.$$('button');
            console.log(`Found ${buttons.length} buttons on page`);
            for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                const buttonText = await page.evaluate(el => el.textContent, buttons[i]);
                console.log(`Button ${i}: "${buttonText}"`);
                if (buttonText.includes('다음') || buttonText.includes('질문')) {
                    await buttons[i].click();
                    console.log('✅ Clicked next step button');
                    break;
                }
            }
        } else {
            await nextButton.click();
            console.log('✅ Next step button clicked');
        }
        
        // Step 4: Wait for questions to appear
        console.log('⏳ Waiting for questions to appear...');
        await page.waitForTimeout(8000);
        await page.screenshot({ path: 'dream-manual-03-questions-loaded.png', fullPage: true });
        
        // Step 5: Check for questions and answer them
        const radioButtons = await page.$$('input[type="radio"]');
        console.log(`📝 Found ${radioButtons.length} radio buttons`);
        
        if (radioButtons.length > 0) {
            // Answer first question
            await radioButtons[0].click();
            console.log('✅ Answered question 1');
            
            if (radioButtons.length > 4) {
                await radioButtons[4].click();
                console.log('✅ Answered question 2');
            }
            
            if (radioButtons.length > 8) {
                await radioButtons[8].click();
                console.log('✅ Answered question 3');
            }
        }
        
        await page.screenshot({ path: 'dream-manual-04-questions-answered.png', fullPage: true });
        
        // Step 6: Click interpretation button
        console.log('🔮 Looking for interpretation button...');
        const interpretButtons = await page.$$('button');
        for (let button of interpretButtons) {
            const buttonText = await page.evaluate(el => el.textContent, button);
            if (buttonText.includes('해몽') || buttonText.includes('AI') || buttonText.includes('해석')) {
                await button.click();
                console.log('✅ Clicked interpretation button');
                break;
            }
        }
        
        // Step 7: Wait for interpretation results
        console.log('⏳ Waiting for interpretation results...');
        await page.waitForTimeout(10000);
        await page.screenshot({ path: 'dream-manual-05-interpretation-results.png', fullPage: true });
        
        // Step 8: Check for results
        const resultElements = await page.$$('div');
        let foundResult = false;
        for (let element of resultElements.slice(0, 20)) {
            const text = await page.evaluate(el => el.textContent, element);
            if (text && (text.includes('해몽') || text.includes('해석') || text.includes('꿈은') || text.includes('의미'))) {
                foundResult = true;
                console.log('✅ Interpretation result found!');
                console.log(`📖 Result preview: ${text.substring(0, 100)}...`);
                break;
            }
        }
        
        if (!foundResult) {
            console.log('❌ No interpretation result found');
        }
        
        await page.screenshot({ path: 'dream-manual-06-final-state.png', fullPage: true });
        
        console.log('✅ Dream interpretation test completed!');
        console.log('📸 Screenshots saved:');
        console.log('   - dream-manual-01-initial.png');
        console.log('   - dream-manual-02-description-entered.png');
        console.log('   - dream-manual-03-questions-loaded.png');
        console.log('   - dream-manual-04-questions-answered.png');
        console.log('   - dream-manual-05-interpretation-results.png');
        console.log('   - dream-manual-06-final-state.png');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'dream-manual-error.png', fullPage: true });
    }
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser kept open for manual inspection. Close when finished.');
    
    // Uncomment to close automatically
    // await browser.close();
})();