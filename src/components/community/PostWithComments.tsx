'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CommunityCommentFormSchema, type CommunityCommentFormData, type CommunityComment, type CommunityPost } from '@/types';
import { getCommentsForPost, addComment, deleteComment, updateComment } from '@/actions/commentActions';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageCircle, 
  Loader2, 
  Send, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  User, 
  Eye,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostWithCommentsProps {
  post: CommunityPost;
}

// Helper component to prevent hydration mismatch for relative dates.
const TimeAgo = ({ date }: { date: Date }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{format(date, 'yyyy.MM.dd')}</>;
  }

  return <>{formatDistanceToNow(date, { addSuffix: true, locale: ko })}</>;
};

export function PostWithComments({ post }: PostWithCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<CommunityComment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  
  const form = useForm<CommunityCommentFormData>({
    resolver: zodResolver(CommunityCommentFormSchema),
    defaultValues: { content: '', isSecret: false },
  });

  const editForm = useForm<CommunityCommentFormData>({
    resolver: zodResolver(CommunityCommentFormSchema),
  });

  const fetchComments = async () => {
    if (commentsLoaded) return;
    
    setLoadingComments(true);
    try {
      const fetchedComments = await getCommentsForPost(post.id);
      setComments(fetchedComments);
      setCommentsLoaded(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message || '댓글을 불러오는 데 실패했습니다.',
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentsToggle = () => {
    setCommentsOpen(!commentsOpen);
    if (!commentsOpen && !commentsLoaded) {
      fetchComments();
    }
  };

  const onAddComment: SubmitHandler<CommunityCommentFormData> = async (data) => {
    if (!user) {
      toast({ variant: 'destructive', title: '로그인 필요', description: '댓글을 작성하려면 로그인해주세요.' });
      return;
    }
    const result = await addComment(post.id, data, user);
    if (result.success) {
      // Optimistic update
      const newComment: CommunityComment = {
        id: result.commentId!,
        postId: post.id,
        authorId: user.uid,
        authorName: user.displayName || '익명',
        authorPhotoURL: user.photoURL || '',
        content: data.content,
        isSecret: data.isSecret || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setComments(prev => [...prev, newComment]);
      form.reset();
      toast({ title: '성공', description: '댓글이 작성되었습니다.' });
    } else {
      toast({ variant: 'destructive', title: '댓글 작성 실패', description: typeof result.error === 'string' ? result.error : '오류가 발생했습니다.' });
    }
  };

  const onUpdateComment = async (data: CommunityCommentFormData, commentId: string) => {
    if (!user) return;
    const result = await updateComment(post.id, commentId, data.content, user.uid);
    if (result.success) {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: data.content, updatedAt: new Date() } : c));
      setEditingCommentId(null);
      toast({ title: '성공', description: '댓글이 수정되었습니다.' });
    } else {
      toast({ variant: 'destructive', title: '수정 실패', description: typeof result.error === 'string' ? result.error : '오류가 발생했습니다.' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete || !user) return;
    const result = await deleteComment(post.id, commentToDelete.id, user.uid);
    if (result.success) {
      setComments(prev => prev.filter(c => c.id !== commentToDelete.id));
      toast({ title: '삭제 완료', description: '댓글이 삭제되었습니다.' });
    } else {
      toast({ variant: 'destructive', title: '삭제 실패', description: result.error || '오류가 발생했습니다.' });
    }
    setCommentToDelete(null);
  };
  
  const startEditing = (comment: CommunityComment) => {
    setEditingCommentId(comment.id);
    editForm.setValue('content', comment.content);
  };

  const canViewSecretComment = (comment: CommunityComment) => {
    if (!comment.isSecret) return true;
    if (!user) return false;
    return user.uid === comment.authorId || user.uid === post.authorId;
  };

  return (
    <Card className="shadow-sm border-primary/20 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <Link href={`/community/post/${post.id}`} className="hover:underline">
                <h3 className="font-semibold text-lg text-primary line-clamp-1 mb-1">{post.title}</h3>
              </Link>
              <div className="flex items-center gap-4 text-sm text-primary/80">
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
                    <AvatarFallback className="text-xs font-medium">{post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <span>{post.authorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.viewCount}</span>
                </div>
                <TimeAgo date={post.createdAt} />
              </div>
            </div>
          </div>

          <Collapsible open={commentsOpen} onOpenChange={setCommentsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-2 hover:bg-muted/50 text-foreground"
                onClick={handleCommentsToggle}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">댓글 {comments.length}개</span>
                </div>
                {commentsOpen ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {/* Comments List */}
              {loadingComments ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner />
                  <p className="ml-2 text-muted-foreground">댓글을 불러오는 중...</p>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">아직 댓글이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.authorPhotoURL} alt={comment.authorName} />
                        <AvatarFallback className="text-xs font-medium">{comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-foreground">{comment.authorName}</p>
                            {comment.isSecret && <Lock className="h-3 w-3 text-primary" />}
                            <p className="text-xs text-foreground/60">
                              <TimeAgo date={comment.createdAt} />
                              {comment.updatedAt > comment.createdAt && ' (수정됨)'}
                            </p>
                          </div>
                          {user?.uid === comment.authorId && (
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => editingCommentId === comment.id ? setEditingCommentId(null) : startEditing(comment)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setCommentToDelete(comment)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {editingCommentId === comment.id ? (
                          <Form {...editForm}>
                            <form onSubmit={editForm.handleSubmit((data) => onUpdateComment(data, comment.id))} className="mt-2 space-y-2">
                              <FormField
                                control={editForm.control}
                                name="content"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Textarea {...field} className="min-h-[60px]"/>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>취소</Button>
                                <Button type="submit" size="sm" disabled={editForm.formState.isSubmitting}>
                                  {editForm.formState.isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin"/>}
                                  수정
                                </Button>
                              </div>
                            </form>
                          </Form>
                        ) : (
                          <div className="mt-1">
                            {canViewSecretComment(comment) ? (
                              <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                            ) : (
                              <p className="text-sm text-foreground/70 italic">🔒 비밀 댓글입니다.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Form */}
              <div className="mt-4 border-t pt-4">
                {user ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onAddComment)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea placeholder="댓글을 입력하세요..." {...field} className="min-h-[80px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name="isSecret"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="flex items-center gap-1">
                                <Lock className="h-3 w-3 text-primary" />
                                <span className="text-sm text-foreground">비밀 댓글</span>
                              </div>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          {form.formState.isSubmitting ? '등록 중...' : '댓글 등록'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="text-center text-foreground/70 p-4 border rounded-md">
                    <p>댓글을 작성하려면 <Link href={`/sign-in?redirect=/community/free-discussion`} className="text-primary hover:underline font-semibold">로그인</Link>이 필요합니다.</p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      {commentToDelete && (
        <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 text-destructive" /> 댓글 삭제 확인
              </AlertDialogTitle>
              <AlertDialogDescription>
                정말로 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}