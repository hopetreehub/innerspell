import { BlogPost } from './posts';

// Lazy load blog posts to improve build performance
export async function loadBlogPosts(): Promise<BlogPost[]> {
  // In production, this could load from a database or CMS
  // For now, we'll dynamically import the static data
  const { mockPosts } = await import('./posts');
  return mockPosts;
}

export async function loadBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await loadBlogPosts();
  return posts.find(p => p.id === slug && p.published);
}

export async function loadFeaturedPosts(): Promise<BlogPost[]> {
  const posts = await loadBlogPosts();
  return posts.filter(post => post.published && post.featured);
}

export async function loadPublishedPosts(): Promise<BlogPost[]> {
  const posts = await loadBlogPosts();
  return posts.filter(post => post.published);
}