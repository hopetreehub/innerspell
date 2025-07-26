const fs = require('fs');

// Read the posts.ts file
const content = fs.readFileSync('./src/lib/blog/posts.ts', 'utf8');

// Extract mockPosts array content
const mockPostsMatch = content.match(/export const mockPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
if (mockPostsMatch) {
  const mockPostsContent = mockPostsMatch[1];
  // Count objects by counting opening braces that start an object
  const postCount = (mockPostsContent.match(/\{\s*id:/g) || []).length;
  console.log(`mockPosts array contains ${postCount} posts`);
  
  // Extract IDs to see which posts are included
  const idMatches = mockPostsContent.match(/id:\s*['"]([^'"]+)['"]/g);
  if (idMatches) {
    console.log('\nPost IDs in mockPosts:');
    idMatches.forEach((match, index) => {
      const id = match.replace(/id:\s*['"]([^'"]+)['"]/, '$1');
      console.log(`${index + 1}. ${id}`);
    });
  }
}

// Also check mockPostsOriginal
const mockPostsOriginalMatch = content.match(/export const mockPostsOriginal: BlogPost\[\] = \[([\s\S]*?)\];/);
if (mockPostsOriginalMatch) {
  const mockPostsOriginalContent = mockPostsOriginalMatch[1];
  const postCountOriginal = (mockPostsOriginalContent.match(/\{\s*id:/g) || []).length;
  console.log(`\nmockPostsOriginal array contains ${postCountOriginal} posts`);
}