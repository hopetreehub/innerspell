// InnerSpell Service Worker - Performance Optimized
const CACHE_VERSION = 'v2';
const CACHE_NAME = `innerspell-cache-${CACHE_VERSION}`;

const urlsToCache = [
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png'
];

// 정적 리소스 캐싱 (나중에 lazy 로드)
const STATIC_RESOURCES = [];

// 캐시 전략 정의
const CACHE_STRATEGIES = {
  // 정적 리소스 - 캐시 우선 (1년)
  static: {
    pattern: /\/_next\/static\/|\/images\/|\/icons\/|\.(?:css|js|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg)$/,
    strategy: 'cache-first',
    maxAge: 365 * 24 * 60 * 60 // 1년
  },
  
  // API 응답 - 네트워크 우선 (5분)
  api: {
    pattern: /\/api\//,
    strategy: 'network-first',
    maxAge: 5 * 60 // 5분
  },
  
  // 페이지 - Stale While Revalidate (1시간)
  pages: {
    pattern: /^https?:\/\/[^\/]+\/(?!api\/|_next\/)/,
    strategy: 'stale-while-revalidate',
    maxAge: 60 * 60 // 1시간
  }
};

// 설치 이벤트 - 캐시 초기화
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        // 각 URL을 개별적으로 캐싱하여 실패한 것은 무시
        return Promise.all(
          [...urlsToCache, ...STATIC_RESOURCES].map(url => {
            return cache.add(url).catch(error => {
              console.warn(`[Service Worker] Failed to cache ${url}:`, error);
            });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 페치 이벤트 - 네트워크 요청 가로채기 (최적화된 버전)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET 요청만 캐싱
  if (request.method !== 'GET') {
    return;
  }

  // Chrome extensions, DevTools, hot reload 관련 요청 완전 제외
  if (request.url.includes('chrome-extension://') || 
      request.url.includes('chrome://') ||
      request.url.includes('moz-extension://') ||
      request.url.includes('safari-extension://') ||
      request.url.includes('webkit-extension://') ||
      request.url.includes('edge-extension://') ||
      request.url.includes('webpack') ||
      request.url.includes('_next/webpack') ||
      request.url.includes('__nextjs') ||
      request.url.includes('_next/static/development') ||
      request.url.includes('hot-update') ||
      request.url.includes('sockjs-node') ||
      request.url.includes('__webpack') ||
      request.url.includes('eventsource')) {
    return; // 완전히 무시
  }

  // 캐시 전략 결정
  let strategy = null;
  for (const [name, config] of Object.entries(CACHE_STRATEGIES)) {
    if (config.pattern.test(request.url)) {
      strategy = config;
      break;
    }
  }

  if (!strategy) {
    return; // 캐싱하지 않음
  }

  event.respondWith(
    handleRequest(request, strategy).catch(error => {
      console.error('[Service Worker] Fetch error:', error);
      // 네트워크 오류 시 캐시에서 찾거나 오프라인 페이지 반환
      return caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // HTML 요청인 경우 오프라인 페이지로 리다이렉트
        const acceptHeader = request.headers.get('accept');
        if (acceptHeader && acceptHeader.includes('text/html')) {
          return caches.match('/offline').then(offlinePage => {
            if (offlinePage) {
              return offlinePage;
            }
            // 오프라인 페이지도 없으면 기본 응답
            return new Response('오프라인 상태입니다', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/html; charset=utf-8' })
            });
          });
        }
        // 그 외의 경우 원본 네트워크 요청으로 fallback
        return fetch(request).catch(() => {
          return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      });
    })
  );
});

// 요청 처리 함수 (최적화된 캐시 전략)
async function handleRequest(request, strategy) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  switch (strategy.strategy) {
    case 'cache-first':
      return cachedResponse || fetchAndCache(request, cache, strategy);
    
    case 'network-first':
      try {
        return await fetchAndCache(request, cache, strategy);
      } catch (error) {
        return cachedResponse || createOfflineResponse();
      }
    
    case 'stale-while-revalidate':
      // 캐시된 응답 반환하면서 백그라운드에서 업데이트
      if (cachedResponse) {
        fetchAndCache(request, cache, strategy); // 백그라운드 업데이트
        return cachedResponse;
      }
      return fetchAndCache(request, cache, strategy);
    
    default:
      return fetch(request);
  }
}

// 네트워크에서 가져와 캐시에 저장
async function fetchAndCache(request, cache, strategy) {
  try {
    // Chrome extension 요청은 절대 처리하지 않음
    if (request.url.includes('chrome-extension://') || 
        request.url.includes('chrome://') ||
        request.url.includes('moz-extension://')) {
      throw new Error('Extension request not supported');
    }

    const fetchOptions = {
      mode: 'cors',
      credentials: 'same-origin',
      cache: 'no-cache'
    };
    
    const response = await fetch(request, fetchOptions);
    
    if (response && response.ok && response.status === 200) {
      // 캐시 가능한 응답인지 확인
      const contentType = response.headers.get('content-type');
      const isValidResponse = response.headers.get('cache-control') !== 'no-store';
      
      // 안전한 캐싱을 위한 추가 검증
      if (isValidResponse && !request.url.includes('chrome-extension://')) {
        try {
          const responseToCache = response.clone();
          await cache.put(request, responseToCache);
        } catch (cacheError) {
          console.warn('[Service Worker] Cache put failed:', cacheError);
          // 캐싱 실패해도 원본 응답은 반환
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Network error:', error);
    throw error;
  }
}

// 오프라인 응답 생성
function createOfflineResponse() {
  return new Response(
    JSON.stringify({
      error: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.',
      timestamp: Date.now()
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync', event);
  if (event.tag === 'sync-readings') {
    event.waitUntil(syncReadings());
  }
});

// 푸시 알림
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 소식이 있습니다!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('InnerSpell', options)
  );
});

// 알림 클릭 핸들러
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 백그라운드 동기화 함수
async function syncReadings() {
  try {
    // 로컬 스토리지에서 저장된 리딩 데이터 가져오기
    // 실제 구현 시 IndexedDB 사용 권장
    console.log('[Service Worker] Syncing readings...');
    // 동기화 로직 구현
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// 캐시 버전 관리 및 정리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[Service Worker] Cache cleared');
    });
  }

  if (event.data && event.data.type === 'CLEAN_EXPIRED_CACHE') {
    event.waitUntil(cleanExpiredCache());
  }
});

// 만료된 캐시 정리
async function cleanExpiredCache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const cacheControl = response.headers.get('cache-control');
      const dateHeader = response.headers.get('date');
      
      if (cacheControl && dateHeader) {
        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
        if (maxAgeMatch) {
          const maxAge = parseInt(maxAgeMatch[1]);
          const responseDate = new Date(dateHeader).getTime();
          
          if (now - responseDate > maxAge * 1000) {
            await cache.delete(request);
            cleanedCount++;
          }
        }
      }
    }
  }
  
  console.log(`[Service Worker] Cleaned ${cleanedCount} expired cache entries`);
}

// 정기적 캐시 정리 (24시간마다)
setInterval(() => {
  cleanExpiredCache();
}, 24 * 60 * 60 * 1000);