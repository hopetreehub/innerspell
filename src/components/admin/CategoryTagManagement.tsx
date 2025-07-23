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
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search, Tag, FolderOpen, TrendingUp, Users, Hash } from 'lucide-react';
import { BlogCategory, BlogTag, CreateCategoryRequest, CreateTagRequest, CategoryStats, TagStats } from '@/types/category';
import { toast } from '@/hooks/use-toast';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  getCategoryStats,
  getTagStats
} from '@/services/category-service';

// 색상 옵션
const colorOptions = [
  { value: '#EF4444', name: '빨강' },
  { value: '#F97316', name: '주황' },
  { value: '#F59E0B', name: '노랑' },
  { value: '#10B981', name: '초록' },
  { value: '#3B82F6', name: '파랑' },
  { value: '#6366F1', name: '인디고' },
  { value: '#8B5CF6', name: '보라' },
  { value: '#EC4899', name: '분홍' },
  { value: '#6B7280', name: '회색' },
];

// 아이콘 옵션
const iconOptions = [
  '🔮', '🌙', '🧘', '📈', '⭐', '🌟', '✨', '🎯', '💫', '🔥',
  '💡', '📚', '🎨', '🌸', '🍃', '🌺', '🦋', '🌈', '☀️', '🌊'
];

export function CategoryTagManagement() {
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(true);
  
  // 카테고리 상태
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<BlogCategory[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null);
  
  // 태그 상태
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [filteredTags, setFilteredTags] = useState<BlogTag[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [tagStats, setTagStats] = useState<TagStats | null>(null);
  
  // 다이얼로그 상태
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [saving, setSaving] = useState(false);
  
  // 새 카테고리/태그 상태
  const [newCategory, setNewCategory] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
    slug: '',
    color: '#8B5CF6',
    icon: '🔮',
    isActive: true
  });
  
  const [newTag, setNewTag] = useState<CreateTagRequest>({
    name: '',
    slug: '',
    description: '',
    color: '#EF4444',
    isActive: true
  });

  // 데이터 로딩
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, tagsData, categoryStatsData, tagStatsData] = await Promise.all([
        getAllCategories(),
        getAllTags(),
        getCategoryStats(),
        getTagStats()
      ]);
      
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
      setTags(tagsData);
      setFilteredTags(tagsData);
      setCategoryStats(categoryStatsData);
      setTagStats(tagStatsData);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      toast({
        title: '오류',
        description: '데이터를 불러올 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 필터링
  useEffect(() => {
    let filtered = categories;
    if (categorySearchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
      );
    }
    setFilteredCategories(filtered);
  }, [categories, categorySearchTerm]);

  // 태그 필터링
  useEffect(() => {
    let filtered = tags;
    if (tagSearchTerm) {
      filtered = filtered.filter(tag =>
        tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(tagSearchTerm.toLowerCase()))
      );
    }
    setFilteredTags(filtered);
  }, [tags, tagSearchTerm]);

  // 카테고리 생성/수정
  const handleSaveCategory = async () => {
    try {
      setSaving(true);
      
      if (editingCategory) {
        // 수정
        await updateCategory(editingCategory.id, newCategory);
        toast({
          title: '성공',
          description: '카테고리가 수정되었습니다.',
        });
      } else {
        // 생성
        await createCategory(newCategory);
        toast({
          title: '성공',
          description: '카테고리가 생성되었습니다.',
        });
      }
      
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setNewCategory({
        name: '',
        description: '',
        slug: '',
        color: '#8B5CF6',
        icon: '🔮',
        isActive: true
      });
      
      await loadData();
    } catch (error) {
      console.error('카테고리 저장 실패:', error);
      toast({
        title: '오류',
        description: '카테고리 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // 태그 생성/수정
  const handleSaveTag = async () => {
    try {
      setSaving(true);
      
      if (editingTag) {
        // 수정
        await updateTag(editingTag.id, newTag);
        toast({
          title: '성공',
          description: '태그가 수정되었습니다.',
        });
      } else {
        // 생성
        await createTag(newTag);
        toast({
          title: '성공',
          description: '태그가 생성되었습니다.',
        });
      }
      
      setIsTagDialogOpen(false);
      setEditingTag(null);
      setNewTag({
        name: '',
        slug: '',
        description: '',
        color: '#EF4444',
        isActive: true
      });
      
      await loadData();
    } catch (error) {
      console.error('태그 저장 실패:', error);
      toast({
        title: '오류',
        description: '태그 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (category: BlogCategory) => {
    if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) return;
    
    try {
      await deleteCategory(category.id);
      toast({
        title: '성공',
        description: '카테고리가 삭제되었습니다.',
      });
      await loadData();
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      toast({
        title: '오류',
        description: '카테고리 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 태그 삭제
  const handleDeleteTag = async (tag: BlogTag) => {
    if (!confirm(`"${tag.name}" 태그를 삭제하시겠습니까?`)) return;
    
    try {
      await deleteTag(tag.id);
      toast({
        title: '성공',
        description: '태그가 삭제되었습니다.',
      });
      await loadData();
    } catch (error) {
      console.error('태그 삭제 실패:', error);
      toast({
        title: '오류',
        description: '태그 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 카테고리 편집 시작
  const startEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      slug: category.slug,
      color: category.color || '#8B5CF6',
      icon: category.icon || '🔮',
      isActive: category.isActive
    });
    setIsCategoryDialogOpen(true);
  };

  // 태그 편집 시작
  const startEditTag = (tag: BlogTag) => {
    setEditingTag(tag);
    setNewTag({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '#EF4444',
      isActive: tag.isActive
    });
    setIsTagDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">카테고리/태그 데이터 로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">전체 카테고리</p>
                <p className="text-2xl font-bold">{categoryStats?.totalCategories || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">전체 태그</p>
                <p className="text-2xl font-bold">{tagStats?.totalTags || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">사용 중인 카테고리</p>
                <p className="text-2xl font-bold">{categoryStats?.categoriesWithPosts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">사용 중인 태그</p>
                <p className="text-2xl font-bold">{tagStats?.tagsWithPosts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리 및 태그 관리</CardTitle>
          <CardDescription>
            블로그 포스트의 카테고리와 태그를 관리하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">카테고리</TabsTrigger>
              <TabsTrigger value="tags">태그</TabsTrigger>
            </TabsList>

            {/* 카테고리 탭 */}
            <TabsContent value="categories" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="카테고리 검색..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingCategory(null);
                      setNewCategory({
                        name: '',
                        description: '',
                        slug: '',
                        color: '#8B5CF6',
                        icon: '🔮',
                        isActive: true
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      새 카테고리
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? '카테고리 수정' : '새 카테고리 생성'}</DialogTitle>
                      <DialogDescription>
                        카테고리 정보를 입력하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">이름 *</Label>
                        <Input
                          id="category-name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          placeholder="카테고리 이름"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-description">설명</Label>
                        <Textarea
                          id="category-description"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                          placeholder="카테고리 설명"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category-color">색상</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                                className={`w-8 h-8 rounded-full border-2 ${
                                  newCategory.color === color.value ? 'border-gray-800' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="category-icon">아이콘</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {iconOptions.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => setNewCategory({ ...newCategory, icon })}
                                className={`w-8 h-8 rounded border text-lg ${
                                  newCategory.icon === icon ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="category-active"
                          checked={newCategory.isActive}
                          onCheckedChange={(checked) => setNewCategory({ ...newCategory, isActive: checked })}
                        />
                        <Label htmlFor="category-active">활성화</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleSaveCategory} disabled={saving || !newCategory.name}>
                        {saving ? '저장 중...' : '저장'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>카테고리</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>포스트 수</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span style={{ color: category.color }}>{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.postCount || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? 'default' : 'secondary'}>
                          {category.isActive ? '활성' : '비활성'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* 태그 탭 */}
            <TabsContent value="tags" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="태그 검색..."
                    value={tagSearchTerm}
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingTag(null);
                      setNewTag({
                        name: '',
                        slug: '',
                        description: '',
                        color: '#EF4444',
                        isActive: true
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      새 태그
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTag ? '태그 수정' : '새 태그 생성'}</DialogTitle>
                      <DialogDescription>
                        태그 정보를 입력하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tag-name">이름 *</Label>
                        <Input
                          id="tag-name"
                          value={newTag.name}
                          onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                          placeholder="태그 이름"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tag-description">설명</Label>
                        <Textarea
                          id="tag-description"
                          value={newTag.description}
                          onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                          placeholder="태그 설명"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tag-color">색상</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setNewTag({ ...newTag, color: color.value })}
                              className={`w-8 h-8 rounded-full border-2 ${
                                newTag.color === color.value ? 'border-gray-800' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="tag-active"
                          checked={newTag.isActive}
                          onCheckedChange={(checked) => setNewTag({ ...newTag, isActive: checked })}
                        />
                        <Label htmlFor="tag-active">활성화</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleSaveTag} disabled={saving || !newTag.name}>
                        {saving ? '저장 중...' : '저장'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>태그</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>포스트 수</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          style={{ 
                            borderColor: tag.color,
                            color: tag.color
                          }}
                        >
                          {tag.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tag.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tag.postCount || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tag.isActive ? 'default' : 'secondary'}>
                          {tag.isActive ? '활성' : '비활성'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditTag(tag)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTag(tag)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}