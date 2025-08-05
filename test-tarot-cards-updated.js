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

    // Count total cards on the page
    const cardElements = await page.$$('.grid > div, [class*="card-item"], a[href*="/tarot/cards/"]');
    testResults.totalCards = cardElements.length;
    console.log(`\nFound ${cardElements.length} tarot cards on the page`);

    // Define cards to test
    const cardsToTest = [
      // Major Arcana
      { name: 'The Fool', slug: 'the-fool' },
      { name: 'The Magician', slug: 'the-magician' },
      { name: 'The Empress', slug: 'the-empress' },
      { name: 'The Chariot', slug: 'the-chariot' },
      { name: 'The World', slug: 'the-world' },
      { name: 'Death', slug: 'death' },
      { name: 'The Tower', slug: 'the-tower' },
      { name: 'The Star', slug: 'the-star' },
      // Minor Arcana samples
      { name: 'Ace of Wands', slug: 'ace-of-wands' },
      { name: 'Three of Cups', slug: 'three-of-cups' },
      { name: 'Seven of Swords', slug: 'seven-of-swords' },
      { name: 'Ten of Pentacles', slug: 'ten-of-pentacles' }
    ];
    
    console.log('\n2. Testing individual card pages...');
    
    for (let i = 0; i < cardsToTest.length; i++) {
      const card = cardsToTest[i];
      const cardUrl = `http://localhost:4000/tarot/cards/${card.slug}`;
      
      try {
        console.log(`\nTesting card ${i + 1}/${cardsToTest.length}: ${card.name} (${card.slug})`);
        await page.goto(cardUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Check if page loaded successfully
        const hasError = await page.$('.error-message, .error-boundary, text=/404/, text=/Error/');
        
        if (hasError) {
          testResults.failedCards.push({
            name: card.name,
            slug: card.slug,
            url: cardUrl,
            error: 'Error message displayed on page'
          });
          console.log(`  ✗ Error on ${card.name} page`);
        } else {
          // Check for essential elements with updated selectors
          const checks = {
            title: await page.$('h1, h2, text=/바보|The Fool|마법사|The Magician|여황제|The Empress|전차|The Chariot|세계|The World/'),
            image: await page.$('img[src*="tarot"], img[alt*="카드"], .card-image img, canvas'),
            uprightReversedToggle: await page.$('button:has-text("정방향"), button:has-text("역방향"), button:has-text("正立"), button:has-text("逆立")'),
            categoryTabs: await page.$$('button:has-text("전체"), button:has-text("연애"), button:has-text("사업"), button:has-text("건강"), button:has-text("오늘")')
          };
          
          // Check for content sections
          const hasMeaningSection = await page.$('text=/의미|해석|Meaning|Interpretation/');
          const hasKeywordsSection = await page.$('text=/키워드|Keywords|핵심/');
          const hasAdviceSection = await page.$('text=/조언|Advice|충고/');
          
          const missingElements = [];
          if (!checks.title) missingElements.push('title');
          if (!checks.image) missingElements.push('image');
          if (!checks.uprightReversedToggle) missingElements.push('upright/reversed toggle');
          if (checks.categoryTabs.length === 0) missingElements.push('category tabs');
          if (!hasMeaningSection && !hasKeywordsSection && !hasAdviceSection) {
            missingElements.push('content sections');
          }
          
          if (missingElements.length > 0) {
            testResults.failedCards.push({
              name: card.name,
              slug: card.slug,
              url: cardUrl,
              error: `Missing elements: ${missingElements.join(', ')}`
            });
            console.log(`  ⚠ Missing elements on ${card.name}: ${missingElements.join(', ')}`);
          } else {
            // Test interactions
            console.log('  Testing interactions...');
            
            // Test upright/reversed toggle
            const reversedButton = await page.$('button:has-text("역방향"), button:has-text("逆立")');
            if (reversedButton) {
              await reversedButton.click();
              await page.waitForTimeout(500);
              console.log('    ✓ Reversed toggle clicked');
            }
            
            // Test category tabs
            if (checks.categoryTabs.length > 1) {
              await checks.categoryTabs[1].click(); // Click 연애 tab
              await page.waitForTimeout(500);
              console.log('    ✓ Category tab clicked');
            }
            
            testResults.successfulCards.push({
              name: card.name,
              slug: card.slug,
              url: cardUrl
            });
            console.log(`  ✓ ${card.name} working properly`);
          }
        }
        
        // Take screenshot for each tested card
        await page.screenshot({ 
          path: `tarot-test-screenshots/card-${String(i + 2).padStart(2, '0')}-${card.slug}.png`,
          fullPage: true 
        });
        
        testResults.testedCards.push(card);
        
      } catch (error) {
        testResults.failedCards.push({
          name: card.name,
          slug: card.slug,
          url: cardUrl,
          error: error.message
        });
        testResults.errors.push({
          card: card.name,
          error: error.message
        });
        console.log(`  ✗ Error testing ${card.name}: ${error.message}`);
      }
    }

    // Test mobile responsiveness on a sample card
    console.log('\n3. Testing mobile responsiveness...');
    await context.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:4000/tarot/cards/the-fool', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'tarot-test-screenshots/mobile-card-view.png',
      fullPage: true 
    });
    console.log('✓ Mobile view tested');

    // Generate report
    const report = {
      summary: {
        totalCardsAvailable: testResults.totalCards,
        cardsTestedCount: testResults.testedCards.length,
        successfulCount: testResults.successfulCards.length,
        failedCount: testResults.failedCards.length,
        successRate: `${Math.round((testResults.successfulCards.length / testResults.testedCards.length) * 100)}%`
      },
      testedCards: testResults.testedCards.map(c => c.name),
      successfulCards: testResults.successfulCards.map(c => ({
        name: c.name,
        slug: c.slug
      })),
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
    console.log(`Total cards available on page: ${report.summary.totalCardsAvailable}`);
    console.log(`Cards tested: ${report.summary.cardsTestedCount}`);
    console.log(`Successful: ${report.summary.successfulCount}`);
    console.log(`Failed: ${report.summary.failedCount}`);
    console.log(`Success rate: ${report.summary.successRate}`);
    
    if (testResults.successfulCards.length > 0) {
      console.log('\n=== SUCCESSFUL CARDS ===');
      testResults.successfulCards.forEach(card => {
        console.log(`✓ ${card.name} (${card.slug})`);
      });
    }
    
    if (testResults.failedCards.length > 0) {
      console.log('\n=== FAILED CARDS ===');
      testResults.failedCards.forEach(card => {
        console.log(`✗ ${card.name}: ${card.error}`);
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

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('tarot-test-screenshots')) {
  fs.mkdirSync('tarot-test-screenshots');
}

testAllTarotCards();