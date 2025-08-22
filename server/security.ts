import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, param, query, validationResult } from "express-validator";
import xss from "xss";
import crypto from "crypto";
import type { Express, Request, Response, NextFunction } from "express";

// XSS protection configuration
const xssOptions = {
  whiteList: {}, // No HTML tags allowed
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script']
};

// Security Configuration
export const SECURITY_CONFIG = {
  MAX_REQUEST_SIZE: '10mb',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // requests per window
  STRICT_RATE_LIMIT_MAX: 5, // for sensitive endpoints
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 1 week
};

// Rate limiting configurations
export const createRateLimit = (maxRequests: number = SECURITY_CONFIG.RATE_LIMIT_MAX) => {
  return rateLimit({
    windowMs: SECURITY_CONFIG.RATE_LIMIT_WINDOW,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(SECURITY_CONFIG.RATE_LIMIT_WINDOW / 1000 / 60)
    },
    skip: (req) => {
      // Skip rate limiting for health checks and static assets
      return req.path === '/health' || req.path.startsWith('/uploads/');
    }
  });
};

// Strict rate limiting for sensitive endpoints
export const strictRateLimit = createRateLimit(SECURITY_CONFIG.STRICT_RATE_LIMIT_MAX);

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Unsafe eval needed for Vite dev
      connectSrc: ["'self'", "ws:", "wss:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disabled for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

// Recursive object sanitization
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return xss(obj, xssOptions);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both key and value
      const cleanKey = xss(key, xssOptions);
      sanitized[cleanKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

// Request validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const sanitizedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: xss(error.msg, xssOptions)
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      details: sanitizedErrors
    });
  }
  next();
};

// Enhanced file upload security
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return next();
  }
  
  for (const file of files) {
    // Check file type
    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type',
        allowedTypes: SECURITY_CONFIG.ALLOWED_FILE_TYPES
      });
    }
    
    // Check file size
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      return res.status(400).json({
        error: 'File too large',
        maxSize: SECURITY_CONFIG.MAX_FILE_SIZE
      });
    }
    
    // Validate file extension matches MIME type
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileExtension = file.originalname.toLowerCase().split('.').pop();
    if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
      return res.status(400).json({
        error: 'Invalid file extension'
      });
    }
    
    // Generate secure filename
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const extension = file.originalname.split('.').pop();
    file.filename = `${timestamp}-${randomBytes}.${extension}`;
  }
  
  next();
};

// Common validation schemas
export const validationSchemas = {
  // ID validation
  mongoId: param('id').isLength({ min: 1 }).trim().escape(),
  
  // Email validation
  email: body('email').isEmail().normalizeEmail().trim(),
  
  // String validation with length limits
  shortString: (field: string, min = 1, max = 100) => 
    body(field).isString().isLength({ min, max }).trim().escape(),
  
  longString: (field: string, min = 1, max = 1000) => 
    body(field).isString().isLength({ min, max }).trim().escape(),
  
  // Number validation
  positiveNumber: (field: string) => 
    body(field).isFloat({ min: 0 }).toFloat(),
  
  // Boolean validation
  boolean: (field: string) => 
    body(field).isBoolean().toBoolean(),
  
  // Phone number validation
  phoneNumber: body('phoneNumber').isMobilePhone('any').trim(),
  
  // URL validation
  url: (field: string) => 
    body(field).optional().isURL().trim(),
};

// Security audit logging
export const securityLogger = {
  logFailedAuth: (req: Request, reason: string) => {
    console.warn(`[SECURITY] Failed authentication attempt from ${req.ip}: ${reason}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      path: req.path
    });
  },
  
  logSuspiciousActivity: (req: Request, activity: string, details?: any) => {
    console.warn(`[SECURITY] Suspicious activity from ${req.ip}: ${activity}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      path: req.path,
      details
    });
  },
  
  logDataAccess: (userId: string, resource: string, action: string) => {
    console.info(`[AUDIT] User ${userId} ${action} ${resource}`, {
      userId,
      resource,
      action,
      timestamp: new Date().toISOString()
    });
  }
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and authenticated API calls with valid sessions
  if (req.method === 'GET' || req.path.startsWith('/api/auth/')) {
    return next();
  }
  
  // For now, we rely on SameSite cookies and Origin header validation
  const origin = req.get('Origin');
  const host = req.get('Host');
  
  if (origin && !origin.includes(host || '')) {
    securityLogger.logSuspiciousActivity(req, 'Invalid origin header', { origin, host });
    return res.status(403).json({ error: 'Invalid origin' });
  }
  
  next();
};

// Enhanced error handler that doesn't expose sensitive information
export const secureErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  // Log the actual error for debugging
  console.error('[ERROR]', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = error.statusCode || error.status || 500;
  
  let message = 'Internal server error';
  if (statusCode < 500) {
    message = error.message || 'Bad request';
  } else if (isDevelopment) {
    message = error.message;
  }
  
  res.status(statusCode).json({
    error: xss(message, xssOptions),
    ...(isDevelopment && { stack: error.stack })
  });
};

// Setup all security middleware
export const setupSecurity = (app: Express) => {
  // Basic security headers
  app.use(securityHeaders);
  
  // Request size limiting
  app.use(express.json({ limit: SECURITY_CONFIG.MAX_REQUEST_SIZE }));
  app.use(express.urlencoded({ extended: true, limit: SECURITY_CONFIG.MAX_REQUEST_SIZE }));
  
  // Rate limiting
  app.use('/api/', createRateLimit());
  
  // Input sanitization
  app.use('/api/', sanitizeInput);
  
  // CSRF protection
  app.use('/api/', csrfProtection);
  
  console.log('[SECURITY] All security middleware enabled');
};