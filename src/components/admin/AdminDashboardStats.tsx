'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  Zap, 
  Brain, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { getAllAIProviderConfigs, getAIFeatureMappings } from '@/actions/aiProviderActions';
import { getAllTarotGuidelines } from '@/actions/tarotGuidelineActions';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/client';

interface DashboardStats {
  totalUsers: number;
  activeAIProviders: number;
  totalModels: number;
  tarotGuidelines: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

export function AdminDashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeAIProviders: 0,
    totalModels: 0,
    tarotGuidelines: 0,
    systemHealth: 'healthy',
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // AI 공급자 정보 로드
      const providersResult = await getAllAIProviderConfigs();
      const mappingsResult = await getAIFeatureMappings();
      const guidelinesResult = await getAllTarotGuidelines();
      
      let activeProviders = 0;
      let totalModels = 0;
      
      if (providersResult.success && providersResult.data) {
        activeProviders = providersResult.data.filter(p => p.isActive).length;
        totalModels = providersResult.data.reduce((total, provider) => 
          total + (provider.models?.length || 0), 0
        );
      }
      
      let guidelinesCount = 0;
      if (guidelinesResult.success && guidelinesResult.data) {
        guidelinesCount = guidelinesResult.data.guidelines.length;
      }
      
      // 시스템 헬스 체크
      const systemHealth = activeProviders > 0 ? 'healthy' : 'warning';
      
      // Fetch real user count from stats API
      let totalUsers = 0;
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdToken();
          const statsResponse = await fetch('/api/admin/stats', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            totalUsers = statsData.data?.summary?.totalUsers || 0;
          }
        }
      } catch (statsError) {
        console.error('Error fetching user stats:', statsError);
      }
      
      setStats({
        totalUsers,
        activeAIProviders: activeProviders,
        totalModels: totalModels,
        tarotGuidelines: guidelinesCount,
        systemHealth,
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return date.toLocaleDateString();
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              실시간 데이터
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 AI 공급자</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAIProviders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalModels}개 모델 사용 가능
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">타로 지침</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tarotGuidelines}</div>
            <p className="text-xs text-muted-foreground">
              전문가 수준 해석 가이드
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
            {getHealthIcon(stats.systemHealth)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(stats.systemHealth)}`}>
              {stats.systemHealth === 'healthy' ? '정상' : 
               stats.systemHealth === 'warning' ? '주의' : '위험'}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatLastUpdated(stats.lastUpdated)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 상세 시스템 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            시스템 현황
          </CardTitle>
          <CardDescription>
            InnerSpell AI 타로 서비스의 실시간 상태 정보
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">AI 서비스</div>
              <div className="flex items-center gap-2">
                <Badge variant={stats.activeAIProviders > 0 ? "default" : "secondary"}>
                  {stats.activeAIProviders > 0 ? "활성" : "비활성"}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">데이터베이스</div>
              <div className="flex items-center gap-2">
                <Badge variant="default">연결됨</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">인증 시스템</div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Firebase</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">배포 환경</div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Vercel</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}