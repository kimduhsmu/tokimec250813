// sw.js
const CACHE_NAME = 'tkp-price-list-cache-v5';

// 현재 서비스워커가 서비스하는 경로(= 배포 경로)를 안전하게 계산
const SCOPE = self.registration.scope.endsWith('/')
  ? self.registration.scope
  : self.registration.scope + '/';

const urlsToCache = [
  SCOPE,
  SCOPE + 'index.html',
  SCOPE + 'manifest.json',
  SCOPE + 'icon-192x192.png',
  SCOPE + 'icon-512x512.png'
];

// 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 활성화(이전 캐시 정리)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});
// 요청 가로채기 (수정된 부분)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // index.html 파일은 네트워크 우선 전략 사용
  // 앱이 실행될 때 가장 중요한 index.html 파일을 무조건 서버에서 먼저 가져오도록 합니다.
  if (requestUrl.origin === location.origin && (requestUrl.pathname === SCOPE || requestUrl.pathname.endsWith('/index.html'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 네트워크 요청이 성공하면, 최신 파일로 캐시를 업데이트하고 사용자에게 보여줍니다.
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // 만약 비행기 모드 등 인터넷이 안될 경우에만, 어쩔 수 없이 캐시에 저장된 구버전을 보여줍니다.
          return caches.match(event.request);
        })
    );
    return;
  }

  // 다른 모든 파일(이미지, manifest 등)은 기존처럼 캐시 우선 전략 사용
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
      );
    })
  );
});


