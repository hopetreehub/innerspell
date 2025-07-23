'use client';

import { db } from '@/lib/firebase/client';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { BlogCategory, BlogTag, CreateCategoryRequest, UpdateCategoryRequest, CreateTagRequest, UpdateTagRequest, CategoryStats, TagStats } from '@/types/category';

// Mock 데이터 (개발 환경용)
const mockCategories = new Map<string, BlogCategory>();
const mockTags = new Map<string, BlogTag>();

// 초기 Mock 데이터 설정
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const initialCategories: BlogCategory[] = [
    {
      id: 'tarot',
      name: '타로',
      description: '타로 카드 관련 콘텐츠',
      slug: 'tarot',
      color: '#8B5CF6',
      icon: '🔮',
      postCount: 0,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'dream',
      name: '꿈해몽',
      description: '꿈 해석 관련 콘텐츠',
      slug: 'dream',
      color: '#3B82F6',
      icon: '🌙',
      postCount: 0,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'spiritual',
      name: '영성',
      description: '명상 및 영적 성장 콘텐츠',
      slug: 'spiritual',
      color: '#10B981',
      icon: '🧘',
      postCount: 0,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'self-development',
      name: '자기계발',
      description: '영성과 결합된 자기계발 콘텐츠',
      slug: 'self-development',
      color: '#F59E0B',
      icon: '📈',
      postCount: 0,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  const initialTags: BlogTag[] = [
    { id: 'beginner', name: '초보자', slug: 'beginner', description: '초보자를 위한 콘텐츠', color: '#EF4444', postCount: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'advanced', name: '고급', slug: 'advanced', description: '고급 사용자를 위한 콘텐츠', color: '#7C3AED', postCount: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'guide', name: '가이드', slug: 'guide', description: '단계별 가이드', color: '#059669', postCount: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'tips', name: '팁', slug: 'tips', description: '유용한 팁과 요령', color: '#DC2626', postCount: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'meditation', name: '명상', slug: 'meditation', description: '명상 관련 콘텐츠', color: '#6366F1', postCount: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ];

  initialCategories.forEach(cat => mockCategories.set(cat.id, cat));
  initialTags.forEach(tag => mockTags.set(tag.id, tag));
  console.log('🏷️ Mock 카테고리/태그 데이터 초기화 완료');
}

// Slug 생성 함수
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// ============= 카테고리 관리 =============

export async function getAllCategories(): Promise<BlogCategory[]> {
  try {
    // Mock 환경
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      const categories = Array.from(mockCategories.values());
      console.log('🏷️ Mock 카테고리 목록 조회:', categories.length);
      return categories.sort((a, b) => a.name.localeCompare(b.name));
    }

    // 실제 Firestore
    const categoriesRef = collection(db as any, 'blog-categories');
    const q = query(categoriesRef, orderBy('name'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as BlogCategory[];
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    throw error;
  }
}

export async function createCategory(categoryData: CreateCategoryRequest): Promise<string> {
  try {
    const categoryId = generateSlug(categoryData.name);
    const now = new Date();
    
    const newCategory: BlogCategory = {
      id: categoryId,
      ...categoryData,
      slug: categoryData.slug || generateSlug(categoryData.name),
      postCount: 0,
      createdAt: now,
      updatedAt: now
    };

    // Mock 환경
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      mockCategories.set(categoryId, newCategory);
      console.log('🏷️ Mock 카테고리 생성:', categoryId);
      return categoryId;
    }

    // 실제 Firestore
    const categoryRef = doc(db as any, 'blog-categories', categoryId);
    await setDoc(categoryRef, newCategory);
    
    return categoryId;
  } catch (error) {
    console.error('카테고리 생성 실패:', error);
    throw error;
  }
}

export async function updateCategory(categoryId: string, updates: UpdateCategoryRequest): Promise<void> {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Mock 환경
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      const existing = mockCategories.get(categoryId);
      if (existing) {
        mockCategories.set(categoryId, { ...existing, ...updateData });
        console.log('🏷️ Mock 카테고리 수정:', categoryId);
      }
      return;
    }

    // 실제 Firestore
    const categoryRef = doc(db as any, 'blog-categories', categoryId);
    await updateDoc(categoryRef, updateData);
  } catch (error) {
    console.error('카테고리 수정 실패:', error);
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    // Mock 환경
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      mockCategories.delete(categoryId);
      console.log('🏷️ Mock 카테고리 삭제:', categoryId);
      return;
    }

    // 실제 Firestore
    const categoryRef = doc(db as any, 'blog-categories', categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('카테고리 삭제 실패:', error);
    throw error;
  }
}

// ============= 태그 관리 =============

export async function getAllTags(): Promise<BlogTag[]> {
  try {
    // Mock 환경
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      const tags = Array.from(mockTags.values());
      console.log('🏷️ Mock 태그 목록 조회:', tags.length);
      return tags.sort((a, b) => a.name.localeCompare(b.name));
    }

    // 실제 Firestore
    const tagsRef = collection(db as any, 'blog-tags');
    const q = query(tagsRef, orderBy('name'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as BlogTag[];
  } catch (error) {
    console.error('태그 조회 실패:', error);
    throw error;
  }
}

export async function createTag(tagData: CreateTagRequest): Promise<string> {
  try {
    const tagId = generateSlug(tagData.name);
    const now = new Date();
    
    const newTag: BlogTag = {
      id: tagId,
      ...tagData,
      slug: tagData.slug || generateSlug(tagData.name),
      postCount: 0,
      createdAt: now,
      updatedAt: now
    };

    // Mock 환경
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      mockTags.set(tagId, newTag);
      console.log('🏷️ Mock 태그 생성:', tagId);
      return tagId;
    }

    // 실제 Firestore
    const tagRef = doc(db as any, 'blog-tags', tagId);
    await setDoc(tagRef, newTag);
    
    return tagId;
  } catch (error) {
    console.error('태그 생성 실패:', error);
    throw error;
  }
}

export async function updateTag(tagId: string, updates: UpdateTagRequest): Promise<void> {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Mock 환경
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      const existing = mockTags.get(tagId);
      if (existing) {
        mockTags.set(tagId, { ...existing, ...updateData });
        console.log('🏷️ Mock 태그 수정:', tagId);
      }
      return;
    }

    // 실제 Firestore
    const tagRef = doc(db as any, 'blog-tags', tagId);
    await updateDoc(tagRef, updateData);
  } catch (error) {
    console.error('태그 수정 실패:', error);
    throw error;
  }
}

export async function deleteTag(tagId: string): Promise<void> {
  try {
    // Mock 환경
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      mockTags.delete(tagId);
      console.log('🏷️ Mock 태그 삭제:', tagId);
      return;
    }

    // 실제 Firestore
    const tagRef = doc(db as any, 'blog-tags', tagId);
    await deleteDoc(tagRef);
  } catch (error) {
    console.error('태그 삭제 실패:', error);
    throw error;
  }
}

// ============= 통계 함수 =============

export async function getCategoryStats(): Promise<CategoryStats> {
  try {
    const categories = await getAllCategories();
    
    return {
      totalCategories: categories.length,
      activeCategories: categories.filter(c => c.isActive).length,
      inactiveCategories: categories.filter(c => !c.isActive).length,
      categoriesWithPosts: categories.filter(c => (c.postCount || 0) > 0).length
    };
  } catch (error) {
    console.error('카테고리 통계 조회 실패:', error);
    throw error;
  }
}

export async function getTagStats(): Promise<TagStats> {
  try {
    const tags = await getAllTags();
    const mostUsedTags = tags
      .filter(t => (t.postCount || 0) > 0)
      .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
      .slice(0, 5);
    
    return {
      totalTags: tags.length,
      activeTags: tags.filter(t => t.isActive).length,
      inactiveTags: tags.filter(t => !t.isActive).length,
      tagsWithPosts: tags.filter(t => (t.postCount || 0) > 0).length,
      mostUsedTags
    };
  } catch (error) {
    console.error('태그 통계 조회 실패:', error);
    throw error;
  }
}