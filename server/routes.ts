import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertFarmerSchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertCartItemSchema,
  insertSimpleOrderSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is also a farmer
      const farmer = await storage.getFarmerByUserId(userId);
      
      res.json({
        ...user,
        farmer: farmer || null
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Farmer routes
  app.post('/api/farmers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const farmerData = insertFarmerSchema.parse({
        ...req.body,
        userId
      });

      const farmer = await storage.createFarmer(farmerData);
      res.json(farmer);
    } catch (error) {
      console.error("Error creating farmer:", error);
      res.status(500).json({ message: "Failed to create farmer profile" });
    }
  });

  app.get('/api/farmers/:id', async (req, res) => {
    try {
      const farmer = await storage.getFarmer(req.params.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
      res.json(farmer);
    } catch (error) {
      console.error("Error fetching farmer:", error);
      res.status(500).json({ message: "Failed to fetch farmer" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const category = req.query.category as string;
      const products = await storage.getProducts(category);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, upload.array('images', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const farmer = await storage.getFarmerByUserId(userId);
      
      if (!farmer) {
        return res.status(403).json({ message: "Only farmers can add products" });
      }

      const images = (req.files as Express.Multer.File[])?.map(file => `/uploads/${file.filename}`) || [];
      
      const productData = insertProductSchema.parse({
        ...req.body,
        farmerId: farmer.id,
        images,
        price: parseFloat(req.body.price),
        availableQuantity: parseInt(req.body.availableQuantity),
        harvestDate: req.body.harvestDate ? new Date(req.body.harvestDate) : null,
      });

      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get('/api/farmers/:farmerId/products', async (req, res) => {
    try {
      const products = await storage.getProductsByFarmer(req.params.farmerId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching farmer products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const farmer = await storage.getFarmerByUserId(userId);
      
      if (!farmer) {
        return res.status(403).json({ message: "Only farmers can update products" });
      }

      const product = await storage.getProduct(req.params.id);
      if (!product || product.farmerId !== farmer.id) {
        return res.status(404).json({ message: "Product not found or unauthorized" });
      }

      const updates = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        availableQuantity: req.body.availableQuantity ? parseInt(req.body.availableQuantity) : undefined,
        harvestDate: req.body.harvestDate ? new Date(req.body.harvestDate) : undefined,
      };

      const updatedProduct = await storage.updateProduct(req.params.id, updates);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const farmer = await storage.getFarmerByUserId(userId);
      
      if (!farmer) {
        return res.status(403).json({ message: "Only farmers can delete products" });
      }

      const product = await storage.getProduct(req.params.id);
      if (!product || product.farmerId !== farmer.id) {
        return res.status(404).json({ message: "Product not found or unauthorized" });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });

      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { quantity } = req.body;
      await storage.updateCartItemQuantity(req.params.id, quantity);
      res.json({ message: "Cart item updated successfully" });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { items, ...orderData } = req.body;

      const orderToCreate = insertOrderSchema.parse({
        ...orderData,
        customerId: userId,
        totalAmount: parseFloat(orderData.totalAmount),
      });

      const order = await storage.createOrder(orderToCreate);

      // Create order items
      for (const item of items) {
        const orderItemData = insertOrderItemSchema.parse({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: parseFloat(item.pricePerUnit),
        });
        await storage.createOrderItem(orderItemData);
      }

      // Clear cart
      await storage.clearCart(userId);

      const fullOrder = await storage.getOrder(order.id);
      res.json(fullOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Simple order route (no authentication required)
  app.post('/api/orders/simple', async (req, res) => {
    try {
      const orderData = insertSimpleOrderSchema.parse(req.body);
      const simpleOrder = await storage.createSimpleOrder(orderData);
      
      res.status(201).json(simpleOrder);
    } catch (error: any) {
      console.error("Failed to create simple order:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  // Get simple orders (for farmers/admin)
  app.get('/api/orders/simple', isAuthenticated, async (req: any, res) => {
    try {
      const simpleOrders = await storage.getSimpleOrders();
      res.json(simpleOrders);
    } catch (error) {
      console.error("Error fetching simple orders:", error);
      res.status(500).json({ message: "Failed to fetch simple orders" });
    }
  });

  // Update simple order status
  app.patch('/api/orders/simple/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await storage.updateSimpleOrderStatus(id, status);
      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Error updating simple order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.get('/api/orders/customer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByCustomer(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/farmer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const farmer = await storage.getFarmerByUserId(userId);
      
      if (!farmer) {
        return res.status(403).json({ message: "Only farmers can access this endpoint" });
      }

      const orders = await storage.getOrdersByFarmer(farmer.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching farmer orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const userId = req.user.claims.sub;
      const farmer = await storage.getFarmerByUserId(userId);
      
      // Check if user is customer or farmer of this order
      const isAuthorized = order.customerId === userId || 
                          (farmer && order.farmerId === farmer.id);
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Unauthorized to view this order" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      const userId = req.user.claims.sub;
      const farmer = await storage.getFarmerByUserId(userId);
      
      if (!farmer) {
        return res.status(403).json({ message: "Only farmers can update order status" });
      }

      const order = await storage.getOrder(req.params.id);
      if (!order || order.farmerId !== farmer.id) {
        return res.status(404).json({ message: "Order not found or unauthorized" });
      }

      await storage.updateOrderStatus(req.params.id, status);
      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
