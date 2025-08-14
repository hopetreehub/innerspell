'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, Save, Loader2, X, RefreshCcw, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
// getBlogPosts API route 사용으로 변경
import type { BlogPost, BlogPostFormData } from '@/types';
import { getCsrfToken } from '@/lib/csrf';

const initialFormData: BlogPostFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  categories: [],
  tags: [],
  status: 'draft',
  seoTitle: '',
  seoDescription: '',
  featuredImage: '',
};

export function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<BlogPostFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // 포스트 목록 로드 - API route 사용
  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts');
      const result = await response.json();
      
      if (result.success && result.posts) {
        setPosts(result.posts);
      } else {
        console.error('포스트 로드 실패:', result.error);
        toast.error('포스트를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('포스트 로드 오류:', error);
      toast.error('포스트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // 제목 변경 시 슬러그 자동 생성
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }));
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/blog/upload', {
        method: 'POST',
        headers: {
          'x-csrf-token': getCsrfToken() || ''
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFormData(prev => ({ ...prev, featuredImage: result.url }));
        setImagePreview(result.url);
        toast.success('이미지가 업로드되었습니다.');
      } else {
        toast.error(result.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast.error('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 편집할 포스트 설정
  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      categories: post.categories || [],
      tags: post.tags || [],
      status: post.status,
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      featuredImage: post.featuredImage || '',
    });
    setImagePreview(post.featuredImage || post.image || '');
    setIsFormOpen(true);
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingPost(null);
    setIsFormOpen(false);
    setFormData(initialFormData);
    setImagePreview('');
  };

  // 폼 제출 - API 라우트 사용 (생성/수정)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const isEditing = !!editingPost;
      const url = isEditing ? `/api/blog/posts/${editingPost.id}` : '/api/blog/posts';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(isEditing ? '블로그 포스트가 수정되었습니다!' : '블로그 포스트가 생성되었습니다!');
        handleCancelEdit();
        loadPosts();
      } else {
        toast.error(result.error || (isEditing ? '포스트 수정에 실패했습니다.' : '포스트 생성에 실패했습니다.'));
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
      console.error('Blog post operation error:', error);
    } finally {
      setSaving(false);
    }
  };

  // 상태 토글
  const handleStatusToggle = async (postId: string, currentStatus: BlogPost['status']) => {
    const newStatus = currentStatus === 'draft' ? 'published' : 
                     currentStatus === 'published' ? 'archived' : 'draft';
    
    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('포스트 상태가 변경되었습니다.');
        loadPosts();
      } else {
        toast.error('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
    }
  };

  // 삭제
  const handleDelete = async (postId: string) => {
    if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('포스트가 삭제되었습니다.');
        loadPosts();
      } else {
        toast.error('삭제에 실패했습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
    }
  };

  // 통계 계산
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    archived: posts.filter(p => p.status === 'archived').length,
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">전체 포스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">게시됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">초안</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">보관됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* 새 포스트 버튼 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">블로그 포스트 관리</h3>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            새 포스트 작성
          </Button>
        )}
      </div>

      {/* 인라인 폼 */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingPost ? '블로그 포스트 수정' : '새 블로그 포스트 작성'}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="포스트 제목"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL 슬러그 *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-slug"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">요약</Label>
                <Input
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="포스트 요약"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="포스트 내용을 입력하세요..."
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categories">카테고리 (쉼표로 구분)</Label>
                  <Input
                    id="categories"
                    value={formData.categories.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="타로, 점성술, 꿈해몽"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'draft' | 'published' | 'archived') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">초안</SelectItem>
                      <SelectItem value="published">게시</SelectItem>
                      <SelectItem value="archived">보관</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="타로, 기초, 입문, 2025"
                />
              </div>

              {/* 이미지 업로드 섹션 */}
              <div className="space-y-2">
                <Label htmlFor="image">대표 이미지</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      최대 5MB, JPG/PNG/GIF/WEBP 형식
                    </p>
                  </div>
                  
                  {/* 이미지 미리보기 */}
                  {imagePreview && (
                    <div className="w-32 h-32 relative group">
                      <img
                        src={imagePreview}
                        alt="대표 이미지 미리보기"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, featuredImage: '' }));
                          setImagePreview('');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {!imagePreview && (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  취소
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      저장
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 포스트 목록 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-lg mb-2">아직 작성된 포스트가 없습니다</p>
              <p className="text-sm">새 포스트를 작성해보세요!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead>조회수</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-gray-500">{post.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          post.status === 'published' ? 'default' :
                          post.status === 'draft' ? 'secondary' : 'outline'
                        }
                      >
                        {post.status === 'published' ? '게시됨' :
                         post.status === 'draft' ? '초안' : '보관됨'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {post.createdAt ? 
                        format(new Date(post.createdAt), 'yyyy-MM-dd', { locale: ko }) : 
                        post.publishedAt ? 
                          format(new Date(post.publishedAt), 'yyyy-MM-dd', { locale: ko }) : 
                          '-'
                      }
                    </TableCell>
                    <TableCell>{post.views || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(post)}
                          title="포스트 수정"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusToggle(post.id, post.status)}
                          title="상태 변경"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          title="포스트 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}