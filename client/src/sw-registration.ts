// Service Worker Registration for FramCart PWA

export function registerServiceWorker() {
  // Check for service worker support
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW Registration] Service workers are not supported in this browser.');
    return;
  }

  // Check for secure context (HTTPS or localhost)
  if (!isSecureContext) {
    console.warn('[SW Registration] Service workers require a secure context (HTTPS).');
    return;
  }

  // Wait for page load to avoid interfering with initial page rendering
  if (document.readyState === 'loading') {
    window.addEventListener('load', initializeServiceWorker);
  } else {
    initializeServiceWorker();
  }
}

async function initializeServiceWorker() {
  try {
    console.log('[SW Registration] Initializing service worker...');

    // Check if there's already a service worker registered
    const existingRegistration = await navigator.serviceWorker.getRegistration();
    
    if (existingRegistration) {
      console.log('[SW Registration] Existing registration found:', existingRegistration);
      handleExistingRegistration(existingRegistration);
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
      // Enable update checks on navigation
      updateViaCache: 'none'
    });

    console.log('[SW Registration] Service worker registered successfully:', registration);

    // Set up event listeners for the registration
    setupRegistrationListeners(registration);

    // Handle initial state
    handleInitialState(registration);

    // Set up periodic update checks (with better timing)
    setupPeriodicUpdates(registration);

    // Handle browser-specific behaviors
    handleBrowserSpecificBehaviors(registration);

  } catch (error) {
    console.error('[SW Registration] Service worker registration failed:', error);
    handleRegistrationError(error);
  }
}

function handleExistingRegistration(registration: ServiceWorkerRegistration) {
  // Check if the existing registration needs updating
  if (registration.waiting) {
    console.log('[SW Registration] Service worker waiting to activate');
    showUpdateNotification(registration.waiting);
  }

  if (registration.installing) {
    console.log('[SW Registration] Service worker installing');
    trackInstallProgress(registration.installing);
  }
}

function setupRegistrationListeners(registration: ServiceWorkerRegistration) {
  // Handle service worker updates
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    
    if (newWorker) {
      console.log('[SW Registration] New service worker installing...');
      trackInstallProgress(newWorker);
    }
  });

  // Listen for service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[SW Registration] Message from service worker:', event.data);
    handleServiceWorkerMessage(event.data);
  });

  // Handle service worker controller changes
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW Registration] Service worker controller changed');
    handleControllerChange();
  });

  // Handle service worker errors
  navigator.serviceWorker.addEventListener('error', (event) => {
    console.error('[SW Registration] Service worker error:', event);
  });
}

function trackInstallProgress(worker: ServiceWorker) {
  worker.addEventListener('statechange', () => {
    console.log('[SW Registration] Service worker state changed to:', worker.state);
    
    switch (worker.state) {
      case 'installed':
        if (navigator.serviceWorker.controller) {
          // New update available
          console.log('[SW Registration] New content available');
          showUpdateNotification(worker);
        } else {
          // Content is cached for the first time
          console.log('[SW Registration] Content cached for offline use');
          showOfflineReadyNotification();
        }
        break;
        
      case 'activated':
        console.log('[SW Registration] Service worker activated');
        break;
        
      case 'redundant':
        console.log('[SW Registration] Service worker became redundant');
        break;
    }
  });
}

function handleInitialState(registration: ServiceWorkerRegistration) {
  if (registration.active && !navigator.serviceWorker.controller) {
    // Service worker is active but not controlling the page
    console.log('[SW Registration] Service worker active but not controlling page');
  }

  if (registration.waiting) {
    // There's a waiting service worker
    console.log('[SW Registration] Service worker waiting');
    showUpdateNotification(registration.waiting);
  }
}

function setupPeriodicUpdates(registration: ServiceWorkerRegistration) {
  // Check for updates when the page becomes visible (user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('[SW Registration] Page became visible, checking for updates');
      registration.update().catch((error) => {
        console.error('[SW Registration] Update check failed:', error);
      });
    }
  });

  // Periodic update checks (less frequent to avoid performance impact)
  const updateInterval = setInterval(() => {
    registration.update().catch((error) => {
      console.error('[SW Registration] Periodic update check failed:', error);
    });
  }, 5 * 60 * 1000); // Check every 5 minutes

  // Clean up interval when page unloads
  window.addEventListener('beforeunload', () => {
    clearInterval(updateInterval);
  });
}

function handleBrowserSpecificBehaviors(registration: ServiceWorkerRegistration) {
  // Safari-specific handling
  if (isSafari()) {
    console.log('[SW Registration] Safari browser detected, applying specific behaviors');
    
    // Safari sometimes doesn't fire updatefound event
    setTimeout(() => {
      registration.update().catch((error) => {
        console.error('[SW Registration] Safari update check failed:', error);
      });
    }, 1000);
  }

  // Firefox-specific handling
  if (isFirefox()) {
    console.log('[SW Registration] Firefox browser detected');
    // Firefox handles service workers well, no special handling needed
  }

  // Chrome/Edge-specific handling
  if (isChromium()) {
    console.log('[SW Registration] Chromium-based browser detected');
    // Enable background sync if supported
    if ('sync' in window.ServiceWorkerRegistration.prototype) {
      console.log('[SW Registration] Background sync supported');
    }
  }
}

function handleServiceWorkerMessage(data: any) {
  switch (data.type) {
    case 'CACHE_UPDATED':
      showUpdateNotification();
      break;
    case 'OFFLINE_READY':
      showOfflineReadyNotification();
      break;
    case 'UPDATE_AVAILABLE':
      showUpdateNotification();
      break;
    default:
      console.log('[SW Registration] Unknown message type:', data.type);
  }
}

function handleControllerChange() {
  // Don't reload immediately to avoid disrupting user experience
  const shouldReload = confirm('A new version of the app is available. Would you like to reload to get the latest features?');
  
  if (shouldReload) {
    window.location.reload();
  }
}

function handleRegistrationError(error: any) {
  // Handle different types of registration errors
  if (error.name === 'SecurityError') {
    console.error('[SW Registration] Security error - ensure HTTPS is used');
  } else if (error.name === 'NetworkError') {
    console.error('[SW Registration] Network error - check service worker file exists');
  } else {
    console.error('[SW Registration] Unknown registration error:', error);
  }
}

// Browser detection utilities
function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function isFirefox(): boolean {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

function isChromium(): boolean {
  return !!(window as any).chrome;
}

// Enhanced update notification that can work with a specific worker
function showUpdateNotification(worker?: ServiceWorker) {
  // Remove any existing notification
  const existing = document.getElementById('sw-update-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #16a34a;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    max-width: 320px;
    cursor: pointer;
    transition: transform 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div>
        <strong>Update Available!</strong><br>
        <small>Click to refresh and get the latest features</small>
      </div>
      <div style="margin-left: 12px; font-size: 18px;">🔄</div>
    </div>
  `;

  notification.onclick = () => {
    if (worker && worker.state === 'installed') {
      // Tell the waiting service worker to skip waiting and become active
      worker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  document.body.appendChild(notification);

  // Auto-remove after 15 seconds
  setTimeout(() => {
    if (document.getElementById('sw-update-notification')) {
      notification.remove();
    }
  }, 15000);
}

// Show offline ready notification
function showOfflineReadyNotification() {
  console.log('[SW Registration] App is ready for offline use');
  
  // Optional: Show a subtle notification that the app is now available offline
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: #059669;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  notification.textContent = '✓ App is ready for offline use';
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Check if the app is running in standalone mode (installed as PWA)
export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
}

// Get installation prompt
export function getInstallPrompt() {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] Install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button or notification
    showInstallPrompt(deferredPrompt);
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App was installed');
    deferredPrompt = null;
  });
}

// Show install prompt to user
function showInstallPrompt(deferredPrompt: any) {
  if (isStandalone()) {
    return; // Already installed
  }

  const installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #16a34a, #059669);
    color: white;
    padding: 16px 20px;
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    transform: translateY(100%);
    transition: transform 0.3s ease;
  `;
  
  installBanner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
      <div>
        <strong>Install FramCart</strong><br>
        <small>Add to your home screen for a better experience</small>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <button id="pwa-install-btn" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Install</button>
        <button id="pwa-dismiss-btn" style="
          background: none;
          border: none;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          font-size: 24px;
          padding: 4px;
        ">×</button>
      </div>
    </div>
  `;

  document.body.appendChild(installBanner);

  // Animate in
  setTimeout(() => {
    installBanner.style.transform = 'translateY(0)';
  }, 100);

  // Handle install button click
  document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User response to install prompt:', outcome);
    installBanner.remove();
  });

  // Handle dismiss button click
  document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
    installBanner.style.transform = 'translateY(100%)';
    setTimeout(() => {
      installBanner.remove();
    }, 300);
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.getElementById('pwa-install-banner')) {
      installBanner.style.transform = 'translateY(100%)';
      setTimeout(() => {
        installBanner.remove();
      }, 300);
    }
  }, 10000);
}