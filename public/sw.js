// InnerSpell Service Worker
const CACHE_NAME = 'innerspell-v1';
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

// 페치 이벤트 - 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 항상 네트워크 우선
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // API 요청 실패 시 오프라인 응답
          return new Response(
            JSON.stringify({ 
              error: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.' 
            }),
            { 
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        })
    );
    return;
  }

  // 정적 리소스는 캐시 우선
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            // 캐시에서 찾음
            return response;
          }
          // 네트워크에서 가져오고 캐시에 저장
          return fetch(request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            return response;
          });
        })
    );
    return;
  }

  // HTML 페이지는 네트워크 우선, 실패 시 캐시
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 성공적인 응답을 캐시에 저장
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 가져오기
        return caches.match(request)
          .then((response) => {
            if (response) {
              return response;
            }
            // 캐시에도 없으면 오프라인 페이지 표시
            if (request.destination === 'document') {
              return caches.match('/offline');
            }
          });
      })
  );
});

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

// 캐시 버전 관리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[Service Worker] Cache cleared');
    });
  }
});