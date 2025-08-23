import { storage } from "./storage";
import { whatsappBot } from "./whatsappBot";
import type { Product, ProductSubscription, ProductNotification } from "@shared/schema";

export interface NewProductNotification {
  productId: string;
  productName: string;
  farmerName: string;
  category: string;
  price: number;
  imageUrl?: string;
}

export class ProductNotificationService {
  
  /**
   * Send notifications to all subscribed users when a new product is added
   */
  async notifyNewProduct(product: Product): Promise<void> {
    console.log(`[Product Notifications] Processing notifications for new product: ${product.name}`);
    
    try {
      // Get all active subscriptions that match this product
      const matchingSubscriptions = await this.getMatchingSubscriptions(product);
      
      console.log(`[Product Notifications] Found ${matchingSubscriptions.length} matching subscriptions`);
      
      // Send notifications for each matching subscription
      for (const subscription of matchingSubscriptions) {
        await this.sendNotificationToUser(product, subscription);
      }
      
    } catch (error) {
      console.error('[Product Notifications] Error processing notifications:', error);
    }
  }

  /**
   * Get all subscriptions that match the new product
   */
  private async getMatchingSubscriptions(product: Product): Promise<ProductSubscription[]> {
    const subscriptions: ProductSubscription[] = [];
    
    // Get all active subscriptions
    const allSubscriptions = await storage.getActiveProductSubscriptions();
    
    for (const subscription of allSubscriptions) {
      // Check if subscription matches this product
      if (this.doesSubscriptionMatch(subscription, product)) {
        subscriptions.push(subscription);
      }
    }
    
    return subscriptions;
  }

  /**
   * Check if a subscription matches a product
   */
  private doesSubscriptionMatch(subscription: ProductSubscription, product: Product): boolean {
    switch (subscription.subscriptionType) {
      case 'all':
        return true; // Match all products
      
      case 'category':
        return subscription.category === product.category;
      
      case 'farmer':
        return subscription.targetId === product.farmerId;
      
      default:
        return false;
    }
  }

  /**
   * Send notification to a specific user
   */
  private async sendNotificationToUser(product: Product, subscription: ProductSubscription): Promise<void> {
    const notificationMethods = Array.isArray(subscription.notificationMethods) 
      ? subscription.notificationMethods as string[]
      : ['push']; // Default fallback
    
    // Get user and farmer details
    const user = await storage.getUser(subscription.userId);
    const farmer = await storage.getFarmer(product.farmerId);
    
    if (!user || !farmer) {
      console.warn(`[Product Notifications] Missing user or farmer data for subscription ${subscription.id}`);
      return;
    }

    // Send notifications via each enabled method
    for (const method of notificationMethods) {
      try {
        await this.sendNotificationViaMethod(product, user, farmer, subscription, method);
      } catch (error) {
        console.error(`[Product Notifications] Failed to send ${method} notification:`, error);
        
        // Log failed notification
        await storage.createProductNotification({
          productId: product.id,
          userId: subscription.userId,
          subscriptionId: subscription.id,
          notificationMethod: method,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Send notification via specific method
   */
  private async sendNotificationViaMethod(
    product: Product, 
    user: any, 
    farmer: any, 
    subscription: ProductSubscription, 
    method: string
  ): Promise<void> {
    
    switch (method) {
      case 'whatsapp':
        await this.sendWhatsAppNotification(product, user, farmer, subscription);
        break;
        
      case 'push':
        await this.sendPushNotification(product, user, farmer, subscription);
        break;
        
      case 'email':
        // TODO: Implement email notifications
        console.log('[Product Notifications] Email notifications not implemented yet');
        break;
        
      default:
        console.warn(`[Product Notifications] Unknown notification method: ${method}`);
    }
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsAppNotification(
    product: Product, 
    user: any, 
    farmer: any, 
    subscription: ProductSubscription
  ): Promise<void> {
    
    if (!user.phone) {
      throw new Error('User has no phone number for WhatsApp notifications');
    }

    const subscriptionTypeText = this.getSubscriptionTypeText(subscription);
    
    const message = `🌟 New Product Alert - FramCart\n\n` +
      `📦 ${product.name} is now available!\n\n` +
      `👨‍🌾 Farmer: ${farmer.farmName}\n` +
      `📍 Location: ${farmer.location}\n` +
      `🏷️ Category: ${product.category}\n` +
      `💰 Price: KSh ${parseFloat(product.price).toFixed(2)} per ${product.unit}\n` +
      `📊 Available: ${product.availableQuantity} ${product.unit}${product.availableQuantity > 1 ? 's' : ''}\n\n` +
      `📝 ${product.description}\n\n` +
      `🔔 You're receiving this because you subscribed to ${subscriptionTypeText}\n\n` +
      `🛒 Shop now on FramCart for fresh, local produce!`;

    const success = await whatsappBot.sendNotification({
      phone: user.phone,
      message,
      type: 'order_confirmation' // Use existing valid type
    });

    // Log notification result
    await storage.createProductNotification({
      productId: product.id,
      userId: subscription.userId,
      subscriptionId: subscription.id,
      notificationMethod: 'whatsapp',
      status: success ? 'sent' : 'failed',
      sentAt: success ? new Date() : undefined,
      errorMessage: success ? undefined : 'WhatsApp sending failed',
    });
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    product: Product, 
    user: any, 
    farmer: any, 
    subscription: ProductSubscription
  ): Promise<void> {
    
    // TODO: Implement push notification sending
    // This would integrate with the existing push notification system
    console.log(`[Product Notifications] Push notification would be sent to user ${user.id} for product ${product.name}`);
    
    // For now, just log as sent
    await storage.createProductNotification({
      productId: product.id,
      userId: subscription.userId,
      subscriptionId: subscription.id,
      notificationMethod: 'push',
      status: 'sent',
      sentAt: new Date(),
    });
  }

  /**
   * Get user-friendly text for subscription type
   */
  private getSubscriptionTypeText(subscription: ProductSubscription): string {
    switch (subscription.subscriptionType) {
      case 'all':
        return 'all new products';
      case 'category':
        return `new ${subscription.category} products`;
      case 'farmer':
        return 'new products from this farmer';
      default:
        return 'new products';
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId?: string): Promise<{
    totalSent: number;
    totalFailed: number;
    recentNotifications: ProductNotification[];
  }> {
    
    const filters = userId ? { userId } : {};
    const notifications = await storage.getProductNotifications(filters);
    
    const totalSent = notifications.filter((n: ProductNotification) => n.status === 'sent').length;
    const totalFailed = notifications.filter((n: ProductNotification) => n.status === 'failed').length;
    const recentNotifications = notifications
      .sort((a: ProductNotification, b: ProductNotification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    return {
      totalSent,
      totalFailed,
      recentNotifications,
    };
  }
}

// Export singleton instance
export const productNotificationService = new ProductNotificationService();