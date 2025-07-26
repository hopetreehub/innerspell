const fs = require('fs');

// Read the posts.ts file
const content = fs.readFileSync('./src/lib/blog/posts.ts', 'utf8');

// Find duplicate post IDs
const duplicateIds = [
  'tarot-2025-new-year-guide',
  'ai-tarot-future-guide',
  'dream-meaning-psychology',
  'tarot-meditation-practice',
  'modern-spirituality-guide'
];

// Track found duplicates
const foundDuplicates = {};
duplicateIds.forEach(id => {
  foundDuplicates[id] = 0;
});

// Find line numbers for duplicates
const lines = content.split('\n');
lines.forEach((line, index) => {
  duplicateIds.forEach(id => {
    if (line.includes(`id: '${id}'`)) {
      foundDuplicates[id]++;
      console.log(`Found "${id}" at line ${index + 1} (occurrence #${foundDuplicates[id]})`);
    }
  });
});

// Show summary
console.log('\nSummary:');
Object.entries(foundDuplicates).forEach(([id, count]) => {
  console.log(`${id}: found ${count} times`);
});

// Check if mockPosts array has correct structure
const mockPostsMatch = content.match(/export const mockPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
if (mockPostsMatch) {
  const posts = mockPostsMatch[1].split(/\},\s*\{/);
  console.log(`\nTotal posts in mockPosts array: ${posts.length}`);
}