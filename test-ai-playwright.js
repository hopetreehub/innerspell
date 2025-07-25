const { chromium } = require('playwright');

async function testAIIntegration() {
    console.log('=== AI Integration Test with Playwright ===\n');
    
    const browser = await chromium.launch({ headless: false }); // Set to false to see what's happening
    const page = await browser.newPage();
    
    try {
        console.log('1. Opening homepage...');
        await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
        
        const title = await page.title();
        console.log(`   ✓ Page title: ${title}`);
        
        // Take screenshot of homepage
        await page.screenshot({ path: 'ai-test-01-homepage.png' });
        console.log('   ✓ Homepage screenshot saved');
        
        console.log('\n2. Looking for tarot reading functionality...');
        
        // Look for links related to tarot reading
        const readingLinks = await page.$$eval('a', links => 
            links.filter(link => 
                link.textContent.includes('타로') || 
                link.textContent.includes('리딩') || 
                link.href.includes('reading')
            ).map(link => ({ text: link.textContent, href: link.href }))
        );
        
        console.log('   Found reading links:', readingLinks);
        
        if (readingLinks.length > 0) {
            // Click on the first tarot reading link
            await page.click(`a[href*="reading"]`);
            await page.waitForLoadState('networkidle');
            console.log('   ✓ Navigated to reading page');
        } else {
            // Direct navigation
            await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
            console.log('   ✓ Direct navigation to reading page');
        }
        
        // Take screenshot of reading page
        await page.screenshot({ path: 'ai-test-02-reading-page.png' });
        console.log('   ✓ Reading page screenshot saved');
        
        console.log('\n3. Testing question input and card drawing...');
        
        // Look for question input field
        const questionInput = await page.$('input[type="text"], textarea, input[placeholder*="질문"]');
        if (questionInput) {
            await questionInput.fill('AI 테스트를 위한 질문입니다');
            console.log('   ✓ Question entered');
        } else {
            console.log('   ! No question input found');
        }
        
        // Look for buttons that might start the reading
        const buttons = await page.$$eval('button', buttons => 
            buttons.map(btn => btn.textContent.trim()).filter(text => 
                text.includes('시작') || 
                text.includes('카드') || 
                text.includes('리딩') ||
                text.includes('뽑기')
            )
        );
        
        console.log('   Found buttons:', buttons);
        
        if (buttons.length > 0) {
            // Try to click a start button
            await page.click('button');
            await page.waitForTimeout(3000); // Wait for cards to be dealt
            console.log('   ✓ Button clicked, waiting for response');
        }
        
        // Take screenshot after interaction
        await page.screenshot({ path: 'ai-test-03-after-interaction.png' });
        console.log('   ✓ After interaction screenshot saved');
        
        console.log('\n4. Checking for AI-related content...');
        
        // Check page content for AI-related text
        const pageText = await page.textContent('body');
        
        const aiIndicators = [
            'AI 해석',
            'API 키',
            '설정되지 않았습니다',
            'OpenAI',
            'Gemini',
            '해석 생성 중',
            'Loading',
            '타로 해석'
        ];
        
        const foundIndicators = aiIndicators.filter(indicator => 
            pageText.includes(indicator)
        );
        
        console.log('   Found AI indicators:', foundIndicators);
        
        // Check network requests for AI API calls
        const requests = [];
        page.on('request', request => {
            if (request.url().includes('api') || request.url().includes('openai') || request.url().includes('gemini')) {
                requests.push(request.url());
            }
        });
        
        // Wait a bit more to catch any async AI requests
        await page.waitForTimeout(5000);
        
        if (requests.length > 0) {
            console.log('   API requests detected:', requests);
        } else {
            console.log('   No AI API requests detected');
        }
        
        // Check console logs for AI-related messages
        const logs = [];
        page.on('console', msg => {
            if (msg.text().includes('AI') || msg.text().includes('GENKIT') || msg.text().includes('TAROT')) {
                logs.push(msg.text());
            }
        });
        
        if (logs.length > 0) {
            console.log('   Console logs (AI-related):', logs);
        }
        
        console.log('\n5. Final assessment...');
        
        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);
        
        // Check if we're in a functional state
        const hasErrorMessages = pageText.includes('error') || pageText.includes('오류');
        const hasApiKeyWarning = pageText.includes('API 키') && pageText.includes('설정되지 않았습니다');
        
        if (hasApiKeyWarning) {
            console.log('   ⚠ AI API keys are not configured - this is expected for initial setup');
        } else if (hasErrorMessages) {
            console.log('   ✗ Error messages detected in the interface');
        } else {
            console.log('   ✓ Interface appears to be functioning normally');
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
        await page.screenshot({ path: 'ai-test-error.png' });
    } finally {
        await browser.close();
    }
}

testAIIntegration().catch(console.error);