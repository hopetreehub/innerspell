'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Bookmark,
  MoreHorizontal,
  User,
  Calendar,
  Hash,
  CreditCard,
  Edit,
  Trash2,
  Flag
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// 타입 정의
interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  likes: number;
  isLiked?: boolean;
}

interface ReadingExperience {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: string;
  };
  spreadType: string;
  cards: string[];
  tags: string[];
  likes: number;
  comments: Comment[];
  views: number;
  createdAt: Date;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

// 더미 데이터
const mockExperience: ReadingExperience = {
  id: '1',
  title: '첫 켈틱 크로스 리딩 경험 - 예상치 못한 통찰',
  content: `오늘 처음으로 켈틱 크로스 스프레드를 시도해봤습니다. 
  
사실 처음에는 10장이나 되는 카드를 어떻게 해석해야 할지 막막했어요. 하지만 하나씩 차근차근 카드를 뽑아가며 배치하니 점점 전체적인 그림이 보이기 시작했습니다.

현재 상황 자리에 The Tower가 나왔을 때는 정말 당황했습니다. 최근에 직장에서 큰 변화를 겪고 있었는데, 카드가 정확히 그 상황을 반영하고 있었거든요.

가장 인상적이었던 건 '무의식' 자리에 나온 The Hermit 카드였습니다. 혼자만의 시간이 필요하다는 걸 알고 있었지만 계속 미뤄왔는데, 카드가 그 필요성을 다시 한번 일깨워줬어요.

미래 카드로는 Three of Cups가 나왔는데, 현재의 어려움을 극복하고 나면 좋은 사람들과 함께 기쁨을 나눌 수 있을 거라는 희망적인 메시지를 받았습니다.

이번 리딩을 통해 제가 지금 겪고 있는 변화가 단순히 부정적인 것만은 아니라는 걸 깨달았어요. 오히려 성장의 기회가 될 수 있다는 관점을 갖게 되었습니다.

켈틱 크로스는 복잡해 보이지만, 각 위치의 의미를 이해하고 나니 정말 깊이 있는 통찰을 얻을 수 있는 훌륭한 스프레드라는 걸 알게 되었습니다. 앞으로도 중요한 결정을 앞두고 있을 때 자주 사용하게 될 것 같아요.`,
  author: {
    id: 'user1',
    name: '별빛타로',
    avatar: '/avatars/user1.jpg',
    level: '중급'
  },
  spreadType: '켈틱 크로스',
  cards: ['The Tower', 'Three of Cups', 'The Hermit', 'Six of Swords', 'Queen of Pentacles', 'Eight of Wands', 'The Star', 'Four of Cups', 'Knight of Swords', 'Ten of Pentacles'],
  tags: ['켈틱크로스', '첫경험', '통찰', '직장운', '성장'],
  likes: 42,
  comments: [
    {
      id: 'c1',
      author: {
        id: 'user2',
        name: '달빛마녀',
        avatar: '/avatars/user2.jpg'
      },
      content: '저도 첫 켈틱 크로스 리딩 때 비슷한 경험을 했어요! Tower 카드가 나왔을 때의 그 당황스러움... 공감이 되네요. 하지만 결국 변화는 성장의 기회가 되더라고요.',
      createdAt: new Date('2025-01-18T10:30:00'),
      likes: 5,
      isLiked: true
    },
    {
      id: 'c2',
      author: {
        id: 'user3',
        name: '영혼의향기'
      },
      content: 'Hermit 카드가 무의식 자리에 나온 것이 정말 의미심장하네요. 내면의 목소리에 귀 기울이라는 메시지 같아요. 좋은 리딩 공유 감사합니다!',
      createdAt: new Date('2025-01-18T11:15:00'),
      likes: 3,
      isLiked: false
    }
  ],
  views: 328,
  createdAt: new Date('2025-01-18'),
  isLiked: false,
  isBookmarked: true
};

// 관련 게시물 더미 데이터
const relatedPosts = [
  {
    id: '2',
    title: '켈틱 크로스 각 위치의 의미 정리',
    author: '타로마스터',
    views: 892,
    likes: 67
  },
  {
    id: '3',
    title: 'Tower 카드가 나왔을 때 대처법',
    author: '영혼의안내자',
    views: 456,
    likes: 34
  },
  {
    id: '4',
    title: '10장 스프레드 해석 팁',
    author: '신비의타로',
    views: 234,
    likes: 28
  }
];

export default function ReadingShareDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [experience, setExperience] = useState<ReadingExperience>(mockExperience);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 좋아요 토글
  const handleLike = () => {
    setExperience(prev => ({
      ...prev,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      isLiked: !prev.isLiked
    }));
  };

  // 북마크 토글
  const handleBookmark = () => {
    setExperience(prev => ({
      ...prev,
      isBookmarked: !prev.isBookmarked
    }));
    toast({
      title: experience.isBookmarked ? "북마크 해제됨" : "북마크 저장됨",
      description: experience.isBookmarked 
        ? "북마크가 해제되었습니다." 
        : "나중에 다시 볼 수 있도록 저장했습니다."
    });
  };

  // 공유하기
  const handleShare = () => {
    // 실제로는 Web Share API 사용
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "링크 복사됨",
      description: "게시물 링크가 클립보드에 복사되었습니다."
    });
  };

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const comment: Comment = {
        id: `c${Date.now()}`,
        author: {
          id: 'current-user',
          name: '현재 사용자',
          avatar: '/avatars/default.jpg'
        },
        content: newComment,
        createdAt: new Date(),
        likes: 0,
        isLiked: false
      };
      
      setExperience(prev => ({
        ...prev,
        comments: [...prev.comments, comment]
      }));
      
      setNewComment('');
      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다."
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "댓글 작성 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 댓글 좋아요
  const handleCommentLike = (commentId: string) => {
    setExperience(prev => ({
      ...prev,
      comments: prev.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1, isLiked: !comment.isLiked }
          : comment
      )
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 뒤로가기 버튼 */}
      <div>
        <Button variant="ghost" asChild>
          <Link href="/community/reading-share">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </Button>
      </div>

      {/* 메인 콘텐츠 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={experience.author.avatar} />
                <AvatarFallback>{experience.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-lg">{experience.author.name}</h4>
                  <Badge variant="secondary">{experience.author.level}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(experience.createdAt, 'yyyy년 M월 d일', { locale: ko })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    조회 {experience.views}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {experience.spreadType}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Flag className="mr-2 h-4 w-4" />
                    신고
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <CardTitle className="text-2xl sm:text-3xl">{experience.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 본문 */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{experience.content}</p>
          </div>

          {/* 사용 카드 */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              사용된 카드
            </h4>
            <div className="flex flex-wrap gap-2">
              {experience.cards.map((card, idx) => (
                <Badge key={idx} variant="secondary">
                  {card}
                </Badge>
              ))}
            </div>
          </div>

          {/* 태그 */}
          <div className="flex flex-wrap gap-2">
            {experience.tags.map(tag => (
              <Badge key={tag} variant="outline">
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* 액션 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={experience.isLiked ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 mr-1 ${experience.isLiked ? 'fill-current' : ''}`} />
                {experience.likes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                {experience.comments.length}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={experience.isBookmarked ? 'text-yellow-500' : ''}
              >
                <Bookmark className={`h-4 w-4 ${experience.isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">댓글 {experience.comments.length}개</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 댓글 작성 */}
          <div className="space-y-3">
            <Textarea
              placeholder="경험을 공유해주셔서 감사합니다. 당신의 생각을 남겨주세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? '작성 중...' : '댓글 작성'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {experience.comments.map(comment => (
              <div key={comment.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(comment.createdAt, 'M월 d일 HH:mm', { locale: ko })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current text-red-500' : ''}`} />
                      좋아요 {comment.likes > 0 && comment.likes}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 관련 게시물 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">관련 경험들</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatedPosts.map(post => (
              <Link
                key={post.id}
                href={`/community/reading-share/${post.id}`}
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <h4 className="font-medium mb-1">{post.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.author}</span>
                  <span>조회 {post.views}</span>
                  <span>좋아요 {post.likes}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}