// Client-side security utilities for FramCart
// Provides input sanitization, validation helpers, and auth guards

/**
 * Sanitize text input to prevent XSS
 */
export const sanitizeText = (input: string | null | undefined): string => {
  if (!input) return '';
  return String(input)
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .substring(0, 1000); // Limit length
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Sanitize and validate product data
 */
export const sanitizeProductData = (product: any) => {
  return {
    name: sanitizeText(product.name),
    description: sanitizeText(product.description),
    price: Math.max(0, parseFloat(product.price) || 0),
    category: sanitizeText(product.category),
    unit: sanitizeText(product.unit),
    quantity: Math.max(0, parseInt(product.quantity) || 0)
  };
};

/**
 * Validate order data before submission
 */
export const validateOrderData = (order: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  }
  
  if (!order.deliveryAddress || typeof order.deliveryAddress !== 'string') {
    errors.push('Delivery address is required');
  }
  
  // Validate each item
  order.items?.forEach((item: any, index: number) => {
    if (!item.productId || typeof item.productId !== 'string') {
      errors.push(`Item ${index + 1}: Product ID is required`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Valid quantity is required`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Rate limiting helper for client-side actions
 */
class RateLimiter {
  private actions: Map<string, number[]> = new Map();
  
  isAllowed(action: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = action;
    
    if (!this.actions.has(key)) {
      this.actions.set(key, []);
    }
    
    const timestamps = this.actions.get(key)!;
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(time => now - time < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.actions.set(key, validTimestamps);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Secure local storage with encryption-like obfuscation
 */
export const secureStorage = {
  set(key: string, value: any): void {
    try {
      const encoded = btoa(JSON.stringify(value));
      localStorage.setItem(`fc_${key}`, encoded);
    } catch (error) {
      console.warn('Failed to store data securely:', error);
    }
  },
  
  get(key: string): any {
    try {
      const item = localStorage.getItem(`fc_${key}`);
      if (!item) return null;
      return JSON.parse(atob(item));
    } catch (error) {
      console.warn('Failed to retrieve data securely:', error);
      return null;
    }
  },
  
  remove(key: string): void {
    localStorage.removeItem(`fc_${key}`);
  },
  
  clear(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('fc_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

/**
 * Content Security Policy validation helper
 */
export const validateCSPCompliance = (element: HTMLElement): boolean => {
  // Check for inline scripts or styles that violate CSP
  const inlineScript = element.getAttribute('onclick') || 
                      element.getAttribute('onload') || 
                      element.getAttribute('onerror');
                      
  if (inlineScript) {
    console.warn('CSP violation: inline event handlers detected');
    return false;
  }
  
  return true;
};

/**
 * File upload security validation
 */
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only image files (JPEG, PNG, WebP, GIF) are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }
  
  // Check for suspicious file names
  if (/[<>:"/\\|?*\x00-\x1f]/.test(file.name)) {
    return { valid: false, error: 'Invalid file name' };
  }
  
  return { valid: true };
};

/**
 * URL validation helper
 */
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Input length validation
 */
export const validateLength = (input: string, min: number = 0, max: number = 1000): boolean => {
  return input.length >= min && input.length <= max;
};