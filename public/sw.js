// MedXpressCare - Progressive Web App (PWA) Service Worker
// Version: v1.0.0

const CACHE_NAME = 'medxpresscare-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
  '/logo-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png',
  '/apple-touch-icon.png'
];

// Install Event: Pre-cache essential app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache warning (some assets may load dynamically):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[PWA SW] Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Smart Caching Strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only handle GET requests with HTTP/HTTPS
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // 2. Bypass Service Worker for external APIs, D1 backend, AI consultation endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('workers.dev') ||
    url.hostname.includes('generativelanguage.googleapis.com') ||
    url.hostname.includes('api.telegram.org') ||
    url.hostname.includes('api.qrserver.com')
  ) {
    return;
  }

  // 3. Navigation requests (HTML pages): Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 4. Static assets (JS, CSS, Images, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request fails, do nothing; cachedResponse will serve
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for message events (e.g. skip waiting when user accepts update)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ===================================================================
// CLOUDFLARE WEB PUSH NOTIFICATION HANDLERS (RFC 8030 / RFC 8292)
// Hỗ trợ Nhắc uống thuốc, Nhắc tái đặt hàng trước 2-3 ngày, Đơn hàng & Ưu đãi
// ===================================================================

self.addEventListener('push', (event) => {
  console.log('[PWA SW] Received push event from Cloudflare Workers');

  let payload = {
    title: 'MedXpressCare - Dược Sĩ Trực Tuyến',
    body: 'Bạn có thông báo mới về sức khỏe và đơn hàng.',
    icon: '/pwa-192x192.png',
    badge: '/favicon.png',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (e) {
      const text = event.data.text();
      if (text) payload.body = text;
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/favicon.png',
    image: payload.image || null,
    vibrate: [150, 80, 150],
    tag: payload.tag || ('medxpress-' + Date.now()),
    renotify: true,
    data: payload.data || { url: payload.url || '/' },
    actions: payload.actions || [
      { action: 'open', title: 'Xem Chi Tiết 🔍' },
      { action: 'close', title: 'Đóng' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  if (action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Nếu app đang mở, focus vào và chuyển hướng
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Nếu app chưa mở, mở cửa sổ mới
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
