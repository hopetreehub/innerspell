'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserNav } from './UserNav';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const baseNavItems = [
  { href: '/', label: '홈' },
  { href: '/reading', label: '타로리딩' },
  { href: '/tarot', label: '타로카드' },
  { href: '/dream-interpretation', label: '꿈해몽' },
  { href: '/blog', label: '블로그' },
  { href: '/community', label: '커뮤니티' },
];

const userNavItems = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/profile', label: '프로필' },
];

const adminNavItems = [
  { href: '/admin', label: '관리자 설정', icon: Shield },
];

export function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🔍 사용자 권한 상태 실시간 디버깅
  React.useEffect(() => {
    console.log('🔍 Navbar: User state changed:', {
      email: user?.email || 'null',
      role: user?.role || 'null',
      hasUser: !!user,
      isAdmin: user?.role === 'admin'
    });
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8 relative">
        {/* 로고 섹션 - 데스크톱에서 전체의 1/4 위치 (25%) */}
        <div className="flex-1 lg:flex-none lg:absolute lg:left-1/4 lg:transform lg:-translate-x-1/2">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="InnerSpell 로고" width={32} height={32} className="h-8 w-8" />
            <span className="font-headline text-2xl font-bold text-primary">InnerSpell</span>
          </Link>
        </div>
        
        {/* 스페이서 - 데스크톱에서만 */}
        <div className="hidden lg:block flex-1"></div>
        
        {/* 메인 네비게이션 + 사용자 메뉴 - 오른쪽 끝으로 */}
        <div className="flex items-center space-x-3 lg:space-x-6 ml-auto">
          {/* 데스크톱 네비게이션 */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
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
            {/* 관리자 메뉴 추가 */}
            {user?.role === 'admin' && (
              <>
                {console.log('🔍 Navbar: Rendering admin menu for user:', user.email, 'role:', user.role)}
                {adminNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-primary text-foreground/80 hover:scale-105 transform duration-200 relative after:absolute after:w-0 after:h-0.5 after:bottom-[-4px] after:left-1/2 after:bg-primary after:transition-all after:duration-300 hover:after:w-full hover:after:left-0 flex items-center gap-1"
              >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
                ))}
              </>
            )}
          </nav>
          
          {/* 사용자 메뉴 - 데스크톱 */}
          <div className="hidden lg:flex items-center space-x-3">
            <UserNav />
            <ThemeToggle />
          </div>

          {/* 모바일 메뉴 */}
          <div className="lg:hidden flex items-center space-x-2">
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
                  {/* 관리자 메뉴 추가 - 모바일 */}
                  {user?.role === 'admin' && (
                    <>
                      {console.log('🔍 Navbar Mobile: Rendering admin menu for user:', user.email, 'role:', user.role)}
                      <div className="h-px bg-border/40 my-2" />
                      {adminNavItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 border border-transparent hover:border-border/40 gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.icon && <item.icon className="h-5 w-5" />}
                          {item.label}
                        </Link>
                      ))}
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}