const fs = require('fs');
const path = require('path');

// Image directories
const ORIGINAL_DIR = path.join(__dirname, '../public/images/tarot');
const SPREAD_DIR = path.join(__dirname, '../public/images/tarot-spread');

// Expected card files
const MAJOR_ARCANA = Array.from({ length: 22 }, (_, i) => {
  const num = i.toString().padStart(2, '0');
  return {
    original: `${num}-The${getCardName(i)}.jpg`,
    spread: `${num}-The${getCardName(i)}.png`
  };
});

const MINOR_SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const MINOR_ARCANA = MINOR_SUITS.flatMap(suit => 
  Array.from({ length: 14 }, (_, i) => ({
    original: `${suit}${(i + 1).toString().padStart(2, '0')}.jpg`,
    spread: `${suit}${(i + 1).toString().padStart(2, '0')}.png`
  }))
);

function getCardName(num) {
  const names = [
    'Fool', 'Magician', 'HighPriestess', 'Empress', 'Emperor',
    'Hierophant', 'Lovers', 'Chariot', 'Strength', 'Hermit',
    'WheelOfFortune', 'Justice', 'HangedMan', 'Death', 'Temperance',
    'Devil', 'Tower', 'Star', 'Moon', 'Sun', 'Judgement', 'World'
  ];
  return names[num];
}

function checkImages() {
  console.log('🔍 Checking Tarot Image Configuration...\n');
  
  // Check directories exist
  if (!fs.existsSync(ORIGINAL_DIR)) {
    console.error('❌ Original images directory not found:', ORIGINAL_DIR);
    return;
  }
  if (!fs.existsSync(SPREAD_DIR)) {
    console.error('❌ Spread images directory not found:', SPREAD_DIR);
    return;
  }
  
  console.log('✅ Both image directories exist\n');
  
  // Check card back
  const backOriginal = path.join(ORIGINAL_DIR, 'back.png');
  const backSpread = path.join(SPREAD_DIR, 'back.png');
  
  console.log('🎴 Checking card backs:');
  console.log(`  Original: ${fs.existsSync(backOriginal) ? '✅' : '❌'} ${backOriginal}`);
  console.log(`  Spread: ${fs.existsSync(backSpread) ? '✅' : '❌'} ${backSpread}\n`);
  
  // Check Major Arcana
  console.log('🌟 Checking Major Arcana (22 cards):');
  let majorMissing = 0;
  MAJOR_ARCANA.forEach(card => {
    const origPath = path.join(ORIGINAL_DIR, card.original);
    const spreadPath = path.join(SPREAD_DIR, card.spread);
    const origExists = fs.existsSync(origPath);
    const spreadExists = fs.existsSync(spreadPath);
    
    if (!origExists || !spreadExists) {
      console.log(`  ${card.original.replace('.jpg', '')}: Original ${origExists ? '✅' : '❌'}, Spread ${spreadExists ? '✅' : '❌'}`);
      majorMissing++;
    }
  });
  console.log(`  Major Arcana: ${22 - majorMissing}/22 complete\n`);
  
  // Check Minor Arcana
  console.log('💎 Checking Minor Arcana (56 cards):');
  const suitStats = {};
  MINOR_SUITS.forEach(suit => suitStats[suit] = { total: 14, found: 0 });
  
  MINOR_ARCANA.forEach(card => {
    const origPath = path.join(ORIGINAL_DIR, card.original);
    const spreadPath = path.join(SPREAD_DIR, card.spread);
    const origExists = fs.existsSync(origPath);
    const spreadExists = fs.existsSync(spreadPath);
    
    if (origExists && spreadExists) {
      const suit = card.original.match(/^(\w+)\d/)[1];
      suitStats[suit].found++;
    }
  });
  
  Object.entries(suitStats).forEach(([suit, stats]) => {
    console.log(`  ${suit}: ${stats.found}/${stats.total} cards`);
  });
  
  // List actual files in directories
  console.log('\n📁 Actual files found:');
  const origFiles = fs.readdirSync(ORIGINAL_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  const spreadFiles = fs.readdirSync(SPREAD_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  
  console.log(`  Original directory: ${origFiles.length} image files`);
  console.log(`  Spread directory: ${spreadFiles.length} image files`);
  
  // Performance check - file sizes
  console.log('\n📊 Performance Check (average file sizes):');
  
  const getAverageSize = (dir, files) => {
    const sizes = files.map(f => fs.statSync(path.join(dir, f)).size);
    const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    return (avg / 1024).toFixed(0);
  };
  
  if (origFiles.length > 0) {
    console.log(`  Original images: ~${getAverageSize(ORIGINAL_DIR, origFiles.slice(0, 10))}KB average`);
  }
  if (spreadFiles.length > 0) {
    console.log(`  Spread images: ~${getAverageSize(SPREAD_DIR, spreadFiles.slice(0, 10))}KB average`);
  }
  
  console.log('\n✨ Image configuration check complete!');
}

// Run the check
checkImages();