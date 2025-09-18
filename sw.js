/**
 * 서비스 워커 (Service Worker)
 * 파일 최종 수정: 2025-09-18
 *
 * 이 파일은 PWA(Progressive Web App)의 핵심으로,
 * 앱 설치, 캐시 관리, 오프라인 동작을 제어합니다.
 */

// 1. 캐시 설정
// 앱의 중요 파일을 업데이트할 때마다 이 버전을 변경해주세요. (예: 'v6' -> 'v7')
// 이 버전이 바뀌면 서비스 워커는 자동으로 업데이트를 진행합니다.
const CACHE_NAME = 'tkp-price-list-cache-v6';
const HTML_FILE_URL = 'index.html';

// 앱이 설치될 때 캐시에 미리 저장할 파일 목록입니다.
const FILES_TO_CACHE = [
  './', // 앱의 루트 경로 (예: https://.../tokimec250813/)
  HTML_FILE_URL,
  'manifest.json',
  'icon-192x192.png',
  'icon-512x512.png'
];

// 2. 서비스 워커 설치 (Install)
// 앱이 처음 설치되거나 서비스 워커 파일이 업데이트될 때 한 번 실행됩니다.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      console.log('[Service Worker] 설치 시작. 캐싱할 파일:', FILES_TO_CACHE);
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(FILES_TO_CACHE);
      // 즉시 활성화 단계로 넘어갑니다.
      self.skipWaiting();
      console.log('[Service Worker] 파일 캐싱 완료 및 설치 성공.');
    })()
  );
});

// 3. 서비스 워커 활성화 (Activate)
// 새로운 서비스 워커가 설치된 후 이전 버전을 정리합니다.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      console.log('[Service Worker] 활성화 시작.');
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          // 현재 캐시 이름과 다른 이전 버전의 캐시를 모두 삭제합니다.
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] 이전 캐시 삭제:', name);
            return caches.delete(name);
          }
        })
      );
      // 즉시 앱의 제어권을 가져옵니다.
      await self.clients.claim();
      console.log('[Service Worker] 활성화 완료 및 제어권 획득.');
    })()
  );
});

// 4. 요청 가로채기 (Fetch)
// 앱에서 발생하는 모든 네트워크 요청을 가로채서 어떻게 처리할지 결정합니다.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 요청 URL이 앱의 메인 페이지(index.html)인 경우
  if (url.origin === self.location.origin && (url.pathname.endsWith('/') || url.pathname.endsWith(HTML_FILE_URL))) {
    // '네트워크 우선' 전략을 사용합니다.
    event.respondWith(networkFirst(request));
  } else {
    // 그 외 모든 파일(이미지, manifest 등)은 '캐시 우선' 전략을 사용합니다.
    event.respondWith(cacheFirst(request));
  }
});

/**
 * 캐싱 전략 1: 네트워크 우선 (Network First)
 * - 항상 최신 콘텐츠를 보여줘야 하는 HTML 파일에 적합합니다.
 * - 먼저 네트워크에 요청하고, 실패할 경우에만 캐시에서 데이터를 보여줍니다.
 */
async function networkFirst(request) {
  try {
    // 먼저 네트워크로부터 최신 응답을 가져옵니다.
    const networkResponse = await fetch(request);
    
    // 네트워크 요청이 성공하면, 최신 버전으로 캐시를 업데이트합니다.
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // 네트워크 연결이 끊겼거나 서버에 문제가 있을 경우, 캐시에서 파일을 찾아 반환합니다.
    console.warn('[Service Worker] 네트워크 요청 실패. 캐시에서 응답 검색:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse;
  }
}

/**
 * 캐싱 전략 2: 캐시 우선 (Cache First)
 * - 내용이 자주 바뀌지 않는 이미지, 폰트, 아이콘 등에 적합합니다.
 * - 먼저 캐시에서 데이터를 찾고, 없을 경우에만 네트워크에 요청합니다. 로딩 속도가 매우 빠릅니다.
 */
async function cacheFirst(request) {
  // 먼저 캐시에서 요청과 일치하는 응답을 찾습니다.
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // 캐시에 없다면 네트워크로 요청을 보냅니다.
  try {
    const networkResponse = await fetch(request);
    // 네트워크에서 성공적으로 가져왔다면, 다음 사용을 위해 캐시에 저장합니다.
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] 캐시와 네트워크 모두에서 응답 가져오기 실패:', error);
    // 오프라인 대체 페이지나 이미지를 여기서 반환할 수도 있습니다.
  }
}
