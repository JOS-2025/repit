import {
  users,
  farmers,
  products,
  orders,
  orderItems,
  cartItems,
  simpleOrders,
  deliveryDrivers,
  deliveryTracking,
  locationHistory,
  escrowTransactions,
  deliveryRiders,
  deliveryAssignments,
  farmCertifications,
  productQuality,
  basketTemplates,
  customerBaskets,
  nutritionInfo,
  discounts,
  recipes,
  forumCategories,
  forumTopics,
  forumPosts,
  forumReactions,
  farmAdoptions,
  demandPredictions,
  marketTrends,
  blockchainRecords,
  iotSensors,
  sensorReadings,
  farmerRatings,
  type User,
  type UpsertUser,
  type InsertFarmer,
  type Farmer,
  type InsertProduct,
  type Product,
  type ProductWithFarmer,
  type InsertOrder,
  type Order,
  type OrderWithDetails,
  type InsertOrderItem,
  type OrderItem,
  type InsertCartItem,
  type CartItem,
  type CartItemWithProduct,
  type InsertSimpleOrder,
  type SimpleOrder,
  type DeliveryDriver,
  type InsertDeliveryDriver,
  type DeliveryTracking,
  type InsertDeliveryTracking,
  type DeliveryTrackingWithDriver,
  type FarmerRating,
  type InsertFarmerRating,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, lte, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Farmer operations
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  getFarmerByUserId(userId: string): Promise<Farmer | undefined>;
  getFarmer(farmerId: string): Promise<Farmer | undefined>;
  updateFarmerVerification(farmerId: string, isVerified: boolean): Promise<void>;
  updateFarmer(farmerId: string, updates: Partial<InsertFarmer>): Promise<Farmer>;
  getFarmerWithDetails(farmerId: string): Promise<any>;
  
  // Farmer rating operations
  createFarmerRating(rating: InsertFarmerRating): Promise<FarmerRating>;
  getFarmerRatings(farmerId: string): Promise<any[]>;
  getFarmerRatingStats(farmerId: string): Promise<any>;
  canRateFarmer(userId: string, farmerId: string): Promise<boolean>;
  getUserFarmerRating(userId: string, farmerId: string): Promise<FarmerRating | undefined>;
  updateFarmerAverageRating(farmerId: string): Promise<void>;
  
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(category?: string): Promise<ProductWithFarmer[]>;
  getProductsByFarmer(farmerId: string): Promise<Product[]>;
  getProduct(productId: string): Promise<ProductWithFarmer | undefined>;
  updateProduct(productId: string, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(productId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrdersByCustomer(customerId: string): Promise<OrderWithDetails[]>;
  getOrdersByFarmer(farmerId: string): Promise<OrderWithDetails[]>;
  getOrder(orderId: string): Promise<OrderWithDetails | undefined>;
  updateOrderStatus(orderId: string, status: string): Promise<void>;
  
  // Cart operations
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void>;
  removeFromCart(cartItemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Simple order operations
  createSimpleOrder(order: InsertSimpleOrder): Promise<SimpleOrder>;
  getSimpleOrders(): Promise<SimpleOrder[]>;
  updateSimpleOrderStatus(orderId: string, status: string): Promise<void>;
  
  // GPS Tracking operations
  getDriverByUserId(userId: string): Promise<DeliveryDriver | undefined>;
  getDriverAssignments(driverId: string): Promise<any[]>;
  createDeliveryAssignment(assignment: any): Promise<any>;
  getDeliveryTracking(orderId: string): Promise<any>;
  
  // Price comparison operations
  getPriceComparisons(productName: string, category: string): Promise<any[]>;
  getPriceComparisonStats(productName: string, category: string): Promise<any>;
  
  // Subscription order operations
  createSubscriptionOrder(subscription: any): Promise<any>;
  getSubscriptionOrders(userId: string): Promise<any[]>;
  updateSubscriptionOrder(id: string, data: any): Promise<any>;
  deleteSubscriptionOrder(id: string): Promise<void>;
  
  // Escrow payment operations
  createEscrowTransaction(transaction: any): Promise<any>;
  getEscrowTransaction(transactionId: string): Promise<any>;
  updateEscrowStatus(transactionId: string, status: string, data?: any): Promise<void>;
  getEscrowTransactionsByOrder(orderId: string): Promise<any[]>;
  
  // Delivery rider operations
  createDeliveryRider(rider: any): Promise<any>;
  getDeliveryRider(riderId: string): Promise<any>;
  getAvailableRiders(location: string): Promise<any[]>;
  updateRiderStatus(riderId: string, status: string): Promise<void>;
  
  // Quality assurance operations
  addProductQuality(quality: any): Promise<any>;
  getProductQuality(productId: string): Promise<any>;
  addFarmCertification(certification: any): Promise<any>;
  getFarmCertifications(farmerId: string): Promise<any[]>;
  
  // Basket operations
  createBasketTemplate(basket: any): Promise<any>;
  getBasketTemplates(): Promise<any[]>;
  createCustomerBasket(basket: any): Promise<any>;

  // Bulk discount operations
  getBulkDiscountsForProduct(productId: string): Promise<any[]>;
  getBulkDiscountsForFarmer(farmerId: string): Promise<any[]>;

  // Forum operations
  getForumCategories(): Promise<any[]>;
  getForumTopics(categoryId?: string): Promise<any[]>;
  createForumTopic(topic: any): Promise<any>;
  getForumTopic(topicId: string): Promise<any>;
  getForumPosts(topicId: string): Promise<any[]>;
  createForumPost(post: any): Promise<any>;
  addForumReaction(reaction: any): Promise<any>;
  removeForumReaction(userId: string, postId?: string, topicId?: string): Promise<void>;
  getCustomerBaskets(customerId: string): Promise<any[]>;
  
  // Nutrition and recipe operations
  addNutritionInfo(nutrition: any): Promise<any>;
  getNutritionInfo(productId: string): Promise<any>;
  createRecipe(recipe: any): Promise<any>;
  getRecipes(filters?: any): Promise<any[]>;
  
  // Farm adoption operations
  createFarmAdoption(adoption: any): Promise<any>;
  getFarmAdoptions(customerId: string): Promise<any[]>;
  updateFarmAdoption(adoptionId: string, data: any): Promise<any>;
  
  // AI and analytics operations
  saveDemandPrediction(prediction: any): Promise<any>;
  getDemandPredictions(productId: string, location: string): Promise<any[]>;
  saveMarketTrend(trend: any): Promise<any>;
  getMarketTrends(category: string, location: string): Promise<any[]>;
  
  // Blockchain and IoT operations
  saveBlockchainRecord(record: any): Promise<any>;
  getBlockchainRecords(productId: string): Promise<any[]>;
  createIoTSensor(sensor: any): Promise<any>;
  saveSensorReading(reading: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Farmer operations
  async createFarmer(farmer: InsertFarmer): Promise<Farmer> {
    const [newFarmer] = await db
      .insert(farmers)
      .values(farmer)
      .returning();
    return newFarmer;
  }

  async getFarmerByUserId(userId: string): Promise<Farmer | undefined> {
    const [farmer] = await db
      .select()
      .from(farmers)
      .where(eq(farmers.userId, userId));
    return farmer;
  }

  async getFarmer(farmerId: string): Promise<Farmer | undefined> {
    const [farmer] = await db
      .select()
      .from(farmers)
      .where(eq(farmers.id, farmerId));
    return farmer;
  }

  async updateFarmerVerification(farmerId: string, isVerified: boolean): Promise<void> {
    await db
      .update(farmers)
      .set({ isVerified, updatedAt: new Date() })
      .where(eq(farmers.id, farmerId));
  }

  async updateFarmer(farmerId: string, updates: Partial<InsertFarmer>): Promise<Farmer> {
    const [updatedFarmer] = await db
      .update(farmers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(farmers.id, farmerId))
      .returning();
    return updatedFarmer;
  }

  async getFarmerWithDetails(farmerId: string): Promise<any> {
    const [result] = await db
      .select()
      .from(farmers)
      .innerJoin(users, eq(farmers.userId, users.id))
      .where(eq(farmers.id, farmerId));
    
    if (!result) return undefined;
    
    return {
      ...result.farmers,
      user: result.users
    };
  }

  // Farmer rating operations
  async createFarmerRating(rating: InsertFarmerRating): Promise<FarmerRating> {
    const [newRating] = await db
      .insert(farmerRatings)
      .values(rating)
      .returning();
    
    // Update farmer's average rating
    await this.updateFarmerAverageRating(rating.farmerId);
    
    return newRating;
  }

  async getFarmerRatings(farmerId: string): Promise<any[]> {
    const ratings = await db
      .select()
      .from(farmerRatings)
      .innerJoin(users, eq(farmerRatings.userId, users.id))
      .where(eq(farmerRatings.farmerId, farmerId))
      .orderBy(desc(farmerRatings.createdAt));
    
    return ratings.map(row => ({
      ...row.farmer_ratings,
      user: {
        id: row.users.id,
        firstName: row.users.firstName,
        lastName: row.users.lastName,
        profileImageUrl: row.users.profileImageUrl
      }
    }));
  }

  async getFarmerRatingStats(farmerId: string): Promise<any> {
    const stats = await db
      .select({
        totalRatings: farmers.totalRatings,
        averageRating: farmers.averageRating,
      })
      .from(farmers)
      .where(eq(farmers.id, farmerId));
    
    const ratingDistribution = await db
      .select()
      .from(farmerRatings)
      .where(eq(farmerRatings.farmerId, farmerId));
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(rating => {
      distribution[rating.rating as keyof typeof distribution]++;
    });
    
    return {
      ...stats[0],
      ratingDistribution: distribution
    };
  }

  async canRateFarmer(userId: string, farmerId: string): Promise<boolean> {
    // Check if user has purchased from this farmer
    const purchases = await db
      .select()
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          eq(orders.customerId, userId),
          eq(products.farmerId, farmerId),
          eq(orders.status, "completed")
        )
      );
    
    return purchases.length > 0;
  }

  async getUserFarmerRating(userId: string, farmerId: string): Promise<FarmerRating | undefined> {
    const [rating] = await db
      .select()
      .from(farmerRatings)
      .where(
        and(
          eq(farmerRatings.userId, userId),
          eq(farmerRatings.farmerId, farmerId)
        )
      );
    return rating;
  }

  async updateFarmerAverageRating(farmerId: string): Promise<void> {
    const ratings = await db
      .select()
      .from(farmerRatings)
      .where(eq(farmerRatings.farmerId, farmerId));
    
    if (ratings.length === 0) {
      await db
        .update(farmers)
        .set({ averageRating: "0", totalRatings: 0 })
        .where(eq(farmers.id, farmerId));
      return;
    }
    
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = (totalRating / ratings.length).toFixed(2);
    
    await db
      .update(farmers)
      .set({ 
        averageRating: averageRating,
        totalRatings: ratings.length,
        updatedAt: new Date()
      })
      .where(eq(farmers.id, farmerId));
  }

  // Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async getProducts(category?: string): Promise<ProductWithFarmer[]> {
    const query = db
      .select()
      .from(products)
      .innerJoin(farmers, eq(products.farmerId, farmers.id))
      .innerJoin(users, eq(farmers.userId, users.id))
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt));

    const results = category ? 
      await db
        .select()
        .from(products)
        .innerJoin(farmers, eq(products.farmerId, farmers.id))
        .innerJoin(users, eq(farmers.userId, users.id))
        .where(and(eq(products.isActive, true), eq(products.category, category as any)))
        .orderBy(desc(products.createdAt)) :
      await query;
    
    return results.map(result => ({
      ...result.products,
      farmer: {
        ...result.farmers,
        user: result.users
      }
    }));
  }

  async getProductsByFarmer(farmerId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.farmerId, farmerId))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(productId: string): Promise<ProductWithFarmer | undefined> {
    const [result] = await db
      .select()
      .from(products)
      .innerJoin(farmers, eq(products.farmerId, farmers.id))
      .innerJoin(users, eq(farmers.userId, users.id))
      .where(eq(products.id, productId));

    if (!result) return undefined;

    return {
      ...result.products,
      farmer: {
        ...result.farmers,
        user: result.users
      }
    };
  }

  async updateProduct(productId: string, updates: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(productId: string): Promise<void> {
    await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, productId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return newOrderItem;
  }

  async getOrdersByCustomer(customerId: string): Promise<OrderWithDetails[]> {
    const results = await db
      .select()
      .from(orders)
      .innerJoin(users, eq(orders.customerId, users.id))
      .innerJoin(farmers, eq(orders.farmerId, farmers.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));

    return this.groupOrderResults(results);
  }

  async getOrdersByFarmer(farmerId: string): Promise<OrderWithDetails[]> {
    const results = await db
      .select()
      .from(orders)
      .innerJoin(users, eq(orders.customerId, users.id))
      .innerJoin(farmers, eq(orders.farmerId, farmers.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.farmerId, farmerId))
      .orderBy(desc(orders.createdAt));

    return this.groupOrderResults(results);
  }

  async getOrder(orderId: string): Promise<OrderWithDetails | undefined> {
    const results = await db
      .select()
      .from(orders)
      .innerJoin(users, eq(orders.customerId, users.id))
      .innerJoin(farmers, eq(orders.farmerId, farmers.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.id, orderId));

    const grouped = this.groupOrderResults(results);
    return grouped[0];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }

  private groupOrderResults(results: any[]): OrderWithDetails[] {
    const orderMap = new Map();

    results.forEach(result => {
      const orderId = result.orders.id;
      
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          ...result.orders,
          customer: result.users,
          farmer: result.farmers,
          orderItems: []
        });
      }

      if (result.order_items && result.products) {
        const order = orderMap.get(orderId);
        order.orderItems.push({
          ...result.order_items,
          product: result.products
        });
      }
    });

    return Array.from(orderMap.values());
  }

  // Cart operations
  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, cartItem.userId),
        eq(cartItems.productId, cartItem.productId)
      ));

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ 
          quantity: existing.quantity + cartItem.quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    } else {
      // Insert new cart item
      const [newCartItem] = await db
        .insert(cartItems)
        .values(cartItem)
        .returning();
      return newCartItem;
    }
  }

  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const results = await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(farmers, eq(products.farmerId, farmers.id))
      .innerJoin(users, eq(farmers.userId, users.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(asc(cartItems.createdAt));

    return results.map(result => ({
      ...result.cart_items,
      product: {
        ...result.products,
        farmer: {
          ...result.farmers,
          user: result.users
        }
      }
    }));
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
    await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, cartItemId));
  }

  async removeFromCart(cartItemId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(eq(cartItems.id, cartItemId));
  }

  async clearCart(userId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  // Simple order operations
  async createSimpleOrder(order: InsertSimpleOrder): Promise<SimpleOrder> {
    const [simpleOrder] = await db
      .insert(simpleOrders)
      .values(order)
      .returning();
    return simpleOrder;
  }

  async getSimpleOrders(): Promise<SimpleOrder[]> {
    return await db
      .select()
      .from(simpleOrders)
      .orderBy(desc(simpleOrders.createdAt));
  }

  async updateSimpleOrderStatus(orderId: string, status: string): Promise<void> {
    await db
      .update(simpleOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(simpleOrders.id, orderId));
  }

  // GPS Tracking operations
  async getDriverByUserId(userId: string): Promise<DeliveryDriver | undefined> {
    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, userId));
    return driver;
  }

  async getDriverAssignments(driverId: string): Promise<any[]> {
    const assignments = await db
      .select({
        id: deliveryTracking.id,
        orderId: deliveryTracking.orderId,
        status: deliveryTracking.status,
        pickupAddress: deliveryTracking.pickupAddress,
        deliveryAddress: deliveryTracking.deliveryAddress,
        pickupLatitude: deliveryTracking.pickupLatitude,
        pickupLongitude: deliveryTracking.pickupLongitude,
        deliveryLatitude: deliveryTracking.deliveryLatitude,
        deliveryLongitude: deliveryTracking.deliveryLongitude,
        estimatedArrival: deliveryTracking.estimatedArrival,
        distanceKm: deliveryTracking.distanceKm,
        createdAt: deliveryTracking.createdAt,
        customerName: orders.customerId, // Will need to join with users
        customerPhone: orders.phoneNumber,
      })
      .from(deliveryTracking)
      .innerJoin(orders, eq(deliveryTracking.orderId, orders.id))
      .where(eq(deliveryTracking.driverId, driverId))
      .orderBy(desc(deliveryTracking.createdAt));

    // Get order items for each assignment
    const assignmentsWithDetails = [];
    for (const assignment of assignments) {
      const assignmentOrderItems = await db
        .select({
          productName: products.name,
          quantity: orderItems.quantity,
          farmerName: farmers.farmName,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(farmers, eq(products.farmerId, farmers.id))
        .where(eq(orderItems.orderId, assignment.orderId));

      // Get customer details
      const [customer] = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.id, assignment.customerName));

      assignmentsWithDetails.push({
        ...assignment,
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer',
        orderItems: assignmentOrderItems,
      });
    }

    return assignmentsWithDetails;
  }

  async createDeliveryAssignment(assignment: any): Promise<any> {
    const [newAssignment] = await db
      .insert(deliveryTracking)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async getDeliveryTracking(orderId: string): Promise<any> {
    const [tracking] = await db
      .select({
        orderId: deliveryTracking.orderId,
        status: deliveryTracking.status,
        currentLatitude: deliveryTracking.currentLatitude,
        currentLongitude: deliveryTracking.currentLongitude,
        pickupAddress: deliveryTracking.pickupAddress,
        deliveryAddress: deliveryTracking.deliveryAddress,
        estimatedArrival: deliveryTracking.estimatedArrival,
        distanceKm: deliveryTracking.distanceKm,
        lastUpdate: deliveryTracking.updatedAt,
        driverName: deliveryDrivers.driverName,
        driverPhone: deliveryDrivers.phoneNumber,
        vehicleType: deliveryDrivers.vehicleType,
        vehicleNumber: deliveryDrivers.vehicleNumber,
      })
      .from(deliveryTracking)
      .leftJoin(deliveryDrivers, eq(deliveryTracking.driverId, deliveryDrivers.id))
      .where(eq(deliveryTracking.orderId, orderId))
      .limit(1);

    if (!tracking) return null;

    // Get location history
    const locationHistoryData = await db
      .select({
        latitude: locationHistory.latitude,
        longitude: locationHistory.longitude,
        recordedAt: locationHistory.recordedAt,
        speed: locationHistory.speed,
      })
      .from(locationHistory)
      .where(eq(locationHistory.deliveryTrackingId, tracking.orderId))
      .orderBy(desc(locationHistory.recordedAt))
      .limit(20);

    return {
      ...tracking,
      locationHistory: locationHistoryData.reverse(), // Oldest first for route display
    };
  }

  // Price comparison operations - stub implementations
  async getPriceComparisons(productName: string, category: string): Promise<any[]> {
    // Mock data for now - will implement proper logic later
    return [
      {
        farmerId: "farm1",
        farmerName: "Green Valley Farm",
        farmLocation: "Nakuru",
        price: 150,
        rating: 4.5,
        inStock: true,
        verified: true,
        distance: 5
      },
      {
        farmerId: "farm2", 
        farmerName: "Sunshine Acres",
        farmLocation: "Eldoret",
        price: 120,
        rating: 4.8,
        inStock: true,
        verified: true,
        distance: 12
      }
    ];
  }

  async getPriceComparisonStats(productName: string, category: string): Promise<any> {
    // Mock data for now - will implement proper logic later
    return {
      averagePrice: 135,
      lowestPrice: 120,
      highestPrice: 150,
      farmersCount: 2
    };
  }

  // Subscription order operations - stub implementations
  async createSubscriptionOrder(subscription: any): Promise<any> {
    // Will implement with proper schema later
    return { id: "sub123", ...subscription };
  }

  async getSubscriptionOrders(userId: string): Promise<any[]> {
    // Mock data for now
    return [];
  }

  async updateSubscriptionOrder(id: string, data: any): Promise<any> {
    // Will implement later
    return { id, ...data };
  }

  async deleteSubscriptionOrder(id: string): Promise<void> {
    // Will implement later
  }
  
  // ============= ESCROW PAYMENT OPERATIONS =============
  
  async createEscrowTransaction(transaction: any): Promise<any> {
    const [newTransaction] = await db
      .insert(escrowTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }
  
  async getEscrowTransaction(transactionId: string): Promise<any> {
    const [transaction] = await db
      .select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.id, transactionId));
    return transaction;
  }
  
  async updateEscrowStatus(transactionId: string, status: string, data?: any): Promise<void> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (status === 'held') updateData.heldAt = new Date();
    if (status === 'released') updateData.releasedAt = new Date();
    if (status === 'refunded') updateData.refundedAt = new Date();
    
    if (data) Object.assign(updateData, data);
    
    await db
      .update(escrowTransactions)
      .set(updateData)
      .where(eq(escrowTransactions.id, transactionId));
  }
  
  async getEscrowTransactionsByOrder(orderId: string): Promise<any[]> {
    return await db
      .select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.orderId, orderId))
      .orderBy(desc(escrowTransactions.createdAt));
  }
  
  // ============= DELIVERY RIDER OPERATIONS =============
  
  async createDeliveryRider(rider: any): Promise<any> {
    const [newRider] = await db
      .insert(deliveryRiders)
      .values(rider)
      .returning();
    return newRider;
  }
  
  async getDeliveryRider(riderId: string): Promise<any> {
    const [rider] = await db
      .select()
      .from(deliveryRiders)
      .innerJoin(users, eq(deliveryRiders.userId, users.id))
      .where(eq(deliveryRiders.id, riderId));
      
    if (!rider) return undefined;
    
    return {
      ...rider.delivery_riders,
      user: rider.users
    };
  }
  
  async getAvailableRiders(location: string): Promise<any[]> {
    return await db
      .select()
      .from(deliveryRiders)
      .innerJoin(users, eq(deliveryRiders.userId, users.id))
      .where(and(
        eq(deliveryRiders.isOnline, true),
        eq(deliveryRiders.status, 'active')
      ))
      .orderBy(asc(deliveryRiders.rating));
  }
  
  async updateRiderStatus(riderId: string, status: string): Promise<void> {
    await db
      .update(deliveryRiders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(deliveryRiders.id, riderId));
  }
  
  // ============= QUALITY ASSURANCE OPERATIONS =============
  
  async addProductQuality(quality: any): Promise<any> {
    const [newQuality] = await db
      .insert(productQuality)
      .values(quality)
      .returning();
    return newQuality;
  }
  
  async getProductQuality(productId: string): Promise<any> {
    const [quality] = await db
      .select()
      .from(productQuality)
      .where(eq(productQuality.productId, productId));
    return quality;
  }
  
  async addFarmCertification(certification: any): Promise<any> {
    const [newCertification] = await db
      .insert(farmCertifications)
      .values(certification)
      .returning();
    return newCertification;
  }
  
  async getFarmCertifications(farmerId: string): Promise<any[]> {
    return await db
      .select()
      .from(farmCertifications)
      .where(eq(farmCertifications.farmerId, farmerId))
      .orderBy(desc(farmCertifications.createdAt));
  }
  
  // ============= BASKET OPERATIONS =============
  
  async createBasketTemplate(basket: any): Promise<any> {
    const [newBasket] = await db
      .insert(basketTemplates)
      .values(basket)
      .returning();
    return newBasket;
  }
  
  async getBasketTemplates(): Promise<any[]> {
    return await db
      .select()
      .from(basketTemplates)
      .where(eq(basketTemplates.isActive, true))
      .orderBy(desc(basketTemplates.createdAt));
  }

  // ============= BULK DISCOUNT OPERATIONS =============
  
  async getBulkDiscountsForProduct(productId: string): Promise<any[]> {
    const now = new Date();
    return await db
      .select()
      .from(discounts)
      .where(
        and(
          eq(discounts.productId, productId),
          eq(discounts.discountType, 'bulk'),
          eq(discounts.isActive, true),
          lte(discounts.startDate, now),
          gte(discounts.endDate, now)
        )
      )
      .orderBy(asc(discounts.minQuantity));
  }

  async getBulkDiscountsForFarmer(farmerId: string): Promise<any[]> {
    const now = new Date();
    return await db
      .select()
      .from(discounts)
      .where(
        and(
          eq(discounts.farmerId, farmerId),
          eq(discounts.discountType, 'bulk'),
          eq(discounts.isActive, true),
          lte(discounts.startDate, now),
          gte(discounts.endDate, now)
        )
      )
      .orderBy(asc(discounts.minQuantity));
  }

  // ============= FORUM OPERATIONS =============

  async getForumCategories(): Promise<any[]> {
    return await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.isActive, true))
      .orderBy(asc(forumCategories.sortOrder));
  }

  async getForumTopics(categoryId?: string): Promise<any[]> {
    const query = db
      .select({
        id: forumTopics.id,
        categoryId: forumTopics.categoryId,
        title: forumTopics.title,
        content: forumTopics.content,
        slug: forumTopics.slug,
        isPinned: forumTopics.isPinned,
        isLocked: forumTopics.isLocked,
        viewCount: forumTopics.viewCount,
        replyCount: forumTopics.replyCount,
        lastReplyAt: forumTopics.lastReplyAt,
        createdAt: forumTopics.createdAt,
        updatedAt: forumTopics.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        category: {
          id: forumCategories.id,
          name: forumCategories.name,
          slug: forumCategories.slug,
          color: forumCategories.color,
        }
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.userId, users.id))
      .leftJoin(forumCategories, eq(forumTopics.categoryId, forumCategories.id));

    if (categoryId) {
      query.where(eq(forumTopics.categoryId, categoryId));
    }

    return await query
      .orderBy(desc(forumTopics.isPinned), desc(forumTopics.lastReplyAt), desc(forumTopics.createdAt));
  }

  async createForumTopic(topic: any): Promise<any> {
    const [newTopic] = await db
      .insert(forumTopics)
      .values(topic)
      .returning();
    return newTopic;
  }

  async getForumTopic(topicId: string): Promise<any> {
    const [topic] = await db
      .select({
        id: forumTopics.id,
        categoryId: forumTopics.categoryId,
        title: forumTopics.title,
        content: forumTopics.content,
        slug: forumTopics.slug,
        isPinned: forumTopics.isPinned,
        isLocked: forumTopics.isLocked,
        viewCount: forumTopics.viewCount,
        replyCount: forumTopics.replyCount,
        lastReplyAt: forumTopics.lastReplyAt,
        createdAt: forumTopics.createdAt,
        updatedAt: forumTopics.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        category: {
          id: forumCategories.id,
          name: forumCategories.name,
          slug: forumCategories.slug,
          color: forumCategories.color,
        }
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.userId, users.id))
      .leftJoin(forumCategories, eq(forumTopics.categoryId, forumCategories.id))
      .where(eq(forumTopics.id, topicId));

    if (topic) {
      // Increment view count
      await db
        .update(forumTopics)
        .set({ viewCount: sql`${forumTopics.viewCount} + 1` })
        .where(eq(forumTopics.id, topicId));
    }

    return topic;
  }

  async getForumPosts(topicId: string): Promise<any[]> {
    return await db
      .select({
        id: forumPosts.id,
        topicId: forumPosts.topicId,
        content: forumPosts.content,
        parentPostId: forumPosts.parentPostId,
        isDeleted: forumPosts.isDeleted,
        editedAt: forumPosts.editedAt,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(and(
        eq(forumPosts.topicId, topicId),
        eq(forumPosts.isDeleted, false)
      ))
      .orderBy(asc(forumPosts.createdAt));
  }

  async createForumPost(post: any): Promise<any> {
    const [newPost] = await db
      .insert(forumPosts)
      .values(post)
      .returning();

    // Update topic reply count and last reply time
    await db
      .update(forumTopics)
      .set({
        replyCount: sql`${forumTopics.replyCount} + 1`,
        lastReplyAt: new Date(),
        lastReplyUserId: post.userId
      })
      .where(eq(forumTopics.id, post.topicId));

    return newPost;
  }

  async addForumReaction(reaction: any): Promise<any> {
    const [newReaction] = await db
      .insert(forumReactions)
      .values(reaction)
      .returning();
    return newReaction;
  }

  async removeForumReaction(userId: string, postId?: string, topicId?: string): Promise<void> {
    const conditions = [eq(forumReactions.userId, userId)];
    
    if (postId) {
      conditions.push(eq(forumReactions.postId, postId));
    }
    if (topicId) {
      conditions.push(eq(forumReactions.topicId, topicId));
    }
    
    await db.delete(forumReactions).where(and(...conditions));
  }
  
  async createCustomerBasket(basket: any): Promise<any> {
    const [newBasket] = await db
      .insert(customerBaskets)
      .values(basket)
      .returning();
    return newBasket;
  }
  
  async getCustomerBaskets(customerId: string): Promise<any[]> {
    return await db
      .select()
      .from(customerBaskets)
      .where(eq(customerBaskets.customerId, customerId))
      .orderBy(desc(customerBaskets.createdAt));
  }
  
  // ============= NUTRITION AND RECIPE OPERATIONS =============
  
  async addNutritionInfo(nutrition: any): Promise<any> {
    const [newNutrition] = await db
      .insert(nutritionInfo)
      .values(nutrition)
      .returning();
    return newNutrition;
  }
  
  async getNutritionInfo(productId: string): Promise<any> {
    const [nutrition] = await db
      .select()
      .from(nutritionInfo)
      .where(eq(nutritionInfo.productId, productId));
    return nutrition;
  }
  
  async createRecipe(recipe: any): Promise<any> {
    const [newRecipe] = await db
      .insert(recipes)
      .values(recipe)
      .returning();
    return newRecipe;
  }
  
  async getRecipes(filters?: any): Promise<any[]> {
    return await db
      .select()
      .from(recipes)
      .orderBy(desc(recipes.rating), desc(recipes.views));
  }
  
  // ============= FARM ADOPTION OPERATIONS =============
  
  async createFarmAdoption(adoption: any): Promise<any> {
    const [newAdoption] = await db
      .insert(farmAdoptions)
      .values(adoption)
      .returning();
    return newAdoption;
  }
  
  async getFarmAdoptions(customerId: string): Promise<any[]> {
    return await db
      .select()
      .from(farmAdoptions)
      .innerJoin(farmers, eq(farmAdoptions.farmerId, farmers.id))
      .innerJoin(users, eq(farmers.userId, users.id))
      .where(eq(farmAdoptions.customerId, customerId))
      .orderBy(desc(farmAdoptions.createdAt));
  }
  
  async updateFarmAdoption(adoptionId: string, data: any): Promise<any> {
    const [updated] = await db
      .update(farmAdoptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(farmAdoptions.id, adoptionId))
      .returning();
    return updated;
  }
  
  // ============= AI AND ANALYTICS OPERATIONS =============
  
  async saveDemandPrediction(prediction: any): Promise<any> {
    const [newPrediction] = await db
      .insert(demandPredictions)
      .values(prediction)
      .returning();
    return newPrediction;
  }
  
  async getDemandPredictions(productId: string, location: string): Promise<any[]> {
    return await db
      .select()
      .from(demandPredictions)
      .where(and(
        eq(demandPredictions.productId, productId),
        eq(demandPredictions.location, location)
      ))
      .orderBy(desc(demandPredictions.predictionDate));
  }
  
  async saveMarketTrend(trend: any): Promise<any> {
    const [newTrend] = await db
      .insert(marketTrends)
      .values(trend)
      .returning();
    return newTrend;
  }
  
  async getMarketTrends(category: string, location: string): Promise<any[]> {
    return await db
      .select()
      .from(marketTrends)
      .where(and(
        eq(marketTrends.category, category as any),
        eq(marketTrends.location, location)
      ))
      .orderBy(desc(marketTrends.periodDate));
  }
  
  // ============= BLOCKCHAIN AND IOT OPERATIONS =============
  
  async saveBlockchainRecord(record: any): Promise<any> {
    const [newRecord] = await db
      .insert(blockchainRecords)
      .values(record)
      .returning();
    return newRecord;
  }
  
  async getBlockchainRecords(productId: string): Promise<any[]> {
    return await db
      .select()
      .from(blockchainRecords)
      .where(eq(blockchainRecords.productId, productId))
      .orderBy(desc(blockchainRecords.timestamp));
  }
  
  async createIoTSensor(sensor: any): Promise<any> {
    const [newSensor] = await db
      .insert(iotSensors)
      .values(sensor)
      .returning();
    return newSensor;
  }
  
  async saveSensorReading(reading: any): Promise<any> {
    const [newReading] = await db
      .insert(sensorReadings)
      .values(reading)
      .returning();
    return newReading;
  }
}

export const storage = new DatabaseStorage();
