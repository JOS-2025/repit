import type { Request, Response } from "express";
import { securityLogger } from "./security";

// Security audit functions to monitor application security

export interface SecurityEvent {
  timestamp: string;
  type: 'auth_failure' | 'suspicious_activity' | 'data_access' | 'rate_limit_hit' | 'file_upload' | 'validation_error';
  userId?: string;
  ip: string;
  userAgent?: string;
  details: any;
}

// In-memory storage for recent security events (in production, use Redis or database)
const securityEvents: SecurityEvent[] = [];
const MAX_EVENTS = 1000;

export const auditLogger = {
  logSecurityEvent: (event: Omit<SecurityEvent, 'timestamp'>) => {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };
    
    securityEvents.unshift(fullEvent);
    if (securityEvents.length > MAX_EVENTS) {
      securityEvents.splice(MAX_EVENTS);
    }
    
    // Log critical events
    if (['auth_failure', 'suspicious_activity'].includes(event.type)) {
      console.warn(`[SECURITY ALERT] ${event.type}:`, fullEvent);
    }
  },

  getRecentEvents: (limit = 50) => {
    return securityEvents.slice(0, limit);
  },

  getEventsByType: (type: SecurityEvent['type'], limit = 50) => {
    return securityEvents.filter(event => event.type === type).slice(0, limit);
  },

  getEventsByUser: (userId: string, limit = 50) => {
    return securityEvents.filter(event => event.userId === userId).slice(0, limit);
  },

  getEventsByIP: (ip: string, limit = 50) => {
    return securityEvents.filter(event => event.ip === ip).slice(0, limit);
  }
};

// Security metrics and monitoring
export const securityMetrics = {
  getSuspiciousIPs: () => {
    const ipCounts: Record<string, number> = {};
    const recentEvents = auditLogger.getRecentEvents(500);
    
    recentEvents
      .filter(event => ['auth_failure', 'suspicious_activity', 'rate_limit_hit'].includes(event.type))
      .forEach(event => {
        ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
      });
    
    return Object.entries(ipCounts)
      .filter(([_, count]) => count > 10)
      .sort(([, a], [, b]) => b - a);
  },

  getFailedAuthAttempts: (timeframeMinutes = 60) => {
    const cutoff = new Date(Date.now() - timeframeMinutes * 60 * 1000);
    return auditLogger.getRecentEvents(500)
      .filter(event => 
        event.type === 'auth_failure' && 
        new Date(event.timestamp) > cutoff
      );
  },

  getValidationErrors: (timeframeMinutes = 60) => {
    const cutoff = new Date(Date.now() - timeframeMinutes * 60 * 1000);
    return auditLogger.getRecentEvents(500)
      .filter(event => 
        event.type === 'validation_error' && 
        new Date(event.timestamp) > cutoff
      );
  }
};

// Middleware to automatically log security events
export const autoAuditMiddleware = (req: Request, res: Response, next: any) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(body) {
    if (res.statusCode >= 400) {
      auditLogger.logSecurityEvent({
        type: res.statusCode === 401 ? 'auth_failure' : 'suspicious_activity',
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        details: {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          body: typeof body === 'string' ? body.slice(0, 200) : JSON.stringify(body).slice(0, 200)
        }
      });
    }
    
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    if (res.statusCode >= 400) {
      auditLogger.logSecurityEvent({
        type: res.statusCode === 401 ? 'auth_failure' : 'suspicious_activity',
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        details: {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          body: JSON.stringify(body).slice(0, 200)
        }
      });
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

// Security dashboard endpoint
export const getSecurityDashboard = (req: Request, res: Response) => {
  const recentEvents = auditLogger.getRecentEvents(100);
  const suspiciousIPs = securityMetrics.getSuspiciousIPs();
  const failedAuths = securityMetrics.getFailedAuthAttempts();
  const validationErrors = securityMetrics.getValidationErrors();
  
  res.json({
    summary: {
      totalEvents: recentEvents.length,
      suspiciousIPs: suspiciousIPs.length,
      failedAuthsLastHour: failedAuths.length,
      validationErrorsLastHour: validationErrors.length
    },
    recentEvents: recentEvents.slice(0, 20),
    suspiciousIPs,
    alerts: [
      ...suspiciousIPs.slice(0, 5).map(([ip, count]) => ({
        type: 'suspicious_ip',
        message: `IP ${ip} has ${count} suspicious activities`,
        severity: count > 50 ? 'high' : 'medium'
      })),
      ...failedAuths.slice(0, 3).map(event => ({
        type: 'auth_failure',
        message: `Failed auth attempt from ${event.ip}`,
        severity: 'medium'
      }))
    ]
  });
};