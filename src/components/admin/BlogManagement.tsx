'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search, Calendar, Tag, User, Eye, EyeOff, Image, Save, X, Loader2, Settings } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { CategoryTagManagement } from '@/components/admin/CategoryTagManagement';
import { type BlogPost } from '@/types/blog';
import { BlogCategory } from '@/types/category';
import { getAllCategories } from '@/services/category-service';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { getApiHeaders } from '@/lib/csrf';

export function BlogManagement() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  
  // 동적 카테고리 상태
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  
  // 포스트 편집 상태
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 새 포스트 상태
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    category: 'tarot',
    tags: [],
    author: 'InnerSpell Team',
    image: '/images/blog1.png',
    featured: false,
    published: false,
  });

  // 포스트 및 카테고리 데이터 가져오기
  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('카테고리 로딩 에러:', error);
      // 에러 시 기본 카테고리 사용
      setCategories([
        { id: 'tarot', name: '타로', description: '타로 카드 관련', slug: 'tarot', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'dream', name: '꿈해몽', description: '꿈 해석 관련', slug: 'dream', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'spiritual', name: '영성', description: '명상 및 영적 성장', slug: 'spiritual', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'self-development', name: '자기계발', description: '영성과 결합된 자기계발', slug: 'self-development', isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ]);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = (user as any)?.getIdToken ? await (user as any).getIdToken() : 'mock-token';
      
      const response = await fetch('/api/blog/posts?published=false', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data.posts || []);
      setFilteredPosts(data.posts || []);
    } catch (error) {
      console.error('포스트 로딩 에러:', error);
      toast({
        title: '오류',
        description: '포스트를 불러올 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 필터링
  useEffect(() => {
    let filtered = posts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory, posts]);

  // 포스트 생성/수정 다이얼로그 열기
  const openDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setNewPost(post);
    } else {
      setEditingPost(null);
      setNewPost({
        title: '',
        excerpt: '',
        content: '',
        category: 'tarot',
        tags: [],
        author: 'InnerSpell Team',
        image: '/images/blog1.png',
        featured: false,
        published: false,
      });
    }
    setIsDialogOpen(true);
  };

  // 포스트 삭제
  const deletePost = async (postId: string) => {
    if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) return;

    try {
      const token = (user as any)?.getIdToken ? await (user as any).getIdToken() : 'mock-token';
      
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) throw new Error('Failed to delete post');

      toast({
        title: '성공',
        description: '포스트가 삭제되었습니다.',
      });

      // 목록 새로고침
      fetchPosts();
    } catch (error) {
      console.error('포스트 삭제 에러:', error);
      toast({
        title: '오류',
        description: '포스트 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 포스트 저장
  const savePost = async () => {
    if (!newPost.title || !newPost.excerpt || !newPost.content) {
      toast({
        title: '오류',
        description: '필수 필드를 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    
    try {
      const token = (user as any)?.getIdToken ? await (user as any).getIdToken() : 'mock-token';
      const isEditing = !!editingPost;
      
      const url = isEditing 
        ? `/api/blog/posts/${editingPost.id}`
        : '/api/blog/posts';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getApiHeaders({
          'Authorization': token ? `Bearer ${token}` : '',
        }),
        body: JSON.stringify({
          ...newPost,
          publishedAt: newPost.publishedAt || new Date().toISOString(),
        }),
      });

      const data = await response.json();
      console.log('API 응답:', { status: response.status, data });
      
      if (!response.ok) {
        console.error('API 응답 오류:', data);
        throw new Error(data.error || 'Failed to save post');
      }

      // Mock 환경에서도 성공으로 처리
      if (data.success || response.ok) {
        toast({
          title: '성공',
          description: data.message || (isEditing ? '포스트가 수정되었습니다.' : '포스트가 생성되었습니다.'),
        });

        setIsDialogOpen(false);
        setEditingPost(null);
        setNewPost({
          title: '',
          excerpt: '',
          content: '',
          category: 'tarot',
          tags: [],
          image: '',
          published: false,
          featured: false,
          readingTime: 0,
          publishedAt: new Date(),
        });
        fetchPosts();
      }
    } catch (error) {
      console.error('포스트 저장 에러:', error);
      toast({
        title: '오류',
        description: '포스트 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // 태그 입력 처리
  const handleTagInput = (tagString: string) => {
    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setNewPost({ ...newPost, tags });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">포스트 관리</TabsTrigger>
          <TabsTrigger value="categories">카테고리/태그 관리</TabsTrigger>
          <TabsTrigger value="analytics">통계</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="포스트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              새 포스트
            </Button>
          </div>

          {/* 포스트 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>포스트 목록</CardTitle>
              <CardDescription>
                총 {filteredPosts.length}개의 포스트
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>추천</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categories.find(c => c.id === post.category)?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(post.publishedAt, 'yyyy-MM-dd', { locale: ko })}
                      </TableCell>
                      <TableCell>
                        {post.published ? (
                          <Badge className="bg-green-500">
                            <Eye className="h-3 w-3 mr-1" />
                            게시됨
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            미게시
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {post.featured && (
                          <Badge className="bg-primary">추천</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryTagManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>총 포스트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{posts.length}</div>
                <p className="text-sm text-muted-foreground">
                  게시됨: {posts.filter(p => p.published).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>추천 포스트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{posts.filter(p => p.featured).length}</div>
                <p className="text-sm text-muted-foreground">
                  전체 대비 {Math.round((posts.filter(p => p.featured).length / posts.length) * 100)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>평균 읽기 시간</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(posts.reduce((sum, p) => sum + p.readingTime, 0) / posts.length)}분
                </div>
                <p className="text-sm text-muted-foreground">
                  전체 포스트 평균
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 포스트 생성/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // 다이얼로그가 닫힐 때 상태 초기화
          setEditingPost(null);
          setNewPost({
            title: '',
            excerpt: '',
            content: '',
            category: 'tarot',
            tags: [],
            image: '',
            published: false,
            featured: false,
            readingTime: 0,
            publishedAt: new Date(),
          });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? '포스트 수정' : '새 포스트 작성'}</DialogTitle>
            <DialogDescription>
              포스트 정보를 입력하세요. 필수 필드는 모두 작성해야 합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={newPost.title || ''}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="포스트 제목을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">요약 *</Label>
              <Textarea
                id="excerpt"
                value={newPost.excerpt || ''}
                onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                placeholder="포스트 요약을 입력하세요 (검색 결과에 표시됩니다)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select 
                value={newPost.category} 
                onValueChange={(value) => setNewPost({ ...newPost, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>대표 이미지</Label>
              <ImageUpload
                currentImageUrl={newPost.image}
                onImageUploaded={(url) => setNewPost({ ...newPost, image: url })}
                onImageRemoved={() => setNewPost({ ...newPost, image: '' })}
                folder="blog-images"
                placeholder="대표 이미지를 업로드하세요"
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="tags">태그 (콤마로 구분)</Label>
              <Input
                id="tags"
                value={newPost.tags?.join(', ') || ''}
                onChange={(e) => handleTagInput(e.target.value)}
                placeholder="타로, 초보자, 가이드"
              />
            </div>

            <div>
              <Label htmlFor="content">본문 *</Label>
              <Textarea
                id="content"
                value={newPost.content || ''}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="마크다운 형식으로 작성하세요"
                rows={10}
                className="font-mono"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={newPost.featured || false}
                  onCheckedChange={(checked) => setNewPost({ ...newPost, featured: checked })}
                />
                <Label htmlFor="featured">추천 포스트</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={newPost.published || false}
                  onCheckedChange={(checked) => setNewPost({ ...newPost, published: checked })}
                />
                <Label htmlFor="published">게시하기</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button onClick={savePost} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}