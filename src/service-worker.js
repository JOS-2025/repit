/* FramCart PWA Service Worker - Hardened v2 */
const VERSION = 'framcart-v2';
const APP_SHELL = [
  '/', 
  '/index.html', 
  '/manifest.json',
  '/icons/icon-192x192.png', 
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installing hardened v2...');
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activating hardened v2...');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== VERSION ? caches.delete(k) : null)))
    )
  );
});

// Never cache auth or sensitive API requests; network-only for security
const isSensitive = (url) =>
  url.pathname.startsWith('/auth') ||
  url.pathname.startsWith('/api/auth') ||
  url.pathname.startsWith('/api/secure') ||
  url.pathname.startsWith('/api/admin') ||
  url.pathname.startsWith('/api/orders') ||
  url.pathname.startsWith('/api/payments') ||
  url.hostname.includes('replit.com');

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Bypass cache for non-GET requests or sensitive endpoints
  if (e.request.method !== 'GET' || isSensitive(url)) {
    e.respondWith(fetch(e.request)); // always network-only
    return;
  }

  // Cache-first for app shell; network with cache-fallback for others
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then((resp) => {
        // Only cache successful, same-origin GETs
        if (resp.ok && url.origin === location.origin) {
          const clone = resp.clone();
          caches.open(VERSION).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// Enhanced push notifications with security validation
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
      // Basic validation to prevent malicious payloads
      if (typeof data.title !== 'string') data.title = 'FramCart';
      if (typeof data.body !== 'string') data.body = 'New update';
      // Sanitize strings
      data.title = data.title.substring(0, 100);
      data.body = data.body.substring(0, 300);
    } catch (error) {
      console.warn('[Service Worker] Invalid push data:', error);
      data = { title: 'FramCart', body: 'New update' };
    }
  }
  
  const title = data.title || 'FramCart';
  const options = {
    body: data.body || 'New update from your farm marketplace',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'framcart-notification',
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  let targetUrl = '/';
  
  if (action === 'view') {
    targetUrl = '/orders';
  } else if (action === 'dismiss') {
    return; // Just close
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background sync for offline functionality  
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOfflineOrders());
  }
});

// Secure offline order sync
async function syncOfflineOrders() {
  try {
    const offlineOrders = JSON.parse(localStorage.getItem('offlineOrders') || '[]');
    
    for (const order of offlineOrders) {
      try {
        // Validate order data before sending
        if (!order.id || !order.items || !Array.isArray(order.items)) {
          console.warn('[Service Worker] Invalid offline order data:', order);
          continue;
        }
        
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          // Remove successfully synced order
          const updatedOrders = offlineOrders.filter(o => o.id !== order.id);
          localStorage.setItem('offlineOrders', JSON.stringify(updatedOrders));
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync order:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});