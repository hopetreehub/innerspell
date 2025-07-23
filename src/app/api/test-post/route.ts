import { NextRequest, NextResponse } from 'next/server';
import { getCommunityPostById } from '@/actions/communityActions';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const post = await getCommunityPostById(postId);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post: post,
      message: 'Post retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving post:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}