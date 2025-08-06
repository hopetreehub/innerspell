import { NextRequest, NextResponse } from 'next/server';
import { getAllMDXPosts, loadMDXPostBySlug } from '@/lib/blog/mdx-loader';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (slug) {
      // 특정 포스트 로드
      const post = await loadMDXPostBySlug(slug);
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        post
      });
    } else {
      // 모든 포스트 목록 로드 (메타데이터만)
      const posts = await getAllMDXPosts();
      return NextResponse.json({
        success: true,
        posts
      });
    }
  } catch (error) {
    console.error('MDX posts API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch MDX posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}