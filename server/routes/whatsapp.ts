import type { Express, Request, Response } from "express";
import { whatsappBot } from "../whatsappBot";
import { isAuthenticated } from "../auth";
import { body, validationResult } from "express-validator";
import { storage } from "../storage";

export function registerWhatsAppRoutes(app: Express) {
  // Get WhatsApp bot status
  app.get("/api/whatsapp/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const isReady = whatsappBot.isClientReady();
      const clientInfo = await whatsappBot.getClientInfo();
      
      res.json({
        isReady,
        clientInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error getting WhatsApp status:", error);
      res.status(500).json({ error: "Failed to get WhatsApp status" });
    }
  });

  // Send test notification (admin only)
  app.post("/api/whatsapp/test", 
    isAuthenticated,
    [
      body("phone").isMobilePhone('any').withMessage("Valid phone number required"),
      body("message").isLength({ min: 1, max: 1000 }).withMessage("Message required (1-1000 chars)")
    ],
    async (req: Request, res: Response) => {
      // Check if user is admin
      const user = req.user as any;
      if (!user?.email?.endsWith('@framcart.admin')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { phone, message } = req.body;
        
        const success = await whatsappBot.sendNotification({
          phone,
          message,
          type: 'order_update'
        });

        res.json({ 
          success, 
          message: success ? "Test message sent successfully" : "Failed to send test message" 
        });
      } catch (error) {
        console.error("Error sending test WhatsApp message:", error);
        res.status(500).json({ error: "Failed to send test message" });
      }
    }
  );

  // Send order confirmation
  app.post("/api/whatsapp/order-confirmation",
    [
      body("orderId").isString().notEmpty(),
      body("phone").isMobilePhone('any'),
      body("customerName").isString().notEmpty(),
      body("items").isArray(),
      body("total").isNumeric(),
      body("deliveryAddress").isString().notEmpty(),
      body("estimatedDelivery").isString().notEmpty()
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const success = await whatsappBot.sendOrderConfirmation(req.body);
        
        res.json({ 
          success, 
          message: success ? "Order confirmation sent" : "Failed to send confirmation" 
        });
      } catch (error) {
        console.error("Error sending order confirmation:", error);
        res.status(500).json({ error: "Failed to send order confirmation" });
      }
    }
  );

  // Send order status update
  app.post("/api/whatsapp/order-update",
    [
      body("orderId").isString().notEmpty(),
      body("phone").isMobilePhone('any'),
      body("customerName").isString().notEmpty(),
      body("status").isString().notEmpty(),
      body("statusMessage").isString().notEmpty(),
      body("trackingNumber").optional().isString()
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const success = await whatsappBot.sendOrderStatusUpdate(req.body);
        
        res.json({ 
          success, 
          message: success ? "Order update sent" : "Failed to send update" 
        });
      } catch (error) {
        console.error("Error sending order update:", error);
        res.status(500).json({ error: "Failed to send order update" });
      }
    }
  );

  // Send delivery notification
  app.post("/api/whatsapp/delivery-notification",
    [
      body("orderId").isString().notEmpty(),
      body("phone").isMobilePhone('any'),
      body("customerName").isString().notEmpty(),
      body("driverName").isString().notEmpty(),
      body("driverPhone").isMobilePhone('any'),
      body("estimatedArrival").isString().notEmpty(),
      body("deliveryInstructions").optional().isString()
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const success = await whatsappBot.sendDeliveryNotification(req.body);
        
        res.json({ 
          success, 
          message: success ? "Delivery notification sent" : "Failed to send notification" 
        });
      } catch (error) {
        console.error("Error sending delivery notification:", error);
        res.status(500).json({ error: "Failed to send delivery notification" });
      }
    }
  );

  // Send delivery confirmation
  app.post("/api/whatsapp/delivery-confirmation",
    [
      body("orderId").isString().notEmpty(),
      body("phone").isMobilePhone('any'),
      body("customerName").isString().notEmpty(),
      body("deliveredAt").isString().notEmpty(),
      body("rating").optional().isBoolean()
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const success = await whatsappBot.sendDeliveryConfirmation(req.body);
        
        res.json({ 
          success, 
          message: success ? "Delivery confirmation sent" : "Failed to send confirmation" 
        });
      } catch (error) {
        console.error("Error sending delivery confirmation:", error);
        res.status(500).json({ error: "Failed to send delivery confirmation" });
      }
    }
  );

  // Send payment reminder
  app.post("/api/whatsapp/payment-reminder",
    [
      body("orderId").isString().notEmpty(),
      body("phone").isMobilePhone('any'),
      body("customerName").isString().notEmpty(),
      body("amount").isNumeric(),
      body("dueDate").isString().notEmpty(),
      body("paymentLink").optional().isURL()
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const success = await whatsappBot.sendPaymentReminder(req.body);
        
        res.json({ 
          success, 
          message: success ? "Payment reminder sent" : "Failed to send reminder" 
        });
      } catch (error) {
        console.error("Error sending payment reminder:", error);
        res.status(500).json({ error: "Failed to send payment reminder" });
      }
    }
  );

  console.log("[WHATSAPP] Routes registered successfully");
}