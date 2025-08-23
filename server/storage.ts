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
  businesses,
  bulkOrders,
  bulkOrderItems,
  recurringBulkOrders,
  recurringBulkOrderItems,
  invoices,
  volumeDiscounts,
  productPricing,
  type User,
  type InsertUser,
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
  type InsertBusiness,
  type Business,
  type InsertBulkOrder,
  type BulkOrder,
  type InsertBulkOrderItem,
  type BulkOrderItem,
  type InsertRecurringBulkOrder,
  type RecurringBulkOrder,
  type InsertRecurringBulkOrderItem,
  type RecurringBulkOrderItem,
  type InsertInvoice,
  type Invoice,
  type InsertVolumeDiscount,
  type VolumeDiscount,
  type InsertProductPricing,
  type ProductPricing,
  productSubscriptions,
  productNotifications,
  type ProductSubscription,
  type InsertProductSubscription,
  type ProductNotification,
  type InsertProductNotification,
  userPreferences,
  paymentMethods,
  type UserPreferences,
  type InsertUserPreferences,
  type PaymentMethod,
  type InsertPaymentMethod,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, lte, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations for simple auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  
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
  
  // B2B Business operations
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusinessByUserId(userId: string): Promise<Business | undefined>;
  getBusiness(businessId: string): Promise<Business | undefined>;
  updateBusinessVerification(businessId: string, status: string, verifierId?: string): Promise<void>;
  updateBusiness(businessId: string, updates: Partial<InsertBusiness>): Promise<Business>;
  getBusinesses(status?: string): Promise<Business[]>;
  
  // B2B Bulk Order operations
  createBulkOrder(order: InsertBulkOrder): Promise<BulkOrder>;
  createBulkOrderItem(item: InsertBulkOrderItem): Promise<BulkOrderItem>;
  getBulkOrdersByBusiness(businessId: string): Promise<any[]>;
  getBulkOrdersByFarmer(farmerId: string): Promise<any[]>;
  getBulkOrder(orderId: string): Promise<any>;
  updateBulkOrderStatus(orderId: string, status: string): Promise<void>;
  calculateBulkOrderDiscount(orderId: string): Promise<void>;
  
  // B2B Recurring Order operations
  createRecurringBulkOrder(order: InsertRecurringBulkOrder): Promise<RecurringBulkOrder>;
  createRecurringBulkOrderItem(item: InsertRecurringBulkOrderItem): Promise<RecurringBulkOrderItem>;
  getRecurringBulkOrdersByBusiness(businessId: string): Promise<any[]>;
  getRecurringBulkOrdersByFarmer(farmerId: string): Promise<any[]>;
  updateRecurringBulkOrder(orderId: string, updates: Partial<InsertRecurringBulkOrder>): Promise<void>;
  processRecurringBulkOrders(): Promise<void>;
  
  // B2B Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoicesByBusiness(businessId: string): Promise<Invoice[]>;
  getInvoicesByFarmer(farmerId: string): Promise<Invoice[]>;
  getInvoice(invoiceId: string): Promise<Invoice | undefined>;
  updateInvoiceStatus(invoiceId: string, status: string): Promise<void>;
  generateInvoiceNumber(): Promise<string>;
  
  // B2B Volume Discount operations
  createVolumeDiscount(discount: InsertVolumeDiscount): Promise<VolumeDiscount>;
  getVolumeDiscountsByFarmer(farmerId: string): Promise<VolumeDiscount[]>;
  getVolumeDiscountsByProduct(productId: string): Promise<VolumeDiscount[]>;
  updateVolumeDiscount(discountId: string, updates: Partial<InsertVolumeDiscount>): Promise<void>;
  deleteVolumeDiscount(discountId: string): Promise<void>;
  getApplicableVolumeDiscount(productId: string, quantity: number): Promise<VolumeDiscount | undefined>;
  
  // B2B Product Pricing operations
  createProductPricing(pricing: InsertProductPricing): Promise<ProductPricing>;
  getProductPricing(productId: string, tier?: string): Promise<ProductPricing[]>;
  updateProductPricing(pricingId: string, updates: Partial<InsertProductPricing>): Promise<void>;
  deleteProductPricing(pricingId: string): Promise<void>;
  getProductPrice(productId: string, tier: string, quantity?: number): Promise<number>;
  
  // B2B Analytics operations
  getBusinessAnalytics(businessId: string): Promise<any>;
  getFarmerB2BAnalytics(farmerId: string): Promise<any>;
  getB2BMarketInsights(): Promise<any>;

  // Product notification operations
  getActiveProductSubscriptions(): Promise<ProductSubscription[]>;
  getUserProductSubscriptions(userId: string): Promise<ProductSubscription[]>;
  createProductSubscription(data: InsertProductSubscription): Promise<ProductSubscription>;
  updateProductSubscription(id: string, data: Partial<ProductSubscription>): Promise<ProductSubscription | undefined>;
  deleteProductSubscription(id: string): Promise<boolean>;
  createProductNotification(data: InsertProductNotification): Promise<ProductNotification>;
  getProductNotifications(filters?: { userId?: string; productId?: string; status?: string }): Promise<ProductNotification[]>;

  // User preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, updates: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  upsertUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;

  // Payment method operations
  getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  getPaymentMethod(paymentMethodId: string): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(paymentMethodId: string, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod>;
  deletePaymentMethod(paymentMethodId: string): Promise<void>;
  setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
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
          eq(orders.status, "delivered")
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
  // ============= B2B IMPLEMENTATIONS =============
  
  // B2B Business operations
  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db
      .insert(businesses)
      .values(business)
      .returning();
    return newBusiness;
  }

  async getBusinessByUserId(userId: string): Promise<Business | undefined> {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, userId));
    return business;
  }

  async getBusiness(businessId: string): Promise<Business | undefined> {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId));
    return business;
  }

  async updateBusinessVerification(businessId: string, status: string, verifierId?: string): Promise<void> {
    await db
      .update(businesses)
      .set({
        verificationStatus: status as any,
        verifiedAt: status === 'verified' ? new Date() : null,
        verifiedBy: verifierId || null,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId));
  }

  async updateBusiness(businessId: string, updates: Partial<InsertBusiness>): Promise<Business> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businesses.id, businessId))
      .returning();
    return updatedBusiness;
  }

  async getBusinesses(status?: string): Promise<Business[]> {
    const query = db.select().from(businesses);
    if (status) {
      return await query.where(eq(businesses.verificationStatus, status as any));
    }
    return await query;
  }

  // B2B Bulk Order operations
  async createBulkOrder(order: InsertBulkOrder): Promise<BulkOrder> {
    const [newOrder] = await db
      .insert(bulkOrders)
      .values(order)
      .returning();
    return newOrder;
  }

  async createBulkOrderItem(item: InsertBulkOrderItem): Promise<BulkOrderItem> {
    const [newItem] = await db
      .insert(bulkOrderItems)
      .values(item)
      .returning();
    return newItem;
  }

  async getBulkOrdersByBusiness(businessId: string): Promise<any[]> {
    return await db
      .select({
        id: bulkOrders.id,
        businessId: bulkOrders.businessId,
        farmerId: bulkOrders.farmerId,
        totalAmount: bulkOrders.totalAmount,
        discountPercent: bulkOrders.discountPercent,
        discountAmount: bulkOrders.discountAmount,
        finalAmount: bulkOrders.finalAmount,
        status: bulkOrders.status,
        requestedDeliveryDate: bulkOrders.requestedDeliveryDate,
        notes: bulkOrders.notes,
        createdAt: bulkOrders.createdAt,
        farmerName: farmers.farmName,
        farmerLocation: farmers.location,
      })
      .from(bulkOrders)
      .leftJoin(farmers, eq(bulkOrders.farmerId, farmers.id))
      .where(eq(bulkOrders.businessId, businessId))
      .orderBy(desc(bulkOrders.createdAt));
  }

  async getBulkOrdersByFarmer(farmerId: string): Promise<any[]> {
    return await db
      .select({
        id: bulkOrders.id,
        businessId: bulkOrders.businessId,
        farmerId: bulkOrders.farmerId,
        totalAmount: bulkOrders.totalAmount,
        discountPercent: bulkOrders.discountPercent,
        discountAmount: bulkOrders.discountAmount,
        finalAmount: bulkOrders.finalAmount,
        status: bulkOrders.status,
        requestedDeliveryDate: bulkOrders.requestedDeliveryDate,
        notes: bulkOrders.notes,
        createdAt: bulkOrders.createdAt,
        businessName: businesses.businessName,
        businessEmail: businesses.businessEmail,
      })
      .from(bulkOrders)
      .leftJoin(businesses, eq(bulkOrders.businessId, businesses.id))
      .where(eq(bulkOrders.farmerId, farmerId))
      .orderBy(desc(bulkOrders.createdAt));
  }

  async getBulkOrder(orderId: string): Promise<any> {
    const [order] = await db
      .select({
        id: bulkOrders.id,
        businessId: bulkOrders.businessId,
        farmerId: bulkOrders.farmerId,
        totalAmount: bulkOrders.totalAmount,
        discountPercent: bulkOrders.discountPercent,
        discountAmount: bulkOrders.discountAmount,
        finalAmount: bulkOrders.finalAmount,
        status: bulkOrders.status,
        requestedDeliveryDate: bulkOrders.requestedDeliveryDate,
        notes: bulkOrders.notes,
        createdAt: bulkOrders.createdAt,
        businessName: businesses.businessName,
        businessEmail: businesses.businessEmail,
        farmerName: farmers.farmName,
        farmerLocation: farmers.location,
      })
      .from(bulkOrders)
      .leftJoin(businesses, eq(bulkOrders.businessId, businesses.id))
      .leftJoin(farmers, eq(bulkOrders.farmerId, farmers.id))
      .where(eq(bulkOrders.id, orderId));

    if (!order) return undefined;

    // Get order items
    const items = await db
      .select({
        id: bulkOrderItems.id,
        productId: bulkOrderItems.productId,
        quantity: bulkOrderItems.quantity,
        unitPrice: bulkOrderItems.unitPrice,
        totalPrice: bulkOrderItems.totalPrice,
        productName: products.name,
        productImage: products.images,
      })
      .from(bulkOrderItems)
      .leftJoin(products, eq(bulkOrderItems.productId, products.id))
      .where(eq(bulkOrderItems.bulkOrderId, orderId));

    return { ...order, items };
  }

  async updateBulkOrderStatus(orderId: string, status: string): Promise<void> {
    await db
      .update(bulkOrders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(bulkOrders.id, orderId));
  }

  async calculateBulkOrderDiscount(orderId: string): Promise<void> {
    const [order] = await db
      .select()
      .from(bulkOrders)
      .where(eq(bulkOrders.id, orderId));

    if (!order) return;

    // Get all items for this order
    const items = await db
      .select()
      .from(bulkOrderItems)
      .where(eq(bulkOrderItems.bulkOrderId, orderId));

    let totalDiscount = 0;
    
    // Calculate volume discounts for each item
    for (const item of items) {
      const discount = await this.getApplicableVolumeDiscount(item.productId, item.quantity);
      if (discount) {
        const itemDiscount = (parseFloat(item.totalPrice.toString()) * parseFloat(discount.discountPercent.toString())) / 100;
        totalDiscount += itemDiscount;
      }
    }

    const discountPercent = parseFloat(order.totalAmount.toString()) > 0 ? (totalDiscount / parseFloat(order.totalAmount.toString())) * 100 : 0;
    const finalAmount = parseFloat(order.totalAmount.toString()) - totalDiscount;

    await db
      .update(bulkOrders)
      .set({
        discountPercent: discountPercent.toString(),
        discountAmount: totalDiscount.toString(),
        finalAmount: finalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(bulkOrders.id, orderId));
  }

  // B2B Recurring Order operations
  async createRecurringBulkOrder(order: InsertRecurringBulkOrder): Promise<RecurringBulkOrder> {
    const [newOrder] = await db
      .insert(recurringBulkOrders)
      .values(order)
      .returning();
    return newOrder;
  }

  async createRecurringBulkOrderItem(item: InsertRecurringBulkOrderItem): Promise<RecurringBulkOrderItem> {
    const [newItem] = await db
      .insert(recurringBulkOrderItems)
      .values(item)
      .returning();
    return newItem;
  }

  async getRecurringBulkOrdersByBusiness(businessId: string): Promise<any[]> {
    return await db
      .select({
        id: recurringBulkOrders.id,
        businessId: recurringBulkOrders.businessId,
        farmerId: recurringBulkOrders.farmerId,
        frequency: recurringBulkOrders.frequency,
        nextDelivery: recurringBulkOrders.nextDelivery,
        lastDelivery: recurringBulkOrders.lastDelivery,
        isActive: recurringBulkOrders.isActive,
        totalDeliveries: recurringBulkOrders.totalDeliveries,
        createdAt: recurringBulkOrders.createdAt,
        farmerName: farmers.farmName,
      })
      .from(recurringBulkOrders)
      .leftJoin(farmers, eq(recurringBulkOrders.farmerId, farmers.id))
      .where(eq(recurringBulkOrders.businessId, businessId))
      .orderBy(desc(recurringBulkOrders.createdAt));
  }

  async getRecurringBulkOrdersByFarmer(farmerId: string): Promise<any[]> {
    return await db
      .select({
        id: recurringBulkOrders.id,
        businessId: recurringBulkOrders.businessId,
        farmerId: recurringBulkOrders.farmerId,
        frequency: recurringBulkOrders.frequency,
        nextDelivery: recurringBulkOrders.nextDelivery,
        lastDelivery: recurringBulkOrders.lastDelivery,
        isActive: recurringBulkOrders.isActive,
        totalDeliveries: recurringBulkOrders.totalDeliveries,
        createdAt: recurringBulkOrders.createdAt,
        businessName: businesses.businessName,
      })
      .from(recurringBulkOrders)
      .leftJoin(businesses, eq(recurringBulkOrders.businessId, businesses.id))
      .where(eq(recurringBulkOrders.farmerId, farmerId))
      .orderBy(desc(recurringBulkOrders.createdAt));
  }

  async updateRecurringBulkOrder(orderId: string, updates: Partial<InsertRecurringBulkOrder>): Promise<void> {
    await db
      .update(recurringBulkOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(recurringBulkOrders.id, orderId));
  }

  async processRecurringBulkOrders(): Promise<void> {
    // TODO: Implement when B2B schema is fully defined
    console.log("processRecurringBulkOrders: Not implemented yet");
    return;
  }

  // B2B Invoice operations
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    // TODO: Implement when invoice schema is fully defined
    throw new Error("createInvoice: Not implemented yet");
  }

  async getInvoicesByBusiness(businessId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.businessId, businessId))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoicesByFarmer(farmerId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.farmerId, farmerId))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoice(invoiceId: string): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId));
    return invoice;
  }

  async updateInvoiceStatus(invoiceId: string, status: string): Promise<void> {
    const updates: any = { status, updatedAt: new Date() };
    if (status === 'paid') {
      updates.paidDate = new Date();
    }

    await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, invoiceId));
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get count of invoices this month
    const startOfMonth = new Date(year, new Date().getMonth(), 1);
    const endOfMonth = new Date(year, new Date().getMonth() + 1, 0);
    
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          gte(invoices.createdAt, startOfMonth),
          lte(invoices.createdAt, endOfMonth)
        )
      );

    const invoiceCount = count[0]?.count || 0;
    const sequenceNumber = String(invoiceCount + 1).padStart(4, '0');
    
    return `INV-${year}${month}-${sequenceNumber}`;
  }

  // B2B Volume Discount operations
  async createVolumeDiscount(discount: InsertVolumeDiscount): Promise<VolumeDiscount> {
    const [newDiscount] = await db
      .insert(volumeDiscounts)
      .values(discount)
      .returning();
    return newDiscount;
  }

  async getVolumeDiscountsByFarmer(farmerId: string): Promise<VolumeDiscount[]> {
    return await db
      .select()
      .from(volumeDiscounts)
      .where(eq(volumeDiscounts.farmerId, farmerId))
      .orderBy(desc(volumeDiscounts.createdAt));
  }

  async getVolumeDiscountsByProduct(productId: string): Promise<VolumeDiscount[]> {
    return await db
      .select()
      .from(volumeDiscounts)
      .where(
        and(
          eq(volumeDiscounts.productId, productId),
          eq(volumeDiscounts.isActive, true)
        )
      )
      .orderBy(asc(volumeDiscounts.minQuantity));
  }

  async updateVolumeDiscount(discountId: string, updates: Partial<InsertVolumeDiscount>): Promise<void> {
    await db
      .update(volumeDiscounts)
      .set(updates)
      .where(eq(volumeDiscounts.id, discountId));
  }

  async deleteVolumeDiscount(discountId: string): Promise<void> {
    await db
      .delete(volumeDiscounts)
      .where(eq(volumeDiscounts.id, discountId));
  }

  async getApplicableVolumeDiscount(productId: string, quantity: number): Promise<VolumeDiscount | undefined> {
    const [discount] = await db
      .select()
      .from(volumeDiscounts)
      .where(
        and(
          eq(volumeDiscounts.productId, productId),
          eq(volumeDiscounts.isActive, true),
          lte(volumeDiscounts.minQuantity, quantity)
        )
      )
      .orderBy(desc(volumeDiscounts.minQuantity))
      .limit(1);
    
    return discount;
  }

  // B2B Product Pricing operations
  async createProductPricing(pricing: InsertProductPricing): Promise<ProductPricing> {
    const [newPricing] = await db
      .insert(productPricing)
      .values(pricing)
      .returning();
    return newPricing;
  }

  async getProductPricing(productId: string, tier?: string): Promise<ProductPricing[]> {
    if (tier) {
      return await db
        .select()
        .from(productPricing)
        .where(and(
          eq(productPricing.productId, productId),
          eq(productPricing.tier, tier)
        ))
        .orderBy(asc(productPricing.minQuantity));
    }
    
    return await db
      .select()
      .from(productPricing)
      .where(eq(productPricing.productId, productId))
      .orderBy(asc(productPricing.minQuantity));
  }

  async updateProductPricing(pricingId: string, updates: Partial<InsertProductPricing>): Promise<void> {
    await db
      .update(productPricing)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(productPricing.id, pricingId));
  }

  async deleteProductPricing(pricingId: string): Promise<void> {
    await db
      .delete(productPricing)
      .where(eq(productPricing.id, pricingId));
  }

  async getProductPrice(productId: string, tier: string, quantity: number = 1): Promise<number> {
    // Get base product price first
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (!product) return 0;

    // Check for tier-specific pricing
    const [tierPricing] = await db
      .select()
      .from(productPricing)
      .where(
        and(
          eq(productPricing.productId, productId),
          eq(productPricing.tier, tier),
          lte(productPricing.minQuantity, quantity)
        )
      )
      .orderBy(desc(productPricing.minQuantity))
      .limit(1);

    if (tierPricing) {
      return parseFloat(tierPricing.price);
    }

    // Return base price if no tier pricing found
    return parseFloat(product.price);
  }

  // B2B Analytics operations
  async getBusinessAnalytics(businessId: string): Promise<any> {
    // Get total orders and spending
    const orderStats = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalSpent: sql<number>`sum(final_amount)`,
        avgOrderValue: sql<number>`avg(final_amount)`,
      })
      .from(bulkOrders)
      .where(eq(bulkOrders.businessId, businessId));

    // Get recent orders
    const recentOrders = await db
      .select({
        id: bulkOrders.id,
        finalAmount: bulkOrders.finalAmount,
        status: bulkOrders.status,
        createdAt: bulkOrders.createdAt,
      })
      .from(bulkOrders)
      .where(eq(bulkOrders.businessId, businessId))
      .orderBy(desc(bulkOrders.createdAt))
      .limit(5);

    // Get monthly spending
    const monthlySpending = await db
      .select({
        month: sql<string>`to_char(created_at, 'YYYY-MM')`,
        totalSpent: sql<number>`sum(final_amount)`,
      })
      .from(bulkOrders)
      .where(eq(bulkOrders.businessId, businessId))
      .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
      .orderBy(sql`to_char(created_at, 'YYYY-MM') DESC`)
      .limit(12);

    return {
      orderStats: orderStats[0] || { totalOrders: 0, totalSpent: 0, avgOrderValue: 0 },
      recentOrders,
      monthlySpending,
    };
  }

  async getFarmerB2BAnalytics(farmerId: string): Promise<any> {
    // Get total B2B revenue
    const revenueStats = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalRevenue: sql<number>`sum(final_amount)`,
        avgOrderValue: sql<number>`avg(final_amount)`,
      })
      .from(bulkOrders)
      .where(eq(bulkOrders.farmerId, farmerId));

    // Get top business customers
    const topCustomers = await db
      .select({
        businessId: bulkOrders.businessId,
        businessName: businesses.businessName,
        totalOrders: sql<number>`count(*)`,
        totalSpent: sql<number>`sum(final_amount)`,
      })
      .from(bulkOrders)
      .leftJoin(businesses, eq(bulkOrders.businessId, businesses.id))
      .where(eq(bulkOrders.farmerId, farmerId))
      .groupBy(bulkOrders.businessId, businesses.businessName)
      .orderBy(sql`sum(final_amount) DESC`)
      .limit(5);

    return {
      revenueStats: revenueStats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
      topCustomers,
    };
  }

  async getB2BMarketInsights(): Promise<any> {
    // Get overall B2B statistics
    const overallStats = await db
      .select({
        totalBusinesses: sql<number>`count(distinct business_id)`,
        totalOrders: sql<number>`count(*)`,
        totalVolume: sql<number>`sum(final_amount)`,
      })
      .from(bulkOrders);

    // Get growth trends
    const monthlyGrowth = await db
      .select({
        month: sql<string>`to_char(created_at, 'YYYY-MM')`,
        orderCount: sql<number>`count(*)`,
        revenue: sql<number>`sum(final_amount)`,
      })
      .from(bulkOrders)
      .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
      .orderBy(sql`to_char(created_at, 'YYYY-MM') DESC`)
      .limit(12);

    return {
      overallStats: overallStats[0] || { totalBusinesses: 0, totalOrders: 0, totalVolume: 0 },
      monthlyGrowth,
    };
  }

  // ============= PRODUCT NOTIFICATION OPERATIONS =============

  // Get active product subscriptions
  async getActiveProductSubscriptions(): Promise<ProductSubscription[]> {
    return await db
      .select()
      .from(productSubscriptions)
      .where(eq(productSubscriptions.isActive, true));
  }

  // Get user's product subscriptions
  async getUserProductSubscriptions(userId: string): Promise<ProductSubscription[]> {
    return await db
      .select()
      .from(productSubscriptions)
      .where(eq(productSubscriptions.userId, userId));
  }

  // Create product subscription
  async createProductSubscription(data: InsertProductSubscription): Promise<ProductSubscription> {
    const [subscription] = await db
      .insert(productSubscriptions)
      .values(data)
      .returning();
    return subscription;
  }

  // Update product subscription
  async updateProductSubscription(id: string, data: Partial<ProductSubscription>): Promise<ProductSubscription | undefined> {
    const [subscription] = await db
      .update(productSubscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productSubscriptions.id, id))
      .returning();
    return subscription;
  }

  // Delete product subscription
  async deleteProductSubscription(id: string): Promise<boolean> {
    const result = await db
      .delete(productSubscriptions)
      .where(eq(productSubscriptions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Create product notification log
  async createProductNotification(data: InsertProductNotification): Promise<ProductNotification> {
    const [notification] = await db
      .insert(productNotifications)
      .values(data)
      .returning();
    return notification;
  }

  // Get product notifications with filters
  async getProductNotifications(filters: { userId?: string; productId?: string; status?: string } = {}): Promise<ProductNotification[]> {
    const conditions = [];
    if (filters.userId) {
      conditions.push(eq(productNotifications.userId, filters.userId));
    }
    if (filters.productId) {
      conditions.push(eq(productNotifications.productId, filters.productId));
    }
    if (filters.status) {
      conditions.push(eq(productNotifications.status, filters.status));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(productNotifications)
        .where(and(...conditions))
        .orderBy(desc(productNotifications.createdAt));
    }
    
    return await db
      .select()
      .from(productNotifications)
      .orderBy(desc(productNotifications.createdAt));
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [newPreferences] = await db
      .insert(userPreferences)
      .values(preferences)
      .returning();
    return newPreferences;
  }

  async updateUserPreferences(userId: string, updates: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [updated] = await db
      .update(userPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updated;
  }

  async upsertUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    if (existing) {
      return this.updateUserPreferences(userId, preferences);
    } else {
      return this.createUserPreferences({ userId, ...preferences });
    }
  }

  // Payment method operations
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId))
      .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt));
  }

  async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethod | undefined> {
    const [paymentMethod] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, paymentMethodId));
    return paymentMethod;
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newPaymentMethod] = await db
      .insert(paymentMethods)
      .values(paymentMethod)
      .returning();
    return newPaymentMethod;
  }

  async updatePaymentMethod(paymentMethodId: string, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod> {
    const [updated] = await db
      .update(paymentMethods)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentMethods.id, paymentMethodId))
      .returning();
    return updated;
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await db
      .delete(paymentMethods)
      .where(eq(paymentMethods.id, paymentMethodId));
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    // First, unset all default payment methods for the user
    await db
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));

    // Then set the selected payment method as default
    await db
      .update(paymentMethods)
      .set({ isDefault: true })
      .where(eq(paymentMethods.id, paymentMethodId));
  }
}

export const storage = new DatabaseStorage();
