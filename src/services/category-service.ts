'use client';

import { db } from '@/lib/firebase/client';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { BlogCategory, BlogTag, CreateCategoryRequest, UpdateCategoryRequest, CreateTagRequest, UpdateTagRequest, CategoryStats, TagStats } from '@/types/category';

// 프로덕션에서는 실제 Firestore만 사용

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