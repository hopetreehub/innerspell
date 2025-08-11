export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorId?: string;
  publishedAt: Date;
  updatedAt?: Date;
  createdAt?: Date;
  readingTime: number;
  image: string;
  featured: boolean;
  published: boolean;
  views?: number;
  likes?: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  postCount?: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface BlogComment {
  id: string;
  postId: string;
  parentId?: string | null;
  author: string;
  authorEmail?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  isApproved: boolean;
  replies: BlogComment[];
}