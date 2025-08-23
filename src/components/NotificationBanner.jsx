import React, { useState, useEffect } from 'react';

const NotificationBanner = () => {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const enableNotifications = async () => {
    if (!isSupported) {
      alert('Notifications are not supported in this browser.');
      return;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        // Register service worker for push notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service Worker registered for notifications:', registration);
          
          // Show confirmation notification
          if (registration.active) {
            registration.showNotification('FramCart Notifications Enabled!', {
              body: 'You will now receive updates about your orders and new products.',
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-192x192.png',
              tag: 'welcome-notification',
              requireInteraction: false
            });
          }
        }
      } else if (permission === 'denied') {
        alert('Notifications blocked. You can enable them in your browser settings.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    }
  };

  const testNotification = () => {
    if (notificationPermission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Test Notification', {
          body: 'This is a test notification from FramCart!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: 'test-notification'
        });
      });
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div style={{ 
      backgroundColor: notificationPermission === 'granted' ? '#d1fae5' : '#fef3c7', 
      border: `1px solid ${notificationPermission === 'granted' ? '#10b981' : '#f59e0b'}`, 
      padding: '1rem', 
      margin: '1rem',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.2rem' }}>
          {notificationPermission === 'granted' ? '✅' : '🔔'}
        </span>
        <span style={{ 
          fontSize: '0.9rem',
          color: notificationPermission === 'granted' ? '#065f46' : '#92400e'
        }}>
          {notificationPermission === 'granted' 
            ? 'Notifications enabled! You\'ll receive order updates and farmer alerts.'
            : 'Enable notifications to get real-time updates about your orders and new products.'
          }
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {notificationPermission !== 'granted' && (
          <button
            onClick={enableNotifications}
            style={{
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
          >
            Enable Notifications
          </button>
        )}
        
        {notificationPermission === 'granted' && (
          <button
            onClick={testNotification}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Test Notification
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBanner;