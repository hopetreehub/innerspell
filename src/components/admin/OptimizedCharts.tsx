'use client';

import React, { memo, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// 공통 차트 설정
const CHART_ANIMATION_DURATION = 300;
const CHART_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

// 날짜 포맷터 메모이제이션
const formatters = {
  formatDate: (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  },
  formatTooltipDate: (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  }
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = memo(({ active, payload, label, formatter }: any) => {
  if (!active || !payload) return null;
  
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium mb-1">{formatter ? formatter(label) : label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

// 최적화된 AreaChart 컴포넌트
export const OptimizedAreaChart = memo(({ data, height = 350 }: { data: any[], height?: number }) => {
  const chartData = useMemo(() => data, [data]);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatters.formatDate}
          tick={{ fontSize: 12 }}
        />
        <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip 
          content={<CustomTooltip formatter={formatters.formatTooltipDate} />}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="users"
          stroke="#8B5CF6"
          fillOpacity={1}
          fill="url(#colorUsers)"
          name="사용자"
          animationDuration={CHART_ANIMATION_DURATION}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="sessions"
          stroke="#3B82F6"
          fillOpacity={1}
          fill="url(#colorSessions)"
          name="세션"
          animationDuration={CHART_ANIMATION_DURATION}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
OptimizedAreaChart.displayName = 'OptimizedAreaChart';

// 최적화된 LineChart 컴포넌트
export const OptimizedLineChart = memo(({ data, height = 300 }: { data: any[], height?: number }) => {
  const chartData = useMemo(() => data, [data]);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatters.formatDate}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          content={<CustomTooltip formatter={formatters.formatTooltipDate} />}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Line 
          type="monotone" 
          dataKey="tarotReadings" 
          stroke="#10B981" 
          name="타로 리딩"
          strokeWidth={2}
          dot={false}
          animationDuration={CHART_ANIMATION_DURATION}
        />
        <Line 
          type="monotone" 
          dataKey="dreamInterpretations" 
          stroke="#F59E0B" 
          name="꿈 해석"
          strokeWidth={2}
          dot={false}
          animationDuration={CHART_ANIMATION_DURATION}
        />
        <Line 
          type="monotone" 
          dataKey="yesNoReadings" 
          stroke="#EF4444" 
          name="예스/노 타로"
          strokeWidth={2}
          dot={false}
          animationDuration={CHART_ANIMATION_DURATION}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
OptimizedLineChart.displayName = 'OptimizedLineChart';

// 최적화된 BarChart 컴포넌트
export const OptimizedBarChart = memo(({ 
  data, 
  dataKey = "count", 
  height = 300,
  layout = "vertical",
  useColors = false 
}: { 
  data: any[], 
  dataKey?: string, 
  height?: number,
  layout?: "horizontal" | "vertical",
  useColors?: boolean
}) => {
  const chartData = useMemo(() => data, [data]);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout={layout}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey={layout === "vertical" ? "service" : "feature"} 
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#8B5CF6" animationDuration={CHART_ANIMATION_DURATION}>
          {useColors && chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});
OptimizedBarChart.displayName = 'OptimizedBarChart';

// 최적화된 PieChart 컴포넌트
export const OptimizedPieChart = memo(({ 
  data, 
  dataKey = "count",
  nameKey = "type",
  height = 300,
  showPercentage = true 
}: { 
  data: any[], 
  dataKey?: string,
  nameKey?: string,
  height?: number,
  showPercentage?: boolean
}) => {
  const chartData = useMemo(() => {
    if (!showPercentage) return data;
    
    const total = data.reduce((sum, item) => sum + item[dataKey], 0);
    return data.map(item => ({
      ...item,
      percentage: Math.round((item[dataKey] / total) * 100)
    }));
  }, [data, dataKey, showPercentage]);
  
  const renderLabel = useMemo(() => {
    if (!showPercentage) return false;
    
    return (props: any) => {
      const { cx, cy, midAngle, innerRadius, outerRadius, value, index } = props;
      const item = chartData[index];
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
      
      if (item.percentage < 5) return null;
      
      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize="12"
          fontWeight="bold"
        >
          {`${item.percentage}%`}
        </text>
      );
    };
  }, [chartData, showPercentage]);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey={dataKey}
          animationDuration={CHART_ANIMATION_DURATION}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any, name: string) => [
            value.toLocaleString(),
            showPercentage && chartData.find(item => item[nameKey] === name)?.percentage 
              ? `${name} (${chartData.find(item => item[nameKey] === name)?.percentage}%)`
              : name
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});
OptimizedPieChart.displayName = 'OptimizedPieChart';

// 성능 모니터링 차트 컴포넌트
export const PerformanceLineChart = memo(({ 
  data, 
  dataKey = "responseTime",
  stroke = "#10B981",
  name = "응답시간",
  height = 300 
}: { 
  data: any[], 
  dataKey?: string,
  stroke?: string,
  name?: string,
  height?: number
}) => {
  const chartData = useMemo(() => data, [data]);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value: any) => [`${value}ms`, name]}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={stroke} 
          name={`평균 ${name} (ms)`}
          strokeWidth={2}
          dot={false}
          animationDuration={CHART_ANIMATION_DURATION}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
PerformanceLineChart.displayName = 'PerformanceLineChart';