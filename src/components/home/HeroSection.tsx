
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 bg-background overflow-hidden rounded-xl shadow-lg border border-primary/10">
      <div className="absolute inset-0 opacity-5">
        {/* Decorative background pattern or subtle image */}
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              당신의 운명을 발견하세요
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary mb-6">
              InnerSpell과 함께 당신의 길을 찾아보세요
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80 mb-8 max-w-xl mx-auto md:mx-0">
              AI 기반 타로 리딩으로 명확성과 통찰력을 얻으세요. 현대의 구도자를 위해 해석된 고대의 지혜를 탐험하세요. 자아 발견을 향한 여정이 여기서 시작됩니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transition-transform hover:scale-105">
                <Link href="/reading">
                  <span className="flex items-center">
                    타로 읽기 시작
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary/50 text-primary hover:bg-primary/5 shadow-md transition-transform hover:scale-105">
                <Link href="/encyclopedia">
                  카드 탐색하기
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="aspect-square max-w-md mx-auto md:max-w-none rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 group">
              <Image
                src="/images/tarothome.png?v=1" 
                alt="신비로운 타로 카드"
                width={600}
                height={600}
                priority // LCP candidate for homepage
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                data-ai-hint="mystical tarot"
                sizes="(max-width: 768px) 100vw, 50vw" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-8">
                <p className="text-primary-foreground text-center text-lg font-semibold">내면의 신비를 밝히세요</p>
              </div>
            </div>
             <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/20 rounded-full filter blur-2xl animate-pulse opacity-50"></div>
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent/20 rounded-full filter blur-2xl animate-pulse opacity-50 animation-delay-2000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
