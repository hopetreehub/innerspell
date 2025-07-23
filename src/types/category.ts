// 카테고리 타입 정의
export interface BlogCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  color?: string;
  icon?: string;
  postCount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 태그 타입 정의
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 카테고리 생성/수정용 타입
export type CreateCategoryRequest = Omit<BlogCategory, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>;
export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

// 태그 생성/수정용 타입
export type CreateTagRequest = Omit<BlogTag, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>;
export type UpdateTagRequest = Partial<CreateTagRequest>;

// 카테고리/태그 통계
export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categoriesWithPosts: number;
}

export interface TagStats {
  totalTags: number;
  activeTags: number;
  inactiveTags: number;
  tagsWithPosts: number;
  mostUsedTags: BlogTag[];
}