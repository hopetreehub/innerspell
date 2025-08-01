const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Image Paths Configuration\n');

// Check if tarot-spread folder exists
const spreadPath = path.join(__dirname, 'public/images/tarot-spread');
const originalPath = path.join(__dirname, 'public/images/tarot');

console.log('📁 Checking directories:');
console.log(`   Original: ${fs.existsSync(originalPath) ? '✅ Exists' : '❌ Missing'}`);
console.log(`   Spread: ${fs.existsSync(spreadPath) ? '✅ Exists' : '❌ Missing'}`);

// Check for back.png in both folders
const originalBack = path.join(originalPath, 'back.png');
const spreadBack = path.join(spreadPath, 'back.png');

console.log('\n🎴 Checking card back images:');
console.log(`   Original back.png: ${fs.existsSync(originalBack) ? '✅ Exists' : '❌ Missing'}`);
console.log(`   Spread back.png: ${fs.existsSync(spreadBack) ? '✅ Exists' : '❌ Missing'}`);

// Check config file
console.log('\n📝 Config file check:');
const configPath = path.join(__dirname, 'src/config/tarot-images.ts');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  console.log('   ✅ tarot-images.ts exists');
  
  // Check if config has correct paths
  if (configContent.includes("cardBack: '/images/tarot-spread/back.png'")) {
    console.log('   ✅ Reading cardBack path is correct');
  } else {
    console.log('   ❌ Reading cardBack path might be incorrect');
  }
}

// Check TarotReadingClient imports
console.log('\n🔧 Component check:');
const clientPath = path.join(__dirname, 'src/components/reading/TarotReadingClient.tsx');
if (fs.existsSync(clientPath)) {
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  
  if (clientContent.includes("import { TAROT_IMAGE_CONFIG, getTarotImagePath }")) {
    console.log('   ✅ Imports are correct');
  } else {
    console.log('   ❌ Missing imports');
  }
  
  if (clientContent.includes("CARD_BACK_IMAGE = TAROT_IMAGE_CONFIG.features.reading.cardBack")) {
    console.log('   ✅ CARD_BACK_IMAGE uses reading config');
  } else {
    console.log('   ❌ CARD_BACK_IMAGE not using reading config');
  }
}

console.log('\n✨ Done!');