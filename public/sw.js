// 南寮魚鱗天梯｜Service Worker（PWA 離線快取）
// 快取版本更新時，請遞增 CACHE_VERSION 以觸發重新預快取
const CACHE_VERSION = 'yulintianti-v2';
const CACHE = CACHE_VERSION;

// 離線時的最終回退頁
const OFFLINE_URL = '/offline/';

// 啟動時預先快取的核心頁面與資源（保持精簡，避免撐爆快取）
const PRECACHE = [
  '/',
  '/index.html',
  '/offline/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/logo.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        // 個別資源失敗不得讓整批預快取失敗
        Promise.all(
          PRECACHE.map((url) =>
            cache.add(url).catch(() => undefined)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 頁面導覽：網路優先，離線時回退到快取頁面或離線頁
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match(OFFLINE_URL) || caches.match('/'))
        )
    );
    return;
  }

  // 靜態資源（圖片／CSS／JS）：快取優先，背景更新
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
