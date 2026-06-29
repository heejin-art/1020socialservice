// 머니코스 Service Worker — basePath(서브경로) 환경에서도 동작하도록 scope 기준 상대 처리
const VERSION = "moneycourse-v2";
// 등록 scope 기준 베이스 경로 (예: "/1020socialservice/" 또는 "/")
const BASE = new URL(self.registration.scope).pathname;
const APP_SHELL = [BASE, BASE + "offline/", BASE + "manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith("http")) return;

  const url = new URL(request.url);

  // 페이지 이동: 네트워크 우선, 실패 시 캐시 → 오프라인 폴백
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match(BASE + "offline/") || caches.match(BASE))
        )
    );
    return;
  }

  // 정적 자산: stale-while-revalidate
  if (url.origin === self.location.origin || url.hostname.includes("jsdelivr")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
