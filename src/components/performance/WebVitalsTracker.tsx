'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export default function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`📊 Web Vitals: ${metric.name}`);
      console.log(`Value: ${metric.value}`);
      console.log(`Rating: ${metric.rating}`);
      console.log(`ID: ${metric.id}`);
      console.groupEnd();
    }

    // Send metrics to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // You can send to Google Analytics, Vercel Analytics, or your own endpoint
      sendToAnalytics(metric);
    }
  });

  return null;
}

function sendToAnalytics(metric: WebVitalsMetric) {
  // Example: Send to Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', metric.name, {
      custom_map: { metric_id: 'custom_metric_id' },
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.value,
    });
  }

  // Example: Send to custom endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error);
  }

  // Example: Send to Vercel Analytics (if using @vercel/analytics)
  try {
    if ('analytics' in window) {
      (window as any).analytics.track('Web Vitals', {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
      });
    }
  } catch (error) {
    console.error('Failed to send metrics to Vercel Analytics:', error);
  }
}