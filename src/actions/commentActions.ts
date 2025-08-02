'use server';

import { z } from 'zod';
import { getFirestore, getFieldValue, safeFirestoreOperation } from '@/lib/firebase/admin-helpers';
import type { CommunityComment } from '@/types';
import { CommunityCommentFormSchema, CommunityCommentFormData } from '@/types';

// Helper to map Firestore doc to CommunityComment type
function mapDocToCommunityComment(doc: FirebaseFirestore.DocumentSnapshot): CommunityComment {
  const data = doc.data()!; // Assume data exists
  const now = new Date();
  const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : now;
  const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : createdAt;

  return {
    id: doc.id,
    postId: data.postId,
    authorId: data.authorId,
    authorName: data.authorName || '익명 사용자',
    authorPhotoURL: data.authorPhotoURL || '',
    content: data.content,
    isSecret: data.isSecret || false,
    createdAt,
    updatedAt,
  };
}

// Get all comments for a specific post
export async function getCommentsForPost(postId: string): Promise<CommunityComment[]> {
  const result = await safeFirestoreOperation(async (firestore) => {
    const snapshot = await firestore
      .collection('communityPosts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .get();
      
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(mapDocToCommunityComment);
  });

  if (!result.success) {
    console.error(`Error fetching comments for post ${postId}:`, result.error);
    return [];
  }
  
  return result.data;
}

// Add a new comment to a post
export async function addComment(
  postId: string,
  formData: CommunityCommentFormData,
  author: { uid: string; displayName?: string | null; photoURL?: string | null }
): Promise<{ success: boolean; commentId?: string; error?: string | object }> {
  try {
    console.log(`[DEBUG] addComment called for postId: ${postId}, author: ${author.displayName}`);
    const validationResult = CommunityCommentFormSchema.safeParse(formData);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { content, isSecret } = validationResult.data;
    
    const result = await safeFirestoreOperation(async (firestore) => {
      const postRef = firestore.collection('communityPosts').doc(postId);
      const commentRef = postRef.collection('comments').doc();

      const newComment = {
        authorId: author.uid,
        authorName: author.displayName || '익명',
        authorPhotoURL: author.photoURL || '',
        content: content,
        isSecret: isSecret || false,
        createdAt: getFieldValue().serverTimestamp(),
        updatedAt: getFieldValue().serverTimestamp(),
      };

      console.log(`[DEBUG] Starting transaction for postId: ${postId}`);
      await firestore.runTransaction(async (transaction: any) => {
        console.log(`[DEBUG] Inside transaction - setting comment and updating post`);
        transaction.set(commentRef, newComment);
        transaction.update(postRef, {
          commentCount: getFieldValue().increment(1),
          updatedAt: getFieldValue().serverTimestamp(),
        });
      });
      console.log(`[DEBUG] Transaction completed for postId: ${postId}`);
      
      return commentRef.id;
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    return { success: true, commentId: result.data };
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    return { success: false, error: '댓글을 추가하는 중 오류가 발생했습니다.' };
  }
}

// Delete a comment
export async function deleteComment(
  postId: string,
  commentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  return safeFirestoreOperation(async (firestore) => {
    const postRef = firestore.collection('communityPosts').doc(postId);
    const commentRef = postRef.collection('comments').doc(commentId);
    
    const doc = await commentRef.get();
    if (!doc.exists) {
      return { success: false, error: '댓글을 찾을 수 없습니다.' };
    }
    
    if (doc.data()?.authorId !== userId) {
      return { success: false, error: '댓글을 삭제할 권한이 없습니다.' };
    }

    await firestore.runTransaction(async (transaction: any) => {
      transaction.delete(commentRef);
      transaction.update(postRef, {
        commentCount: getFieldValue().increment(-1),
      });
    });

    return { success: true };
  });
}

// Update a comment
export async function updateComment(
  postId: string,
  commentId: string,
  content: string,
  userId: string
): Promise<{ success: boolean; error?: string | object }> {
  try {
    const validationResult = CommunityCommentFormSchema.safeParse({ content });
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    return safeFirestoreOperation(async (firestore) => {
      const commentRef = firestore.collection('communityPosts').doc(postId).collection('comments').doc(commentId);
      const doc = await commentRef.get();

      if (!doc.exists) {
        return { success: false, error: '댓글을 찾을 수 없습니다.' };
      }
      
      if (doc.data()?.authorId !== userId) {
        return { success: false, error: '댓글을 수정할 권한이 없습니다.' };
      }
      
      await commentRef.update({
        content: validationResult.data.content,
        updatedAt: getFieldValue().serverTimestamp(),
      });

      return { success: true };
    });
  } catch (error) {
    console.error(`Error updating comment ${commentId} from post ${postId}:`, error);
    return { success: false, error: '댓글 수정 중 오류가 발생했습니다.' };
  }
}