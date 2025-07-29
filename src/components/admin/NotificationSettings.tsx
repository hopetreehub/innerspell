'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  Smartphone,
  AlertTriangle,
  Activity,
  Users,
  TrendingUp,
  Clock,
  Save,
  RotateCcw,
  Info,
  Zap,
  Shield,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NotificationConfig {
  // 이메일 알림
  email: {
    enabled: boolean;
    address: string;
    frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
    types: {
      criticalErrors: boolean;
      performanceAlerts: boolean;
      userMilestones: boolean;
      systemUpdates: boolean;
      dailyReports: boolean;
      weeklyReports: boolean;
    };
  };
  
  // 슬랙 알림
  slack: {
    enabled: boolean;
    webhookUrl: string;
    channel: string;
    types: {
      criticalErrors: boolean;
      performanceAlerts: boolean;
      userActivity: boolean;
      newSignups: boolean;
    };
  };
  
  // 푸시 알림
  push: {
    enabled: boolean;
    types: {
      criticalErrors: boolean;
      userMilestones: boolean;
      systemAlerts: boolean;
    };
  };
  
  // 임계값 설정
  thresholds: {
    errorRate: number; // 퍼센트
    responseTime: number; // ms
    cpuUsage: number; // 퍼센트
    memoryUsage: number; // 퍼센트
    activeUsers: number; // 명
    requestsPerMinute: number; // 요청 수
  };
  
  // 알림 스케줄
  schedule: {
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM
      end: string; // HH:MM
    };
    weekendNotifications: boolean;
  };
}

const defaultConfig: NotificationConfig = {
  email: {
    enabled: true,
    address: '',
    frequency: 'instant',
    types: {
      criticalErrors: true,
      performanceAlerts: true,
      userMilestones: false,
      systemUpdates: true,
      dailyReports: false,
      weeklyReports: true,
    },
  },
  slack: {
    enabled: false,
    webhookUrl: '',
    channel: '#alerts',
    types: {
      criticalErrors: true,
      performanceAlerts: true,
      userActivity: false,
      newSignups: true,
    },
  },
  push: {
    enabled: false,
    types: {
      criticalErrors: true,
      userMilestones: false,
      systemAlerts: true,
    },
  },
  thresholds: {
    errorRate: 5,
    responseTime: 1000,
    cpuUsage: 80,
    memoryUsage: 85,
    activeUsers: 100,
    requestsPerMinute: 1000,
  },
  schedule: {
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    weekendNotifications: true,
  },
};

export function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, []);

  // 변경사항 감지
  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(defaultConfig));
  }, [config]);

  const loadSettings = async () => {
    try {
      // 실제 구현에서는 API 호출
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setConfig(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // 실제 구현에서는 API 호출
      localStorage.setItem('notificationSettings', JSON.stringify(config));
      
      toast({
        title: '알림 설정 저장됨',
        description: '알림 설정이 성공적으로 저장되었습니다.',
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '저장 실패',
        description: '알림 설정을 저장하는데 실패했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    setConfig(defaultConfig);
    toast({
      title: '설정 초기화',
      description: '알림 설정이 기본값으로 초기화되었습니다.',
    });
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">알림 설정</h2>
          <p className="text-muted-foreground">
            시스템 알림 채널과 조건을 관리합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetSettings}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            초기화
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="channels">알림 채널</TabsTrigger>
          <TabsTrigger value="thresholds">임계값 설정</TabsTrigger>
          <TabsTrigger value="schedule">스케줄</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          {/* 이메일 알림 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <CardTitle>이메일 알림</CardTitle>
                </div>
                <Switch
                  checked={config.email.enabled}
                  onCheckedChange={(checked) => updateConfig('email.enabled', checked)}
                />
              </div>
              <CardDescription>
                중요한 이벤트를 이메일로 받아보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">수신 이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={config.email.address}
                  onChange={(e) => updateConfig('email.address', e.target.value)}
                  disabled={!config.email.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">알림 빈도</Label>
                <Select
                  value={config.email.frequency}
                  onValueChange={(value) => updateConfig('email.frequency', value)}
                  disabled={!config.email.enabled}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">즉시</SelectItem>
                    <SelectItem value="hourly">시간별</SelectItem>
                    <SelectItem value="daily">일별</SelectItem>
                    <SelectItem value="weekly">주별</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>알림 유형</Label>
                {Object.entries(config.email.types).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`email-${key}`} className="font-normal cursor-pointer">
                      {key === 'criticalErrors' && '심각한 오류'}
                      {key === 'performanceAlerts' && '성능 경고'}
                      {key === 'userMilestones' && '사용자 마일스톤'}
                      {key === 'systemUpdates' && '시스템 업데이트'}
                      {key === 'dailyReports' && '일일 리포트'}
                      {key === 'weeklyReports' && '주간 리포트'}
                    </Label>
                    <Switch
                      id={`email-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateConfig(`email.types.${key}`, checked)}
                      disabled={!config.email.enabled}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 슬랙 알림 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle>Slack 알림</CardTitle>
                </div>
                <Switch
                  checked={config.slack.enabled}
                  onCheckedChange={(checked) => updateConfig('slack.enabled', checked)}
                />
              </div>
              <CardDescription>
                팀 채널로 실시간 알림을 받아보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={config.slack.webhookUrl}
                  onChange={(e) => updateConfig('slack.webhookUrl', e.target.value)}
                  disabled={!config.slack.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel">채널</Label>
                <Input
                  id="channel"
                  placeholder="#alerts"
                  value={config.slack.channel}
                  onChange={(e) => updateConfig('slack.channel', e.target.value)}
                  disabled={!config.slack.enabled}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>알림 유형</Label>
                {Object.entries(config.slack.types).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`slack-${key}`} className="font-normal cursor-pointer">
                      {key === 'criticalErrors' && '심각한 오류'}
                      {key === 'performanceAlerts' && '성능 경고'}
                      {key === 'userActivity' && '사용자 활동'}
                      {key === 'newSignups' && '신규 가입'}
                    </Label>
                    <Switch
                      id={`slack-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateConfig(`slack.types.${key}`, checked)}
                      disabled={!config.slack.enabled}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 푸시 알림 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  <CardTitle>푸시 알림</CardTitle>
                  <Badge variant="secondary">Beta</Badge>
                </div>
                <Switch
                  checked={config.push.enabled}
                  onCheckedChange={(checked) => updateConfig('push.enabled', checked)}
                />
              </div>
              <CardDescription>
                브라우저 푸시 알림으로 즉시 알림을 받아보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>알림 유형</Label>
                {Object.entries(config.push.types).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`push-${key}`} className="font-normal cursor-pointer">
                      {key === 'criticalErrors' && '심각한 오류'}
                      {key === 'userMilestones' && '사용자 마일스톤'}
                      {key === 'systemAlerts' && '시스템 경고'}
                    </Label>
                    <Switch
                      id={`push-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateConfig(`push.types.${key}`, checked)}
                      disabled={!config.push.enabled}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>알림 임계값</CardTitle>
              <CardDescription>
                이 값을 초과하면 알림이 발송됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 오류율 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    오류율
                  </Label>
                  <span className="text-sm font-medium">{config.thresholds.errorRate}%</span>
                </div>
                <Slider
                  value={[config.thresholds.errorRate]}
                  onValueChange={([value]) => updateConfig('thresholds.errorRate', value)}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  전체 요청 대비 오류 발생 비율
                </p>
              </div>

              {/* 응답시간 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    응답시간
                  </Label>
                  <span className="text-sm font-medium">{config.thresholds.responseTime}ms</span>
                </div>
                <Slider
                  value={[config.thresholds.responseTime]}
                  onValueChange={([value]) => updateConfig('thresholds.responseTime', value)}
                  max={5000}
                  step={100}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  평균 서버 응답시간
                </p>
              </div>

              {/* CPU 사용률 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    CPU 사용률
                  </Label>
                  <span className="text-sm font-medium">{config.thresholds.cpuUsage}%</span>
                </div>
                <Slider
                  value={[config.thresholds.cpuUsage]}
                  onValueChange={([value]) => updateConfig('thresholds.cpuUsage', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* 메모리 사용률 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    메모리 사용률
                  </Label>
                  <span className="text-sm font-medium">{config.thresholds.memoryUsage}%</span>
                </div>
                <Slider
                  value={[config.thresholds.memoryUsage]}
                  onValueChange={([value]) => updateConfig('thresholds.memoryUsage', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* 활성 사용자 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    동시 접속자
                  </Label>
                  <span className="text-sm font-medium">{config.thresholds.activeUsers}명</span>
                </div>
                <Slider
                  value={[config.thresholds.activeUsers]}
                  onValueChange={([value]) => updateConfig('thresholds.activeUsers', value)}
                  max={500}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  동시 접속자 수가 이 값을 초과하면 알림
                </p>
              </div>

              {/* 분당 요청 수 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    분당 요청 수
                  </Label>
                  <span className="text-sm font-medium">{config.thresholds.requestsPerMinute}</span>
                </div>
                <Slider
                  value={[config.thresholds.requestsPerMinute]}
                  onValueChange={([value]) => updateConfig('thresholds.requestsPerMinute', value)}
                  max={5000}
                  step={100}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>알림 스케줄</CardTitle>
              <CardDescription>
                알림을 받고 싶지 않은 시간대를 설정하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 방해금지 시간 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <BellOff className="h-4 w-4" />
                      방해금지 시간
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      설정한 시간에는 긴급 알림만 발송됩니다.
                    </p>
                  </div>
                  <Switch
                    checked={config.schedule.quietHours.enabled}
                    onCheckedChange={(checked) => updateConfig('schedule.quietHours.enabled', checked)}
                  />
                </div>

                {config.schedule.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="quiet-start">시작 시간</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={config.schedule.quietHours.start}
                        onChange={(e) => updateConfig('schedule.quietHours.start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiet-end">종료 시간</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={config.schedule.quietHours.end}
                        onChange={(e) => updateConfig('schedule.quietHours.end', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* 주말 알림 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    주말 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    주말에도 모든 알림을 받습니다.
                  </p>
                </div>
                <Switch
                  checked={config.schedule.weekendNotifications}
                  onCheckedChange={(checked) => updateConfig('schedule.weekendNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 알림 테스트 */}
          <Card>
            <CardHeader>
              <CardTitle>알림 테스트</CardTitle>
              <CardDescription>
                설정한 채널로 테스트 알림을 보내보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!config.email.enabled || !config.email.address}
                  onClick={() => {
                    toast({
                      title: '이메일 알림 전송됨',
                      description: '테스트 이메일이 발송되었습니다.',
                    });
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  이메일 테스트
                </Button>
                <Button
                  variant="outline"
                  disabled={!config.slack.enabled || !config.slack.webhookUrl}
                  onClick={() => {
                    toast({
                      title: 'Slack 알림 전송됨',
                      description: '테스트 메시지가 발송되었습니다.',
                    });
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Slack 테스트
                </Button>
                <Button
                  variant="outline"
                  disabled={!config.push.enabled}
                  onClick={() => {
                    toast({
                      title: '푸시 알림 전송됨',
                      description: '테스트 푸시 알림이 발송되었습니다.',
                    });
                  }}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  푸시 테스트
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 현재 상태 요약 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                현재 {Object.values(config).filter(c => c.enabled).length}개의 알림 채널이 활성화되어 있습니다.
              </p>
              {config.schedule.quietHours.enabled && (
                <p>
                  방해금지 시간: {config.schedule.quietHours.start} - {config.schedule.quietHours.end}
                </p>
              )}
              {hasChanges && (
                <p className="text-orange-600 dark:text-orange-400 font-medium">
                  저장되지 않은 변경사항이 있습니다.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}