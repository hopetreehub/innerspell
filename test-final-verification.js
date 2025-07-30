const { chromium } = require('playwright');

async function testFinalVerification() {
    console.log('🎯 Final Verification of AI Tarot Fix');
    console.log('📅 Date:', new Date().toISOString());
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Monitor errors
    const errors = [];
    let aiInterpretationSuccess = false;
    let interpretationContent = null;
    
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', text);
            errors.push(text);
            
            // Check for specific errors
            if (text.includes('generateTarotInterpretation') && text.includes('undefined')) {
                console.log('🚨 CRITICAL: generateTarotInterpretation returned undefined!');
            }
        } else if (msg.type() === 'log') {
            // Monitor successful AI calls
            if (text.includes('[TAROT]')) {
                console.log('📝 Tarot Log:', text);
            }
        }
    });
    
    try {
        // Step 1: Load Vercel deployment
        console.log('\n1️⃣ Loading Vercel deployment...');
        await page.goto('https://test-studio-firebase.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.screenshot({ path: 'final-01-homepage.png' });
        console.log('✅ Homepage loaded');
        
        // Step 2: Navigate to tarot reading
        console.log('\n2️⃣ Navigating to tarot reading...');
        await page.click('a[href="/reading"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'final-02-reading-page.png' });
        console.log('✅ Reading page loaded');
        
        // Step 3: Enter question
        console.log('\n3️⃣ Entering question...');
        const questionInput = page.locator('textarea[placeholder*="질문"]');
        await questionInput.fill('나의 앞으로의 운명은 어떻게 될까요?');
        await page.waitForTimeout(500);
        
        // Step 4: Shuffle cards
        console.log('\n4️⃣ Shuffling cards...');
        await page.click('button:has-text("카드 섞기")');
        await page.waitForTimeout(3000); // Wait for shuffle animation
        
        // Step 5: Reveal cards
        console.log('\n5️⃣ Revealing cards...');
        await page.click('button:has-text("카드 펼치기")');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'final-03-cards-revealed.png' });
        
        // Step 6: Select 3 cards
        console.log('\n6️⃣ Selecting 3 cards...');
        const cards = page.locator('[class*="cursor-pointer"]').filter({ hasNotText: 'AI' });
        
        for (let i = 0; i < 3; i++) {
            await cards.nth(i).click();
            console.log(`✅ Selected card ${i + 1}`);
            await page.waitForTimeout(500);
        }
        
        await page.screenshot({ path: 'final-04-cards-selected.png' });
        
        // Step 7: Click AI interpretation
        console.log('\n7️⃣ Requesting AI interpretation...');
        const aiButton = page.locator('button:has-text("AI 해석")');
        
        if (await aiButton.count() > 0) {
            await aiButton.click();
            console.log('✅ Clicked AI interpretation button');
            
            // Wait for interpretation with timeout
            console.log('⏳ Waiting for AI response...');
            
            try {
                // Wait for dialog to appear
                await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
                
                // Wait a bit more for content to load
                await page.waitForTimeout(5000);
                
                // Check for interpretation content
                const interpretationElement = await page.locator('[role="dialog"] .overflow-y-auto').first();
                if (interpretationElement) {
                    interpretationContent = await interpretationElement.textContent();
                    if (interpretationContent && interpretationContent.length > 50) {
                        aiInterpretationSuccess = true;
                        console.log('✅ AI interpretation received!');
                        console.log('Preview:', interpretationContent.substring(0, 200) + '...');
                    } else {
                        console.log('⚠️ Interpretation content too short or empty');
                    }
                }
                
                await page.screenshot({ path: 'final-05-ai-interpretation.png' });
                
            } catch (timeoutError) {
                console.log('❌ Timeout waiting for AI interpretation');
                await page.screenshot({ path: 'final-05-timeout.png' });
            }
        } else {
            console.log('❌ AI interpretation button not found');
        }
        
        // Final screenshot
        await page.screenshot({ path: 'final-06-complete.png' });
        
        // Results summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 FINAL VERIFICATION RESULTS');
        console.log('='.repeat(50));
        console.log('Vercel URL: https://test-studio-firebase.vercel.app');
        console.log('Total Errors:', errors.length);
        console.log('AI Interpretation Success:', aiInterpretationSuccess ? '✅ YES' : '❌ NO');
        
        if (aiInterpretationSuccess) {
            console.log('\n🎉 SUCCESS! AI tarot interpretation is working correctly!');
            console.log('Interpretation length:', interpretationContent?.length || 0, 'characters');
        } else {
            console.log('\n⚠️ ISSUE: AI interpretation did not complete successfully');
            console.log('\nErrors found:');
            errors.forEach((err, i) => {
                console.log(`${i + 1}. ${err}`);
            });
        }
        
        // Check for specific undefined error
        const hasUndefinedError = errors.some(err => 
            err.includes('generateTarotInterpretation') && err.includes('undefined')
        );
        
        if (hasUndefinedError) {
            console.log('\n🚨 CRITICAL: generateTarotInterpretation undefined error still exists!');
        } else {
            console.log('\n✅ No generateTarotInterpretation undefined errors detected');
        }
        
    } catch (error) {
        console.log('\n💥 Test failed:', error.message);
        await page.screenshot({ path: 'final-error.png' });
    } finally {
        await browser.close();
        console.log('\n✅ Test completed');
    }
}

testFinalVerification().catch(console.error);