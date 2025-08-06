'use client';

import { useState } from 'react';
import { Copy, Share2, MessageCircle, Instagram, Facebook, Twitter, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface ShareGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export function ShareGuideDialog({ isOpen, onClose, shareUrl }: ShareGuideDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: '복사 완료',
        description: '링크가 클립보드에 복사되었습니다.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '복사 실패',
        description: '링크 복사에 실패했습니다.',
      });
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'InnerSpell 타로 리딩 결과',
          text: '나의 타로 리딩 결과를 확인해보세요!',
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      toast({
        variant: 'destructive',
        title: '공유 불가',
        description: '이 브라우저는 공유 기능을 지원하지 않습니다.',
      });
    }
  };

  const snsGuides = [
    {
      name: '카카오톡',
      icon: MessageCircle,
      color: 'bg-yellow-400',
      guide: [
        '1. 카카오톡 대화방을 열어주세요',
        '2. 메시지 입력창을 길게 눌러 "붙여넣기"를 선택하세요',
        '3. 복사된 링크가 나타나면 전송 버튼을 누르세요',
      ],
      where: '💬 메시지 입력창에 붙여넣기',
      tip: '링크를 보내면 카드 이미지와 해석 내용이 미리보기로 표시됩니다'
    },
    {
      name: '인스타그램',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      guide: [
        '1. 인스타그램 프로필 → "프로필 편집" 클릭',
        '2. "링크 추가" 또는 "웹사이트" 항목 찾기',
        '3. 복사된 링크를 붙여넣고 "완료" 클릭',
      ],
      where: '🔗 프로필 링크 섹션에 붙여넣기',
      tip: '스토리에서는 "링크" 스티커를 사용하세요 (팔로워 1만 이상)'
    },
    {
      name: '페이스북',
      icon: Facebook,
      color: 'bg-blue-600',
      guide: [
        '1. 페이스북에서 "무슨 생각을 하고 계신가요?" 클릭',
        '2. 게시물 작성창에 붙여넣기(Ctrl+V 또는 Cmd+V)',
        '3. 링크 미리보기가 나타나면 게시하기',
      ],
      where: '📝 게시물 작성창에 붙여넣기',
      tip: '링크가 자동으로 카드 형태로 변환되어 보기 좋게 표시됩니다'
    },
    {
      name: '트위터',
      icon: Twitter,
      color: 'bg-black',
      guide: [
        '1. 트위터에서 트윗 작성 버튼 클릭',
        '2. 작성창에 붙여넣기(Ctrl+V 또는 Cmd+V)',
        '3. 원하는 메시지를 추가하고 트윗하기',
      ],
      where: '✍️ 트윗 작성창에 붙여넣기',
      tip: '해시태그 #타로 #InnerSpell을 추가하면 더 많은 사람들이 볼 수 있어요'
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>타로 리딩 공유하기</DialogTitle>
          <DialogDescription>
            리딩 결과가 공유 링크로 생성되었습니다. 30일간 유효합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL 복사 섹션 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">공유 링크</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* 빠른 공유 버튼 */}
          {navigator.share && (
            <Button
              onClick={handleWebShare}
              className="w-full"
              variant="default"
            >
              <Share2 className="h-4 w-4 mr-2" />
              다른 앱으로 공유하기
            </Button>
          )}

          {/* SNS별 공유 가이드 */}
          <Tabs defaultValue="kakao" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              {snsGuides.map((sns) => (
                <TabsTrigger key={sns.name} value={sns.name.toLowerCase()}>
                  <sns.icon className="h-4 w-4" />
                </TabsTrigger>
              ))}
            </TabsList>

            {snsGuides.map((sns) => (
              <TabsContent key={sns.name} value={sns.name.toLowerCase()}>
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${sns.color}`}>
                      <sns.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold">{sns.name}에 공유하기</h3>
                  </div>
                  
                  {/* 붙여넣기 위치 강조 */}
                  <div className="mb-3 p-2 bg-primary/10 rounded-md">
                    <p className="text-sm font-medium text-primary">{sns.where}</p>
                  </div>
                  
                  <ul className="space-y-2 mb-3">
                    {sns.guide.map((step, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {step}
                      </li>
                    ))}
                  </ul>
                  
                  {/* 추가 팁 */}
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">💡 Tip:</span> {sns.tip}
                    </p>
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* 안내 메시지 */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> 링크와 함께 나만의 해석이나 느낀 점을 
              함께 공유하면 더 의미있는 대화를 나눌 수 있어요!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}