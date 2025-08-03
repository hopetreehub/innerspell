'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Edit, 
  Save, 
  Download, 
  Upload, 
  FileText, 
  Code, 
  Image as ImageIcon,
  Link,
  List,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Table,
  Hash
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { MDXRenderer } from '@/components/blog/MDXRenderer';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MDXEditorProps {
  initialContent?: string;
  initialMeta?: {
    title: string;
    excerpt: string;
    category: string;
    tags: string[];
    author: string;
    image: string;
    featured: boolean;
    published: boolean;
  };
  onSave?: (content: string, meta: any) => Promise<void>;
  readOnly?: boolean;
}

const categories = [
  { id: 'tarot-guide', name: '타로 가이드' },
  { id: 'spiritual-knowledge', name: '점술 지식' },
  { id: 'dream-interpretation', name: '꿈해몽 정보' },
  { id: 'spiritual-healing', name: '영성 및 힐링' },
  { id: 'self-development', name: '자기계발' },
  { id: 'success-strategy', name: '성공 전략' },
  { id: 'intuition-development', name: '직관력 개발' }
];

const mdxTemplate = `---
title: "새로운 포스트 제목"
excerpt: "포스트 요약을 여기에 작성하세요"
publishedAt: "${new Date().toISOString().split('T')[0]}"
category: "타로 가이드"
tags: ["타로", "초보자", "가이드"]
author: "InnerSpell 팀"
image: "/images/blog/default.jpg"
featured: false
published: false
---

# 제목

여기에 내용을 작성하세요.

## 부제목

### 소제목

**굵은 글씨**와 *이탤릭*을 사용할 수 있습니다.

- 목록 항목 1
- 목록 항목 2
- 목록 항목 3

1. 순서 있는 목록 1
2. 순서 있는 목록 2

> 인용문을 작성할 수 있습니다.

\`\`\`typescript
// 코드 블록
const example = "Hello, World!";
console.log(example);
\`\`\`

| 테이블 | 헤더 |
|--------|------|
| 데이터 | 값   |

---

### 관련 글
- [링크 텍스트](../other-post)
`;

export function MDXEditor({ 
  initialContent = mdxTemplate, 
  initialMeta,
  onSave,
  readOnly = false 
}: MDXEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // 메타데이터 상태
  const [meta, setMeta] = useState({
    title: '',
    excerpt: '',
    publishedAt: new Date().toISOString().split('T')[0],
    category: '타로 가이드',
    tags: [] as string[],
    author: 'InnerSpell 팀',
    image: '/images/blog/default.jpg',
    featured: false,
    published: false,
    ...initialMeta
  });

  // 프리뷰 업데이트
  useEffect(() => {
    if (activeTab === 'preview') {
      updatePreview();
    }
  }, [activeTab, content]);

  const updatePreview = async () => {
    try {
      setPreviewLoading(true);
      
      // Extract content without frontmatter for preview
      const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
      
      const mdxSource = await serialize(contentWithoutFrontmatter, {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeHighlight],
          development: process.env.NODE_ENV === 'development',
        },
      });
      
      setPreviewContent(mdxSource);
    } catch (error) {
      console.error('프리뷰 생성 실패:', error);
      toast({
        title: '프리뷰 오류',
        description: 'MDX 프리뷰를 생성할 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setSaving(true);
      
      // Create frontmatter
      const frontmatter = `---
title: "${meta.title}"
excerpt: "${meta.excerpt}"
publishedAt: "${meta.publishedAt}"
category: "${meta.category}"
tags: [${meta.tags.map(tag => `"${tag}"`).join(', ')}]
author: "${meta.author}"
image: "${meta.image}"
featured: ${meta.featured}
published: ${meta.published}
---

`;
      
      // Extract content without frontmatter
      const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
      const fullContent = frontmatter + contentWithoutFrontmatter;
      
      await onSave(fullContent, meta);
      
      toast({
        title: '저장 완료',
        description: 'MDX 포스트가 저장되었습니다.',
      });
    } catch (error) {
      console.error('저장 실패:', error);
      toast({
        title: '저장 실패',
        description: '포스트 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('#mdx-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      content.substring(end);
    
    setContent(newContent);
    
    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleTagInput = (tagString: string) => {
    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setMeta({ ...meta, tags });
  };

  const downloadMDX = () => {
    const frontmatter = `---
title: "${meta.title}"
excerpt: "${meta.excerpt}"
publishedAt: "${meta.publishedAt}"
category: "${meta.category}"
tags: [${meta.tags.map(tag => `"${tag}"`).join(', ')}]
author: "${meta.author}"
image: "${meta.image}"
featured: ${meta.featured}
published: ${meta.published}
---

`;
    
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
    const fullContent = frontmatter + contentWithoutFrontmatter;
    
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.mdx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 메타데이터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            포스트 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                placeholder="포스트 제목"
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select value={meta.category} onValueChange={(value) => setMeta({ ...meta, category: value })} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="excerpt">요약 *</Label>
            <Textarea
              id="excerpt"
              value={meta.excerpt}
              onChange={(e) => setMeta({ ...meta, excerpt: e.target.value })}
              placeholder="포스트 요약 (SEO에 사용됩니다)"
              rows={3}
              disabled={readOnly}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">작성자</Label>
              <Input
                id="author"
                value={meta.author}
                onChange={(e) => setMeta({ ...meta, author: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="publishedAt">발행일</Label>
              <Input
                id="publishedAt"
                type="date"
                value={meta.publishedAt}
                onChange={(e) => setMeta({ ...meta, publishedAt: e.target.value })}
                disabled={readOnly}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="tags">태그 (콤마로 구분)</Label>
            <Input
              id="tags"
              value={meta.tags.join(', ')}
              onChange={(e) => handleTagInput(e.target.value)}
              placeholder="타로, 초보자, 가이드"
              disabled={readOnly}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {meta.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <Label>대표 이미지</Label>
            <ImageUpload
              currentImageUrl={meta.image}
              onImageUploaded={(url) => setMeta({ ...meta, image: url })}
              onImageRemoved={() => setMeta({ ...meta, image: '' })}
              folder="blog-images"
              placeholder="MDX 포스트 대표 이미지"
              disabled={readOnly || saving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={meta.featured}
                onCheckedChange={(checked) => setMeta({ ...meta, featured: checked })}
                disabled={readOnly}
              />
              <Label htmlFor="featured">추천 포스트</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={meta.published}
                onCheckedChange={(checked) => setMeta({ ...meta, published: checked })}
                disabled={readOnly}
              />
              <Label htmlFor="published">게시하기</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MDX 에디터 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              MDX 에디터
            </CardTitle>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <>
                  <Button variant="outline" size="sm" onClick={downloadMDX}>
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                  <Button onClick={handleSave} disabled={saving || !meta.title || !meta.excerpt}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? '저장 중...' : '저장'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  편집
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  미리보기
                </TabsTrigger>
              </TabsList>
              
              {/* 마크다운 툴바 */}
              {activeTab === 'edit' && !readOnly && (
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('# ', '')}
                    title="제목 1"
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('## ', '')}
                    title="제목 2"
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('### ', '')}
                    title="제목 3"
                  >
                    <Heading3 className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-4" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('**', '**')}
                    title="굵게"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('*', '*')}
                    title="기울임"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-4" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('- ', '')}
                    title="목록"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('> ', '')}
                    title="인용"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('[링크 텍스트](', ')')}
                    title="링크"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('![이미지 설명](', ')')}
                    title="이미지"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('\n| 헤더1 | 헤더2 |\n|--------|--------|\n| 데이터1 | 데이터2 |\n', '')}
                    title="테이블"
                  >
                    <Table className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <TabsContent value="edit" className="m-0">
              <Textarea
                id="mdx-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="MDX 콘텐츠를 작성하세요..."
                className="min-h-[500px] font-mono text-sm"
                disabled={readOnly}
              />
            </TabsContent>
            
            <TabsContent value="preview" className="m-0">
              {previewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">프리뷰 생성 중...</span>
                </div>
              ) : previewContent ? (
                <div className="border rounded-md p-6 min-h-[500px] bg-background">
                  <MDXRenderer content={previewContent} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  프리뷰를 생성하려면 먼저 콘텐츠를 작성하세요.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}