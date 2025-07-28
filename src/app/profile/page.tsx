
'use client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { User, Edit3, ShieldCheck, Calendar, Sparkles, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/actions/userActions';
import { Badge } from '@/components/ui/badge';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { ReadingHistoryDashboard } from '@/components/reading/ReadingHistoryDashboard';


export default function ProfilePage() {
  const { user, firebaseUser, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sajuInfo, setSajuInfo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [creationDate, setCreationDate] = useState('정보 없음');

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push('/sign-in?redirect=/profile');
    }
  }, [firebaseUser, authLoading, router]);
  
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBirthDate(user.birthDate || '');
      setSajuInfo(user.sajuInfo || '');
    }

    if (firebaseUser?.metadata.creationTime) {
        setCreationDate(new Date(firebaseUser.metadata.creationTime).toLocaleDateString('ko-KR'));
    } else {
        setCreationDate('정보 없음');
    }
  }, [user, firebaseUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    const result = await updateUserProfile(user.uid, { displayName, birthDate, sajuInfo });
    
    if (result.success) {
      toast({ title: '성공', description: result.message });
      setIsEditing(false);
      refreshUser(); // Refresh user data in context
    } else {
      toast({ variant: 'destructive', title: '오류', description: result.message });
    }
    setIsUpdating(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setDisplayName(user.displayName || '');
      setBirthDate(user.birthDate || '');
      setSajuInfo(user.sajuInfo || '');
    }
  };



  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Spinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-10">
      <header className="text-center">
        <User className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">내 프로필</h1>
      </header>

      {/* 계정 정보 카드 */}
      <Card className="shadow-xl border-primary/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-2xl text-primary">계정 정보</CardTitle>
            {!isEditing && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} aria-label="프로필 수정">
                <Edit3 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {(displayName || user.email?.charAt(0) || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                {isEditing ? (
                  <div className="space-y-2">
                     <Label htmlFor="displayNameInput">닉네임</Label>
                     <Input 
                       id="displayNameInput" 
                       value={displayName} 
                       onChange={(e) => setDisplayName(e.target.value)}
                       placeholder="닉네임"
                     />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-semibold text-foreground">{displayName || '닉네임 없음'}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                     <div className="flex items-center gap-2 mt-2">
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                            {user.role === 'admin' ? '관리자' : '사용자'}
                        </Badge>
                        <Badge variant={user.subscriptionStatus === 'paid' ? 'default' : 'outline'}>
                            {user.subscriptionStatus === 'paid' ? <><Star className="mr-1.5 h-3.5 w-3.5"/>유료 구독자</> : '무료 회원'}
                        </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="birthDateInput" className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                    <Calendar className="mr-2 h-4 w-4"/> 생년월일
                  </Label>
                  {isEditing ? (
                     <Input 
                       id="birthDateInput" 
                       value={birthDate} 
                       onChange={(e) => setBirthDate(e.target.value)}
                       placeholder="예: 1990-01-01"
                     />
                  ) : (
                    <p className="text-foreground h-10 flex items-center">{birthDate || '정보 없음'}</p>
                  )}
                </div>
                <div>
                   <Label className="text-sm font-medium text-muted-foreground">계정 생성일</Label>
                   <p className="text-foreground h-10 flex items-center">{creationDate}</p>
                </div>
            </div>

            <div>
              <Label htmlFor="sajuInfoInput" className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                <Sparkles className="mr-2 h-4 w-4"/> 사주 정보
              </Label>
              {isEditing ? (
                 <Textarea 
                   id="sajuInfoInput"
                   value={sajuInfo}
                   onChange={(e) => setSajuInfo(e.target.value)}
                   placeholder="꿈 해석의 정확도를 높이기 위해 사주 정보를 입력할 수 있습니다. (예: 양력 1990년 1월 1일 오전 10시, 서울 출생)"
                   className="min-h-[80px]"
                 />
              ) : (
                <p className="text-foreground min-h-[80px] text-sm bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{sajuInfo || '정보 없음'}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                  취소
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Spinner size="small" className="mr-2" />}
                  {isUpdating ? '저장 중...' : '프로필 저장'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* 비밀번호 변경 카드 */}
      <PasswordChangeForm />
      
      {/* 관리자 섹션 */}
      {user.role === 'admin' && (
        <Card className="shadow-xl border-primary/10">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <ShieldCheck className="mr-2 h-6 w-6 text-destructive"/>관리자
            </CardTitle>
            <CardDescription>관리자 전용 기능에 접근할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full justify-start"
                onClick={() => router.push('/admin')}
              >
                <ShieldCheck className="mr-2 h-5 w-5" />
                관리자 대시보드
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full justify-start"
                onClick={() => router.push('/admin?tab=user-management')}
              >
                <User className="mr-2 h-5 w-5" />
                사용자 관리
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 나의 타로 리딩 히스토리 대시보드 */}
      <ReadingHistoryDashboard userId={user.uid} />


    </div>
  );
}
