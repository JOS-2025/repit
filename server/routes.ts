import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
// Removed old Replit Auth import
import { escrowService } from "./escrowService";
import { setupGPSTracking, updateDriverLocation, updateDeliveryStatus, calculateETA } from "./gpsTracking";
import { aiService } from "./ai";
import { 
  insertFarmerSchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertCartItemSchema,
  insertSimpleOrderSchema,
  insertFarmerRatingSchema,
  insertBusinessSchema,
  insertBulkOrderSchema,
  insertBulkOrderItemSchema,
  insertRecurringBulkOrderSchema,
  insertRecurringBulkOrderItemSchema,
  insertInvoiceSchema,
  insertVolumeDiscountSchema,
  insertProductPricingSchema,
} from "@shared/schema";
import { 
  strictRateLimit, 
  validateFileUpload, 
  validationSchemas, 
  handleValidationErrors,
  securityLogger,
  SECURITY_CONFIG 
} from "./security";
import { body } from "express-validator";
import { autoAuditMiddleware, getSecurityDashboard } from "./securityAudit";
import { registerWhatsAppRoutes } from "./routes/whatsapp";
import { whatsappBot } from "./whatsappBot";
import { setupAuth, isAuthenticated } from "./auth";
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
  limits: { 
    fileSize: SECURITY_CONFIG.MAX_FILE_SIZE,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    if (SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Helper functions for trending and recommendations
function getTrendingReason(product: any): string {
  const reasons = [
    'High farmer rating & quality',
    'Popular this week',
    'Seasonal favorite',
    'Local community choice',
    'Fresh harvest available',
    'Nutritionally rich',
    'Great value for money'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function getHotLevel(score: number): 'low' | 'medium' | 'high' | 'extreme' {
  if (score > 80) return 'extreme';
  if (score > 60) return 'high';
  if (score > 40) return 'medium';
  return 'low';
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function generateSmartRecommendations(products: any[], userPreferences: any, context: any): any[] {
  return products
    .map(product => ({
      ...product,
      recommendationScore: calculateRecommendationScore(product, userPreferences, context),
      reason: getRecommendationReason(product, userPreferences, context),
      confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
      nutritionalMatch: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      seasonalRelevance: getSeasonalRelevance(product, context.season)
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}

function calculateRecommendationScore(product: any, userPreferences: any, context: any): number {
  let score = 0;
  
  // Base score from farmer rating
  score += parseFloat(product.farmer.averageRating) * 10;
  
  // Category preference boost
  if (userPreferences.favoriteCategories.includes(product.category)) {
    score += 15;
  }
  
  // Price preference matching
  const price = parseFloat(product.price);
  if (userPreferences.pricePreference === 'low' && price < 20) score += 10;
  if (userPreferences.pricePreference === 'medium' && price >= 20 && price <= 50) score += 10;
  if (userPreferences.pricePreference === 'high' && price > 50) score += 10;
  
  // Search query relevance
  if (context.searchQuery && (
    product.name.toLowerCase().includes(context.searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(context.searchQuery.toLowerCase())
  )) {
    score += 20;
  }
  
  // Local preference
  if (userPreferences.localPreference && product.farmer.location.includes(userPreferences.location)) {
    score += 8;
  }
  
  // Seasonal relevance
  score += getSeasonalRelevance(product, context.season) * 5;
  
  // Time of day relevance
  if (context.timeOfDay === 'morning' && ['fruits', 'dairy'].includes(product.category)) score += 5;
  if (context.timeOfDay === 'evening' && ['vegetables', 'grains'].includes(product.category)) score += 5;
  
  return score + Math.random() * 10; // Add some randomness
}

function getRecommendationReason(product: any, userPreferences: any, context: any): string {
  const reasons = [];
  
  if (parseFloat(product.farmer.averageRating) > 4.5) {
    reasons.push('Highly rated farmer');
  }
  
  if (userPreferences.favoriteCategories.includes(product.category)) {
    reasons.push('Matches your preferences');
  }
  
  if (context.searchQuery && product.name.toLowerCase().includes(context.searchQuery.toLowerCase())) {
    reasons.push('Perfect match for your search');
  }
  
  if (getSeasonalRelevance(product, context.season) > 0.7) {
    reasons.push('Perfect for current season');
  }
  
  if (userPreferences.localPreference && product.farmer.location.includes(userPreferences.location)) {
    reasons.push('Local farm near you');
  }
  
  if (userPreferences.organicPreference) {
    reasons.push('Fresh & naturally grown');
  }
  
  return reasons.length > 0 ? reasons[0] : 'Great quality product';
}

function getSeasonalRelevance(product: any, season: string): number {
  const seasonalMapping: { [key: string]: string[] } = {
    spring: ['fruits', 'herbs', 'vegetables'],
    summer: ['fruits', 'vegetables', 'herbs'],
    autumn: ['grains', 'vegetables', 'fruits'],
    winter: ['grains', 'dairy', 'vegetables']
  };
  
  return seasonalMapping[season]?.includes(product.category) ? 1.0 : 0.5;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Security audit middleware
  app.use('/api/', autoAuditMiddleware);
  
  // Auth middleware
  await setupAuth(app);

  // Initialize WhatsApp bot service
  try {
    await whatsappBot.initialize();
    console.log('[WHATSAPP] Bot service initialized');
  } catch (error) {
    console.error('[WHATSAPP] Failed to initialize bot service:', error);
  }

  // Register WhatsApp routes
  registerWhatsAppRoutes(app);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      console.log("[AUTH] Fetching user data for authenticated user");
      const userId = req.user.claims.sub;
      securityLogger.logDataAccess(userId, 'user profile', 'read');
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("[AUTH] User not found in database:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      console.log("[AUTH] User data fetched successfully");
      
      // Check if user is also a farmer
      const farmer = await storage.getFarmerByUserId(userId);
      
      res.json({
        ...user,
        farmer: farmer || null
      });
    } catch (error: any) {
      console.error("[AUTH] Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
  });

  // Health check endpoint for authentication
  app.get('/api/auth/status', (req, res) => {
    const authStatus = {
      authenticated: req.isAuthenticated(),
      session: !!req.session,
      sessionID: req.sessionID?.substring(0, 8) + '...',
      user: req.user ? 'present' : 'absent',
      timestamp: new Date().toISOString()
    };
    console.log("[AUTH] Status check:", authStatus);
    res.json(authStatus);
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
  // Farmer registration with enhanced validation and rate limiting
  app.post('/api/farmers', 
    strictRateLimit,
    isAuthenticated,
    [
      validationSchemas.shortString('farmName', 2, 100),
      validationSchemas.shortString('location', 2, 100),
      validationSchemas.positiveNumber('farmSize'),
      validationSchemas.longString('description', 10, 500),
      validationSchemas.phoneNumber,
      validationSchemas.email,
      validationSchemas.url('website').optional()
    ],
    handleValidationErrors,
    async (req: any, res: any) => {
      try {
        const userId = req.user.claims.sub;
        
        // Check if user already has a farmer profile
        const existingFarmer = await storage.getFarmerByUserId(userId);
        if (existingFarmer) {
          return res.status(409).json({ message: "Farmer profile already exists" });
        }
        
        securityLogger.logDataAccess(userId, 'farmer profile', 'create');
        
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
    }
  );

  app.get('/api/farmers/:id', async (req, res) => {
    try {
      const farmer = await storage.getFarmerWithDetails(req.params.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
      res.json(farmer);
    } catch (error) {
      console.error("Error fetching farmer:", error);
      res.status(500).json({ message: "Failed to fetch farmer" });
    }
  });

  // Farmer profile update with enhanced security
  app.put("/api/farmers/:id", 
    isAuthenticated,
    [
      validationSchemas.mongoId,
      validationSchemas.shortString('farmName', 2, 100).optional(),
      validationSchemas.shortString('location', 2, 100).optional(),
      validationSchemas.positiveNumber('farmSize').optional(),
      validationSchemas.longString('description', 10, 500).optional(),
      validationSchemas.phoneNumber.optional(),
      validationSchemas.email.optional(),
      validationSchemas.url('website').optional()
    ],
    handleValidationErrors,
    async (req: any, res: any) => {
      try {
        const farmer = await storage.getFarmer(req.params.id);
        if (!farmer) {
          return res.status(404).json({ message: "Farmer not found" });
        }
        
        // Verify ownership
        const userId = (req.user as any)?.claims?.sub;
        if (farmer.userId !== userId) {
          securityLogger.logSuspiciousActivity(req, 'Unauthorized farmer profile update attempt', { 
            farmerId: req.params.id, 
            userId 
          });
          return res.status(403).json({ message: "Unauthorized" });
        }

        securityLogger.logDataAccess(userId, `farmer profile ${req.params.id}`, 'update');
        
        const updatedFarmer = await storage.updateFarmer(req.params.id, req.body);
        res.json(updatedFarmer);
      } catch (error) {
        console.error("Error updating farmer:", error);
        res.status(500).json({ message: "Failed to update farmer" });
      }
    }
  );

  app.get("/api/farmers/:id/products", async (req, res) => {
    try {
      const products = await storage.getProductsByFarmer(req.params.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching farmer products:", error);
      res.status(500).json({ message: "Failed to fetch farmer products" });
    }
  });

  // Farmer rating routes
  app.get("/api/farmers/:id/ratings", async (req, res) => {
    try {
      const ratings = await storage.getFarmerRatings(req.params.id);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching farmer ratings:", error);
      res.status(500).json({ message: "Failed to fetch farmer ratings" });
    }
  });

  app.get("/api/farmers/:id/rating-stats", async (req, res) => {
    try {
      const stats = await storage.getFarmerRatingStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching farmer rating stats:", error);
      res.status(500).json({ message: "Failed to fetch farmer rating stats" });
    }
  });

  app.post("/api/farmers/:id/ratings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { id: farmerId } = req.params;
      const { rating, comment } = req.body;

      // Check if user can rate this farmer
      const canRate = await storage.canRateFarmer(userId, farmerId);
      if (!canRate) {
        return res.status(403).json({ 
          message: "You can only rate farmers from whom you have made purchases" 
        });
      }

      // Check if user has already rated this farmer
      const existingRating = await storage.getUserFarmerRating(userId, farmerId);
      if (existingRating) {
        return res.status(400).json({ 
          message: "You have already rated this farmer" 
        });
      }

      const isVerifiedPurchase = await storage.canRateFarmer(userId, farmerId);
      
      const newRating = await storage.createFarmerRating({
        userId,
        farmerId,
        rating,
        comment,
        isVerifiedPurchase
      });

      res.status(201).json(newRating);
    } catch (error) {
      console.error("Error creating farmer rating:", error);
      res.status(500).json({ message: "Failed to create farmer rating" });
    }
  });

  app.get("/api/farmers/:id/can-rate", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { id: farmerId } = req.params;
      
      const canRate = await storage.canRateFarmer(userId, farmerId);
      const existingRating = await storage.getUserFarmerRating(userId, farmerId);
      
      res.json({ 
        canRate: canRate && !existingRating,
        hasPurchased: canRate,
        hasRated: !!existingRating
      });
    } catch (error) {
      console.error("Error checking rating eligibility:", error);
      res.status(500).json({ message: "Failed to check rating eligibility" });
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

  // Get trending products endpoint  
  app.get('/api/products/trending', async (req, res) => {
    try {
      const products = await storage.getProducts();
      const productsWithFarmers = [];
      
      // Get farmer details for each product
      for (const product of products) {
        try {
          const farmer = await storage.getFarmer(product.farmerId);
          if (farmer) {
            productsWithFarmers.push({
              ...product,
              farmer: {
                farmName: farmer.farmName,
                location: farmer.location,
                averageRating: farmer.averageRating?.toString() || '4.5'
              },
              trendingScore: Math.random() * 100, // Mock trending score
              viewCount: Math.floor(Math.random() * 1000),
              purchaseCount: Math.floor(Math.random() * 100)
            });
          }
        } catch (err) {
          // Skip products without valid farmers
          continue;
        }
      }
      
      // Enhanced trending logic based on multiple factors
      const trending = productsWithFarmers
        .sort((a: any, b: any) => {
          const aScore = (parseFloat(a.farmer.averageRating) * 0.4) + 
                        (a.trendingScore * 0.3) + 
                        (a.viewCount * 0.2) + 
                        (a.purchaseCount * 0.1);
          const bScore = (parseFloat(b.farmer.averageRating) * 0.4) + 
                        (b.trendingScore * 0.3) + 
                        (b.viewCount * 0.2) + 
                        (b.purchaseCount * 0.1);
          return bScore - aScore;
        })
        .slice(0, 8)
        .map((product: any) => ({
          ...product,
          trendingReason: getTrendingReason(product),
          hotLevel: getHotLevel(product.trendingScore)
        }));
        
      res.json(trending);
    } catch (error) {
      console.error('Error getting trending products:', error);
      res.status(500).json({ error: 'Failed to get trending products' });
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

  // Product creation with enhanced security
  app.post('/api/products', 
    strictRateLimit,
    isAuthenticated, 
    upload.array('images', 5),
    validateFileUpload,
    [
      validationSchemas.shortString('name', 2, 100),
      validationSchemas.longString('description', 10, 500),
      validationSchemas.shortString('category', 2, 50),
      validationSchemas.positiveNumber('price'),
      validationSchemas.shortString('unit', 1, 20),
      validationSchemas.positiveNumber('availableQuantity')
    ],
    handleValidationErrors,
    async (req: any, res: any) => {
      try {
        const userId = req.user.claims.sub;
        const farmer = await storage.getFarmerByUserId(userId);
        
        if (!farmer) {
          securityLogger.logSuspiciousActivity(req, 'Non-farmer attempted to create product', { userId });
          return res.status(403).json({ message: "Only farmers can add products" });
        }

        securityLogger.logDataAccess(userId, 'product', 'create');

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
  // Order creation with enhanced validation
  app.post('/api/orders', 
    strictRateLimit,
    isAuthenticated,
    [
      validationSchemas.shortString('deliveryAddress', 10, 200),
      validationSchemas.positiveNumber('totalAmount'),
      body('items').isArray({ min: 1 }).withMessage('Orders must contain at least one item')
    ],
    handleValidationErrors,
    async (req: any, res: any) => {
      try {
        const userId = req.user.claims.sub;
        const { items, ...orderData } = req.body;

        // Validate order items
        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ message: "Orders must contain at least one item" });
        }

        securityLogger.logDataAccess(userId, 'order', 'create');

        const orderToCreate = insertOrderSchema.parse({
          ...orderData,
          customerId: userId,
          totalAmount: parseFloat(orderData.totalAmount),
        });

        const order = await storage.createOrder(orderToCreate);

        // Create order items with validation and collect for WhatsApp notification
        const orderItems = [];
        for (const item of items) {
          const orderItemData = insertOrderItemSchema.parse({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            pricePerUnit: parseFloat(item.pricePerUnit),
          });
          await storage.createOrderItem(orderItemData);
          
          // Get product details for notification
          try {
            const product = await storage.getProduct(item.productId);
            if (product) {
              orderItems.push({
                name: product.name,
                quantity: item.quantity,
                price: parseFloat(item.pricePerUnit)
              });
            }
          } catch (productError) {
            console.warn(`[WHATSAPP] Could not fetch product ${item.productId} for notification`);
          }
        }

        // Send WhatsApp order confirmation if service is ready
        if (whatsappBot.isClientReady()) {
          try {
            const user = await storage.getUser(userId);
            const estimatedDelivery = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
            
            // For demo purposes, use a test phone number
            const demoPhone = '+1234567890'; // In real app, this would come from user profile
            
            await whatsappBot.sendOrderConfirmation({
              phone: demoPhone,
              orderId: order.id,
              customerName: user?.firstName || 'Customer',
              items: orderItems,
              total: parseFloat(orderData.totalAmount),
              deliveryAddress: orderData.deliveryAddress,
              estimatedDelivery: estimatedDelivery.toLocaleDateString()
            });
            console.log(`[WHATSAPP] Order confirmation sent for order ${order.id}`);
          } catch (whatsappError) {
            console.error('[WHATSAPP] Failed to send order confirmation:', whatsappError);
            // Don't fail the order creation if WhatsApp fails
          }
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
      
      // Send WhatsApp status update notification
      if (whatsappBot.isClientReady()) {
        try {
          // Get order details for notification
          const orders = await storage.getSimpleOrders();
          const order = orders.find(o => o.id === id);
          if (order) {
            const statusMessages: Record<string, string> = {
              'confirmed': 'Your order has been confirmed and is being prepared',
              'preparing': 'Your order is being prepared by the farmer',
              'packed': 'Your order has been packed and is ready for shipping',
              'shipped': 'Your order has been shipped and is on its way',
              'delivered': 'Your order has been delivered successfully',
              'cancelled': 'Your order has been cancelled'
            };

            await whatsappBot.sendOrderStatusUpdate({
              phone: '+1234567890', // Demo phone number
              orderId: order.id,
              customerName: order.customerName || 'Customer',
              status: status,
              statusMessage: statusMessages[status] || `Order status updated to ${status}`
            });
            console.log(`[WHATSAPP] Status update sent for order ${id}`);
          }
        } catch (whatsappError) {
          console.error('[WHATSAPP] Failed to send status update:', whatsappError);
        }
      }
      
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

  // Get bulk discounts for a product
  app.get("/api/products/:productId/bulk-discounts", async (req: any, res: any) => {
    try {
      const { productId } = req.params;
      const discounts = await storage.getBulkDiscountsForProduct(productId);
      res.json({ success: true, discounts });
    } catch (error) {
      console.error("Error getting bulk discounts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get bulk discounts"
      });
    }
  });

  // Get bulk discounts for a farmer
  app.get("/api/farmers/:farmerId/bulk-discounts", async (req: any, res: any) => {
    try {
      const { farmerId } = req.params;
      const discounts = await storage.getBulkDiscountsForFarmer(farmerId);
      res.json({ success: true, discounts });
    } catch (error) {
      console.error("Error getting farmer bulk discounts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get bulk discounts"
      });
    }
  });

  // ============= FORUM API ROUTES =============

  // Get forum categories
  app.get("/api/forum/categories", async (req, res) => {
    try {
      const categories = await storage.getForumCategories();
      res.json({ success: true, categories });
    } catch (error) {
      console.error("Error getting forum categories:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get forum categories"
      });
    }
  });

  // Get forum topics
  app.get("/api/forum/topics", async (req: any, res: any) => {
    try {
      const { categoryId } = req.query;
      const topics = await storage.getForumTopics(categoryId);
      res.json({ success: true, topics });
    } catch (error) {
      console.error("Error getting forum topics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get forum topics"
      });
    }
  });

  // Create forum topic
  app.post("/api/forum/topics", isAuthenticated, async (req: any, res: any) => {
    try {
      const { title, content, categoryId } = req.body;
      const userId = req.user.claims.sub;
      
      const slug = title.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
        + '-' + Date.now();

      const topic = await storage.createForumTopic({
        title,
        content,
        categoryId,
        userId,
        slug,
        lastReplyAt: new Date(),
        lastReplyUserId: userId
      });

      res.json({ success: true, topic });
    } catch (error) {
      console.error("Error creating forum topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create forum topic"
      });
    }
  });

  // Get forum topic details
  app.get("/api/forum/topics/:topicId", async (req: any, res: any) => {
    try {
      const { topicId } = req.params;
      const topic = await storage.getForumTopic(topicId);
      
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: "Topic not found"
        });
      }
      
      res.json({ success: true, topic });
    } catch (error) {
      console.error("Error getting forum topic:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get forum topic"
      });
    }
  });

  // Get forum posts for a topic
  app.get("/api/forum/topics/:topicId/posts", async (req: any, res: any) => {
    try {
      const { topicId } = req.params;
      const posts = await storage.getForumPosts(topicId);
      res.json({ success: true, posts });
    } catch (error) {
      console.error("Error getting forum posts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get forum posts"
      });
    }
  });

  // Create forum post/reply
  app.post("/api/forum/topics/:topicId/posts", isAuthenticated, async (req: any, res: any) => {
    try {
      const { topicId } = req.params;
      const { content, parentPostId } = req.body;
      const userId = req.user.claims.sub;

      const post = await storage.createForumPost({
        topicId,
        userId,
        content,
        parentPostId: parentPostId || null
      });

      res.json({ success: true, post });
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create forum post"
      });
    }
  });

  // Add reaction to post or topic
  app.post("/api/forum/reactions", isAuthenticated, async (req: any, res: any) => {
    try {
      const { postId, topicId, reactionType } = req.body;
      const userId = req.user.claims.sub;

      // Remove existing reaction first
      await storage.removeForumReaction(userId, postId, topicId);

      // Add new reaction
      const reaction = await storage.addForumReaction({
        userId,
        postId: postId || null,
        topicId: topicId || null,
        reactionType
      });

      res.json({ success: true, reaction });
    } catch (error) {
      console.error("Error adding forum reaction:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add reaction"
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
  
  // AI Recommendation routes
  app.get('/api/ai/recipe-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      console.log("[AI] Generating recipe recommendations for user:", req.user.claims.sub);
      
      // Get user's recent purchases to base recommendations on
      const userCartItems = await storage.getCartItems(req.user.claims.sub);
      const purchasedItems: Array<{ name: string; category: string; description?: string }> = [];
      
      // Use cart items as proxy for purchase history since orders might be limited
      for (const item of userCartItems.slice(0, 10)) {
        purchasedItems.push({
          name: item.product.name,
          category: item.product.category,
          description: item.product.description || ''
        });
      }
      
      if (purchasedItems.length === 0) {
        // If no purchase history, use some default popular items
        const allProducts = await storage.getProducts();
        const popularItems = allProducts.slice(0, 3).map((p: any) => ({
          name: p.name,
          category: p.category,
          description: p.description || ''
        }));
        
        const recipes = await aiService.generateRecipeRecommendations(popularItems);
        return res.json({ success: true, recipes, basedOn: 'popular items' });
      }
      
      const recipes = await aiService.generateRecipeRecommendations(purchasedItems);
      res.json({ success: true, recipes, basedOn: 'purchase history' });
    } catch (error) {
      console.error("Error generating recipe recommendations:", error);
      res.status(500).json({ success: false, message: "Failed to generate recipe recommendations" });
    }
  });

  app.get('/api/ai/product-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      console.log("[AI] Generating product recommendations for user:", req.user.claims.sub);
      
      // Get user's purchase history
      const userCartItems = await storage.getCartItems(req.user.claims.sub);
      const userHistory: Array<{ name: string; category: string }> = [];
      
      // Use cart items as proxy for purchase history
      for (const item of userCartItems.slice(0, 15)) {
        userHistory.push({
          name: item.product.name,
          category: item.product.category
        });
      }
      
      // Get all available products
      const availableProducts = await storage.getProducts();
      const productData = availableProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description || ''
      }));
      
      const recommendations = await aiService.getPersonalizedRecommendations(userHistory, productData, {}, 5);
      
      // Get full product details for recommendations
      const recommendedProducts = [];
      for (const rec of recommendations) {
        const product = await storage.getProduct(rec.productId);
        if (product) {
          recommendedProducts.push({
            ...product,
            reason: rec.reason,
            confidence: rec.confidence
          });
        }
      }
      
      res.json({ success: true, recommendations: recommendedProducts });
    } catch (error) {
      console.error("Error generating product recommendations:", error);
      res.status(500).json({ success: false, message: "Failed to generate product recommendations" });
    }
  });

  // Enhanced AI Product Recommendations
  app.get('/api/ai/recommendations', async (req, res) => {
    try {
      const { searchTerm, category } = req.query;
      const products = await storage.getProducts();
      const productsWithFarmers = [];
      
      // Get farmer details for products
      for (const product of products.slice(0, 20)) {
        try {
          const farmer = await storage.getFarmer(product.farmerId);
          if (farmer) {
            productsWithFarmers.push({
              ...product,
              farmer: {
                farmName: farmer.farmName,
                location: farmer.location,
                averageRating: farmer.averageRating?.toString() || '4.5'
              }
            });
          }
        } catch (err) {
          continue;
        }
      }
      
      // Enhanced mock user preferences with more sophisticated logic
      const userPreferences = {
        purchaseHistory: [],
        location: 'Kenya',
        dietaryPreferences: [],
        recentSearches: [searchTerm?.toString()].filter(Boolean),
        favoriteCategories: [category?.toString()].filter(s => s !== 'all'),
        pricePreference: 'medium', // low, medium, high
        organicPreference: true,
        localPreference: true
      };
      
      const context = {
        searchQuery: searchTerm?.toString(),
        season: getCurrentSeason(),
        timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                   new Date().getHours() < 18 ? 'afternoon' : 'evening',
        weather: 'pleasant'
      };
      
      // Smart recommendation algorithm
      const recommendations = generateSmartRecommendations(
        productsWithFarmers,
        userPreferences,
        context
      );
      
      res.json(recommendations.slice(0, 6));
    } catch (error) {
      console.error('AI recommendations error:', error);
      res.json([]); // Return empty array instead of error to prevent breaking UI
    }
  });

  // AI Search Suggestions
  app.post('/api/ai/search-suggestions', async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || query.length < 2) {
        return res.json({ suggestions: [] });
      }
      
      // Mock user preferences - in real app, get from user session
      const userPreferences = {
        purchaseHistory: [],
        location: 'Kenya',
      };
      
      const suggestions = await aiService.getSearchSuggestions(query, userPreferences);
      
      res.json({ suggestions });
    } catch (error) {
      console.error('AI search suggestions error:', error);
      res.json({ suggestions: [] }); // Return empty suggestions instead of error
    }
  });

  app.get('/api/ai/trending-products', async (req, res) => {
    try {
      console.log("[AI] Generating trending products");
      
      // Get all available products
      const allProducts = await storage.getProducts();
      const productData = allProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description || ''
      }));
      
      // Get current season context
      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
                    currentMonth >= 5 && currentMonth <= 7 ? 'summer' :
                    currentMonth >= 8 && currentMonth <= 10 ? 'fall' : 'winter';
      
      const trending = productData.slice(0, 8); // Mock trending for now
      
      // Get full product details for trending items
      const trendingProducts = [];
      for (const trend of trending) {
        const product = await storage.getProduct(trend.productId);
        if (product) {
          trendingProducts.push({
            ...product,
            reason: trend.reason,
            confidence: trend.confidence
          });
        }
      }
      
      res.json({ success: true, trending: trendingProducts, season });
    } catch (error) {
      console.error("Error generating trending products:", error);
      res.status(500).json({ success: false, message: "Failed to generate trending products" });
    }
  });

  // ============= B2B API ROUTES =============
  
  // B2B Business Registration Routes
  app.post('/api/business/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user already has a business
      const existingBusiness = await storage.getBusinessByUserId(userId);
      if (existingBusiness) {
        return res.status(400).json({ error: 'User already has a business registered' });
      }

      // Validate business data
      const businessData = insertBusinessSchema.parse({
        ...req.body,
        userId,
      });

      const business = await storage.createBusiness(businessData);
      res.json(business);
    } catch (error: any) {
      console.error('Error registering business:', error);
      res.status(400).json({ error: error.message || 'Failed to register business' });
    }
  });

  app.get('/api/business/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      res.json(business);
    } catch (error: any) {
      console.error('Error fetching business profile:', error);
      res.status(500).json({ error: 'Failed to fetch business profile' });
    }
  });

  app.put('/api/business/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      const updates = insertBusinessSchema.partial().parse(req.body);
      const updatedBusiness = await storage.updateBusiness(business.id, updates);
      
      res.json(updatedBusiness);
    } catch (error: any) {
      console.error('Error updating business profile:', error);
      res.status(400).json({ error: error.message || 'Failed to update business profile' });
    }
  });

  // B2B Bulk Order Routes
  app.post('/api/bulk-orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(403).json({ error: 'Only verified businesses can place bulk orders' });
      }

      const orderData = insertBulkOrderSchema.parse({
        ...req.body,
        businessId: business.id,
      });

      const order = await storage.createBulkOrder(orderData);
      
      // Add order items
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const itemData = insertBulkOrderItemSchema.parse({
            ...item,
            bulkOrderId: order.id,
          });
          await storage.createBulkOrderItem(itemData);
        }
      }

      // Calculate discounts
      await storage.calculateBulkOrderDiscount(order.id);

      const fullOrder = await storage.getBulkOrder(order.id);
      res.json(fullOrder);
    } catch (error: any) {
      console.error('Error creating bulk order:', error);
      res.status(400).json({ error: error.message || 'Failed to create bulk order' });
    }
  });

  app.get('/api/bulk-orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const business = await storage.getBusinessByUserId(userId);
      const farmer = await storage.getFarmerByUserId(userId);

      let orders;
      if (business) {
        orders = await storage.getBulkOrdersByBusiness(business.id);
      } else if (farmer) {
        orders = await storage.getBulkOrdersByFarmer(farmer.id);
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(orders);
    } catch (error: any) {
      console.error('Error fetching bulk orders:', error);
      res.status(500).json({ error: 'Failed to fetch bulk orders' });
    }
  });

  app.get('/api/bulk-orders/:orderId', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const order = await storage.getBulkOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error: any) {
      console.error('Error fetching bulk order:', error);
      res.status(500).json({ error: 'Failed to fetch bulk order' });
    }
  });

  app.put('/api/bulk-orders/:orderId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      await storage.updateBulkOrderStatus(orderId, status);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating bulk order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // B2B Invoices Routes
  app.get('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const business = await storage.getBusinessByUserId(userId);
      const farmer = await storage.getFarmerByUserId(userId);

      let invoices;
      if (business) {
        invoices = await storage.getInvoicesByBusiness(business.id);
      } else if (farmer) {
        invoices = await storage.getInvoicesByFarmer(farmer.id);
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(invoices);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  });

  app.get('/api/products/:productId/pricing', async (req: any, res) => {
    try {
      const { productId } = req.params;
      const { tier } = req.query;
      
      const pricing = await storage.getProductPricing(productId, tier as string);
      res.json(pricing);
    } catch (error: any) {
      console.error('Error fetching product pricing:', error);
      res.status(500).json({ error: 'Failed to fetch product pricing' });
    }
  });

  app.get('/api/business/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const analytics = await storage.getBusinessAnalytics(business.id);
      res.json(analytics);
    } catch (error: any) {
      console.error('Error fetching business analytics:', error);
      res.status(500).json({ error: 'Failed to fetch business analytics' });
    }
  });

  // Initialize sample data endpoint (for development)
  app.post('/api/init-sample-data', async (req, res) => {
    try {
      // Clear existing data first by checking if data exists
      const existingProducts = await storage.getProducts();
      if (existingProducts.length > 0) {
        return res.json({ 
          success: true, 
          message: 'Sample data already exists',
          productsCount: existingProducts.length 
        });
      }

      // Create sample users first, check if they already exist
      let user1 = await storage.getUserByEmail('farmer1@greenvalley.com');
      if (!user1) {
        user1 = await storage.createUser({
          id: randomUUID(),
          email: 'farmer1@greenvalley.com',
          password: 'samplepass123', // Sample password for demo purposes
          firstName: 'John',
          lastName: 'Kiprotich',
          profileImageUrl: null,
        });
      }

      let user2 = await storage.getUserByEmail('farmer2@sunshine.com');
      if (!user2) {
        user2 = await storage.createUser({
          id: randomUUID(),
          email: 'farmer2@sunshine.com',
          password: 'samplepass123', // Sample password for demo purposes
          firstName: 'Mary',
          lastName: 'Wanjiku',
          profileImageUrl: null,
        });
      }

      // Create sample farmers
      const farmer1 = await storage.createFarmer({
        userId: user1.id,
        farmName: 'Green Valley Farm',
        location: 'Kiambu County, Kenya',
        // experience: '10 years', // Remove non-schema field
        // certifications: ['Organic', 'Fair Trade'], // Remove non-schema field
        // specialties: ['vegetables', 'fruits'], // Remove non-schema field
        isVerified: true,
        averageRating: 4.8
      });

      const farmer2 = await storage.createFarmer({
        userId: user2.id, 
        farmName: 'Sunshine Organic Farm',
        location: 'Nakuru County, Kenya',
        // experience: '7 years', // Remove non-schema field
        // certifications: ['Organic'], // Remove non-schema field
        // specialties: ['dairy', 'grains'], // Remove non-schema field
        isVerified: true,
        averageRating: 4.6
      });

      // Create sample products
      const sampleProducts = [
        {
          name: 'Fresh Tomatoes',
          description: 'Juicy red tomatoes, perfect for cooking',
          price: '150',
          category: 'vegetables' as const,
          unit: 'kg' as const,
          availableQuantity: 100,
          farmerId: farmer1.id,
          images: null,
          isActive: true
        },
        {
          name: 'Organic Carrots',
          description: 'Sweet and crunchy organic carrots',
          price: '120',
          category: 'vegetables' as const,
          unit: 'kg' as const,
          availableQuantity: 80,
          farmerId: farmer1.id,
          images: null,
          isActive: true
        },
        {
          name: 'Fresh Spinach',
          description: 'Leafy green spinach, rich in nutrients',
          price: '80',
          category: 'vegetables' as const,
          unit: 'bunch' as const,
          availableQuantity: 50,
          farmerId: farmer1.id,
          images: null,
          isActive: true
        },
        {
          name: 'Sweet Mangoes',
          description: 'Delicious ripe mangoes from local farms',
          price: '200',
          category: 'fruits' as const,
          unit: 'kg' as const,
          availableQuantity: 60,
          farmerId: farmer2.id,
          images: null,
          isActive: true
        },
        {
          name: 'Fresh Milk',
          description: 'Pure cow milk from grass-fed cows',
          price: '60',
          category: 'dairy' as const,
          unit: 'liter' as const,
          availableQuantity: 40,
          farmerId: farmer2.id,
          images: null,
          isActive: true
        },
        {
          name: 'Organic Maize',
          description: 'High-quality organic maize kernels',
          price: '90',
          category: 'grains' as const,
          unit: 'kg' as const,
          availableQuantity: 200,
          farmerId: farmer2.id,
          images: null,
          isActive: true
        }
      ];

      for (const productData of sampleProducts) {
        await storage.createProduct(productData);
      }

      res.json({ 
        success: true, 
        message: 'Sample data initialized successfully',
        farmersCreated: 2,
        productsCreated: sampleProducts.length
      });
    } catch (error) {
      console.error('Error initializing sample data:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize sample data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Setup GPS tracking WebSocket
  setupGPSTracking(httpServer);
  
  return httpServer;
}
