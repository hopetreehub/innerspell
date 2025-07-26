const fs = require('fs');

// Read the file
const content = fs.readFileSync('./src/lib/blog/posts.ts', 'utf8');

// Find the mockPosts array
const mockPostsMatch = content.match(/(export const mockPosts: BlogPost\[\] = \[)([\s\S]*?)(\];)/);

if (!mockPostsMatch) {
  console.error('Could not find mockPosts array');
  process.exit(1);
}

const arrayStart = mockPostsMatch[1];
const arrayContent = mockPostsMatch[2];
const arrayEnd = mockPostsMatch[3];

// Split by post objects
const posts = [];
let currentPost = '';
let braceCount = 0;
let inPost = false;

for (let i = 0; i < arrayContent.length; i++) {
  const char = arrayContent[i];
  
  if (char === '{') {
    if (braceCount === 0) inPost = true;
    braceCount++;
  }
  
  if (inPost) currentPost += char;
  
  if (char === '}') {
    braceCount--;
    if (braceCount === 0 && inPost) {
      posts.push(currentPost.trim());
      currentPost = '';
      inPost = false;
    }
  }
}

console.log(`Found ${posts.length} posts in mockPosts array`);

// Extract IDs and find unique posts
const seenIds = new Set();
const uniquePosts = [];

posts.forEach((post, index) => {
  const idMatch = post.match(/id:\s*['"]([^'"]+)['"]/);
  if (idMatch) {
    const id = idMatch[1];
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniquePosts.push(post);
    } else {
      console.log(`Removing duplicate: ${id} (at position ${index + 1})`);
    }
  }
});

console.log(`\nKept ${uniquePosts.length} unique posts`);

// Reconstruct the content
const newArrayContent = uniquePosts.join(',\n  ');
const newContent = content.replace(
  mockPostsMatch[0],
  `${arrayStart}\n  ${newArrayContent}\n${arrayEnd}`
);

// Write back
fs.writeFileSync('./src/lib/blog/posts.ts', newContent);

console.log('\nDuplicates removed successfully!');