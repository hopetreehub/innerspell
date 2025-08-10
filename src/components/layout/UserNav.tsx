'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, LogIn, UserPlus, Shield, BookOpen } from 'lucide-react';
import { logoutFromKakao } from '@/lib/firebase/auth-providers';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export function UserNav() {
  const { user, loading, logout, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      // 1. First sign out from Firebase to prevent re-authentication
      if (auth && auth.currentUser) {
        await signOut(auth);
        console.log('Firebase signOut completed');
      }
      
      // 2. Clear all localStorage items
      localStorage.clear();
      
      // 3. Clear all sessionStorage items
      sessionStorage.clear();
      
      // 4. Clear Firebase-specific IndexedDB databases
      if ('indexedDB' in window) {
        const firebaseDBNames = [
          'firebaseLocalStorageDb',
          'firestore/[DEFAULT]/innerspell-an7ce/main',
          'firebase-heartbeat-database',
          'firebase-installations-database'
        ];
        
        for (const dbName of firebaseDBNames) {
          try {
            await indexedDB.deleteDatabase(dbName);
          } catch (e) {
            // Ignore errors
          }
        }
      }
      
      // 5. Sign out from Kakao if logged in via Kakao
      try {
        await logoutFromKakao();
      } catch (error) {
        console.log('Kakao logout error (may not be logged in via Kakao):', error);
      }
      
      // 6. Clear any service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // 7. Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // 8. Use the logout function from AuthContext
      logout();
      
      toast({ title: '로그아웃 성공', description: '성공적으로 로그아웃되었습니다.' });
      
      // 9. Force complete page reload to clear any in-memory state
      // Use replace to prevent back button issues
      window.location.replace('/?logout=true&t=' + Date.now());
    } catch (error) {
      console.error('Error signing out:', error);
      toast({ variant: 'destructive', title: '로그아웃 오류', description: '로그아웃 중 문제가 발생했습니다.' });
      
      // Even on error, try to force reload
      window.location.replace('/?logout=true&t=' + Date.now());
    }
  };

  // 🔍 디버깅 로그 추가
  console.log('🔍 UserNav state:', { mounted, loading, user: user ? `${user.email} (${user.role})` : null });

  if (!mounted || loading) {
    console.log('🔍 UserNav: Showing skeleton (mounted:', mounted, 'loading:', loading, ')');
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    console.log('🔍 UserNav: No user, showing login buttons');
    return (
      <div className="flex items-center space-x-2">
        {/* Always show regular login/signup buttons */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sign-in">
            <LogIn className="mr-2 h-4 w-4" />
            로그인
          </Link>
        </Button>
        <Button variant="default" size="sm" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/sign-up">
             <UserPlus className="mr-2 h-4 w-4" />
            회원가입
          </Link>
        </Button>
      </div>
    );
  }

  console.log('🔍 UserNav: User found, showing profile dropdown for:', user.email);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="user-profile">
          <Avatar className="h-10 w-10 border border-primary/50">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>프로필</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/tarot/history')}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>리딩 기록</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>설정</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
