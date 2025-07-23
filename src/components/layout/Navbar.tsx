
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserNav } from './UserNav';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const baseNavItems = [
  { href: '/', label: '홈' },
  { href: '/reading', label: '타로리딩' },
  { href: '/tarot', label: '타로카드' },
  { href: '/dream-interpretation', label: '꿈해몽' },
  { href: '/blog', label: '블로그' },
  { href: '/community', label: '커뮤니티' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        {/* 로고 섹션 - 왼쪽 */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="InnerSpell 로고" width={32} height={32} className="h-8 w-8" />
            <span className="font-headline text-2xl font-bold text-primary">InnerSpell</span>
          </Link>
        </div>
        
        {/* 중앙 네비게이션 - 데스크톱 */}
        <div className="hidden md:flex flex-1 justify-center">
          <nav className="flex items-center space-x-8 text-sm font-medium">
            {baseNavItems.map((item) => {
              const isExternal = item.href.startsWith('http');
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-primary text-foreground/80 hover:scale-105 transform duration-200 relative after:absolute after:w-0 after:h-0.5 after:bottom-[-4px] after:left-1/2 after:bg-primary after:transition-all after:duration-300 hover:after:w-full hover:after:left-0"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 우측 사용자 메뉴 */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-3">
            <UserNav />
            <ThemeToggle />
          </div>

          {/* 모바일 메뉴 */}
          <div className="md:hidden flex items-center space-x-2">
            <UserNav />
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] bg-background p-0">
                <SheetHeader className="p-6 border-b border-border/40">
                  <SheetTitle className="flex items-center space-x-3">
                    <Image src="/logo.png" alt="InnerSpell 로고" width={28} height={28} />
                    <span className="font-headline text-xl font-bold text-primary">InnerSpell</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-6 space-y-3">
                  {baseNavItems.map((item) => {
                     const isExternal = item.href.startsWith('http');
                     return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 border border-transparent hover:border-border/40"
                          onClick={() => setMobileMenuOpen(false)}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                        >
                          {item.label}
                        </Link>
                     );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
