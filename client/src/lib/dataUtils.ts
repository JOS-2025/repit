// Data handling and safety utilities for robust component operation
import React from 'react';

export interface SafeApiResponse<T = any> {
  data?: T;
  success: boolean;
  error?: string;
  message?: string;
}

// Safe data extraction with fallbacks
export const safeGet = <T>(obj: any, path: string, fallback: T): T => {
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return fallback;
      }
      current = current[key];
    }
    
    return current !== undefined && current !== null ? current : fallback;
  } catch {
    return fallback;
  }
};

// Safe array operations
export const safeArray = <T>(data: any, fallback: T[] = []): T[] => {
  if (!data) return fallback;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  return fallback;
};

// Safe number conversion
export const safeNumber = (value: any, fallback: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^-?\d.]/g, ''));
    return !isNaN(parsed) ? parsed : fallback;
  }
  return fallback;
};

// Safe string extraction
export const safeString = (value: any, fallback: string = ''): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return value.toString();
  if (value && typeof value.toString === 'function') return value.toString();
  return fallback;
};

// Safe boolean conversion  
export const safeBool = (value: any, fallback: boolean = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

// Validate required fields
export const validateRequired = (data: Record<string, any>, requiredFields: string[]): string[] => {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    const value = safeGet(data, field, null);
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.push(`${field} is required`);
    }
  });
  
  return errors;
};

// Safe JSON parsing
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) || fallback;
  } catch {
    return fallback;
  }
};

// Safe price formatting
export const formatPrice = (price: any, currency: string = 'KES'): string => {
  const numPrice = safeNumber(price, 0);
  return `${currency} ${numPrice.toFixed(2)}`;
};

// Safe image URL handling
export const safeImageUrl = (images: any, index: number = 0): string => {
  const defaultImage = '/api/placeholder/300/200';
  
  if (!images) return defaultImage;
  if (typeof images === 'string') return images || defaultImage;
  if (Array.isArray(images) && images.length > index) {
    return images[index] || defaultImage;
  }
  
  return defaultImage;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// API response validator
export const validateApiResponse = <T>(response: any): SafeApiResponse<T> => {
  if (!response) {
    return { success: false, error: 'No response received' };
  }
  
  // Handle different response structures
  if (response.success !== undefined) {
    return {
      success: safeBool(response.success),
      data: response.data,
      error: response.error,
      message: response.message
    };
  }
  
  // Assume success if we have data and no explicit error
  const hasData = response.data !== undefined || 
                 response.items !== undefined || 
                 response.results !== undefined ||
                 (Array.isArray(response) && response.length >= 0);
  
  return {
    success: hasData && !response.error,
    data: response.data || response.items || response.results || response,
    error: response.error || response.message,
    message: response.message
  };
};

// Error boundary helper
export const withErrorBoundary = <T extends Record<string, any>>(
  component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error }>
) => {
  return (props: T) => {
    try {
      return React.createElement(component, props);
    } catch (error) {
      console.error('Component error:', error);
      if (fallback) {
        return React.createElement(fallback, { error: error as Error });
      }
      return React.createElement('div', { 
        className: 'p-4 text-red-600 bg-red-50 rounded-lg' 
      }, 'Something went wrong. Please try again.');
    }
  };
};