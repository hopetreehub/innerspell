// InnerSpell Service Worker - Performance Optimized
const CACHE_VERSION = 'v2';
const CACHE_NAME = `innerspell-cache-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 정적 리소스 캐싱
const STATIC_RESOURCES = [
  '/images/tarothome.png',
  '/images/1ai.png',
  '/images/2road.png',
  '/images/3wisdom.png',
];

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
        return cache.addAll([...urlsToCache, ...STATIC_RESOURCES]);
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
    handleRequest(request, strategy)
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
    const response = await fetch(request);
    
    if (response.ok) {
      // 응답 복제 (Stream은 한번만 읽을 수 있음)
      const responseToCache = response.clone();
      await cache.put(request, responseToCache);
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