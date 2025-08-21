const CACHE_NAME = 'framcart-v1';
const STATIC_CACHE = 'framcart-static-v1';

// Essential files to cache immediately
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching essential files');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('[Service Worker] Essential files cached');
        // Don't skip waiting automatically - let the user decide
        // return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache essential files:', error);
      })
  );
});

// Handle skip waiting message
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skipping waiting...');
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If network fails, serve cached index.html
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Handle static assets (CSS, JS, images, fonts)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.includes('/icons/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // Serve from cache
                return cachedResponse;
              }
              
              // Not in cache, fetch from network
              return fetch(request)
                .then((networkResponse) => {
                  // Cache successful responses
                  if (networkResponse.status === 200) {
                    cache.put(request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(() => {
                  // Network failed, return offline fallback if available
                  console.log('[Service Worker] Network failed for:', request.url);
                  return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                  });
                });
            });
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          if (request.method === 'GET') {
            return caches.match(request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                return new Response(JSON.stringify({ 
                  error: 'Offline', 
                  message: 'No network connection available' 
                }), {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                });
              });
          }
          
          return new Response(JSON.stringify({ 
            error: 'Offline', 
            message: 'No network connection available' 
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Default: try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle background sync for orders
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

// Background sync function for orders
async function syncOrders() {
  console.log('[Service Worker] Syncing orders...');
  
  try {
    // Get pending orders from IndexedDB or cache
    const cache = await caches.open(CACHE_NAME);
    const pendingOrdersResponse = await cache.match('/offline-orders');
    
    if (pendingOrdersResponse) {
      const pendingOrders = await pendingOrdersResponse.json();
      
      for (const order of pendingOrders.orders || []) {
        try {
          // Attempt to sync each order
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(order)
          });
          
          if (response.ok) {
            console.log('[Service Worker] Order synced successfully:', order.id);
            
            // Show notification for successful sync
            self.registration.showNotification('Order Synced', {
              body: `Your order #${order.id} has been processed successfully!`,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png',
              tag: `order-sync-${order.id}`,
              data: { orderId: order.id, url: `/orders/${order.id}` }
            });
          }
        } catch (error) {
          console.error('[Service Worker] Failed to sync order:', error);
        }
      }
      
      // Clear synced orders
      await cache.delete('/offline-orders');
    }
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  let notificationData = {
    title: 'FramCart',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: { url: '/' },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        data: pushData.data || notificationData.data,
        tag: pushData.tag || 'general',
        requireInteraction: pushData.requireInteraction || false
      };
    } catch (error) {
      console.error('[Service Worker] Failed to parse push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      actions: notificationData.actions,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});