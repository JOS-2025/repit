// Service Worker Registration for FramCart PWA

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        console.log('[SW Registration] Starting service worker registration...');
        
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });

        console.log('[SW Registration] Service worker registered successfully:', registration);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            console.log('[SW Registration] New service worker installing...');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  console.log('[SW Registration] New content available, please refresh.');
                  
                  // Show update notification to user
                  showUpdateNotification();
                } else {
                  // Content is cached for the first time
                  console.log('[SW Registration] Content cached for offline use.');
                  showOfflineReadyNotification();
                }
              }
            });
          }
        });

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[SW Registration] Message from service worker:', event.data);
          
          if (event.data.type === 'CACHE_UPDATED') {
            showUpdateNotification();
          }
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

      } catch (error) {
        console.error('[SW Registration] Service worker registration failed:', error);
      }
    });

    // Handle service worker controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Registration] Service worker controller changed, reloading...');
      window.location.reload();
    });
  } else {
    console.warn('[SW Registration] Service workers are not supported in this browser.');
  }
}

// Show update notification to user
function showUpdateNotification() {
  // Create a simple notification div
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
    window.location.reload();
  };

  document.body.appendChild(notification);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById('sw-update-notification')) {
      notification.remove();
    }
  }, 10000);
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