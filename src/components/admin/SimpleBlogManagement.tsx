'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  createBlogPost, 
  getBlogPosts, 
  togglePostStatus, 
  deleteBlogPost 
} from '@/actions/blogActions';
import type { BlogPost, BlogPostFormData } from '@/types';

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
};

const statusConfig = {
  draft: { label: '초안', className: 'bg-yellow-100 text-yellow-800' },
  published: { label: '게시됨', className: 'bg-green-100 text-green-800' },
  archived: { label: '보관됨', className: 'bg-gray-100 text-gray-800' },
};

export function SimpleBlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<BlogPostFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // 포스트 목록 로드
  const loadPosts = async () => {
    try {
      setLoading(true);
      const result = await getBlogPosts(20);
      if (result.success && result.posts) {
        setPosts(result.posts);
      }
    } catch (error) {
      toast.error('포스트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // 슬러그 자동 생성
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await createBlogPost(formData);
      
      if (result.success) {
        toast.success('블로그 포스트가 생성되었습니다!');
        setIsDialogOpen(false);
        setFormData(initialFormData);
        loadPosts(); // 목록 새로고침
      } else {
        toast.error(result.error || '포스트 생성에 실패했습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
      console.error('Blog post creation error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (postId: string, currentStatus: BlogPost['status']) => {
    const newStatus = currentStatus === 'draft' ? 'published' : 
                     currentStatus === 'published' ? 'archived' : 'draft';
    
    try {
      const result = await togglePostStatus(postId, newStatus);
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

  const handleDelete = async (postId: string) => {
    if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await deleteBlogPost(postId);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              새 포스트 작성
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 블로그 포스트 작성</DialogTitle>
              <DialogDescription>
                새로운 블로그 포스트를 작성합니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="포스트 제목"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL 슬러그</Label>
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
                <Label htmlFor="content">내용</Label>
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
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
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
          </DialogContent>
        </Dialog>
      </div>

      {/* 포스트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>포스트 목록</CardTitle>
          <CardDescription>
            작성된 블로그 포스트를 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">포스트를 불러오는 중...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 작성된 포스트가 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground">
                          /{post.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[post.status].className}>
                        {statusConfig[post.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(post.createdAt), 'PPP', { locale: ko })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusToggle(post.id, post.status)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
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