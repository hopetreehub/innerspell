const { chromium } = require('playwright');

async function inspectTarotPage() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  try {
    console.log('Inspecting tarot page structure...');
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Debug: Print all links on the page
    const allLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          links.push({
            href: href,
            text: link.textContent.trim(),
            className: link.className
          });
        }
      });
      return links;
    });
    
    console.log('\nAll links found on page:');
    allLinks.forEach(link => {
      if (link.href.includes('tarot') || link.href.includes('card')) {
        console.log(`  - ${link.href} (${link.text})`);
      }
    });
    
    // Check for card grid structure
    const gridInfo = await page.evaluate(() => {
      const possibleGrids = [
        document.querySelector('.grid'),
        document.querySelector('[class*="grid"]'),
        document.querySelector('.cards-container'),
        document.querySelector('[class*="card-list"]'),
        document.querySelector('main .grid'),
        document.querySelector('div[class*="grid-cols"]')
      ];
      
      for (const grid of possibleGrids) {
        if (grid) {
          const children = grid.children.length;
          return {
            found: true,
            selector: grid.className || grid.tagName,
            childCount: children
          };
        }
      }
      
      return { found: false };
    });
    
    console.log('\nGrid structure:', gridInfo);
    
    // Try to find cards by image
    const cardImages = await page.evaluate(() => {
      const images = [];
      document.querySelectorAll('img').forEach(img => {
        if (img.src && (img.src.includes('tarot') || img.alt?.includes('카드'))) {
          const parentLink = img.closest('a');
          images.push({
            src: img.src,
            alt: img.alt,
            parentHref: parentLink ? parentLink.getAttribute('href') : null
          });
        }
      });
      return images;
    });
    
    console.log(`\nFound ${cardImages.length} card images`);
    cardImages.slice(0, 5).forEach(img => {
      console.log(`  - ${img.alt} -> ${img.parentHref}`);
    });
    
    // Take screenshot for manual inspection
    await page.screenshot({ 
      path: 'tarot-test-screenshots/page-structure.png',
      fullPage: true 
    });
    
    // Now let's directly test some known card URLs
    console.log('\n\nTesting known card URLs directly:');
    const knownCards = [
      { name: 'The Fool', slug: '0' },
      { name: 'The Magician', slug: '1' },
      { name: 'The High Priestess', slug: '2' },
      { name: 'The Empress', slug: '3' },
      { name: 'The World', slug: '21' },
      { name: 'Ace of Wands', slug: 'wands-01' },
      { name: 'Two of Cups', slug: 'cups-02' },
      { name: 'Three of Swords', slug: 'swords-03' },
      { name: 'Four of Pentacles', slug: 'pentacles-04' }
    ];
    
    for (const card of knownCards.slice(0, 5)) {
      const url = `http://localhost:4000/tarot/cards/${card.slug}`;
      console.log(`\nTesting ${card.name} at ${url}`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        const pageTitle = await page.textContent('h1, h2');
        const hasContent = await page.$('.prose, .content, main');
        
        if (pageTitle && !pageTitle.includes('404') && hasContent) {
          console.log(`  ✓ Card page works! Title: ${pageTitle.trim()}`);
          
          await page.screenshot({ 
            path: `tarot-test-screenshots/card-${card.slug}.png`,
            fullPage: true 
          });
        } else {
          console.log(`  ✗ Card not found or error`);
        }
      } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

inspectTarotPage();