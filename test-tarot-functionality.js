/**
 * Tarot Reading Functionality Test
 * 
 * Tests the complete tarot reading flow including:
 * - Question input
 * - Card drawing/selection
 * - Reading generation
 * - Save functionality (if available)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4000';
const SCREENSHOTS_DIR = path.join(__dirname, 'tarot-functionality-screenshots');
const TIMEOUT = 20000;

const testResults = {
  timestamp: new Date().toISOString(),
  tarotFlow: [],
  errors: [],
  screenshots: []
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  
  if (type === 'error') {
    testResults.errors.push({ timestamp, message });
  }
}

async function takeScreenshot(page, name, description) {
  try {
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true,
      timeout: 5000 
    });
    
    testResults.screenshots.push({
      name,
      description,
      path: screenshotPath,
      timestamp: new Date().toISOString()
    });
    
    log(`Screenshot: ${name} - ${description}`);
    return screenshotPath;
  } catch (error) {
    log(`Screenshot failed: ${name}`, 'error');
    return null;
  }
}

async function testTarotReadingFlow(page) {
  log('=== Testing Complete Tarot Reading Flow ===');
  
  try {
    // Step 1: Navigate to reading page
    log('Step 1: Navigating to reading page...');
    await page.goto(`${BASE_URL}/reading`, { 
      waitUntil: 'domcontentloaded', 
      timeout: TIMEOUT 
    });
    
    await takeScreenshot(page, '01-reading-page-loaded', 'Reading page initial load');
    
    // Step 2: Enter a question
    log('Step 2: Entering question...');
    const questionInput = await page.locator('textarea, input[type="text"]').first();
    
    if (await questionInput.count() > 0) {
      const testQuestion = "오늘 나에게 필요한 메시지는 무엇인가요?";
      await questionInput.fill(testQuestion);
      await takeScreenshot(page, '02-question-entered', 'Question entered');
      log(`Question entered: "${testQuestion}"`);
      
      testResults.tarotFlow.push({
        step: 'question_input',
        status: 'success',
        details: { question: testQuestion }
      });
    } else {
      throw new Error('Question input field not found');
    }
    
    // Step 3: Look for tarot spread or card selection
    log('Step 3: Looking for tarot spread options...');
    
    const spreadSelectors = [
      'select', // Dropdown for spread selection
      '[data-testid="spread-select"]',
      'button:has-text("스프레드")',
      'button:has-text("Spread")'
    ];
    
    for (const selector of spreadSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          log(`Found spread selector: ${selector}`);
          if (selector === 'select') {
            // If it's a dropdown, select an option
            await element.selectOption({ index: 1 }); // Select second option
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await takeScreenshot(page, '03-spread-selected', 'Spread selection');
    
    // Step 4: Look for start reading or shuffle button
    log('Step 4: Looking for reading start button...');
    
    const startButtonSelectors = [
      'button:has-text("리딩 시작")',
      'button:has-text("Start Reading")',
      'button:has-text("카드 뽑기")',
      'button:has-text("Shuffle")',
      'button:has-text("Draw Cards")',
      '[data-testid="start-reading"]'
    ];
    
    let startButton = null;
    for (const selector of startButtonSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.count() > 0 && await button.isVisible() && await button.isEnabled()) {
          startButton = button;
          log(`Found start button: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (startButton) {
      log('Clicking start reading button...');
      await startButton.click();
      await page.waitForTimeout(3000); // Wait for cards to load/shuffle
      
      await takeScreenshot(page, '04-reading-started', 'Reading started - cards loading');
      
      testResults.tarotFlow.push({
        step: 'reading_started',
        status: 'success',
        details: { buttonFound: true }
      });
    } else {
      log('No start button found, checking if cards are already visible');
      testResults.tarotFlow.push({
        step: 'reading_started',
        status: 'info',
        details: { buttonFound: false, note: 'No start button, cards may be pre-loaded' }
      });
    }
    
    // Step 5: Look for tarot cards
    log('Step 5: Looking for tarot cards...');
    
    const cardSelectors = [
      '.tarot-card',
      '[data-card]',
      '.card',
      'img[alt*="tarot"]',
      'img[alt*="카드"]',
      'img[src*="tarot"]'
    ];
    
    let cardsFound = false;
    let cardCount = 0;
    
    for (const selector of cardSelectors) {
      try {
        const cards = await page.locator(selector);
        cardCount = await cards.count();
        if (cardCount > 0) {
          cardsFound = true;
          log(`Found ${cardCount} cards with selector: ${selector}`);
          
          // Try to click on a card if they're clickable
          const firstCard = cards.first();
          if (await firstCard.isVisible()) {
            try {
              await firstCard.click();
              await page.waitForTimeout(1000);
              log('Clicked on first card');
            } catch (e) {
              log('Card not clickable or no interaction');
            }
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await takeScreenshot(page, '05-cards-state', `Cards state - Found: ${cardsFound}, Count: ${cardCount}`);
    
    testResults.tarotFlow.push({
      step: 'cards_detection',
      status: cardsFound ? 'success' : 'failed',
      details: { cardsFound, cardCount }
    });
    
    // Step 6: Look for reading/interpretation text
    log('Step 6: Looking for reading interpretation...');
    
    const interpretationSelectors = [
      '.interpretation',
      '.reading-result',
      '[data-testid="interpretation"]',
      '.tarot-interpretation',
      'div:has-text("해석")',
      'div:has-text("Interpretation")'
    ];
    
    let interpretationFound = false;
    let interpretationText = '';
    
    for (const selector of interpretationSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          interpretationText = await element.textContent();
          if (interpretationText && interpretationText.length > 50) {
            interpretationFound = true;
            log(`Found interpretation: ${interpretationText.substring(0, 100)}...`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!interpretationFound) {
      // Also check for any long text content that might be interpretation
      const longTexts = await page.locator('div, p').evaluateAll(elements => 
        elements
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 100)
          .slice(0, 3)
      );
      
      if (longTexts.length > 0) {
        interpretationFound = true;
        interpretationText = longTexts[0];
        log(`Found potential interpretation in long text: ${interpretationText.substring(0, 100)}...`);
      }
    }
    
    await takeScreenshot(page, '06-interpretation-state', 'Interpretation/reading result state');
    
    testResults.tarotFlow.push({
      step: 'interpretation_detection',
      status: interpretationFound ? 'success' : 'failed',
      details: { 
        interpretationFound, 
        textLength: interpretationText.length,
        preview: interpretationText.substring(0, 200)
      }
    });
    
    // Step 7: Look for save functionality
    log('Step 7: Looking for save functionality...');
    
    const saveButtonSelectors = [
      'button:has-text("저장")',
      'button:has-text("Save")',
      'button:has-text("리딩 저장")',
      '[data-testid="save-reading"]',
      '.save-button'
    ];
    
    let saveButtonFound = false;
    
    for (const selector of saveButtonSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.count() > 0 && await button.isVisible()) {
          saveButtonFound = true;
          log(`Found save button: ${selector}`);
          
          // Check if button is enabled
          const isEnabled = await button.isEnabled();
          log(`Save button enabled: ${isEnabled}`);
          
          if (isEnabled) {
            try {
              await button.click();
              await page.waitForTimeout(2000);
              log('Clicked save button');
              
              // Look for success/error messages
              const messageSelectors = [
                '.toast',
                '.notification',
                '.alert',
                '[role="alert"]',
                '.success-message',
                '.error-message'
              ];
              
              let saveResult = 'unknown';
              for (const msgSelector of messageSelectors) {
                try {
                  const msg = await page.locator(msgSelector).first();
                  if (await msg.count() > 0 && await msg.isVisible()) {
                    const msgText = await msg.textContent();
                    log(`Save result message: "${msgText}"`);
                    saveResult = msgText.includes('성공') || msgText.includes('saved') ? 'success' : 'error';
                    break;
                  }
                } catch (e) {
                  continue;
                }
              }
              
              testResults.tarotFlow.push({
                step: 'save_attempt',
                status: 'attempted',
                details: { saveResult, clicked: true }
              });
            } catch (e) {
              log(`Error clicking save button: ${e.message}`, 'error');
            }
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await takeScreenshot(page, '07-save-state', 'Save functionality state');
    
    testResults.tarotFlow.push({
      step: 'save_detection',
      status: saveButtonFound ? 'success' : 'failed',
      details: { saveButtonFound }
    });
    
    // Final screenshot
    await takeScreenshot(page, '08-final-state', 'Final tarot reading state');
    
    return true;
    
  } catch (error) {
    log(`Tarot reading flow failed: ${error.message}`, 'error');
    await takeScreenshot(page, '08-error-state', 'Error state');
    return false;
  }
}

async function generateTarotReport() {
  const reportPath = path.join(__dirname, 'tarot-functionality-report.json');
  const summaryPath = path.join(__dirname, 'tarot-functionality-summary.md');
  
  const completedSteps = testResults.tarotFlow.filter(step => step.status === 'success').length;
  const totalSteps = testResults.tarotFlow.length;
  
  // Save detailed JSON
  await fs.promises.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  
  // Generate summary
  const summary = `# Tarot Reading Functionality Test Report

**Date:** ${testResults.timestamp}
**Completed Steps:** ${completedSteps}/${totalSteps}

## Tarot Reading Flow Analysis

${testResults.tarotFlow.map((step, index) => `
### Step ${index + 1}: ${step.step.replace(/_/g, ' ').toUpperCase()}
- **Status:** ${step.status === 'success' ? '✅ SUCCESS' : step.status === 'failed' ? '❌ FAILED' : '⚠️ ' + step.status.toUpperCase()}
- **Details:** ${JSON.stringify(step.details, null, 2)}
`).join('\n')}

## Issues Found

${testResults.errors.length > 0 ? 
  testResults.errors.map(err => `- ${err.message}`).join('\n') :
  'No critical errors found in the tarot reading flow.'
}

## Functionality Assessment

### Working Components:
${testResults.tarotFlow
  .filter(step => step.status === 'success')
  .map(step => `- ${step.step.replace(/_/g, ' ')}: ✅`)
  .join('\n')}

### Issues or Missing Components:
${testResults.tarotFlow
  .filter(step => step.status === 'failed')
  .map(step => `- ${step.step.replace(/_/g, ' ')}: ❌`)
  .join('\n')}

## Recommendations

### For Full Tarot Reading Functionality:

1. **Card Display:** Ensure tarot cards are properly displayed and interactive
2. **Reading Generation:** Verify AI integration for generating interpretations
3. **Save Functionality:** 
   - Requires user authentication (Google login working)
   - Needs proper Firebase configuration
   - Should save to userReadings collection
4. **Share Functionality:** Should create entries in sharedReadings collection

### Firebase Requirements:
- User must be authenticated to save readings
- Firestore rules are correctly configured for userReadings and sharedReadings
- Environment variables must be properly set

## Screenshots
${testResults.screenshots.map(s => `- ${s.name}: ${s.description}`).join('\n')}

## Next Steps:
1. Configure Firebase environment variables
2. Test with actual authentication
3. Verify AI integration for card interpretations
4. Test save/share functionality with authenticated user
`;

  await fs.promises.writeFile(summaryPath, summary);
  
  console.log('\n' + '='.repeat(60));
  console.log('🔮 TAROT READING FUNCTIONALITY TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`📊 Flow Steps Completed: ${completedSteps}/${totalSteps}`);
  console.log(`⚠️  Errors: ${testResults.errors.length}`);
  console.log(`📸 Screenshots: ${testResults.screenshots.length}`);
  console.log('='.repeat(60));
  
  testResults.tarotFlow.forEach((step, index) => {
    const statusIcon = step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : '⚠️';
    console.log(`${statusIcon} Step ${index + 1}: ${step.step.replace(/_/g, ' ')}`);
  });
  
  console.log(`\n📋 Reports saved:`);
  console.log(`   - JSON: ${reportPath}`);
  console.log(`   - Summary: ${summaryPath}`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);
}

async function main() {
  log('🔮 Starting tarot reading functionality test...');
  
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  
  let browser = null;
  
  try {
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 }
    });
    
    // Capture console logs for debugging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Firebase') || text.includes('tarot') || text.includes('error')) {
        log(`Console: ${text}`);
      }
    });
    
    await testTarotReadingFlow(page);
    
  } catch (error) {
    log(`Test execution error: ${error.message}`, 'error');
  } finally {
    if (browser) {
      await browser.close();
    }
    
    await generateTarotReport();
  }
}

main().catch(console.error);