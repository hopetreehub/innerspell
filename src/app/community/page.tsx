
import type { Metadata } from 'next';
import { BookOpenText, MessageSquare, Sparkles, GraduationCap, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '커뮤니티 - InnerSpell',
  description: 'InnerSpell 커뮤니티에서 타로와 영성에 대한 이야기를 나누고, 교육 상담을 받으며, 리딩 경험을 공유하세요.',
};

const communityLinks = [
  {
    href: '/community/free-discussion',
    icon: <MessageSquare className="h-12 w-12 text-primary" />,
    title: '자유 토론',
    description: '타로, 꿈, 명상 등 영적인 주제에 대해 자유롭게 이야기를 나누고 다른 사람들의 경험과 통찰을 공유하세요.',
    buttonText: '토론 참여하기'
  },
  {
    href: '/community/tarot-education',
    icon: <GraduationCap className="h-12 w-12 text-primary" />,
    title: '타로 교육 문의',
    description: '타로 학습에 대한 궁금증을 해결하고, 전문가의 조언을 받으며, 체계적인 타로 교육 정보를 얻으세요.',
    buttonText: '교육 상담 받기'
  },
  {
    href: '/community/reading-share',
    icon: <Share2 className="h-12 w-12 text-primary" />,
    title: '리딩 경험 공유',
    description: '나의 타로 리딩 경험을 공유하고, 다른 사람들의 해석을 들으며, 함께 통찰력을 키워가세요.',
    buttonText: '경험 공유하기'
  }
];

export default function CommunityHubPage() {
  return (
    <div className="space-y-8">
       <header className="text-center">
        <MessageSquare className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">커뮤니티</h1>
        <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
          InnerSpell 커뮤니티에 오신 것을 환영합니다. 자유롭게 의견을 나누고 타로의 지혜를 함께 탐험해 보세요.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-8">
        {communityLinks.map((link) => (
          <Card key={link.href} className="text-center shadow-2xl border-primary/20 transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
            <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4 border-2 border-primary/20">
                    {link.icon}
                </div>
                <CardTitle className="font-headline text-3xl text-primary">{link.title}</CardTitle>
                <CardDescription className="text-md text-foreground/80 pt-2 min-h-[60px]">
                    {link.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
                <Button asChild size="lg">
                    <Link href={link.href}>
                        <Sparkles className="mr-2 h-5 w-5"/>
                        {link.buttonText}
                    </Link>
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
