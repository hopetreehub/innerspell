'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserActivity } from '@/types/admin';

interface ActivityStreamData {
  type: 'connected' | 'activities';
  data?: UserActivity[];
  timestamp: string;
}

export function useActivityStream() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    const eventSource = new EventSource('/api/admin/activities/stream');
    
    eventSource.onopen = () => {
      console.log('Activity stream connected');
      setIsConnected(true);
      setError(null);
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data: ActivityStreamData = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('Stream connected at:', data.timestamp);
        } else if (data.type === 'activities' && data.data) {
          setActivities(data.data);
          setLastUpdate(new Date(data.timestamp));
        }
      } catch (error) {
        console.error('Error parsing stream data:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('Activity stream error:', error);
      setIsConnected(false);
      setError('실시간 연결이 끊어졌습니다. 재연결 시도 중...');
      
      // 자동 재연결
      setTimeout(() => {
        eventSource.close();
        connect();
      }, 5000);
    };
    
    return eventSource;
  }, []);

  useEffect(() => {
    const eventSource = connect();
    
    return () => {
      eventSource.close();
    };
  }, [connect]);

  return {
    activities,
    isConnected,
    lastUpdate,
    error
  };
}