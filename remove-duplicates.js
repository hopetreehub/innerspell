const fs = require('fs');

// Read the file
const content = fs.readFileSync('./src/lib/blog/posts.ts', 'utf8');
const lines = content.split('\n');

// Find the start of duplicates (the comment line)
let duplicateStartIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// 새로 추가된 SEO 최적화 블로그 글들 (적절한 이미지와 함께)') && i > 1000) {
    duplicateStartIndex = i;
    break;
  }
}

if (duplicateStartIndex === -1) {
  console.log('Could not find duplicate section');
  process.exit(1);
}

console.log(`Found duplicate section starting at line ${duplicateStartIndex + 1}`);

// Find the end of mockPosts array (first occurrence)
let arrayEndIndex = -1;
for (let i = duplicateStartIndex; i < lines.length; i++) {
  if (lines[i] === '];') {
    arrayEndIndex = i;
    break;
  }
}

console.log(`Found array end at line ${arrayEndIndex + 1}`);

// Remove lines from duplicateStartIndex-1 (the comma before) to arrayEndIndex (not including the closing bracket)
const newLines = [
  ...lines.slice(0, duplicateStartIndex - 1),
  ...lines.slice(arrayEndIndex)
];

// Write back
fs.writeFileSync('./src/lib/blog/posts.ts', newLines.join('\n'));

console.log(`Removed ${arrayEndIndex - duplicateStartIndex + 1} lines`);
console.log('Duplicates removed successfully!');