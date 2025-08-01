// Quick test to check image paths in the config
console.log('🔍 Checking TAROT_IMAGE_CONFIG:\n');

// Since we can't directly require TypeScript, let's read and parse the file
const fs = require('fs');
const configContent = fs.readFileSync('./src/config/tarot-images.ts', 'utf8');

// Extract the cardBack paths
const readingCardBackMatch = configContent.match(/reading:\s*{\s*[^}]*cardBack:\s*['"]([^'"]+)['"]/);
const encyclopediaCardBackMatch = configContent.match(/encyclopedia:\s*{\s*[^}]*cardBack:\s*['"]([^'"]+)['"]/);

console.log('📖 Reading card back:', readingCardBackMatch ? readingCardBackMatch[1] : 'Not found');
console.log('📚 Encyclopedia card back:', encyclopediaCardBackMatch ? encyclopediaCardBackMatch[1] : 'Not found');

// Check if files exist
const path = require('path');
const publicDir = path.join(__dirname, 'public');

console.log('\n🎴 Checking actual files:');
const files = [
  '/images/tarot/back.png',
  '/images/tarot-spread/back.png',
  '/images/tarot-spread/00-TheFool.png',
  '/images/tarot/00-TheFool.jpg'
];

files.forEach(file => {
  const fullPath = path.join(publicDir, file);
  console.log(`   ${file}: ${fs.existsSync(fullPath) ? '✅ Exists' : '❌ Missing'}`);
});

console.log('\n✨ Done!');