import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase/admin-lazy';
import { monitoring } from '@/lib/monitoring';

export const runtime = 'nodejs';

interface SystemMetrics {
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connection_status: string;
    response_time?: number;
    collections: {
      name: string;
      estimated_docs: number;
    }[];
  };
  api: {
    total_requests: number;
    error_rate: number;
    avg_response_time: number;
  };
  services: {
    firebase: boolean;
    ai_configured: boolean;
  };
  performance_summary: Record<string, { count: number; avg: number; min: number; max: number }>;
}

export async function GET() {
  const startTime = performance.now();
  
  try {
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
      },
      database: {
        connection_status: 'unknown',
        collections: [],
      },
      api: {
        total_requests: 0,
        error_rate: 0,
        avg_response_time: 0,
      },
      services: {
        firebase: false,
        ai_configured: false,
      },
      performance_summary: {},
    };

    // Test Firebase connectivity and get collection info
    try {
      const dbStartTime = performance.now();
      const db = await getFirestore();
      
      // Test basic connectivity
      await db.collection('health-check').limit(1).get();
      const dbResponseTime = performance.now() - dbStartTime;
      
      metrics.database.connection_status = 'connected';
      metrics.database.response_time = dbResponseTime;
      metrics.services.firebase = true;
      
      // Get collection information (sample collections)
      const collectionNames = ['users', 'posts', 'readingHistory', 'aiProviderConfigs', 'notifications'];
      for (const collectionName of collectionNames) {
        try {
          const snapshot = await db.collection(collectionName).limit(1).get();
          metrics.database.collections.push({
            name: collectionName,
            estimated_docs: snapshot.size, // This is just a sample, not actual count
          });
        } catch (error) {
          // Collection might not exist, skip
        }
      }
      
    } catch (firebaseError) {
      console.error('Firebase metrics collection failed:', firebaseError);
      metrics.database.connection_status = 'error';
      metrics.services.firebase = false;
    }

    // Check AI service configuration
    try {
      const hasOpenAIKey = !!(process.env.OPENAI_API_KEY && 
                             !process.env.OPENAI_API_KEY.includes('your-') && 
                             !process.env.OPENAI_API_KEY.includes('here') &&
                             process.env.OPENAI_API_KEY.length > 20);
      metrics.services.ai_configured = hasOpenAIKey;
    } catch (error) {
      metrics.services.ai_configured = false;
    }

    // Get performance metrics summary from monitoring service
    try {
      metrics.performance_summary = monitoring.getMetricsSummary();
    } catch (error) {
      console.warn('Failed to get performance summary:', error);
    }

    // Calculate and record this endpoint's response time
    const totalResponseTime = performance.now() - startTime;
    monitoring.recordMetric('metrics_endpoint_response_time', totalResponseTime, {
      firebase_status: metrics.services.firebase,
      ai_status: metrics.services.ai_configured,
    });

    return NextResponse.json(metrics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Response-Time': totalResponseTime.toString(),
      },
    });

  } catch (error) {
    const responseTime = performance.now() - startTime;
    console.error('Metrics collection failed:', error);
    
    monitoring.reportError(error as Error, { 
      context: 'metrics_endpoint_failure',
      response_time: responseTime 
    });
    
    return NextResponse.json(
      {
        error: 'Failed to collect system metrics',
        timestamp: new Date().toISOString(),
        response_time: responseTime,
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Response-Time': responseTime.toString(),
        },
      }
    );
  }
}