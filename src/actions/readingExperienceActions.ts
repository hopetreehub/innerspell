'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getFirestore, getFieldValue, safeFirestoreOperation } from '@/lib/firebase/admin-helpers';
import { 
  ReadingExperience, 
  ReadingExperienceFormData, 
  ReadingExperienceFormSchema,
  CommentFormData,
  CommentFormSchema,
  ReadingComment,
  UserProfile
} from '@/types';

// 리딩 경험 생성
export async function createReadingExperience(
  formData: ReadingExperienceFormData,
  userId: string
) {
  const result = await safeFirestoreOperation(async (firestore) => {
    // 폼 데이터 검증
    const validatedData = ReadingExperienceFormSchema.parse(formData);
    
    // 사용자 정보 조회
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    const userData = userDoc.data() as UserProfile;
    
    // 리딩 경험 문서 생성
    const readingExperienceData = {
      userId,
      title: validatedData.title,
      date: validatedData.date,
      spread: validatedData.spread,
      question: validatedData.question,
      interpretation: validatedData.interpretation,
      reflection: validatedData.reflection,
      isPublic: validatedData.isPublic,
      cards: validatedData.cards,
      
      // 사용자 정보
      author: {
        id: userId,
        name: userData.name,
        avatar: userData.avatar || null,
        level: userData.level || 'beginner'
      },
      
      // 메타데이터
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      createdAt: getFieldValue().serverTimestamp(),
      updatedAt: getFieldValue().serverTimestamp()
    };
    
    const docRef = await firestore.collection('readingExperiences').add(readingExperienceData);
    
    // 사용자의 리딩 경험 수 증가
    await firestore.collection('users').doc(userId).update({
      'stats.readingCount': getFieldValue().increment(1),
      updatedAt: getFieldValue().serverTimestamp()
    });
    
    return docRef.id;
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath('/community/reading-share');
  redirect(`/community/reading-share/${result.data}`);
}

// 리딩 경험 목록 조회
export async function getReadingExperiences(
  pageSize: number = 12,
  lastDocId?: string
) {
  return safeFirestoreOperation(async (firestore) => {
    const readingExperiencesRef = firestore.collection('readingExperiences');
    let q = readingExperiencesRef
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(pageSize + 1); // 다음 페이지 여부 확인을 위해 +1

    if (lastDocId) {
      const lastDoc = await readingExperiencesRef.doc(lastDocId).get();
      if (lastDoc.exists) {
        q = q.startAfter(lastDoc);
      }
    }

    const snapshot = await q.get();
    const experiences: ReadingExperience[] = [];
    
    snapshot.forEach((doc) => {
      if (experiences.length < pageSize) {
        const data = doc.data();
        experiences.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ReadingExperience);
      }
    });
    
    const hasMore = snapshot.size > pageSize;
    const nextCursor = hasMore && experiences.length > 0 
      ? experiences[experiences.length - 1].id 
      : null;
    
    return {
      experiences,
      hasMore,
      nextCursor
    };
  });
}

// 특정 리딩 경험 조회
export async function getReadingExperience(id: string, incrementView = false) {
  return safeFirestoreOperation(async (firestore) => {
    const docRef = firestore.collection('readingExperiences').doc(id);
    
    if (incrementView) {
      // 트랜잭션으로 조회수 증가와 문서 조회를 동시에 처리
      const result = await firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        
        if (!doc.exists) {
          throw new Error('리딩 경험을 찾을 수 없습니다.');
        }
        
        transaction.update(docRef, {
          viewCount: getFieldValue().increment(1)
        });
        
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          viewCount: (data?.viewCount || 0) + 1, // 증가된 값 반영
          createdAt: data?.createdAt?.toDate() || new Date(),
          updatedAt: data?.updatedAt?.toDate() || new Date()
        } as ReadingExperience;
      });
      
      return result;
    } else {
      // 단순 조회
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('리딩 경험을 찾을 수 없습니다.');
      }
      
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date()
      } as ReadingExperience;
    }
  });
}

// 사용자의 리딩 경험 목록 조회
export async function getUserReadingExperiences(
  userId: string,
  pageSize: number = 12,
  lastDocId?: string
) {
  return safeFirestoreOperation(async (firestore) => {
    const readingExperiencesRef = firestore.collection('readingExperiences');
    let q = readingExperiencesRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(pageSize + 1);

    if (lastDocId) {
      const lastDoc = await readingExperiencesRef.doc(lastDocId).get();
      if (lastDoc.exists) {
        q = q.startAfter(lastDoc);
      }
    }

    const snapshot = await q.get();
    const experiences: ReadingExperience[] = [];
    
    snapshot.forEach((doc) => {
      if (experiences.length < pageSize) {
        const data = doc.data();
        experiences.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ReadingExperience);
      }
    });
    
    const hasMore = snapshot.size > pageSize;
    const nextCursor = hasMore && experiences.length > 0 
      ? experiences[experiences.length - 1].id 
      : null;
    
    return {
      experiences,
      hasMore,
      nextCursor
    };
  });
}

// 리딩 경험 업데이트
export async function updateReadingExperience(
  id: string,
  userId: string,
  formData: Partial<ReadingExperienceFormData>
) {
  const result = await safeFirestoreOperation(async (firestore) => {
    const docRef = firestore.collection('readingExperiences').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new Error('리딩 경험을 찾을 수 없습니다.');
    }
    
    const data = doc.data();
    if (data?.userId !== userId) {
      throw new Error('수정 권한이 없습니다.');
    }
    
    // 검증된 데이터만 업데이트
    const updateData: any = {
      updatedAt: getFieldValue().serverTimestamp()
    };
    
    if (formData.title !== undefined) updateData.title = formData.title;
    if (formData.interpretation !== undefined) updateData.interpretation = formData.interpretation;
    if (formData.reflection !== undefined) updateData.reflection = formData.reflection;
    if (formData.isPublic !== undefined) updateData.isPublic = formData.isPublic;
    
    await docRef.update(updateData);
    return id;
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath(`/community/reading-share/${id}`);
  return result.data;
}

// 리딩 경험 삭제
export async function deleteReadingExperience(id: string, userId: string) {
  const result = await safeFirestoreOperation(async (firestore) => {
    const docRef = firestore.collection('readingExperiences').doc(id);
    
    // 트랜잭션으로 삭제 처리
    await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      
      if (!doc.exists) {
        throw new Error('리딩 경험을 찾을 수 없습니다.');
      }
      
      const data = doc.data();
      if (data?.userId !== userId) {
        throw new Error('삭제 권한이 없습니다.');
      }
      
      // 관련 댓글 삭제
      const commentsSnapshot = await firestore
        .collection('readingComments')
        .where('readingExperienceId', '==', id)
        .get();
      
      commentsSnapshot.forEach((commentDoc) => {
        transaction.delete(commentDoc.ref);
      });
      
      // 리딩 경험 삭제
      transaction.delete(docRef);
      
      // 사용자의 리딩 경험 수 감소
      const userRef = firestore.collection('users').doc(userId);
      transaction.update(userRef, {
        'stats.readingCount': getFieldValue().increment(-1),
        updatedAt: getFieldValue().serverTimestamp()
      });
    });
    
    return true;
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath('/community/reading-share');
  redirect('/community/reading-share');
}

// 좋아요 토글
export async function toggleLike(readingExperienceId: string, userId: string) {
  return safeFirestoreOperation(async (firestore) => {
    const likeRef = firestore
      .collection('readingLikes')
      .doc(`${readingExperienceId}_${userId}`);
    
    const result = await firestore.runTransaction(async (transaction) => {
      const likeDoc = await transaction.get(likeRef);
      const experienceRef = firestore.collection('readingExperiences').doc(readingExperienceId);
      
      if (likeDoc.exists) {
        // 좋아요 취소
        transaction.delete(likeRef);
        transaction.update(experienceRef, {
          likeCount: getFieldValue().increment(-1)
        });
        return false;
      } else {
        // 좋아요 추가
        transaction.set(likeRef, {
          userId,
          readingExperienceId,
          createdAt: getFieldValue().serverTimestamp()
        });
        transaction.update(experienceRef, {
          likeCount: getFieldValue().increment(1)
        });
        return true;
      }
    });
    
    revalidatePath(`/community/reading-share/${readingExperienceId}`);
    return result;
  });
}

// 댓글 작성
export async function createComment(
  readingExperienceId: string,
  userId: string,
  formData: CommentFormData
) {
  return safeFirestoreOperation(async (firestore) => {
    // 폼 데이터 검증
    const validatedData = CommentFormSchema.parse(formData);
    
    // 사용자 정보 조회
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    const userData = userDoc.data() as UserProfile;
    
    // 댓글 생성
    const commentData = {
      readingExperienceId,
      userId,
      content: validatedData.content,
      author: {
        id: userId,
        name: userData.name,
        avatar: userData.avatar || null,
        level: userData.level || 'beginner'
      },
      createdAt: getFieldValue().serverTimestamp(),
      updatedAt: getFieldValue().serverTimestamp()
    };
    
    const result = await firestore.runTransaction(async (transaction) => {
      const commentRef = firestore.collection('readingComments').doc();
      const experienceRef = firestore.collection('readingExperiences').doc(readingExperienceId);
      
      transaction.set(commentRef, commentData);
      transaction.update(experienceRef, {
        commentCount: getFieldValue().increment(1)
      });
      
      return commentRef.id;
    });
    
    revalidatePath(`/community/reading-share/${readingExperienceId}`);
    return result;
  });
}

// 댓글 목록 조회
export async function getComments(readingExperienceId: string) {
  return safeFirestoreOperation(async (firestore) => {
    const snapshot = await firestore
      .collection('readingComments')
      .where('readingExperienceId', '==', readingExperienceId)
      .orderBy('createdAt', 'asc')
      .get();
    
    const comments: ReadingComment[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as ReadingComment);
    });
    
    return comments;
  });
}

// 댓글 삭제
export async function deleteComment(
  commentId: string,
  readingExperienceId: string,
  userId: string
) {
  return safeFirestoreOperation(async (firestore) => {
    await firestore.runTransaction(async (transaction) => {
      const commentRef = firestore.collection('readingComments').doc(commentId);
      const commentDoc = await transaction.get(commentRef);
      
      if (!commentDoc.exists) {
        throw new Error('댓글을 찾을 수 없습니다.');
      }
      
      const data = commentDoc.data();
      if (data?.userId !== userId) {
        throw new Error('삭제 권한이 없습니다.');
      }
      
      // 댓글 삭제
      transaction.delete(commentRef);
      
      // 리딩 경험의 댓글 수 감소
      const experienceRef = firestore.collection('readingExperiences').doc(readingExperienceId);
      transaction.update(experienceRef, {
        commentCount: getFieldValue().increment(-1)
      });
    });
    
    revalidatePath(`/community/reading-share/${readingExperienceId}`);
    return true;
  });
}