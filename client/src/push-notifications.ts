// Push Notifications and Background Sync for FramCart

// Type declarations for Background Sync API and enhanced Notifications
declare global {
  interface ServiceWorkerRegistration {
    sync: SyncManager;
  }
  
  interface SyncManager {
    register(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  }
  
  interface NotificationOptions {
    vibrate?: number[] | number;
    actions?: NotificationAction[];
  }
  
  interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
  }
}

// Types for offline orders
interface OfflineOrder {
  id: string;
  timestamp: string;
  synced: boolean;
  [key: string]: unknown;
}

interface OfflineOrdersCache {
  orders: OfflineOrder[];
}

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// VAPID keys for push notifications (these should be generated and stored securely)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Initialize push notifications
export async function initializePushNotifications() {
  console.log('[Push Notifications] Initializing...');

  // Check for notification support
  if (!('Notification' in window)) {
    console.warn('[Push Notifications] This browser does not support notifications');
    return;
  }

  // Check for service worker support
  if (!('serviceWorker' in navigator)) {
    console.warn('[Push Notifications] Service workers not supported');
    return;
  }

  // Check for push manager support
  if (!('PushManager' in window)) {
    console.warn('[Push Notifications] Push messaging not supported');
    return;
  }

  try {
    // Request notification permission
    const permission = await requestNotificationPermission();
    
    if (permission === 'granted') {
      console.log('[Push Notifications] Permission granted');
      await subscribeToPush();
    } else {
      console.log('[Push Notifications] Permission denied or dismissed');
    }
  } catch (error) {
    console.error('[Push Notifications] Initialization failed:', error);
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  console.log('[Push Notifications] Requesting permission...');
  
  // Check current permission status
  if (Notification.permission === 'granted') {
    console.log('[Push Notifications] Permission already granted');
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    console.log('[Push Notifications] Permission denied');
    return 'denied';
  }

  // Request permission
  try {
    const permission = await Notification.requestPermission();
    console.log('[Push Notifications] Permission result:', permission);
    return permission;
  } catch (error) {
    console.error('[Push Notifications] Permission request failed:', error);
    return 'denied';
  }
}

// Subscribe to push notifications
export async function subscribeToPush(): Promise<PushSubscription | null> {
  console.log('[Push Notifications] Subscribing to push...');

  if (!VAPID_PUBLIC_KEY) {
    console.warn('[Push Notifications] VAPID public key not configured');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('[Push Notifications] Existing subscription found');
      await storePushSubscription(subscription);
      return subscription;
    }

    // Create new subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log('[Push Notifications] New subscription created');
    
    // Store subscription in Supabase
    await storePushSubscription(subscription);
    
    return subscription;
  } catch (error) {
    console.error('[Push Notifications] Subscription failed:', error);
    return null;
  }
}

// Store push subscription in Supabase
export async function storePushSubscription(subscription: PushSubscription): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Push Notifications] Supabase not configured, storing locally');
    localStorage.setItem('push-subscription', JSON.stringify(subscription.toJSON()));
    return;
  }

  try {
    const subscriptionData = subscription.toJSON();
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys?.p256dh,
        auth: subscriptionData.keys?.auth,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log('[Push Notifications] Subscription stored in Supabase');
    } else {
      console.error('[Push Notifications] Failed to store subscription in Supabase:', response.statusText);
      // Fallback to local storage
      localStorage.setItem('push-subscription', JSON.stringify(subscriptionData));
    }
  } catch (error) {
    console.error('[Push Notifications] Error storing subscription:', error);
    // Fallback to local storage
    localStorage.setItem('push-subscription', JSON.stringify(subscription.toJSON()));
  }
}

// Remove push subscription from Supabase
export async function removePushSubscription(subscription: PushSubscription): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    localStorage.removeItem('push-subscription');
    return;
  }

  try {
    const subscriptionData = subscription.toJSON();
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(subscriptionData.endpoint || '')}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (response.ok) {
      console.log('[Push Notifications] Subscription removed from Supabase');
    } else {
      console.error('[Push Notifications] Failed to remove subscription from Supabase:', response.statusText);
    }
  } catch (error) {
    console.error('[Push Notifications] Error removing subscription:', error);
  }
  
  localStorage.removeItem('push-subscription');
}

// Register background sync for orders
export async function registerBackgroundSync(): Promise<void> {
  console.log('[Background Sync] Initializing...');

  if (!('serviceWorker' in navigator)) {
    console.warn('[Background Sync] Service workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if background sync is supported
    if (!('sync' in registration)) {
      console.warn('[Background Sync] Background sync not supported');
      return;
    }
    
    // Register sync event for orders
    await registration.sync.register('sync-orders');
    console.log('[Background Sync] Registered sync-orders');
  } catch (error) {
    console.error('[Background Sync] Registration failed:', error);
  }
}

// Store order for background sync when offline
export async function storeOrderForSync(orderData: Record<string, unknown>): Promise<void> {
  console.log('[Background Sync] Storing order for sync:', orderData);

  try {
    const cache = await caches.open('framcart-v1');
    const existingOrdersResponse = await cache.match('/offline-orders');
    
    let offlineOrders: OfflineOrdersCache = { orders: [] };
    if (existingOrdersResponse) {
      offlineOrders = await existingOrdersResponse.json();
    }

    // Add new order
    const newOrder: OfflineOrder = {
      ...orderData,
      id: `offline-${Date.now()}`,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    offlineOrders.orders.push(newOrder);

    // Store updated orders
    await cache.put('/offline-orders', new Response(JSON.stringify(offlineOrders), {
      headers: { 'Content-Type': 'application/json' }
    }));

    // Trigger background sync
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await registration.sync.register('sync-orders');
      }
    }

    console.log('[Background Sync] Order stored for sync');
  } catch (error) {
    console.error('[Background Sync] Failed to store order:', error);
  }
}

// Send test notification
export async function sendTestNotification(): Promise<void> {
  if (Notification.permission !== 'granted') {
    console.warn('[Push Notifications] Notification permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification('FramCart Test', {
      body: 'Push notifications are working!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: { url: '/' },
      actions: [
        {
          action: 'view',
          title: 'View App',
          icon: '/icons/icon-72x72.png'
        }
      ]
    });

    console.log('[Push Notifications] Test notification sent');
  } catch (error) {
    console.error('[Push Notifications] Test notification failed:', error);
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Get current push subscription status
export async function getPushSubscriptionStatus(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  subscription?: PushSubscription;
}> {
  const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  
  if (!supported) {
    return { supported: false, permission: 'denied', subscribed: false };
  }

  const permission = Notification.permission;
  
  if (permission !== 'granted') {
    return { supported, permission, subscribed: false };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return {
      supported,
      permission,
      subscribed: !!subscription,
      subscription: subscription || undefined
    };
  } catch (error) {
    console.error('[Push Notifications] Status check failed:', error);
    return { supported, permission, subscribed: false };
  }
}