
'use server';

import { z } from 'zod';
import { firestore, FieldValue } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { CommunityPost, CommunityPostCategory } from '@/types';
import { FreeDiscussionPostFormSchema, type FreeDiscussionPostFormData, type ReadingSharePostFormData, ReadingSharePostFormSchema } from '@/types';

const POSTS_PER_PAGE = 15;

// Helper to map Firestore doc to CommunityPost type
function mapDocToCommunityPost(doc: FirebaseFirestore.DocumentSnapshot): CommunityPost {
  const data = doc.data()!; // Assume data exists
  const now = new Date();
  const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : now;
  const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : createdAt;

  return {
    id: doc.id,
    authorId: data.authorId,
    authorName: data.authorName || '익명',
    authorPhotoURL: data.authorPhotoURL || '',
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl || null,
    viewCount: data.viewCount || 0,
    commentCount: data.commentCount || 0,
    category: data.category,
    createdAt,
    updatedAt,
  };
}


export async function getCommunityPosts(
  category: CommunityPostCategory,
  page: number = 1
): Promise<{ posts: CommunityPost[]; totalPages: number }> {
  try {
    console.log('[DEBUG] getCommunityPosts called with:', { category, page });
    
    // Check global mock storage
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] Mock storage state:', (global as any).mockStorage);
    }
    
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    
    const postsRef = firestore.collection('communityPosts');
    const queryByCategory = postsRef.where('category', '==', category);
    
    // Get total count for pagination. Use a separate query for this.
    const countPromise = queryByCategory.count().get();
    
    // Construct the query for the posts
    let postsQuery = queryByCategory.orderBy('createdAt', 'desc');

    if (page > 1) {
      const offset = (page - 1) * POSTS_PER_PAGE;
      const lastVisibleSnapshot = await queryByCategory.orderBy('createdAt', 'desc').limit(offset).get();
      if (!lastVisibleSnapshot.empty) {
        const lastVisibleDoc = lastVisibleSnapshot.docs[lastVisibleSnapshot.docs.length - 1];
        postsQuery = postsQuery.startAfter(lastVisibleDoc);
      }
    }
    const postsPromise = postsQuery.limit(POSTS_PER_PAGE).get();

    // Await both promises
    const [countSnapshot, postsSnapshot] = await Promise.all([countPromise, postsPromise]);
    
    const totalPosts = countSnapshot.data().count;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    const posts = postsSnapshot.docs.map(mapDocToCommunityPost);
    
    console.log('[DEBUG] Query results:', {
      totalPosts,
      totalPages,
      postsCount: posts.length,
      posts: posts.map((p: CommunityPost) => ({ id: p.id, title: p.title }))
    });
    
    return { posts, totalPages };

  } catch (error) {
    console.error(`Error fetching community posts for category ${category}:`, error);
    // Return empty state on error to prevent UI crash
    return { posts: [], totalPages: 1 };
  }
}

export async function getCommunityPostById(postId: string): Promise<CommunityPost | null> {
  try {
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const docRef = firestore.collection('communityPosts').doc(postId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }
    
    // Atomically increment view count, but don't let it block the response
    if (FieldValue) {
      docRef.update({ viewCount: FieldValue.increment(1) }).catch((err: any) => {
        console.error(`Failed to increment view count for post ${postId}:`, err);
      });
    }

    return mapDocToCommunityPost(doc);
  } catch (error) {
    console.error(`Error fetching post by ID ${postId}:`, error);
    return null;
  }
}

export async function createFreeDiscussionPost(
  formData: FreeDiscussionPostFormData,
  author: { uid: string; displayName?: string | null; photoURL?: string | null }
): Promise<{ success: boolean; postId?: string; error?: string | object }> {
  try {
    console.log('[DEBUG] createFreeDiscussionPost called with:', { formData, author });
    
    const validationResult = FreeDiscussionPostFormSchema.safeParse(formData);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { title, content, imageUrl } = validationResult.data;

    const newPostData = {
      authorId: author.uid,
      authorName: author.displayName || '익명',
      authorPhotoURL: author.photoURL || '',
      title,
      content,
      ...imageUrl && { imageUrl }, // Conditionally add imageUrl only if it exists
      category: 'free-discussion' as CommunityPostCategory,
      viewCount: 0,
      commentCount: 0,
      createdAt: FieldValue?.serverTimestamp() || new Date(),
      updatedAt: FieldValue?.serverTimestamp() || new Date(),
    };

    console.log('[DEBUG] Saving post data:', newPostData);
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const docRef = await firestore.collection('communityPosts').add(newPostData);
    console.log('[DEBUG] Post created with ID:', docRef.id);
    
    // Verify post was saved
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const verification = await firestore.collection('communityPosts').doc(docRef.id).get();
    console.log('[DEBUG] Post verification - exists:', verification.exists);
    
    return { success: true, postId: docRef.id };

  } catch (error) {
    console.error('Error creating free discussion post:', error);
    return { success: false, error: '게시물 생성 중 오류가 발생했습니다.' };
  }
}

export async function deleteCommunityPost(
  postId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const docRef = firestore.collection('communityPosts').doc(postId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: false, error: '게시물을 찾을 수 없습니다.' };
    }
    
    if (doc.data()?.authorId !== userId) {
      return { success: false, error: '이 게시물을 삭제할 권한이 없습니다.' };
    }

    // Note: This does not delete subcollections like comments. For a full cleanup, a Cloud Function would be needed.
    await docRef.delete();

    return { success: true };
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    return { success: false, error: '게시물 삭제 중 오류가 발생했습니다.' };
  }
}
// Generic function to create community posts
export async function createCommunityPost(
  formData: FreeDiscussionPostFormData,
  author: { uid: string; displayName?: string | null; photoURL?: string | null },
  category?: CommunityPostCategory
): Promise<{ success: boolean; postId?: string; error?: string | object }> {
  try {
    const validationResult = FreeDiscussionPostFormSchema.safeParse(formData);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { title, content, imageUrl } = validationResult.data;

    const newPostData = {
      authorId: author.uid,
      authorName: author.displayName || '익명',
      authorPhotoURL: author.photoURL || '',
      title,
      content,
      ...imageUrl && { imageUrl },
      category: category || 'free-discussion',
      viewCount: 0,
      commentCount: 0,
      createdAt: FieldValue?.serverTimestamp() || new Date(),
      updatedAt: FieldValue?.serverTimestamp() || new Date(),
    };

    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const docRef = await firestore.collection('communityPosts').add(newPostData);
    return { success: true, postId: docRef.id };

  } catch (error) {
    console.error('Error creating community post:', error);
    return { success: false, error: '게시물 생성 중 오류가 발생했습니다.' };
  }
}

// Function to create reading share posts
export async function createReadingSharePost(
  formData: ReadingSharePostFormData,
  author: { uid: string; displayName?: string | null; photoURL?: string | null }
): Promise<{ success: boolean; postId?: string; error?: string | object }> {
  try {
    const validationResult = ReadingSharePostFormSchema.safeParse(formData);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { title, content, imageUrl, readingQuestion, cardsInfo } = validationResult.data;

    const newPostData = {
      authorId: author.uid,
      authorName: author.displayName || '익명',
      authorPhotoURL: author.photoURL || '',
      title,
      content,
      readingQuestion,
      cardsInfo,
      ...imageUrl && { imageUrl },
      category: 'reading-share' as CommunityPostCategory,
      viewCount: 0,
      commentCount: 0,
      createdAt: FieldValue?.serverTimestamp() || new Date(),
      updatedAt: FieldValue?.serverTimestamp() || new Date(),
    };

    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const docRef = await firestore.collection('communityPosts').add(newPostData);
    return { success: true, postId: docRef.id };

  } catch (error) {
    console.error('Error creating reading share post:', error);
    return { success: false, error: '리딩 공유 게시물 생성 중 오류가 발생했습니다.' };
  }
}