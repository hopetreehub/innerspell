import { Metadata } from 'next';
import { mockPosts } from '@/lib/blog/posts';

export const metadata: Metadata = {
  title: '새 블로그 테스트 | InnerSpell',
  description: '새로운 블로그 글 표시 테스트 페이지',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function BlogNewPage() {
  // 직접 mockPosts 표시
  const publishedPosts = mockPosts.filter(post => post.published);
  const sortedPosts = publishedPosts.sort((a, b) => {
    const dateA = new Date(a.publishedAt);
    const dateB = new Date(b.publishedAt);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">새 블로그 테스트 페이지</h1>
        
        <div className="mb-4 p-4 bg-blue-100 rounded">
          <p>Total mockPosts: {mockPosts.length}</p>
          <p>Published posts: {publishedPosts.length}</p>
          <p>Render time: {new Date().toISOString()}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedPosts.slice(0, 20).map((post) => (
            <article key={post.id} className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-3">{post.excerpt}</p>
              <div className="text-sm text-gray-500">
                <p>ID: {post.id}</p>
                <p>카테고리: {post.category}</p>
                <p>날짜: {new Date(post.publishedAt).toLocaleDateString('ko-KR')}</p>
                <p>태그: {post.tags.join(', ')}</p>
              </div>
            </article>
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">블로그 포스트가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}