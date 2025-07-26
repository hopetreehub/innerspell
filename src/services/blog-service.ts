import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { BlogPost, BlogCategory, BlogComment } from '@/types/blog';

const POSTS_COLLECTION = 'blog_posts';
const CATEGORIES_COLLECTION = 'blog_categories';
const COMMENTS_COLLECTION = 'blog_comments';

// Firestore 타임스탬프 변환 유틸리티
const convertTimestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

// BlogPost 데이터 변환
const convertFirestoreToPost = (data: DocumentData, id: string): BlogPost => {
  return {
    id,
    title: data.title || '',
    excerpt: data.excerpt || '',
    content: data.content || '',
    category: data.category || 'tarot',
    tags: data.tags || [],
    author: data.author || 'InnerSpell Team',
    authorId: data.authorId,
    publishedAt: convertTimestampToDate(data.publishedAt),
    updatedAt: data.updatedAt ? convertTimestampToDate(data.updatedAt) : undefined,
    createdAt: data.createdAt ? convertTimestampToDate(data.createdAt) : undefined,
    readingTime: data.readingTime || 5,
    image: data.image || '/images/blog1.png',
    featured: data.featured || false,
    published: data.published || false,
    views: data.views || 0,
    likes: data.likes || 0,
  };
};

// 포스트 목록 가져오기
export async function getAllPosts(
  onlyPublished: boolean = true,
  categoryFilter?: string,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ posts: BlogPost[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
  try {
    if (!db) {
      console.log('📝 Firestore not initialized, returning empty posts');
      return { posts: [] };
    }

    // Firestore 환경
    let q = query(collection(db, POSTS_COLLECTION));

    // 필터 적용
    if (onlyPublished) {
      q = query(q, where('published', '==', true));
    }
    if (categoryFilter && categoryFilter !== 'all') {
      q = query(q, where('category', '==', categoryFilter));
    }

    // 정렬 및 페이지네이션
    q = query(q, orderBy('publishedAt', 'desc'), limit(10));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => convertFirestoreToPost(doc.data(), doc.id));
    const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

    return { posts, lastDoc: newLastDoc };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [] };
  }
}

// 단일 포스트 가져오기
export async function getPostById(postId: string): Promise<BlogPost | null> {
  try {
    if (!db) {
      console.log('📝 Firestore not initialized, returning null');
      return null;
    }

    // Firestore 환경
    const postDoc = await getDoc(doc(db, POSTS_COLLECTION, postId));
    
    if (!postDoc.exists()) {
      return null;
    }

    return convertFirestoreToPost(postDoc.data(), postDoc.id);
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// 포스트 생성
export async function createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    if (!db) {
      console.error('🔥 Firestore/Mock DB not initialized');
      throw new Error('Firestore not initialized');
    }

    const now = new Date();
    const postData = {
      ...post,
      createdAt: now,
      updatedAt: now,
      publishedAt: post.publishedAt || now,
      views: 0,
      likes: 0,
    };

    // Firestore 환경
    const newPostRef = doc(collection(db, POSTS_COLLECTION));
    
    await setDoc(newPostRef, {
      ...postData,
      publishedAt: Timestamp.fromDate(postData.publishedAt),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return newPostRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('포스트 생성에 실패했습니다.');
  }
}

// 포스트 업데이트
export async function updatePost(postId: string, updates: Partial<BlogPost>): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // Firestore 환경
    const postRef = doc(db, POSTS_COLLECTION, postId);
    
    const firestoreUpdateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Date 객체를 Timestamp로 변환
    if (updates.publishedAt) {
      firestoreUpdateData.publishedAt = Timestamp.fromDate(updates.publishedAt);
    }

    await updateDoc(postRef, firestoreUpdateData);
  } catch (error) {
    console.error('Error updating post:', error);
    throw new Error('포스트 업데이트에 실패했습니다.');
  }
}

// 포스트 삭제
export async function deletePost(postId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Firestore 환경
    await deleteDoc(doc(db, POSTS_COLLECTION, postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error('포스트 삭제에 실패했습니다.');
  }
}

// 추천 포스트 가져오기
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('published', '==', true),
      where('featured', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertFirestoreToPost(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

// 카테고리별 포스트 수 가져오기
export async function getPostCountByCategory(): Promise<Record<string, number>> {
  try {
    const snapshot = await getDocs(collection(db, POSTS_COLLECTION));
    
    const counts: Record<string, number> = {};
    snapshot.docs.forEach(doc => {
      const category = doc.data().category || 'uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error counting posts by category:', error);
    return {};
  }
}

// 검색 기능 (간단한 버전 - 향후 Algolia나 ElasticSearch 연동 고려)
export async function searchPosts(searchTerm: string): Promise<BlogPost[]> {
  try {
    const snapshot = await getDocs(collection(db, POSTS_COLLECTION));
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const posts = snapshot.docs
      .map(doc => convertFirestoreToPost(doc.data(), doc.id))
      .filter(post => 
        post.published &&
        (post.title.toLowerCase().includes(lowerSearchTerm) ||
         post.excerpt.toLowerCase().includes(lowerSearchTerm) ||
         post.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
      );

    return posts;
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

// 조회수 증가
export async function incrementPostViews(postId: string): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const currentViews = postDoc.data().views || 0;
      await updateDoc(postRef, {
        views: currentViews + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
}

// 좋아요 토글
export async function togglePostLike(postId: string, increment: boolean): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const currentLikes = postDoc.data().likes || 0;
      await updateDoc(postRef, {
        likes: increment ? currentLikes + 1 : Math.max(0, currentLikes - 1)
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
}

// 댓글 관련 함수들
export async function getCommentsByPostId(postId: string): Promise<BlogComment[]> {
  try {
    if (!db) {
      console.log('📝 Firestore not initialized, returning empty comments');
      return [];
    }

    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('postId', '==', postId),
      where('parentId', '==', null),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const comments: BlogComment[] = [];

    for (const docSnap of snapshot.docs) {
      const commentData = docSnap.data();
      const comment: BlogComment = {
        id: docSnap.id,
        postId: commentData.postId,
        parentId: commentData.parentId || null,
        author: commentData.author,
        authorEmail: commentData.authorEmail,
        content: commentData.content,
        createdAt: convertTimestampToDate(commentData.createdAt),
        updatedAt: commentData.updatedAt ? convertTimestampToDate(commentData.updatedAt) : undefined,
        likes: commentData.likes || 0,
        isApproved: commentData.isApproved || false,
        replies: []
      };

      // 답글 가져오기
      const repliesQ = query(
        collection(db, COMMENTS_COLLECTION),
        where('postId', '==', postId),
        where('parentId', '==', docSnap.id),
        orderBy('createdAt', 'asc')
      );
      
      const repliesSnapshot = await getDocs(repliesQ);
      comment.replies = repliesSnapshot.docs.map(replyDoc => {
        const replyData = replyDoc.data();
        return {
          id: replyDoc.id,
          postId: replyData.postId,
          parentId: replyData.parentId,
          author: replyData.author,
          authorEmail: replyData.authorEmail,
          content: replyData.content,
          createdAt: convertTimestampToDate(replyData.createdAt),
          updatedAt: replyData.updatedAt ? convertTimestampToDate(replyData.updatedAt) : undefined,
          likes: replyData.likes || 0,
          isApproved: replyData.isApproved || false,
          replies: []
        };
      });

      comments.push(comment);
    }

    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function createComment(comment: Omit<BlogComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const commentData = {
      ...comment,
      createdAt: Timestamp.now(),
      likes: 0,
      isApproved: true, // 자동 승인 (나중에 관리자 승인 시스템으로 변경 가능)
    };

    const newCommentRef = doc(collection(db, COMMENTS_COLLECTION));
    await setDoc(newCommentRef, commentData);

    return newCommentRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('댓글 등록에 실패했습니다.');
  }
}

export async function updateComment(commentId: string, updates: Partial<BlogComment>): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(commentRef, updateData);
  } catch (error) {
    console.error('Error updating comment:', error);
    throw new Error('댓글 업데이트에 실패했습니다.');
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // 답글들도 함께 삭제
    const repliesQ = query(
      collection(db, COMMENTS_COLLECTION),
      where('parentId', '==', commentId)
    );
    
    const repliesSnapshot = await getDocs(repliesQ);
    const deletePromises = repliesSnapshot.docs.map(replyDoc => 
      deleteDoc(doc(db, COMMENTS_COLLECTION, replyDoc.id))
    );

    // 원본 댓글 삭제
    deletePromises.push(deleteDoc(doc(db, COMMENTS_COLLECTION, commentId)));

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('댓글 삭제에 실패했습니다.');
  }
}

export async function toggleCommentLike(commentId: string, increment: boolean): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (commentDoc.exists()) {
      const currentLikes = commentDoc.data().likes || 0;
      await updateDoc(commentRef, {
        likes: increment ? currentLikes + 1 : Math.max(0, currentLikes - 1)
      });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
  }
}