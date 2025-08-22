// Frontend security utilities for FramCart

// XSS protection for user-generated content
export const sanitizeHtml = (html: string): string => {
  // Create a temporary div to sanitize HTML
  const tempDiv = document.createElement('div');
  tempDiv.textContent = html;
  return tempDiv.innerHTML;
};

// Input validation utilities
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },
  
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  price: (price: string): boolean => {
    const priceNum = parseFloat(price);
    return !isNaN(priceNum) && priceNum > 0;
  },
  
  quantity: (quantity: string): boolean => {
    const quantityNum = parseInt(quantity);
    return !isNaN(quantityNum) && quantityNum > 0;
  }
};

// Safe data handling for forms
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove potential script tags and sanitize
      sanitized[key] = value
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Content Security Policy helper
export const isSecureUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['https:', 'http:'].includes(urlObj.protocol) && 
           !url.includes('javascript:') && 
           !url.includes('data:');
  } catch {
    return false;
  }
};

// Rate limiting detection on frontend
let requestCount = 0;
let requestResetTime = Date.now() + 60000; // 1 minute window

export const checkRateLimit = (): boolean => {
  const now = Date.now();
  
  if (now > requestResetTime) {
    requestCount = 0;
    requestResetTime = now + 60000;
  }
  
  requestCount++;
  
  // Warning at 80% of likely server limit
  if (requestCount > 80) {
    console.warn('Approaching rate limit. Please slow down requests.');
    return false;
  }
  
  return true;
};

// Secure local storage wrapper
export const secureStorage = {
  set: (key: string, value: any): void => {
    try {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
      const data = {
        value,
        timestamp: Date.now(),
        checksum: btoa(JSON.stringify(value)).slice(0, 10)
      };
      localStorage.setItem(`framcart_${sanitizedKey}`, JSON.stringify(data));
    } catch (error) {
      console.error('Secure storage set failed:', error);
    }
  },
  
  get: (key: string): any => {
    try {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
      const stored = localStorage.getItem(`framcart_${sanitizedKey}`);
      
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      const expectedChecksum = btoa(JSON.stringify(data.value)).slice(0, 10);
      
      // Verify data integrity
      if (data.checksum !== expectedChecksum) {
        console.warn('Data integrity check failed, removing corrupted data');
        localStorage.removeItem(`framcart_${sanitizedKey}`);
        return null;
      }
      
      // Check if data is too old (30 days)
      if (Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`framcart_${sanitizedKey}`);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.error('Secure storage get failed:', error);
      return null;
    }
  },
  
  remove: (key: string): void => {
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
    localStorage.removeItem(`framcart_${sanitizedKey}`);
  },
  
  clear: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('framcart_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Error handling that doesn't expose sensitive information
export const safeErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    // Filter out sensitive information
    const message = error.message.toLowerCase();
    if (message.includes('password') || 
        message.includes('token') || 
        message.includes('key') ||
        message.includes('secret')) {
      return 'Authentication error occurred';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// CSRF token management
export const csrfToken = {
  get: (): string | null => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
  },
  
  addToHeaders: (headers: Record<string, string> = {}): Record<string, string> => {
    const token = csrfToken.get();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  }
};