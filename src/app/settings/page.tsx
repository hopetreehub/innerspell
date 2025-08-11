
'use client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Cog, Palette, Bell, AlertTriangle, BookHeart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from 'next-themes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in?redirect=/settings');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || !mounted) {
     return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <Cog className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">설정</h1>
        <p className="mt-2 text-lg text-foreground/80">
          InnerSpell 환경을 맞춤 설정하세요.
        </p>
      </header>

      <Card className="shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <Palette className="mr-2 h-6 w-6 text-accent" /> 화면 테마
          </CardTitle>
          <CardDescription>테마 및 화면 표시 설정을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode-toggle" className="text-md">다크 모드</Label>
            <Switch
              id="dark-mode-toggle"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              aria-label="다크 모드 토글"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <BookHeart className="mr-2 h-6 w-6 text-accent" /> 타로리딩 기록
          </CardTitle>
          <CardDescription>저장된 타로리딩 기록을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              프로필 페이지에서 저장된 타로리딩 기록을 확인하고 관리할 수 있습니다.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/profile#tarot-readings')}
            >
              <BookHeart className="mr-2 h-4 w-4" />
              타로리딩 기록 보기
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center"><Bell className="mr-2 h-6 w-6 text-accent"/>알림</CardTitle>
          <CardDescription>알림 수신 방법 설정 (현재 비활성화됨)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            알림 설정 기능은 현재 준비 중입니다.
          </p>
           <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="text-md text-muted-foreground/70">이메일 알림 (준비 중)</Label>
            <Switch id="email-notifications" disabled />
          </div>
        </CardContent>
      </Card>

      <Separator />
      <div className="text-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="opacity-70 hover:opacity-100">
              <AlertTriangle className="mr-2 h-4 w-4" />
              계정 삭제 (준비 중)
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                 <AlertTriangle className="mr-2 h-5 w-5 text-destructive" /> 계정 삭제 안내
              </AlertDialogTitle>
              <AlertDialogDescription>
                계정 삭제 기능은 현재 준비 중입니다. 이 기능이 활성화되면 계정을 영구적으로 삭제할 수 있게 됩니다.
                <br /><br />
                계정 삭제는 되돌릴 수 없는 작업이며, 모든 개인 정보와 활동 기록이 제거됩니다. 신중하게 결정해주세요.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>닫기</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
