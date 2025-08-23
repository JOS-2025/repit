import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import * as qrcode from 'qrcode-terminal';
import path from 'path';
import fs from 'fs';

interface WhatsAppNotification {
  phone: string;
  message: string;
  type: 'order_confirmation' | 'order_update' | 'delivery_notification' | 'payment_reminder';
  orderId?: string;
  trackingNumber?: string;
  mediaPath?: string;
}

class WhatsAppService {
  private client: Client | null = null;
  private isReady = false;
  private messageQueue: WhatsAppNotification[] = [];

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    // Initialize WhatsApp client with local authentication
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'framcart-bot',
        dataPath: './whatsapp-session'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.client) return;

    // QR Code for initial authentication
    this.client.on('qr', (qr) => {
      console.log('\n[WHATSAPP] QR Code for WhatsApp authentication:');
      qrcode.generate(qr, { small: true });
      console.log('\nScan this QR code with your WhatsApp Business account to connect the bot.');
    });

    // Client ready
    this.client.on('ready', () => {
      console.log('[WHATSAPP] Bot is ready and connected!');
      this.isReady = true;
      this.processMessageQueue();
    });

    // Authentication success
    this.client.on('authenticated', () => {
      console.log('[WHATSAPP] Authentication successful!');
    });

    // Authentication failure
    this.client.on('auth_failure', (msg) => {
      console.error('[WHATSAPP] Authentication failed:', msg);
    });

    // Client disconnected
    this.client.on('disconnected', (reason) => {
      console.log('[WHATSAPP] Client disconnected:', reason);
      this.isReady = false;
    });

    // Error handling
    this.client.on('error', (error) => {
      console.error('[WHATSAPP] Client error:', error);
    });

    // Incoming message handler (for basic responses)
    this.client.on('message', async (message) => {
      try {
        await this.handleIncomingMessage(message);
      } catch (error) {
        console.error('[WHATSAPP] Error handling incoming message:', error);
      }
    });
  }

  private async handleIncomingMessage(message: any) {
    const messageBody = message.body.toLowerCase().trim();
    const contact = await message.getContact();
    
    // Basic auto-responses
    if (messageBody.includes('hello') || messageBody.includes('hi')) {
      await message.reply(
        '🌱 Hello! Welcome to FramCart - Your Farm-to-Table Marketplace!\n\n' +
        'I can help you with:\n' +
        '📦 Order status updates\n' +
        '🚚 Delivery tracking\n' +
        '🛒 Order information\n\n' +
        'Just send me your order number or ask about your recent orders!'
      );
    } else if (messageBody.includes('order') || messageBody.includes('track')) {
      await message.reply(
        '📋 To check your order status, please provide your order number.\n\n' +
        'You can find your order number in your email confirmation or on our website.'
      );
    } else if (messageBody.includes('help') || messageBody.includes('support')) {
      await message.reply(
        '🆘 FramCart Support\n\n' +
        '🌐 Website: framcart.com\n' +
        '📧 Email: support@framcart.com\n' +
        '📞 Phone: +1 (555) 123-FARM\n\n' +
        'Our team is here to help you 24/7!'
      );
    }
  }

  async initialize(): Promise<void> {
    try {
      if (this.client) {
        await this.client.initialize();
        console.log('[WHATSAPP] Initializing WhatsApp client...');
      }
    } catch (error) {
      console.error('[WHATSAPP] Failed to initialize client:', error);
      throw error;
    }
  }

  async sendNotification(notification: WhatsAppNotification): Promise<boolean> {
    if (!this.isReady) {
      console.log('[WHATSAPP] Client not ready, queuing message');
      this.messageQueue.push(notification);
      return false;
    }

    try {
      if (!this.client) {
        throw new Error('WhatsApp client not initialized');
      }

      const formattedPhone = this.formatPhoneNumber(notification.phone);
      const chatId = `${formattedPhone}@c.us`;

      // Send media if provided
      if (notification.mediaPath && fs.existsSync(notification.mediaPath)) {
        const media = MessageMedia.fromFilePath(notification.mediaPath);
        await this.client.sendMessage(chatId, media, { caption: notification.message });
      } else {
        await this.client.sendMessage(chatId, notification.message);
      }

      console.log(`[WHATSAPP] Message sent successfully to ${formattedPhone}`);
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
        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
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
    
    return cleaned;
  }

  // Order notification templates
  async sendOrderConfirmation(orderData: {
    phone: string;
    orderId: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    deliveryAddress: string;
    estimatedDelivery: string;
  }): Promise<boolean> {
    const itemsList = orderData.items
      .map(item => `• ${item.quantity}x ${item.name} - $${item.price.toFixed(2)}`)
      .join('\n');

    const message = `🎉 Order Confirmed - FramCart\n\n` +
      `Hello ${orderData.customerName}!\n\n` +
      `✅ Your order #${orderData.orderId} has been confirmed\n\n` +
      `📦 Your Items:\n${itemsList}\n\n` +
      `💰 Total: $${orderData.total.toFixed(2)}\n` +
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

  async sendOrderStatusUpdate(orderData: {
    phone: string;
    orderId: string;
    customerName: string;
    status: string;
    statusMessage: string;
    trackingNumber?: string;
  }): Promise<boolean> {
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
      orderId: orderData.orderId,
      trackingNumber: orderData.trackingNumber
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
    if (!this.client || !this.isReady) {
      return null;
    }

    try {
      const info = await this.client.info;
      return {
        phone: info.wid.user,
        name: info.pushname,
        platform: info.platform
      };
    } catch (error) {
      console.error('[WHATSAPP] Error getting client info:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      console.log('[WHATSAPP] Client disconnected');
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
export { WhatsAppService, WhatsAppNotification };