// Privacy and anonymity utilities for FramCart
// Provides data minimization, anonymization, and privacy protection

/**
 * Generate anonymous session identifier
 */
export const generateAnonymousId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `anon_${timestamp}_${random}`;
};

/**
 * Anonymize IP address by masking last octet
 */
export const anonymizeIP = (ip: string): string => {
  if (!ip || ip === 'unknown') return 'unknown';
  
  // IPv4 anonymization
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }
  
  // IPv6 anonymization
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return `${parts[0]}:${parts[1]}:${parts[2]}:xxxx::`;
    }
  }
  
  return 'anonymized';
};

/**
 * Anonymize user agent string
 */
export const anonymizeUserAgent = (userAgent: string): string => {
  if (!userAgent) return 'unknown';
  
  // Extract only browser family and major version
  const browserPattern = /(Chrome|Firefox|Safari|Edge)\/(\d+)/i;
  const match = userAgent.match(browserPattern);
  
  if (match) {
    return `${match[1]}/${match[2]}.x`;
  }
  
  return 'Browser/Unknown';
};

/**
 * Data minimization for user profiles
 */
export const minimizeUserData = (userData: any) => {
  return {
    id: userData.id,
    firstName: userData.firstName,
    // Remove sensitive data
    email: userData.email ? `${userData.email.substring(0, 3)}***@***` : null,
    profileImageUrl: userData.profileImageUrl,
    farmer: userData.farmer,
    // Remove timestamps and tracking data
    createdAt: null,
    updatedAt: null,
  };
};

/**
 * Anonymous session storage
 */
export const anonymousStorage = {
  set(key: string, value: any, expiryMinutes: number = 60): void {
    const expiry = Date.now() + (expiryMinutes * 60 * 1000);
    const data = {
      value,
      expiry,
      anonymous: true
    };
    
    try {
      sessionStorage.setItem(`anon_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Anonymous storage failed:', error);
    }
  },
  
  get(key: string): any {
    try {
      const item = sessionStorage.getItem(`anon_${key}`);
      if (!item) return null;
      
      const data = JSON.parse(item);
      
      // Check expiry
      if (Date.now() > data.expiry) {
        sessionStorage.removeItem(`anon_${key}`);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.warn('Anonymous storage retrieval failed:', error);
      return null;
    }
  },
  
  remove(key: string): void {
    sessionStorage.removeItem(`anon_${key}`);
  },
  
  clear(): void {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('anon_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

/**
 * Anonymous cart management
 */
export const anonymousCart = {
  add(productId: string, quantity: number): void {
    const cart = anonymousStorage.get('cart') || [];
    const existingItem = cart.find((item: any) => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ 
        productId, 
        quantity, 
        addedAt: Date.now(),
        sessionId: generateAnonymousId()
      });
    }
    
    anonymousStorage.set('cart', cart, 120); // 2 hour expiry
  },
  
  remove(productId: string): void {
    const cart = anonymousStorage.get('cart') || [];
    const filtered = cart.filter((item: any) => item.productId !== productId);
    anonymousStorage.set('cart', filtered, 120);
  },
  
  get(): any[] {
    return anonymousStorage.get('cart') || [];
  },
  
  clear(): void {
    anonymousStorage.remove('cart');
  },
  
  getTotal(): number {
    const cart = this.get();
    return cart.reduce((total: number, item: any) => total + item.quantity, 0);
  }
};

/**
 * Privacy-safe error logging
 */
export const logPrivacySafeError = (error: Error, context?: any) => {
  const safeLog = {
    message: error.message,
    stack: error.stack?.split('\n')[0], // Only first line
    timestamp: Date.now(),
    userAgent: anonymizeUserAgent(navigator.userAgent),
    context: context ? sanitizeLogContext(context) : null
  };
  
  console.error('[Privacy-Safe Error]', safeLog);
  return safeLog;
};

/**
 * Sanitize logging context to remove sensitive data
 */
const sanitizeLogContext = (context: any): any => {
  if (!context || typeof context !== 'object') return context;
  
  const sanitized = { ...context };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'email', 'phone', 'address', 'ip'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Generate anonymous review ID
 */
export const generateAnonymousReviewId = (): string => {
  return `review_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Anonymous feedback system
 */
export const anonymousFeedback = {
  submit(feedback: {
    type: 'bug' | 'suggestion' | 'review';
    content: string;
    rating?: number;
    productId?: string;
  }): void {
    const anonymousFeedback = {
      ...feedback,
      id: generateAnonymousReviewId(),
      timestamp: Date.now(),
      sessionId: generateAnonymousId(),
      // No user identification
    };
    
    // Store locally for now (could send to anonymous endpoint)
    const existingFeedback = anonymousStorage.get('feedback') || [];
    existingFeedback.push(anonymousFeedback);
    anonymousStorage.set('feedback', existingFeedback, 1440); // 24 hour expiry
    
    console.log('[Anonymous Feedback]', 'Feedback submitted anonymously');
  },
  
  get(): any[] {
    return anonymousStorage.get('feedback') || [];
  }
};

/**
 * Privacy settings manager
 */
export const privacySettings = {
  get(): {
    allowAnalytics: boolean;
    allowPersonalization: boolean;
    allowMarketingEmails: boolean;
    anonymousBrowsing: boolean;
  } {
    return {
      allowAnalytics: localStorage.getItem('privacy_analytics') !== 'false',
      allowPersonalization: localStorage.getItem('privacy_personalization') !== 'false',
      allowMarketingEmails: localStorage.getItem('privacy_marketing') !== 'false',
      anonymousBrowsing: localStorage.getItem('privacy_anonymous') === 'true',
    };
  },
  
  set(settings: Partial<{
    allowAnalytics: boolean;
    allowPersonalization: boolean;
    allowMarketingEmails: boolean;
    anonymousBrowsing: boolean;
  }>): void {
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(`privacy_${key.replace('allow', '').toLowerCase()}`, String(value));
    });
    
    // Clear data if anonymous mode enabled
    if (settings.anonymousBrowsing) {
      this.enableAnonymousMode();
    }
  },
  
  enableAnonymousMode(): void {
    // Clear tracking data
    anonymousStorage.clear();
    
    // Clear non-essential cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (!name.startsWith('session') && !name.startsWith('auth')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
    
    console.log('[Privacy]', 'Anonymous mode enabled');
  }
};

/**
 * Check if user is in anonymous browsing mode
 */
export const isAnonymousBrowsing = (): boolean => {
  return privacySettings.get().anonymousBrowsing;
};