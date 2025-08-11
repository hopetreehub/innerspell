'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { emergencyInvalidateCache, cacheBustedFetch, refreshAuthWithCacheBust } from '@/lib/cache-buster';

interface CacheStatus {
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: number;
}

export function EmergencyCacheInvalidator() {
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [status, setStatus] = useState<CacheStatus[]>([]);

  const addStatus = (type: CacheStatus['type'], message: string) => {
    setStatus(prev => [...prev, { type, message, timestamp: Date.now() }]);
  };

  const handleEmergencyInvalidation = async () => {
    setIsInvalidating(true);
    addStatus('info', '🚨 Starting emergency cache invalidation...');

    try {
      // 1. Test current cache status
      addStatus('info', '📊 Testing current cache status...');
      const cacheTestResponse = await cacheBustedFetch('/api/cache-bust');
      const cacheData = await cacheTestResponse.json();
      addStatus('success', `✅ Cache test successful: ${cacheData.cacheBustId}`);

      // 2. Trigger server-side cache bust
      addStatus('info', '🔧 Triggering server-side cache invalidation...');
      const serverBustResponse = await cacheBustedFetch('/api/cache-bust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'emergency-invalidate' })
      });
      const serverData = await serverBustResponse.json();
      addStatus('success', `✅ Server cache invalidated: ${serverData.cacheBustId}`);

      // 3. Clear browser caches
      addStatus('info', '🗑️ Clearing browser caches...');
      await emergencyInvalidateCache();
      addStatus('success', '✅ Browser caches cleared successfully');

      // 4. Test authentication endpoints
      addStatus('info', '🔐 Testing authentication endpoints...');
      const authTestResponse = await cacheBustedFetch('/api/auth/session');
      addStatus('success', `✅ Auth endpoint accessible: ${authTestResponse.status}`);

      addStatus('success', '🎉 Emergency cache invalidation completed successfully!');
      
    } catch (error) {
      console.error('Emergency cache invalidation failed:', error);
      addStatus('error', `❌ Cache invalidation failed: ${error}`);
    } finally {
      setIsInvalidating(false);
    }
  };

  const handleAuthRefresh = async () => {
    addStatus('info', '🔄 Refreshing authentication with cache bust...');
    try {
      await refreshAuthWithCacheBust();
      addStatus('success', '✅ Authentication refresh triggered');
    } catch (error) {
      addStatus('error', `❌ Auth refresh failed: ${error}`);
    }
  };

  const handleClearStatus = () => {
    setStatus([]);
  };

  const handleTestCacheHeaders = async () => {
    addStatus('info', '🧪 Testing cache headers...');
    try {
      const adminResponse = await fetch(window.location.href, { method: 'HEAD' });
      const cacheControl = adminResponse.headers.get('cache-control');
      const pragma = adminResponse.headers.get('pragma');
      const expires = adminResponse.headers.get('expires');
      
      addStatus('info', `Cache-Control: ${cacheControl || 'Not set'}`);
      addStatus('info', `Pragma: ${pragma || 'Not set'}`);
      addStatus('info', `Expires: ${expires || 'Not set'}`);
      
      if (cacheControl?.includes('no-store') && cacheControl?.includes('no-cache')) {
        addStatus('success', '✅ Proper no-cache headers detected');
      } else {
        addStatus('error', '❌ Cache headers may be allowing caching');
      }
    } catch (error) {
      addStatus('error', `❌ Cache header test failed: ${error}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <AlertTriangle className="h-5 w-5" />
          Emergency Cache Invalidation
        </CardTitle>
        <CardDescription>
          Use these tools to fix persistent login issues caused by browser or CDN caching.
          This is specifically designed to resolve authentication problems.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            onClick={handleEmergencyInvalidation}
            disabled={isInvalidating}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isInvalidating ? 'Invalidating...' : 'Emergency Invalidate All'}
          </Button>

          <Button 
            onClick={handleAuthRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Auth State
          </Button>

          <Button 
            onClick={handleTestCacheHeaders}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Test Cache Headers
          </Button>

          <Button 
            onClick={handleClearStatus}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Clear Status
          </Button>
        </div>

        {/* Status Log */}
        {status.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-sm mb-2">Status Log:</h4>
            <div className="bg-black text-green-400 font-mono text-xs p-3 rounded max-h-60 overflow-y-auto">
              {status.map((item, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">
                    [{new Date(item.timestamp).toLocaleTimeString()}]
                  </span>{' '}
                  <span className={
                    item.type === 'success' ? 'text-green-400' :
                    item.type === 'error' ? 'text-red-400' :
                    'text-yellow-400'
                  }>
                    {item.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-3 bg-blue-50 rounded text-sm">
          <p className="font-medium text-blue-900 mb-1">When to use this tool:</p>
          <ul className="text-blue-700 text-xs space-y-1">
            <li>• User cannot log in despite correct credentials</li>
            <li>• Authentication state appears stuck or inconsistent</li>
            <li>• Admin menu not appearing after successful login</li>
            <li>• Getting cached authentication responses</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}