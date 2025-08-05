const { chromium } = require('playwright');
const fs = require('fs');

async function testAllTarotCards() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  let testResults = {
    totalCards: 0,
    testedCards: [],
    successfulCards: [],
    failedCards: [],
    errors: []
  };

  try {
    console.log('1. Navigating to main tarot page...');
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of main tarot page
    await page.screenshot({ 
      path: 'tarot-test-screenshots/01-main-tarot-page.png',
      fullPage: true 
    });
    console.log('✓ Main tarot page screenshot taken');

    // Get all card links
    const cardLinks = await page.$$eval('a[href^="/tarot/cards/"]', links => 
      links.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent.trim()
      }))
    );
    
    testResults.totalCards = cardLinks.length;
    console.log(`\nFound ${cardLinks.length} tarot cards to test`);

    // Test major arcana cards
    const majorArcanaToTest = [
      'the-fool', 'the-magician', 'the-high-priestess', 'the-empress', 
      'the-emperor', 'the-hierophant', 'the-lovers', 'the-chariot',
      'strength', 'the-hermit', 'wheel-of-fortune', 'justice',
      'the-hanged-man', 'death', 'temperance', 'the-devil',
      'the-tower', 'the-star', 'the-moon', 'the-sun',
      'judgement', 'the-world'
    ];

    // Test minor arcana cards (sample from each suit)
    const minorArcanaToTest = [
      'ace-of-wands', 'three-of-wands', 'king-of-wands',
      'ace-of-cups', 'five-of-cups', 'queen-of-cups',
      'ace-of-swords', 'seven-of-swords', 'knight-of-swords',
      'ace-of-pentacles', 'ten-of-pentacles', 'page-of-pentacles'
    ];

    const cardsToTest = [...majorArcanaToTest, ...minorArcanaToTest];
    
    console.log('\n2. Testing individual card pages...');
    
    for (let i = 0; i < cardsToTest.length && i < 15; i++) {
      const cardSlug = cardsToTest[i];
      const cardUrl = `http://localhost:4000/tarot/cards/${cardSlug}`;
      
      try {
        console.log(`\nTesting card ${i + 1}/15: ${cardSlug}`);
        await page.goto(cardUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Check if page loaded successfully
        const hasError = await page.$('.error-message, .error-boundary');
        
        if (hasError) {
          testResults.failedCards.push({
            slug: cardSlug,
            url: cardUrl,
            error: 'Error message displayed on page'
          });
          console.log(`  ✗ Error on ${cardSlug} page`);
        } else {
          // Check for essential elements
          const checks = {
            image: await page.$('.card-image, img[alt*="카드"], img[alt*="card"]'),
            title: await page.$('h1, h2'),
            keywords: await page.$('text=/키워드/i, text=/Keywords/i'),
            meaning: await page.$('text=/의미/i, text=/Meaning/i'),
            uprightToggle: await page.$('button:has-text("정방향"), button:has-text("Upright")'),
            reversedToggle: await page.$('button:has-text("역방향"), button:has-text("Reversed")'),
            tabs: await page.$$('button:has-text("전체"), button:has-text("연애"), button:has-text("사업"), button:has-text("건강")')
          };
          
          const missingElements = [];
          for (const [element, found] of Object.entries(checks)) {
            if (!found || (Array.isArray(found) && found.length === 0)) {
              missingElements.push(element);
            }
          }
          
          if (missingElements.length > 0) {
            testResults.failedCards.push({
              slug: cardSlug,
              url: cardUrl,
              error: `Missing elements: ${missingElements.join(', ')}`
            });
            console.log(`  ⚠ Missing elements on ${cardSlug}: ${missingElements.join(', ')}`);
          } else {
            // Test toggle functionality
            if (checks.reversedToggle) {
              await checks.reversedToggle.click();
              await page.waitForTimeout(500);
            }
            
            // Test tabs
            if (checks.tabs.length > 0) {
              for (const tab of checks.tabs.slice(1, 3)) { // Test first 2 tabs after 전체
                await tab.click();
                await page.waitForTimeout(500);
              }
            }
            
            testResults.successfulCards.push({
              slug: cardSlug,
              url: cardUrl
            });
            console.log(`  ✓ ${cardSlug} working properly`);
          }
        }
        
        // Take screenshot for sample cards
        if (i < 5 || testResults.failedCards.find(card => card.slug === cardSlug)) {
          await page.screenshot({ 
            path: `tarot-test-screenshots/card-${String(i + 1).padStart(2, '0')}-${cardSlug}.png`,
            fullPage: true 
          });
        }
        
        testResults.testedCards.push(cardSlug);
        
      } catch (error) {
        testResults.failedCards.push({
          slug: cardSlug,
          url: cardUrl,
          error: error.message
        });
        testResults.errors.push({
          card: cardSlug,
          error: error.message
        });
        console.log(`  ✗ Error testing ${cardSlug}: ${error.message}`);
      }
    }

    // Generate report
    const report = {
      summary: {
        totalCardsAvailable: testResults.totalCards,
        cardsTestedCount: testResults.testedCards.length,
        successfulCount: testResults.successfulCards.length,
        failedCount: testResults.failedCards.length,
        successRate: `${Math.round((testResults.successfulCards.length / testResults.testedCards.length) * 100)}%`
      },
      testedCards: testResults.testedCards,
      successfulCards: testResults.successfulCards.map(c => c.slug),
      failedCards: testResults.failedCards,
      errors: testResults.errors,
      timestamp: new Date().toISOString()
    };

    // Save report
    fs.writeFileSync(
      'tarot-test-screenshots/test-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n=== TEST SUMMARY ===');
    console.log(`Total cards available: ${report.summary.totalCardsAvailable}`);
    console.log(`Cards tested: ${report.summary.cardsTestedCount}`);
    console.log(`Successful: ${report.summary.successfulCount}`);
    console.log(`Failed: ${report.summary.failedCount}`);
    console.log(`Success rate: ${report.summary.successRate}`);
    
    if (testResults.failedCards.length > 0) {
      console.log('\n=== FAILED CARDS ===');
      testResults.failedCards.forEach(card => {
        console.log(`- ${card.slug}: ${card.error}`);
      });
    }

  } catch (error) {
    console.error('Critical error during testing:', error);
    await page.screenshot({ 
      path: 'tarot-test-screenshots/error-screenshot.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n✓ Test completed. Check tarot-test-screenshots folder for results.');
  }
}

// Create screenshots directory
if (!fs.existsSync('tarot-test-screenshots')) {
  fs.mkdirSync('tarot-test-screenshots');
}

testAllTarotCards();