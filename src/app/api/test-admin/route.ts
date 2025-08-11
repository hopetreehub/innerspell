import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/actions/userActions';
import { createCommunityPost } from '@/actions/communityActions';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  const postId = searchParams.get('postId');

  // 게시물 조회 요청
  if (postId) {
    try {
      const { getCommunityPostById } = await import('@/actions/communityActions');
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

  // 관리자 권한 확인 요청
  if (!email) {
    return NextResponse.json({ error: 'Email parameter is required for admin check' }, { status: 400 });
  }

  try {
    // 이메일로 사용자 정보 확인
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@innerspell.com,junsupark9999@gmail.com,ceo@innerspell.com').split(',').map(email => email.trim().replace(/\n/g, ''));
    const isAdmin = adminEmails.includes(email.trim());

    return NextResponse.json({
      email: email,
      isAdmin: isAdmin,
      adminEmails: adminEmails,
      message: isAdmin ? 'This email has admin privileges' : 'This email does not have admin privileges'
    });

  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 });
    }

    // 테스트용 작성자 정보
    const testAuthor = {
      uid: 'test-user-id',
      displayName: 'Test User',
      photoURL: null
    };

    // 게시물 생성 - 직접 Firestore에 저장
    const { firestore, FieldValue } = await import('@/lib/firebase/admin');
    
    const newPostData = {
      authorId: testAuthor.uid,
      authorName: testAuthor.displayName || '익명',
      authorPhotoURL: testAuthor.photoURL || '',
      title,
      content,
      category,
      viewCount: 0,
      commentCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection('communityPosts').add(newPostData);
    
    return NextResponse.json({ 
      success: true, 
      postId: docRef.id,
      message: 'Post created successfully'
    });

  } catch (error) {
    console.error('Error creating test post:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}