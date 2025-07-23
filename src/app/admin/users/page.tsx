'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { listFirebaseUsers, changeUserRole } from '@/actions/userActions';
import type { AppUser } from '@/actions/userActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  MoreVertical,
  Shield,
  User,
  AlertCircle,
  ChevronLeft,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      if (!user) {
        router.push('/sign-in?redirect=/admin/users');
        return;
      }

      // Check if user is admin
      const adminEmails = ['ceo@innerspell.com', 'admin@innerspell.com', 'junsupark9999@gmail.com'];
      if (!user.email || !adminEmails.includes(user.email)) {
        router.push('/');
        return;
      }

      // Load users
      try {
        const result = await listFirebaseUsers(50);
        if (result.error) {
          toast({
            variant: 'destructive',
            title: '오류',
            description: result.error,
          });
        } else {
          setUsers(result.users);
          setNextPageToken(result.nextPageToken);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          variant: 'destructive',
          title: '오류',
          description: '사용자 목록을 불러오는 중 오류가 발생했습니다.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndLoadUsers();
  }, [user, router, toast]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const result = await changeUserRole(userId, newRole);
      if (result.success) {
        toast({
          title: '성공',
          description: result.message,
        });
        // Update local state
        setUsers(users.map(u => 
          u.uid === userId ? { ...u, role: newRole } : u
        ));
      } else {
        toast({
          variant: 'destructive',
          title: '오류',
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Error changing role:', error);
      toast({
        variant: 'destructive',
        title: '오류',
        description: '역할 변경 중 오류가 발생했습니다.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ChevronLeft className="mr-2 h-4 w-4" />
            관리자 대시보드로 돌아가기
          </Link>
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="mr-3 h-8 w-8" />
              사용자 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              등록된 사용자 목록과 권한을 관리합니다
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">관리자</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">일반 사용자</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role !== 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>
            사용자 정보를 확인하고 권한을 관리할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>마지막 로그인</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.uid}>
                    <TableCell className="font-medium">{u.email || '-'}</TableCell>
                    <TableCell>{u.displayName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {u.role === 'admin' ? (
                          <>
                            <Crown className="mr-1 h-3 w-3" />
                            관리자
                          </>
                        ) : '사용자'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.creationTime ? new Date(u.creationTime).toLocaleDateString('ko-KR') : '-'}
                    </TableCell>
                    <TableCell>
                      {u.lastSignInTime ? new Date(u.lastSignInTime).toLocaleDateString('ko-KR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">메뉴 열기</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(u.uid, u.role === 'admin' ? 'user' : 'admin')}
                          >
                            {u.role === 'admin' ? (
                              <>
                                <User className="mr-2 h-4 w-4" />
                                일반 사용자로 변경
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                관리자로 승격
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              등록된 사용자가 없습니다.
            </div>
          )}

          {nextPageToken && (
            <div className="mt-4 text-center">
              <Button variant="outline" disabled>
                더 보기 (준비 중)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>참고:</strong> 실제 환경에서는 Firebase Functions를 통해 Custom Claims를 설정하여 
          역할을 안전하게 관리해야 합니다. 현재는 시뮬레이션 모드로 작동합니다.
        </AlertDescription>
      </Alert>
    </div>
  );
}