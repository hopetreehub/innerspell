import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface PerformanceData {
  metrics: Array<{
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    navigationType: string;
    timestamp: number;
  }>;
  userAgent: string;
  url: string;
  timestamp: number;
}

// 성능 데이터 저장소 (프로덕션에서는 데이터베이스 사용)
const performanceData: PerformanceData[] = [];
const performanceStats = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    // 개발 환경에서는 성능 모니터링 비활성화
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ 
        success: true, 
        message: 'Performance monitoring disabled in development' 
      });
    }

    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'anonymous';
    
    // 요청 본문 검증
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.text();
    if (!body || body.trim() === '') {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    let data: PerformanceData;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    
    // 기본 검증
    if (!data.metrics || !Array.isArray(data.metrics)) {
      return NextResponse.json(
        { error: 'Invalid performance data format' },
        { status: 400 }
      );
    }
    
    // 성능 데이터 저장
    performanceData.push({
      ...data,
      ip,
    } as any);
    
    // 최대 1000개 항목만 메모리에 보관
    if (performanceData.length > 1000) {
      performanceData.splice(0, performanceData.length - 1000);
    }
    
    // 성능 통계 업데이트
    updatePerformanceStats(data);
    
    // 성능 이슈 감지 및 알림
    detectPerformanceIssues(data, ip);
    
    return NextResponse.json({ 
      success: true,
      received: data.metrics.length 
    });
    
  } catch (error) {
    console.error('Failed to process performance data:', error);
    return NextResponse.json(
      { error: 'Failed to process performance data' },
      { status: 500 }
    );
  }
}

function updatePerformanceStats(data: PerformanceData) {
  data.metrics.forEach(metric => {
    const key = `${metric.name}_${metric.rating}`;
    const current = performanceStats.get(key) || { count: 0, totalValue: 0 };
    
    performanceStats.set(key, {
      count: current.count + 1,
      totalValue: current.totalValue + metric.value,
      avgValue: (current.totalValue + metric.value) / (current.count + 1),
      lastUpdated: Date.now(),
    });
  });
  
  // URL별 성능 통계
  const urlKey = `url_${new URL(data.url).pathname}`;
  const urlStats = performanceStats.get(urlKey) || { 
    views: 0, 
    avgLoadTime: 0, 
    totalLoadTime: 0 
  };
  
  const loadTimeMetric = data.metrics.find(m => m.name === 'FCP' || m.name === 'LCP');
  if (loadTimeMetric) {
    urlStats.views += 1;
    urlStats.totalLoadTime += loadTimeMetric.value;
    urlStats.avgLoadTime = urlStats.totalLoadTime / urlStats.views;
    performanceStats.set(urlKey, urlStats);
  }
}

function detectPerformanceIssues(data: PerformanceData, ip: string) {
  const criticalIssues = data.metrics.filter(metric => 
    metric.rating === 'poor' && 
    (metric.name === 'LCP' || metric.name === 'FID' || metric.name === 'CLS')
  );
  
  if (criticalIssues.length > 0) {
    console.warn('🚨 Performance issues detected:', {
      ip,
      url: data.url,
      issues: criticalIssues.map(issue => ({
        metric: issue.name,
        value: issue.value,
        rating: issue.rating,
      })),
      userAgent: data.userAgent,
      timestamp: new Date().toISOString(),
    });
    
    // 실제 환경에서는 알림 서비스로 전송
    // await sendPerformanceAlert(criticalIssues, data);
  }
  
  // 느린 페이지 감지
  const lcpMetric = data.metrics.find(m => m.name === 'LCP');
  if (lcpMetric && lcpMetric.value > 4000) { // 4초 이상
    console.warn('🐌 Slow page detected:', {
      url: data.url,
      lcp: lcpMetric.value,
      ip,
    });
  }
}

// 성능 통계 조회 (관리자 전용)
export async function GET(request: NextRequest) {
  try {
    // 간단한 인증 체크
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 최근 성능 데이터 요약
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recentData = performanceData.filter(d => d.timestamp > last24Hours);
    
    // Core Web Vitals 평균 계산
    const coreWebVitals = {
      LCP: calculateMetricAverage(recentData, 'LCP'),
      FID: calculateMetricAverage(recentData, 'FID'),
      CLS: calculateMetricAverage(recentData, 'CLS'),
      FCP: calculateMetricAverage(recentData, 'FCP'),
      TTFB: calculateMetricAverage(recentData, 'TTFB'),
    };
    
    // 페이지별 성능
    const pagePerformance = calculatePagePerformance(recentData);
    
    // 디바이스/브라우저별 통계
    const deviceStats = calculateDeviceStats(recentData);
    
    return NextResponse.json({
      summary: {
        totalSamples: recentData.length,
        timeRange: '24h',
        coreWebVitals,
      },
      pagePerformance,
      deviceStats,
      rawStats: Object.fromEntries(performanceStats),
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Failed to retrieve performance stats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance stats' },
      { status: 500 }
    );
  }
}

function calculateMetricAverage(data: PerformanceData[], metricName: string) {
  const metrics = data.flatMap(d => d.metrics.filter(m => m.name === metricName));
  if (metrics.length === 0) return null;
  
  const sum = metrics.reduce((acc, m) => acc + m.value, 0);
  const avg = sum / metrics.length;
  
  const ratings = metrics.map(m => m.rating);
  const goodCount = ratings.filter(r => r === 'good').length;
  const needsImprovementCount = ratings.filter(r => r === 'needs-improvement').length;
  const poorCount = ratings.filter(r => r === 'poor').length;
  
  return {
    average: Math.round(avg),
    min: Math.min(...metrics.map(m => m.value)),
    max: Math.max(...metrics.map(m => m.value)),
    samples: metrics.length,
    distribution: {
      good: Math.round((goodCount / metrics.length) * 100),
      needsImprovement: Math.round((needsImprovementCount / metrics.length) * 100),
      poor: Math.round((poorCount / metrics.length) * 100),
    },
  };
}

function calculatePagePerformance(data: PerformanceData[]) {
  const pageStats = new Map<string, any>();
  
  data.forEach(d => {
    const path = new URL(d.url).pathname;
    const existing = pageStats.get(path) || { 
      views: 0, 
      metrics: {} as Record<string, number[]>
    };
    
    existing.views += 1;
    
    d.metrics.forEach(metric => {
      if (!existing.metrics[metric.name]) {
        existing.metrics[metric.name] = [];
      }
      existing.metrics[metric.name].push(metric.value);
    });
    
    pageStats.set(path, existing);
  });
  
  // 평균 계산
  const result: Record<string, any> = {};
  pageStats.forEach((stats, path) => {
    result[path] = {
      views: stats.views,
      averages: {} as Record<string, number>,
    };
    
    Object.entries(stats.metrics).forEach(([metricName, values]) => {
      const sum = (values as number[]).reduce((a, b) => a + b, 0);
      result[path].averages[metricName] = Math.round(sum / values.length);
    });
  });
  
  return result;
}

function calculateDeviceStats(data: PerformanceData[]) {
  const deviceStats = new Map<string, number>();
  const browserStats = new Map<string, number>();
  
  data.forEach(d => {
    // 간단한 디바이스 분류
    const isMobile = /Mobile|Android|iPhone|iPad/.test(d.userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    deviceStats.set(deviceType, (deviceStats.get(deviceType) || 0) + 1);
    
    // 브라우저 분류
    let browser = 'unknown';
    if (d.userAgent.includes('Chrome')) browser = 'chrome';
    else if (d.userAgent.includes('Firefox')) browser = 'firefox';
    else if (d.userAgent.includes('Safari') && !d.userAgent.includes('Chrome')) browser = 'safari';
    else if (d.userAgent.includes('Edge')) browser = 'edge';
    
    browserStats.set(browser, (browserStats.get(browser) || 0) + 1);
  });
  
  return {
    devices: Object.fromEntries(deviceStats),
    browsers: Object.fromEntries(browserStats),
  };
}