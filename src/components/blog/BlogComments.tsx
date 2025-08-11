'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Reply, Heart, Flag, User } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { BlogComment } from '@/types/blog';
import { 
  getCommentsByPostId, 
  createComment, 
  toggleCommentLike 
} from '@/services/blog-service';


interface BlogCommentsProps {
  postId: string;
}


export function BlogComments({ postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();

  // 댓글 불러오기
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await getCommentsByPostId(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: '댓글 로딩 실패',
        description: '댓글을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !authorName.trim()) {
      toast({
        title: '입력 오류',
        description: '이름과 댓글 내용을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createComment({
        postId,
        parentId: null,
        author: authorName.trim(),
        content: newComment.trim(),
        likes: 0,
        isApproved: true,
        replies: []
      });

      setNewComment('');
      setAuthorName('');
      
      toast({
        title: '댓글이 등록되었습니다',
        description: '소중한 의견 감사합니다!',
      });

      // 댓글 목록 새로고침
      await loadComments();
    } catch (error) {
      toast({
        title: '댓글 등록 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) {
      toast({
        title: '답글 내용을 입력해주세요',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createComment({
        postId,
        parentId: commentId,
        author: '익명',
        content: replyContent.trim(),
        likes: 0,
        isApproved: true,
        replies: []
      });

      setReplyContent('');
      setReplyingTo(null);
      
      toast({
        title: '답글이 등록되었습니다',
        description: '소중한 의견 감사합니다!',
      });

      // 댓글 목록 새로고침
      await loadComments();
    } catch (error) {
      toast({
        title: '답글 등록 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await toggleCommentLike(commentId, true);
      // 댓글 목록 새로고침
      await loadComments();
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: '좋아요 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="mt-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">댓글을 불러오고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-headline font-bold text-primary">
          댓글 {comments.length}개
        </h3>
      </div>

      {/* 댓글 작성 폼 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">댓글 남기기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="이름을 입력하세요"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full"
          />
          <Textarea
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? '등록 중...' : '댓글 등록'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 목록 */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <Card key={comment.id} className="overflow-hidden">
            <CardContent className="p-6">
              {/* 댓글 헤더 */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar>
                  <AvatarImage src="" alt={comment.author} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{comment.author}</span>
                    {comment.isApproved && (
                      <Badge variant="secondary" className="text-xs">
                        승인됨
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(comment.createdAt, 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                  </div>
                </div>
              </div>

              {/* 댓글 내용 */}
              <div className="mb-4">
                <p className="text-foreground leading-relaxed">{comment.content}</p>
              </div>

              {/* 댓글 액션 */}
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                >
                  <Heart className="h-4 w-4" />
                  {comment.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                >
                  <Reply className="h-4 w-4" />
                  답글
                </Button>
              </div>

              {/* 답글 작성 폼 */}
              {replyingTo === comment.id && (
                <div className="ml-12 mb-4 p-4 bg-muted/50 rounded-lg">
                  <Textarea
                    placeholder="답글을 입력하세요..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="mb-3 min-h-[80px] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReply(comment.id)}
                    >
                      답글 등록
                    </Button>
                  </div>
                </div>
              )}

              {/* 답글 목록 */}
              {comment.replies.length > 0 && (
                <div className="ml-12 space-y-4">
                  <Separator />
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" alt={reply.author} />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-foreground">{reply.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(reply.createdAt, 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed mb-2">
                          {reply.content}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(reply.id)}
                          className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                        >
                          <Heart className="h-3 w-3" />
                          {reply.likes}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 댓글이 없는 경우 */}
      {comments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              첫 번째 댓글을 남겨보세요
            </h3>
            <p className="text-muted-foreground">
              이 포스트에 대한 생각이나 질문을 공유해주세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}