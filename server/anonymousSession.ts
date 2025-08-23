import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Anonymous session management for privacy-focused features
export interface AnonymousSession {
  id: string;
  data: Record<string, any>;
  expiresAt: Date;
  createdAt: Date;
  lastAccessed: Date;
}

// In-memory storage for anonymous sessions (use Redis in production)
const anonymousSessions = new Map<string, AnonymousSession>();

// Clean up expired sessions every hour
setInterval(() => {
  const now = new Date();
  anonymousSessions.forEach((session, sessionId) => {
    if (session.expiresAt < now) {
      anonymousSessions.delete(sessionId);
    }
  });
}, 60 * 60 * 1000);

export const anonymousSessionManager = {
  /**
   * Create a new anonymous session
   */
  create(ttlMinutes: number = 120): string {
    const sessionId = `anon_${crypto.randomBytes(32).toString('hex')}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
    
    const session: AnonymousSession = {
      id: sessionId,
      data: {},
      expiresAt,
      createdAt: now,
      lastAccessed: now
    };
    
    anonymousSessions.set(sessionId, session);
    return sessionId;
  },

  /**
   * Get anonymous session data
   */
  get(sessionId: string): AnonymousSession | null {
    const session = anonymousSessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check if expired
    if (session.expiresAt < new Date()) {
      anonymousSessions.delete(sessionId);
      return null;
    }
    
    // Update last accessed
    session.lastAccessed = new Date();
    return session;
  },

  /**
   * Update anonymous session data
   */
  update(sessionId: string, data: Record<string, any>): boolean {
    const session = this.get(sessionId);
    
    if (!session) {
      return false;
    }
    
    session.data = { ...session.data, ...data };
    return true;
  },

  /**
   * Delete anonymous session
   */
  delete(sessionId: string): boolean {
    return anonymousSessions.delete(sessionId);
  },

  /**
   * Extend session expiry
   */
  extend(sessionId: string, additionalMinutes: number = 60): boolean {
    const session = this.get(sessionId);
    
    if (!session) {
      return false;
    }
    
    session.expiresAt = new Date(session.expiresAt.getTime() + additionalMinutes * 60 * 1000);
    return true;
  },

  /**
   * Clean up all expired sessions
   */
  cleanup(): number {
    const now = new Date();
    let cleaned = 0;
    
    anonymousSessions.forEach((session, sessionId) => {
      if (session.expiresAt < now) {
        anonymousSessions.delete(sessionId);
        cleaned++;
      }
    });
    
    return cleaned;
  },

  /**
   * Get session statistics
   */
  getStats() {
    const now = new Date();
    let active = 0;
    let expired = 0;
    
    anonymousSessions.forEach((session) => {
      if (session.expiresAt > now) {
        active++;
      } else {
        expired++;
      }
    });
    
    return { active, expired, total: anonymousSessions.size };
  }
};

/**
 * Middleware to handle anonymous sessions
 */
export const anonymousSessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check for anonymous session ID in cookies or headers
  const sessionId = req.cookies?.['anon-session'] || req.headers['x-anonymous-session'] as string;
  
  if (sessionId) {
    const session = anonymousSessionManager.get(sessionId);
    if (session) {
      (req as any).anonymousSession = session;
    }
  }
  
  // Helper function to create anonymous session
  (req as any).createAnonymousSession = (ttlMinutes?: number) => {
    const newSessionId = anonymousSessionManager.create(ttlMinutes);
    res.cookie('anon-session', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: (ttlMinutes || 120) * 60 * 1000
    });
    (req as any).anonymousSession = anonymousSessionManager.get(newSessionId);
    return newSessionId;
  };
  
  next();
};

/**
 * Data retention policy for anonymous data
 */
export const dataRetentionPolicy = {
  /**
   * Automatically clean up data older than specified days
   */
  cleanupOldData(maxAgeDays: number = 30): void {
    const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    
    // Clean up anonymous sessions
    anonymousSessions.forEach((session, sessionId) => {
      if (session.createdAt < cutoffDate) {
        anonymousSessions.delete(sessionId);
      }
    });
    
    console.log(`[DATA RETENTION] Cleaned up data older than ${maxAgeDays} days`);
  },

  /**
   * Schedule automatic cleanup
   */
  scheduleCleanup(intervalHours: number = 24, maxAgeDays: number = 30): void {
    setInterval(() => {
      this.cleanupOldData(maxAgeDays);
    }, intervalHours * 60 * 60 * 1000);
    
    console.log(`[DATA RETENTION] Scheduled cleanup every ${intervalHours} hours for data older than ${maxAgeDays} days`);
  }
};

/**
 * Anonymous order tracking
 */
export const anonymousOrderTracking = {
  /**
   * Create anonymous order tracking ID
   */
  createTrackingId(): string {
    return `ANON${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  },

  /**
   * Store order tracking data anonymously
   */
  storeOrderData(trackingId: string, orderData: any): void {
    const sessionId = anonymousSessionManager.create(43200); // 30 days in minutes
    const sanitizedOrderData = {
      trackingId,
      status: orderData.status,
      items: orderData.items?.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        // Remove any personal information
      })),
      total: orderData.total,
      createdAt: new Date(),
      // Don't store personal delivery information permanently
    };
    
    anonymousSessionManager.update(sessionId, { orderTracking: sanitizedOrderData });
  },

  /**
   * Get order status by tracking ID
   */
  getOrderStatus(trackingId: string): any | null {
    let result = null;
    anonymousSessions.forEach((session) => {
      const orderData = session.data.orderTracking;
      if (orderData?.trackingId === trackingId) {
        result = {
          trackingId: orderData.trackingId,
          status: orderData.status,
          items: orderData.items,
          total: orderData.total,
          createdAt: orderData.createdAt
        };
      }
    });
    return result;
  }
};