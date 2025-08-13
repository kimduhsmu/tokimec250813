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

// 요청 가로채기(캐시 우선)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((res) => {
          // 정적 파일만 캐시에 저장(옵션)
          const reqUrl = new URL(event.request.url);
          const isStatic =
            reqUrl.pathname.endsWith('.html') ||
            reqUrl.pathname.endsWith('.json') ||
            reqUrl.pathname.endsWith('.png');
          if (isStatic) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return res;
        })
      );
    })
  );

});


