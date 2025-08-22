import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { escrowService } from "./escrowService";
import { setupGPSTracking, updateDriverLocation, updateDeliveryStatus, calculateETA } from "./gpsTracking";
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

  // Public farmer registration endpoint (no auth required)
  app.post('/api/register-farmer', upload.single('farmImage'), async (req, res) => {
    try {
      const { fullName, phoneNumber, email, farmLocation, farmType } = req.body;
      const farmImage = req.file;

      if (!fullName || !phoneNumber || !email || !farmLocation || !farmType) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Create a temporary farmer registration record
      // In a real app, this might go to a separate "farmer_applications" table for approval
      const farmerRegistrationData = {
        farmName: `${fullName}'s ${farmType} Farm`,
        location: farmLocation,
        farmSize: null, // Will be filled later
        description: `${farmType} farm operated by ${fullName}. Contact: ${phoneNumber}, ${email}`,
        isVerified: false, // Needs approval
        phoneNumber,
        email,
        farmType,
        imageUrl: farmImage ? `/uploads/${farmImage.filename}` : null
      };

      // For now, store the registration data (in production, this would be a pending applications table)
      // Since we don't have a user ID yet, we'll create a placeholder
      console.log("Farmer registration received:", farmerRegistrationData);
      
      res.json({ 
        message: "Registration successful! Your application will be reviewed and you'll be contacted soon.",
        data: farmerRegistrationData 
      });
    } catch (error) {
      console.error("Error processing farmer registration:", error);
      res.status(500).json({ message: "Failed to process registration" });
    }
  });

  // Farmer routes (authenticated)
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

  // Price comparison endpoints
  app.get('/api/price-comparison/:productName/:category', async (req, res) => {
    try {
      const { productName, category } = req.params;
      const priceComparisons = await storage.getPriceComparisons(productName, category);
      res.json(priceComparisons);
    } catch (error) {
      console.error("Error fetching price comparisons:", error);
      res.status(500).json({ message: "Failed to fetch price comparisons" });
    }
  });

  app.get('/api/price-comparison/stats/:productName/:category', async (req, res) => {
    try {
      const { productName, category } = req.params;
      const stats = await storage.getPriceComparisonStats(productName, category);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching price comparison stats:", error);
      res.status(500).json({ message: "Failed to fetch price comparison stats" });
    }
  });

  // Subscription order endpoints
  app.post('/api/subscription-orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.createSubscriptionOrder({
        ...req.body,
        customerId: userId,
      });
      res.json(subscription);
    } catch (error) {
      console.error("Error creating subscription order:", error);
      res.status(500).json({ message: "Failed to create subscription order" });
    }
  });

  app.get('/api/subscription-orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await storage.getSubscriptionOrders(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscription orders:", error);
      res.status(500).json({ message: "Failed to fetch subscription orders" });
    }
  });

  app.put('/api/subscription-orders/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const subscription = await storage.updateSubscriptionOrder(id, { isActive });
      res.json(subscription);
    } catch (error) {
      console.error("Error updating subscription order:", error);
      res.status(500).json({ message: "Failed to update subscription order" });
    }
  });

  app.delete('/api/subscription-orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSubscriptionOrder(id);
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling subscription order:", error);
      res.status(500).json({ message: "Failed to cancel subscription order" });
    }
  });

  // Admin endpoints
  app.get('/api/admin/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // For now, simple check - in production, check admin table
      const isAdmin = userId === 'admin' || (req.user.claims.email && req.user.claims.email.includes('admin'));
      res.json(isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  app.get('/api/admin/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      // Mock data for now - will implement proper analytics later
      const dashboardData = {
        totalFarmers: 45,
        pendingFarmersCount: 8,
        totalOrders: 234,
        totalRevenue: 45600,
        totalCommission: 2280,
        activeUsers: 156,
        recentOrders: [
          { id: 'order1', customerName: 'John Doe', totalAmount: 250, status: 'delivered' },
          { id: 'order2', customerName: 'Jane Smith', totalAmount: 180, status: 'pending' },
        ],
        topProducts: [],
        revenueByMonth: []
      };
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      res.status(500).json({ message: "Failed to fetch admin dashboard" });
    }
  });

  app.get('/api/admin/farmer-applications', isAuthenticated, async (req: any, res) => {
    try {
      // Mock data for now - will implement proper farmer applications later
      const applications = [
        {
          id: 'app1',
          farmName: 'Green Valley Farm',
          farmerName: 'Peter Mwangi',
          location: 'Nakuru',
          farmSize: 5,
          description: 'Organic vegetable farm specializing in tomatoes and lettuce',
          documents: [],
          appliedAt: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: 'app2',
          farmName: 'Sunshine Dairy',
          farmerName: 'Mary Wanjiku',
          location: 'Eldoret',
          farmSize: 10,
          description: 'Dairy farm with 20 Holstein cows producing fresh milk daily',
          documents: [],
          appliedAt: new Date().toISOString(),
          status: 'pending'
        }
      ];
      res.json(applications);
    } catch (error) {
      console.error("Error fetching farmer applications:", error);
      res.status(500).json({ message: "Failed to fetch farmer applications" });
    }
  });

  app.put('/api/admin/farmers/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.updateFarmerVerification(id, true);
      res.json({ message: "Farmer approved successfully" });
    } catch (error) {
      console.error("Error approving farmer:", error);
      res.status(500).json({ message: "Failed to approve farmer" });
    }
  });

  app.put('/api/admin/farmers/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.updateFarmerVerification(id, false);
      res.json({ message: "Farmer application rejected" });
    } catch (error) {
      console.error("Error rejecting farmer:", error);
      res.status(500).json({ message: "Failed to reject farmer application" });
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

  // GPS Tracking routes for drivers
  app.get('/api/driver/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      res.json(driver);
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      res.status(500).json({ message: "Failed to fetch driver profile" });
    }
  });

  app.get('/api/driver/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      
      const assignments = await storage.getDriverAssignments(driver.id);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching driver assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post('/api/driver/location', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { latitude, longitude } = req.body;
      
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }

      await updateDriverLocation(driver.id, latitude, longitude);
      res.json({ message: "Location updated successfully" });
    } catch (error) {
      console.error("Error updating driver location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  app.post('/api/driver/delivery/:deliveryId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { deliveryId } = req.params;
      const { status, latitude, longitude } = req.body;
      
      await updateDeliveryStatus(deliveryId, status, latitude, longitude);
      res.json({ message: "Delivery status updated successfully" });
    } catch (error) {
      console.error("Error updating delivery status:", error);
      res.status(500).json({ message: "Failed to update delivery status" });
    }
  });

  // GPS Tracking routes for customers
  app.get('/api/tracking/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const trackingData = await storage.getDeliveryTracking(orderId);
      
      if (!trackingData) {
        return res.status(404).json({ message: "Tracking information not found" });
      }
      
      res.json(trackingData);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      res.status(500).json({ message: "Failed to fetch tracking data" });
    }
  });

  // Create delivery assignment
  app.post('/api/delivery/assign', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, driverId, pickupAddress, deliveryAddress } = req.body;
      
      const assignment = await storage.createDeliveryAssignment({
        orderId,
        driverId,
        pickupAddress,
        deliveryAddress,
        status: 'assigned',
      });
      
      res.json(assignment);
    } catch (error) {
      console.error("Error creating delivery assignment:", error);
      res.status(500).json({ message: "Failed to create delivery assignment" });
    }
  });

  // ============= ESCROW PAYMENT ENDPOINTS =============
  
  // Initiate escrow payment for an order
  app.post("/api/escrow/initiate", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { orderId, farmerId, amount, provider, phoneNumber } = req.body;

      const result = await escrowService.initiateEscrowTransaction({
        orderId,
        customerId: userId,
        farmerId,
        amount: parseFloat(amount),
        provider,
        customerPhoneNumber: phoneNumber,
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error initiating escrow payment:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Confirm mobile money payment
  app.post("/api/escrow/confirm-payment", isAuthenticated, async (req, res) => {
    try {
      const { transactionId, paymentProof } = req.body;

      const result = await escrowService.confirmPaymentAndHoldFunds(
        transactionId,
        paymentProof
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Release funds to farmer (typically called after delivery confirmation)
  app.post("/api/escrow/release-funds", isAuthenticated, async (req, res) => {
    try {
      const { transactionId, deliveryConfirmed, confirmationMethod, confirmationProof } = req.body;

      const result = await escrowService.releaseFundsToFarmer(transactionId, {
        deliveryConfirmed,
        confirmationMethod,
        confirmationProof,
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error releasing funds:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Get escrow transaction status
  app.get("/api/escrow/status/:transactionId", isAuthenticated, async (req, res) => {
    try {
      const { transactionId } = req.params;
      const result = await escrowService.getTransactionStatus(transactionId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Error getting transaction status:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // ============= NEW ECOSYSTEM ENDPOINTS =============
  
  // Register as delivery rider
  app.post("/api/riders/register", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const riderData = {
        userId,
        ...req.body,
        status: 'pending',
      };

      const rider = await storage.createDeliveryRider(riderData);
      res.json({ success: true, rider });
    } catch (error) {
      console.error("Error registering rider:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to register rider" 
      });
    }
  });

  // Get basket templates
  app.get("/api/baskets/templates", async (req, res) => {
    try {
      const templates = await storage.getBasketTemplates();
      res.json({ success: true, templates });
    } catch (error) {
      console.error("Error getting basket templates:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get basket templates" 
      });
    }
  });

  // Create farm adoption
  app.post("/api/adoptions/create", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const adoptionData = {
        customerId: userId,
        ...req.body,
      };

      const adoption = await storage.createFarmAdoption(adoptionData);
      res.json({ success: true, adoption });
    } catch (error) {
      console.error("Error creating farm adoption:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create farm adoption" 
      });
    }
  });

  const httpServer = createServer(app);
  
  // Setup GPS tracking WebSocket
  setupGPSTracking(httpServer);
  
  return httpServer;
}
