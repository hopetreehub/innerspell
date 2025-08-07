import { promises as fs } from 'fs';
import path from 'path';
import type { CommunityComment, CommunityCommentFormData } from '@/types';
import { developmentLog } from '@/lib/development-helpers';

const COMMENTS_FILE = path.join(process.cwd(), 'data', 'community-comments.json');
const POSTS_FILE = path.join(process.cwd(), 'data', 'community-posts.json');

interface FileComment extends Omit<CommunityComment, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

async function ensureDataDir() {
  const dataDir = path.dirname(COMMENTS_FILE);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function readCommentsFile(): Promise<FileComment[]> {
  try {
    const data = await fs.readFile(COMMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('📄 Comments file not found, returning empty array');
    return [];
  }
}

async function writeCommentsFile(comments: FileComment[]): Promise<void> {
  await ensureDataDir();
  
  // Create backup before writing
  try {
    const existingData = await fs.readFile(COMMENTS_FILE, 'utf-8');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(path.dirname(COMMENTS_FILE), `community-comments_${timestamp}.json`);
    await fs.writeFile(backupPath, existingData, 'utf-8');
    console.log(`📦 Backup created: ${path.basename(backupPath)}`);
    
    // Clean old backups (keep only last 5)
    const files = await fs.readdir(path.dirname(COMMENTS_FILE));
    const backups = files
      .filter(f => f.startsWith('community-comments_') && f.endsWith('.json'))
      .sort()
      .slice(0, -5); // Keep last 5
    
    for (const backup of backups) {
      await fs.unlink(path.join(path.dirname(COMMENTS_FILE), backup));
      console.log(`🗑️ Deleted old backup: ${backup}`);
    }
  } catch (error) {
    // No existing file or backup failed, continue
  }
  
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
  console.log('✅ Successfully wrote community-comments.json');
}

// Helper to update post comment count
async function updatePostCommentCount(postId: string, increment: number) {
  try {
    const postsData = await fs.readFile(POSTS_FILE, 'utf-8');
    const posts = JSON.parse(postsData);
    
    const postIndex = posts.findIndex((p: any) => p.id === postId);
    if (postIndex !== -1) {
      posts[postIndex].commentCount = (posts[postIndex].commentCount || 0) + increment;
      posts[postIndex].updatedAt = new Date().toISOString();
      
      await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
      console.log(`📝 Updated comment count for post ${postId}`);
    }
  } catch (error) {
    console.error('Error updating post comment count:', error);
  }
}

export async function getCommentsFromFile(postId: string): Promise<CommunityComment[]> {
  developmentLog('Comments', `Getting comments from file for post: ${postId}`);
  
  const fileComments = await readCommentsFile();
  const postComments = fileComments.filter(comment => comment.postId === postId);
  
  // Convert to CommunityComment type with Date objects
  const comments = postComments.map(comment => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
    updatedAt: new Date(comment.updatedAt)
  }));
  
  developmentLog('Comments', `Found ${comments.length} comments for post ${postId}`);
  return comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function addCommentToFile(
  postId: string,
  formData: CommunityCommentFormData,
  author: { uid: string; displayName?: string | null; photoURL?: string | null }
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  developmentLog('Comments', `Adding comment to post: ${postId}`);
  
  try {
    const comments = await readCommentsFile();
    const now = new Date().toISOString();
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newComment: FileComment = {
      id: commentId,
      postId,
      authorId: author.uid,
      authorName: author.displayName || '익명',
      authorPhotoURL: author.photoURL || '',
      content: formData.content,
      isSecret: formData.isSecret || false,
      createdAt: now,
      updatedAt: now
    };
    
    comments.push(newComment);
    await writeCommentsFile(comments);
    
    // Update post comment count
    await updatePostCommentCount(postId, 1);
    
    developmentLog('Comments', `Created new comment: ${commentId}`);
    return { success: true, commentId };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: '댓글 추가 중 오류가 발생했습니다.' };
  }
}

export async function deleteCommentFromFile(
  postId: string,
  commentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  developmentLog('Comments', `Deleting comment: ${commentId} from post: ${postId}`);
  
  try {
    const comments = await readCommentsFile();
    const commentIndex = comments.findIndex(c => c.id === commentId && c.postId === postId);
    
    if (commentIndex === -1) {
      return { success: false, error: '댓글을 찾을 수 없습니다.' };
    }
    
    if (comments[commentIndex].authorId !== userId) {
      return { success: false, error: '댓글을 삭제할 권한이 없습니다.' };
    }
    
    comments.splice(commentIndex, 1);
    await writeCommentsFile(comments);
    
    // Update post comment count
    await updatePostCommentCount(postId, -1);
    
    developmentLog('Comments', `Deleted comment: ${commentId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: '댓글 삭제 중 오류가 발생했습니다.' };
  }
}

export async function updateCommentInFile(
  postId: string,
  commentId: string,
  content: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  developmentLog('Comments', `Updating comment: ${commentId} in post: ${postId}`);
  
  try {
    const comments = await readCommentsFile();
    const commentIndex = comments.findIndex(c => c.id === commentId && c.postId === postId);
    
    if (commentIndex === -1) {
      return { success: false, error: '댓글을 찾을 수 없습니다.' };
    }
    
    if (comments[commentIndex].authorId !== userId) {
      return { success: false, error: '댓글을 수정할 권한이 없습니다.' };
    }
    
    comments[commentIndex].content = content;
    comments[commentIndex].updatedAt = new Date().toISOString();
    
    await writeCommentsFile(comments);
    
    developmentLog('Comments', `Updated comment: ${commentId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating comment:', error);
    return { success: false, error: '댓글 수정 중 오류가 발생했습니다.' };
  }
}

// Initialize with sample comments if needed
export async function initializeCommentsIfNeeded() {
  const comments = await readCommentsFile();
  
  if (comments.length === 0) {
    developmentLog('Comments', 'Initializing with sample comments');
    
    const sampleComments: FileComment[] = [
      {
        id: 'mock-comment-1',
        postId: 'mock-post-1',
        authorId: 'dev-user-2',
        authorName: '타로초보',
        authorPhotoURL: '',
        content: '저도 같은 고민이 있어요! 함께 공부해요.',
        isSecret: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 'mock-comment-2',
        postId: 'mock-post-1',
        authorId: 'dev-user-3',
        authorName: '영성탐구자',
        authorPhotoURL: '',
        content: '타로 카드는 직관이 중요해요. 책만 보지 말고 느낌을 믿으세요.',
        isSecret: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];
    
    await writeCommentsFile(sampleComments);
  }
}