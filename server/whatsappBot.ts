// Simplified WhatsApp Bot Service for FramCart
import * as qrcode from 'qrcode-terminal';

interface WhatsAppNotification {
  phone: string;
  message: string;
  type: 'order_confirmation' | 'order_update' | 'delivery_notification' | 'payment_reminder';
  orderId?: string;
}

interface OrderData {
  phone: string;
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  deliveryAddress: string;
  estimatedDelivery: string;
}

interface OrderUpdateData {
  phone: string;
  orderId: string;
  customerName: string;
  status: string;
  statusMessage: string;
  trackingNumber?: string;
}

class WhatsAppBotService {
  private isReady = false;
  private client: any = null;
  private messageQueue: WhatsAppNotification[] = [];

  constructor() {
    console.log('[WHATSAPP] Service initialized in simulation mode');
    // Simulate bot being ready after 5 seconds
    setTimeout(() => {
      this.isReady = true;
      console.log('[WHATSAPP] Bot simulation ready! Processing queued messages...');
      this.processMessageQueue();
    }, 5000);
  }

  async initialize(): Promise<void> {
    try {
      console.log('[WHATSAPP] Starting WhatsApp Bot Service...');
      console.log('[WHATSAPP] To connect with real WhatsApp, scan this QR code:');
      
      // Generate a demo QR code
      const demoQR = 'https://framcart.com/whatsapp-demo';
      try {
        qrcode.generate(demoQR, { small: true });
      } catch (qrError) {
        console.log('[WHATSAPP] QR Code: https://framcart.com/whatsapp-demo');
      }
      
      console.log('\n[WHATSAPP] Demo Mode: WhatsApp notifications will be logged to console');
      console.log('[WHATSAPP] In production, scan the QR code with WhatsApp Business');
      
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.isReady = true;
      
      console.log('[WHATSAPP] Bot service initialized successfully');
    } catch (error) {
      console.error('[WHATSAPP] Failed to initialize:', error);
    }
  }

  async sendNotification(notification: WhatsAppNotification): Promise<boolean> {
    if (!this.isReady) {
      console.log('[WHATSAPP] Service not ready, queuing message');
      this.messageQueue.push(notification);
      return false;
    }

    try {
      // In demo mode, log the message to console
      console.log('\n📱 [WHATSAPP MESSAGE SENT]');
      console.log(`📞 To: ${this.formatPhoneNumber(notification.phone)}`);
      console.log(`📝 Type: ${notification.type}`);
      if (notification.orderId) {
        console.log(`📦 Order: ${notification.orderId}`);
      }
      console.log('💬 Message:');
      console.log('─'.repeat(50));
      console.log(notification.message);
      console.log('─'.repeat(50));
      console.log('✅ Message delivered successfully\n');
      
      return true;
    } catch (error) {
      console.error('[WHATSAPP] Failed to send message:', error);
      return false;
    }
  }

  private async processMessageQueue() {
    console.log(`[WHATSAPP] Processing ${this.messageQueue.length} queued messages`);
    
    while (this.messageQueue.length > 0) {
      const notification = this.messageQueue.shift();
      if (notification) {
        await this.sendNotification(notification);
        // Add delay between messages
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming US +1)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    // Format for display
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return `+${cleaned}`;
  }

  // Order notification methods
  async sendOrderConfirmation(orderData: OrderData): Promise<boolean> {
    const itemsList = orderData.items
      .map(item => `• ${item.quantity}x ${item.name}${item.price ? ` - $${parseFloat(item.price).toFixed(2)}` : ''}`)
      .join('\n');

    const message = `🎉 Order Confirmed - FramCart\n\n` +
      `Hello ${orderData.customerName}!\n\n` +
      `✅ Your order #${orderData.orderId} has been confirmed\n\n` +
      `📦 Your Items:\n${itemsList}\n\n` +
      `💰 Total: $${parseFloat(orderData.total).toFixed(2)}\n` +
      `🏠 Delivery Address: ${orderData.deliveryAddress}\n` +
      `🚚 Estimated Delivery: ${orderData.estimatedDelivery}\n\n` +
      `We'll keep you updated on your order status!\n\n` +
      `🌱 Thank you for choosing fresh, local produce!`;

    return this.sendNotification({
      phone: orderData.phone,
      message,
      type: 'order_confirmation',
      orderId: orderData.orderId
    });
  }

  async sendOrderStatusUpdate(orderData: OrderUpdateData): Promise<boolean> {
    const statusEmojis: Record<string, string> = {
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'packed': '📦',
      'shipped': '🚚',
      'out_for_delivery': '🛻',
      'delivered': '✨',
      'cancelled': '❌'
    };

    const emoji = statusEmojis[orderData.status] || '📋';
    
    let message = `${emoji} Order Update - FramCart\n\n` +
      `Hello ${orderData.customerName}!\n\n` +
      `📋 Order #${orderData.orderId}\n` +
      `📍 Status: ${orderData.statusMessage}\n\n`;

    if (orderData.trackingNumber) {
      message += `📦 Tracking Number: ${orderData.trackingNumber}\n\n`;
    }

    message += `We'll notify you of any further updates!\n\n` +
      `🌱 FramCart - Fresh from Farm to Table`;

    return this.sendNotification({
      phone: orderData.phone,
      message,
      type: 'order_update',
      orderId: orderData.orderId
    });
  }

  async sendDeliveryNotification(orderData: {
    phone: string;
    orderId: string;
    customerName: string;
    driverName: string;
    driverPhone: string;
    estimatedArrival: string;
    deliveryInstructions?: string;
  }): Promise<boolean> {
    let message = `🚚 Out for Delivery - FramCart\n\n` +
      `Hello ${orderData.customerName}!\n\n` +
      `📦 Order #${orderData.orderId} is out for delivery!\n\n` +
      `👨‍🚚 Driver: ${orderData.driverName}\n` +
      `📞 Driver Contact: ${orderData.driverPhone}\n` +
      `⏰ Estimated Arrival: ${orderData.estimatedArrival}\n\n`;

    if (orderData.deliveryInstructions) {
      message += `📋 Delivery Instructions: ${orderData.deliveryInstructions}\n\n`;
    }

    message += `Please be available to receive your fresh produce!\n\n` +
      `🌱 Thank you for choosing FramCart!`;

    return this.sendNotification({
      phone: orderData.phone,
      message,
      type: 'delivery_notification',
      orderId: orderData.orderId
    });
  }

  async sendDeliveryConfirmation(orderData: {
    phone: string;
    orderId: string;
    customerName: string;
    deliveredAt: string;
    rating?: boolean;
  }): Promise<boolean> {
    let message = `✨ Delivered Successfully! - FramCart\n\n` +
      `Hello ${orderData.customerName}!\n\n` +
      `📦 Your order #${orderData.orderId} has been delivered!\n` +
      `⏰ Delivered at: ${orderData.deliveredAt}\n\n` +
      `🌱 We hope you enjoy your fresh, local produce!\n\n`;

    if (orderData.rating) {
      message += `⭐ Please rate your experience on our website or app\n\n`;
    }

    message += `🛒 Order again anytime at framcart.com\n\n` +
      `Thank you for supporting local farmers! 👩‍🌾👨‍🌾`;

    return this.sendNotification({
      phone: orderData.phone,
      message,
      type: 'delivery_notification',
      orderId: orderData.orderId
    });
  }

  async sendPaymentReminder(orderData: {
    phone: string;
    orderId: string;
    customerName: string;
    amount: number;
    dueDate: string;
    paymentLink?: string;
  }): Promise<boolean> {
    let message = `💳 Payment Reminder - FramCart\n\n` +
      `Hello ${orderData.customerName}!\n\n` +
      `📋 Order #${orderData.orderId}\n` +
      `💰 Amount Due: $${orderData.amount.toFixed(2)}\n` +
      `📅 Due Date: ${orderData.dueDate}\n\n`;

    if (orderData.paymentLink) {
      message += `💳 Pay now: ${orderData.paymentLink}\n\n`;
    }

    message += `Please complete your payment to avoid order cancellation.\n\n` +
      `❓ Need help? Contact support@framcart.com\n\n` +
      `🌱 FramCart Team`;

    return this.sendNotification({
      phone: orderData.phone,
      message,
      type: 'payment_reminder',
      orderId: orderData.orderId
    });
  }

  isClientReady(): boolean {
    return this.isReady;
  }

  async getClientInfo(): Promise<any> {
    if (!this.isReady) {
      return null;
    }

    return {
      phone: '+1234567890',
      name: 'FramCart Bot',
      platform: 'Demo Mode'
    };
  }

  async disconnect(): Promise<void> {
    this.isReady = false;
    console.log('[WHATSAPP] Bot service disconnected');
  }
}

// Export singleton instance
export const whatsappBot = new WhatsAppBotService();
export { WhatsAppBotService };