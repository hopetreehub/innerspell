'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Users, Activity, BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface StatsData {
  summary: {
    totalUsers: number;
    totalUsage: number;
    activeToday: number;
    activeThisWeek: number;
    topUsers: Array<{ email: string; totalUsage: number }>;
  };
  charts: {
    dailyUsage: Array<{ date: string; usage: number }>;
    weeklyUsage: Array<{ week: string; usage: number }>;
    monthlyUsage: Array<{ month: string; usage: number }>;
    usageByType: { tarot: number; dream: number };
    userGrowth: Array<{ date: string; users: number }>;
  };
  users: Array<{
    userId: string;
    email: string;
    tarotReadings: number;
    dreamInterpretations: number;
    totalUsage: number;
    lastActivity: string;
  }>;
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function UsageStatsCharts() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { user, firebaseUser } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : null;
      const response = await fetch('/api/admin/stats', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      if (!response.ok) {
        throw new Error('통계 데이터를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setStats(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center text-red-500 p-4">
        {error || '데이터를 불러올 수 없습니다.'}
      </div>
    );
  }

  const pieData = [
    { name: '타로 리딩', value: stats.charts.usageByType.tarot },
    { name: '꿈해몽', value: stats.charts.usageByType.dream }
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 및 새로고침 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">사용 통계 대시보드</h3>
          <p className="text-sm text-muted-foreground">
            마지막 업데이트: {lastUpdate ? lastUpdate.toLocaleTimeString('ko-KR') : '알 수 없음'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              오늘 활성: {stats.summary.activeToday}명
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용 횟수</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              타로 {stats.charts.usageByType.tarot} / 꿈 {stats.charts.usageByType.dream}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주간 활성 사용자</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.activeThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              전체 대비 {Math.round((stats.summary.activeThisWeek / stats.summary.totalUsers) * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">인당 평균 사용</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.summary.totalUsage / stats.summary.totalUsers).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              회/사용자
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 탭 */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">일별 사용량</TabsTrigger>
          <TabsTrigger value="weekly">주간 추이</TabsTrigger>
          <TabsTrigger value="monthly">월간 추이</TabsTrigger>
          <TabsTrigger value="growth">사용자 성장</TabsTrigger>
          <TabsTrigger value="distribution">사용 분포</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>일별 사용량 (최근 30일)</CardTitle>
              <CardDescription>
                타로 리딩과 꿈해몽 서비스의 일별 사용 횟수
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stats.charts.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('ko-KR')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="#8B5CF6" 
                    name="사용 횟수"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>주간 사용량 추이</CardTitle>
              <CardDescription>
                최근 12주간의 사용량 변화
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.charts.weeklyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#3B82F6" name="주간 사용량" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>월간 사용량 추이</CardTitle>
              <CardDescription>
                최근 12개월간의 사용량 변화
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.charts.monthlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="월간 사용량"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 성장 추이</CardTitle>
              <CardDescription>
                누적 사용자 수 증가 추이
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.charts.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('ko-KR')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.6}
                    name="누적 사용자"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>서비스별 사용 비율</CardTitle>
                <CardDescription>
                  타로 리딩 vs 꿈해몽 사용 비율
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>상위 사용자</CardTitle>
                <CardDescription>
                  가장 활발한 사용자 TOP 5
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.summary.topUsers.slice(0, 5).map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <span className="text-sm font-medium">{user.totalUsage}회</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 사용자 상세 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자별 상세 통계</CardTitle>
          <CardDescription>
            상위 20명 사용자의 상세 사용 내역
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">이메일</th>
                  <th className="text-right p-2">타로 리딩</th>
                  <th className="text-right p-2">꿈해몽</th>
                  <th className="text-right p-2">총 사용</th>
                  <th className="text-right p-2">마지막 활동</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map((user) => (
                  <tr key={user.userId} className="border-b">
                    <td className="p-2">{user.email}</td>
                    <td className="text-right p-2">{user.tarotReadings}</td>
                    <td className="text-right p-2">{user.dreamInterpretations}</td>
                    <td className="text-right p-2 font-medium">{user.totalUsage}</td>
                    <td className="text-right p-2 text-muted-foreground">
                      {new Date(user.lastActivity).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}