import React from 'react';

const NotificationBanner = () => {
  return (
    <div style={{ 
      backgroundColor: '#fef3c7', 
      border: '1px solid #f59e0b', 
      padding: '1rem', 
      margin: '1rem',
      borderRadius: '4px'
    }}>
      <p>🔔 Push notifications will be implemented here for order updates and farmer alerts.</p>
    </div>
  );
};

export default NotificationBanner;