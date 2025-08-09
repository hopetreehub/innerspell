import { NextRequest, NextResponse } from 'next/server';
import { BlogPost, BlogPostFormData } from '@/types/blog';
import { readJSON, writeJSON } from '@/services/file-storage-service';
import { nanoid } from 'nanoid';

// GET: 블로그 포스트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json(
        { error: 'File storage is not enabled' },
        { status: 400 }
      );
    }

    // 블로그 포스트 데이터 읽기
    const posts = await readJSON<BlogPost[]>('blog-posts.json') || [];
    
    // URL 파라미터 읽기
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published') === 'true';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    
    // 필터링
    let filteredPosts = Array.isArray(posts) ? posts : [];
    
    if (published) {
      filteredPosts = filteredPosts.filter(post => post.status === 'published');
    } else if (status) {
      filteredPosts = filteredPosts.filter(post => post.status === status);
    }
    
    if (category) {
      filteredPosts = filteredPosts.filter(post => 
        post.category === category || 
        (Array.isArray(post.categories) && post.categories.includes(category))
      );
    }
    
    // 최신순 정렬
    filteredPosts.sort((a, b) => 
      new Date(b.createdAt || b.publishedAt || 0).getTime() - 
      new Date(a.createdAt || a.publishedAt || 0).getTime()
    );

    // author 필드 정규화
    const normalizedPosts = filteredPosts.map(post => ({
      ...post,
      author: typeof post.author === 'object' ? post.author.name : post.author
    }));

    return NextResponse.json({
      success: true,
      posts: normalizedPosts,
      total: normalizedPosts.length
    });
  } catch (error) {
    console.error('❌ GET /api/blog/posts 오류:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST: 새 블로그 포스트 생성
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/blog/posts - 새 포스트 생성 요청');
    
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json(
        { error: 'File storage is not enabled' },
        { status: 400 }
      );
    }

    const formData: BlogPostFormData = await request.json();
    console.log('📋 받은 데이터:', formData);

    // 블로그 포스트 데이터 읽기
    const posts = await readJSON<BlogPost[]>('blog-posts.json') || [];
    console.log(`📚 현재 포스트 수: ${posts.length}개`);

    // 새 포스트 생성
    const newPost: BlogPost = {
      id: nanoid(),
      title: formData.title,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: formData.content,
      excerpt: formData.excerpt || formData.content.substring(0, 200) + '...',
      author: formData.author || {
        name: 'InnerSpell',
        image: '/images/logo.png',
        role: 'admin'
      },
      category: formData.categories?.[0] || formData.category || '일반',
      tags: formData.tags || [],
      status: formData.status || 'draft',
      featuredImage: formData.featuredImage || '',
      views: 0,
      likes: 0,
      readingTime: Math.ceil(formData.content.split(' ').length / 200) + ' min',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: formData.status === 'published' ? new Date() : null,
      // 추가 필드들
      authorId: 'mock-admin-id',
      published: formData.status === 'published',
      featured: false,
      image: formData.featuredImage || '/images/blog1.png'
    } as any;

    // 포스트 추가 및 저장
    posts.unshift(newPost);
    await writeJSON('blog-posts.json', posts);
    
    console.log(`✅ 새 포스트 생성 완료: ${newPost.title} (${newPost.id})`);
    console.log(`📊 총 포스트 수: ${posts.length}개`);

    return NextResponse.json({ 
      success: true, 
      post: newPost,
      message: '포스트가 성공적으로 생성되었습니다.'
    });

  } catch (error) {
    console.error('❌ 포스트 생성 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '포스트 생성에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}