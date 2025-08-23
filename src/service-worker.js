// Service Worker for FramCart PWA

const CACHE_NAME = 'framcart-v1.2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js', 
  '/static/css/main.css',
  '/manifest.json',
  '/src/App.jsx',
  '/src/main.jsx',
  '/src/index.css'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching essential files');
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('[Service Worker] Essential files cached');
          })
          .catch((error) => {
            console.error('[Service Worker] Failed to cache essential files:', error);
          });
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page or error response
            if (event.request.destination === 'document') {
              console.log('[Service Worker] Network failed for:', event.request.url);
              return new Response(
                JSON.stringify({
                  error: 'Offline', 
                  message: 'Please check your internet connection'
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            return new Response(
              JSON.stringify({
                error: 'Offline', 
                message: 'Resource not available offline'
              }),
              {
                status: 503,
                statusText: 'Service Unavailable', 
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
      })
  );
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncOrders());
  }
});

// Sync offline orders when connection is restored
async function syncOrders() {
  console.log('[Service Worker] Syncing orders...');
  try {
    // Get offline orders from IndexedDB or localStorage
    const offlineOrders = JSON.parse(localStorage.getItem('offlineOrders') || '[]');
    
    for (const order of offlineOrders) {
      try {
        const response = await fetch('/api/orders/simple', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          console.log('[Service Worker] Order synced successfully:', order.id);
          // Remove from offline storage
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

// Push notification event with enhanced data handling
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'FramCart',
    body: 'New update from FramCart!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'framcart-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Orders'
      },
      {
        action: 'dismiss', 
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('[Service Worker] Failed to parse push data:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Enhanced notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const notification = event.notification;
  
  if (action === 'view') {
    event.waitUntil(
      clients.openWindow('/orders')
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open main page
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skipping waiting...');
    self.skipWaiting();
  }
});