'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  ShieldQuestion, 
  AlertCircle, 
  Loader2, 
  Search, 
  Filter, 
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download
} from "lucide-react";
import { listFirebaseUsers, changeUserRole, type AppUser } from '@/actions/userActions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface UserFilters {
  search: string;
  role: 'all' | 'admin' | 'user';
  sortBy: 'creationTime' | 'lastSignInTime' | 'email' | 'displayName';
  sortOrder: 'asc' | 'desc';
}

export function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // 필터링 및 검색 상태
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    sortBy: 'creationTime',
    sortOrder: 'desc'
  });

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // 모달 상태
  const [userToEditRole, setUserToEditRole] = useState<AppUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [userDetailDialog, setUserDetailDialog] = useState<AppUser | null>(null);

  // 사용자 목록 가져오기
  async function fetchUsers() {
    setLoading(true);
    setError(null);
    const result = await listFirebaseUsers(100);
    if (result.error) {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: '사용자 로딩 오류',
        description: result.error,
      });
    } else {
      setUsers(result.users);
    }
    setLoading(false);
  }

  // 새로고침
  async function refreshUsers() {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    toast({
      title: '새로고침 완료',
      description: '사용자 목록이 업데이트되었습니다.',
    });
  }

  // 초기 로딩
  useEffect(() => {
    fetchUsers();
  }, []);

  // 필터링된 사용자 목록
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // 검색 필터
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.uid.toLowerCase().includes(searchLower)
      );
    }

    // 역할 필터
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => {
        if (filters.role === 'admin') {
          return user.role === 'admin';
        } else {
          return user.role !== 'admin';
        }
      });
    }

    // 정렬
    filtered = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'displayName':
          aValue = a.displayName || '';
          bValue = b.displayName || '';
          break;
        case 'creationTime':
          aValue = new Date(a.creationTime || 0);
          bValue = new Date(b.creationTime || 0);
          break;
        case 'lastSignInTime':
          aValue = new Date(a.lastSignInTime || 0);
          bValue = new Date(b.lastSignInTime || 0);
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, filters]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 역할 변경 다이얼로그 열기
  const handleOpenRoleDialog = (user: AppUser) => {
    setUserToEditRole(user);
    setSelectedNewRole(user.role || 'user');
  };

  // 역할 변경 확인
  const handleConfirmRoleChange = async () => {
    if (!userToEditRole || !selectedNewRole) return;

    setIsUpdatingRole(true);
    const result = await changeUserRole(userToEditRole.uid, selectedNewRole);
    setIsUpdatingRole(false);

    toast({
      title: result.success ? '역할 변경 요청 성공' : '역할 변경 요청 실패',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
      duration: 5000,
    });

    if (result.success) {
      setUsers(users.map(u => 
        u.uid === userToEditRole.uid ? {...u, role: selectedNewRole} : u
      ));
    }
    setUserToEditRole(null);
  };

  // 사용자 상세 정보 보기
  const handleViewUserDetail = (user: AppUser) => {
    setUserDetailDialog(user);
  };

  // CSV 내보내기
  const handleExportCSV = () => {
    const headers = ['이메일', '이름', '역할', '가입일', '마지막 로그인'];
    const csvData = filteredUsers.map(user => [
      user.email || '',
      user.displayName || '',
      user.role || 'user',
      user.creationTime ? new Date(user.creationTime).toLocaleDateString('ko-KR') : '',
      user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString('ko-KR') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'CSV 내보내기 완료',
      description: `${filteredUsers.length}명의 사용자 데이터를 내보냈습니다.`,
    });
  };

  // 통계 계산
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = totalUsers - adminUsers;
    const recentSignIns = users.filter(u => {
      if (!u.lastSignInTime) return false;
      const lastSignIn = new Date(u.lastSignInTime);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastSignIn > weekAgo;
    }).length;

    return { totalUsers, adminUsers, regularUsers, recentSignIns };
  }, [users]);

  if (loading) {
    return (
      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <Users className="mr-2 h-6 w-6" /> 사용자 관리
          </CardTitle>
          <CardDescription>사용자 정보를 불러오는 중입니다...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">잠시만 기다려주세요...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-destructive flex items-center">
            <AlertCircle className="mr-2 h-6 w-6" /> 오류 발생
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-destructive font-medium">{error}</p>
          <p className="text-sm text-muted-foreground">
            사용자 정보를 불러오는 데 실패했습니다. Firebase Admin SDK 설정 및 권한을 확인해주세요.
          </p>
          <Button onClick={fetchUsers} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">관리자</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.adminUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">일반 사용자</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.regularUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 활성 사용자</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.recentSignIns}</div>
            <p className="text-xs text-muted-foreground">지난 7일</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 사용자 관리 카드 */}
      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <Users className="mr-2 h-6 w-6" /> 사용자 관리
              </CardTitle>
              <CardDescription>
                Firebase Authentication의 사용자 목록을 관리합니다. ({filteredUsers.length}명 표시 중)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshUsers}
                disabled={refreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={filteredUsers.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                CSV 내보내기
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이메일, 이름, UID로 검색..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.role}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 역할</SelectItem>
                <SelectItem value="admin">관리자</SelectItem>
                <SelectItem value="user">일반 사용자</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-') as [any, any];
                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creationTime-desc">가입일 (최신순)</SelectItem>
                <SelectItem value="creationTime-asc">가입일 (오래된순)</SelectItem>
                <SelectItem value="lastSignInTime-desc">로그인 (최신순)</SelectItem>
                <SelectItem value="lastSignInTime-asc">로그인 (오래된순)</SelectItem>
                <SelectItem value="email-asc">이메일 (A-Z)</SelectItem>
                <SelectItem value="email-desc">이메일 (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 사용자 테이블 */}
          {currentUsers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>마지막 로그인</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                            {user.email || '이메일 없음'}
                          </div>
                          {user.displayName && (
                            <div className="text-sm text-muted-foreground">
                              {user.displayName}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            UID: {user.uid.substring(0, 12)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? (
                            <>
                              <Crown className="mr-1 h-3 w-3" />
                              관리자
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-1 h-3 w-3" />
                              사용자
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                          {user.creationTime ? 
                            new Date(user.creationTime).toLocaleDateString('ko-KR') : 
                            'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastSignInTime ? 
                            new Date(user.lastSignInTime).toLocaleDateString('ko-KR') : 
                            '로그인 기록 없음'
                          }
                        </div>
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
                            <DropdownMenuItem onClick={() => handleViewUserDetail(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              상세 정보
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenRoleDialog(user)}>
                              <ShieldQuestion className="mr-2 h-4 w-4" />
                              역할 변경
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {filters.search || filters.role !== 'all' 
                  ? '검색 조건에 맞는 사용자가 없습니다' 
                  : '등록된 사용자가 없습니다'
                }
              </h3>
              {(filters.search || filters.role !== 'all') && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilters({ search: '', role: 'all', sortBy: 'creationTime', sortOrder: 'desc' })}
                >
                  필터 초기화
                </Button>
              )}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                총 {filteredUsers.length}명 중 {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}명 표시
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          <div className="bg-muted/30 rounded-lg p-4 mt-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <strong>개발 모드:</strong> 실제 환경에서는 Firebase Functions를 통해 Custom Claims를 설정하여 
                역할을 안전하게 관리해야 합니다. 현재는 시뮬레이션 모드로 작동합니다.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 역할 변경 다이얼로그 */}
      <AlertDialog open={!!userToEditRole} onOpenChange={(open) => !open && setUserToEditRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <ShieldQuestion className="mr-2 h-5 w-5" />
              역할 변경: {userToEditRole?.displayName || userToEditRole?.email}
            </AlertDialogTitle>
            <AlertDialogDescription>
              사용자 {`'${userToEditRole?.email}'`}의 역할을 변경합니다. 
              이 작업은 현재 시뮬레이션이며, 실제 적용을 위해서는 백엔드 설정이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-select">새 역할 선택</Label>
              <Select value={selectedNewRole} onValueChange={setSelectedNewRole}>
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="역할을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center">
                      <UserCheck className="mr-2 h-4 w-4" />
                      일반 사용자
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Crown className="mr-2 h-4 w-4" />
                      관리자
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedNewRole === 'admin' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm text-amber-800">
                    관리자 권한을 부여하면 모든 관리 기능에 접근할 수 있습니다.
                  </span>
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToEditRole(null)}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRoleChange} 
              disabled={isUpdatingRole || !selectedNewRole}
            >
              {isUpdatingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdatingRole ? '변경 중...' : '변경 확인'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 사용자 상세 정보 다이얼로그 */}
      <Dialog open={!!userDetailDialog} onOpenChange={(open) => !open && setUserDetailDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              사용자 상세 정보
            </DialogTitle>
            <DialogDescription>
              선택한 사용자의 세부 정보를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {userDetailDialog && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">이메일</Label>
                    <p className="text-sm">{userDetailDialog.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">표시 이름</Label>
                    <p className="text-sm">{userDetailDialog.displayName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">역할</Label>
                    <Badge variant={userDetailDialog.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                      {userDetailDialog.role === 'admin' ? '관리자' : '일반 사용자'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">사용자 ID</Label>
                    <p className="text-xs font-mono bg-muted/50 p-2 rounded">
                      {userDetailDialog.uid}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">가입일</Label>
                    <p className="text-sm">
                      {userDetailDialog.creationTime ? 
                        new Date(userDetailDialog.creationTime).toLocaleString('ko-KR') : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">마지막 로그인</Label>
                    <p className="text-sm">
                      {userDetailDialog.lastSignInTime ? 
                        new Date(userDetailDialog.lastSignInTime).toLocaleString('ko-KR') : 
                        '로그인 기록 없음'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">추가 정보</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">생년월일</Label>
                    <p className="text-sm">{userDetailDialog.birthDate || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">구독 상태</Label>
                    <p className="text-sm">{userDetailDialog.subscriptionStatus || 'free'}</p>
                  </div>
                </div>
                {userDetailDialog.sajuInfo && (
                  <div>
                    <Label className="text-xs text-muted-foreground">사주 정보</Label>
                    <p className="text-sm bg-muted/50 p-3 rounded mt-1">
                      {userDetailDialog.sajuInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}