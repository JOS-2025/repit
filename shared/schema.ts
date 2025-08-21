import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Farmer profiles
export const farmers = pgTable("farmers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  farmName: text("farm_name").notNull(),
  location: text("location").notNull(),
  farmSize: decimal("farm_size", { precision: 10, scale: 2 }),
  description: text("description"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories
export const categoryEnum = pgEnum("category", [
  "fruits",
  "vegetables", 
  "grains",
  "dairy",
  "herbs",
  "others"
]);

export const unitEnum = pgEnum("unit_type", [
  "kg",
  "piece",
  "bunch",
  "bag",
  "liter"
]);

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  name: text("name").notNull(),
  description: text("description"),
  category: categoryEnum("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: unitEnum("unit").notNull(),
  availableQuantity: integer("available_quantity").notNull(),
  harvestDate: timestamp("harvest_date"),
  images: text("images").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order status enum
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed", 
  "harvested",
  "in_transit",
  "delivered",
  "cancelled"
]);

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", [
  "mpesa",
  "card",
  "cash_on_delivery"
]);

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  status: orderStatusEnum("status").default("pending"),
  paymentMethod: paymentMethodEnum("payment_method"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  phoneNumber: varchar("phone_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart items
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Simple orders table for direct customer orders without account registration
export const simpleOrders = pgTable("simple_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: varchar("customer_name").notNull(),
  customerPhone: varchar("customer_phone").notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  productName: varchar("product_name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, confirmed, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  farmer: one(farmers, {
    fields: [users.id],
    references: [farmers.userId],
  }),
  orders: many(orders, { relationName: "customerOrders" }),
  cartItems: many(cartItems),
}));

export const farmersRelations = relations(farmers, ({ one, many }) => ({
  user: one(users, {
    fields: [farmers.userId],
    references: [users.id],
  }),
  products: many(products),
  orders: many(orders, { relationName: "farmerOrders" }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  farmer: one(farmers, {
    fields: [products.farmerId],
    references: [farmers.id],
  }),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
    relationName: "customerOrders",
  }),
  farmer: one(farmers, {
    fields: [orders.farmerId],
    references: [farmers.id],
    relationName: "farmerOrders",
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFarmerSchema = createInsertSchema(farmers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSimpleOrderSchema = createInsertSchema(simpleOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
// Subscription orders for recurring deliveries
export const subscriptionOrders = pgTable("subscription_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  frequency: varchar("frequency").notNull(), // weekly, monthly, etc
  nextDelivery: timestamp("next_delivery").notNull(),
  isActive: boolean("is_active").default(true),
  totalDeliveries: integer("total_deliveries").default(0),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin management table
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull().default("admin"), // admin, super_admin
  permissions: jsonb("permissions").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Commission tracking
export const commissions = pgTable("commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  orderAmount: decimal("order_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, paid
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Stock alerts for farmers
export const stockAlerts = pgTable("stock_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  alertType: varchar("alert_type").notNull(), // low_stock, out_of_stock
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loyalty points system
export const loyaltyPoints = pgTable("loyalty_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  points: integer("points").notNull(),
  pointsUsed: integer("points_used").default(0),
  source: varchar("source").notNull(), // order, referral, bonus
  orderId: varchar("order_id").references(() => orders.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Price comparison tracking
export const priceComparisons = pgTable("price_comparisons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: varchar("product_name").notNull(),
  category: categoryEnum("category").notNull(),
  averagePrice: decimal("average_price", { precision: 10, scale: 2 }).notNull(),
  lowestPrice: decimal("lowest_price", { precision: 10, scale: 2 }).notNull(),
  highestPrice: decimal("highest_price", { precision: 10, scale: 2 }).notNull(),
  farmersCount: integer("farmers_count").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Customer insights for analytics
export const customerInsights = pgTable("customer_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  purchaseCount: integer("purchase_count").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  lastPurchase: timestamp("last_purchase"),
  popularWithAge: varchar("popular_with_age"), // 18-25, 26-35, etc
  popularLocation: varchar("popular_location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SMS/WhatsApp/Email notifications
export const messageNotifications = pgTable("message_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // sms, whatsapp, email
  message: text("message").notNull(),
  status: varchar("status").default("pending"), // pending, sent, failed
  orderId: varchar("order_id").references(() => orders.id),
  phoneNumber: varchar("phone_number"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type Farmer = typeof farmers.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertSimpleOrder = z.infer<typeof insertSimpleOrderSchema>;
export type SimpleOrder = typeof simpleOrders.$inferSelect;

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  farmerId: varchar("farmer_id").references(() => farmers.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Favorites/Wishlist table
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  farmerId: varchar("farmer_id").references(() => farmers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id),
  orderId: varchar("order_id").references(() => simpleOrders.id),
  message: text("message").notNull(),
  messageType: varchar("message_type").default("text").notNull(), // text, image, system
  isSupport: boolean("is_support").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // order, promotion, system, chat
  orderId: varchar("order_id").references(() => simpleOrders.id),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Discounts/Offers table
export const discounts = pgTable("discounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  discountType: varchar("discount_type").notNull(), // bulk, loyalty, seasonal
  minQuantity: integer("min_quantity"),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order tracking updates
export const orderTracking = pgTable("order_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => simpleOrders.id).notNull(),
  status: varchar("status").notNull(), // placed, confirmed, preparing, in_transit, delivered, cancelled
  location: varchar("location"),
  notes: text("notes"),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Delivery drivers table
export const deliveryDrivers = pgTable("delivery_drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  driverName: varchar("driver_name").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  vehicleType: varchar("vehicle_type").notNull(), // motorcycle, bicycle, car, truck
  vehicleNumber: varchar("vehicle_number"),
  isActive: boolean("is_active").default(true).notNull(),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 7 }),
  currentLongitude: decimal("current_longitude", { precision: 10, scale: 7 }),
  lastLocationUpdate: timestamp("last_location_update"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live delivery tracking table for GPS locations
export const deliveryTracking = pgTable("delivery_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  driverId: varchar("driver_id").references(() => deliveryDrivers.id),
  status: varchar("status").notNull(), // assigned, picked_up, in_transit, delivered, cancelled
  pickupAddress: text("pickup_address"),
  deliveryAddress: text("delivery_address").notNull(),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 7 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 10, scale: 7 }),
  deliveryLatitude: decimal("delivery_latitude", { precision: 10, scale: 7 }),
  deliveryLongitude: decimal("delivery_longitude", { precision: 10, scale: 7 }),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 7 }),
  currentLongitude: decimal("current_longitude", { precision: 10, scale: 7 }),
  estimatedArrival: timestamp("estimated_arrival"),
  actualPickupTime: timestamp("actual_pickup_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  distanceKm: decimal("distance_km", { precision: 8, scale: 3 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Location history for delivery tracking
export const locationHistory = pgTable("location_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deliveryTrackingId: varchar("delivery_tracking_id").references(() => deliveryTracking.id).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }), // GPS accuracy in meters
  speed: decimal("speed", { precision: 6, scale: 2 }), // Speed in km/h
  bearing: decimal("bearing", { precision: 6, scale: 2 }), // Direction in degrees
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Community posts (recipes, tips, stories)
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // recipe, storage_tip, farm_story
  tags: text("tags").array(), // searchable tags
  images: text("images").array(), // image URLs
  likes: integer("likes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics data for farmers
export const salesAnalytics = pgTable("sales_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  period: varchar("period").notNull(), // daily, weekly, monthly
  periodDate: date("period_date").notNull(),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0").notNull(),
  totalOrders: integer("total_orders").default(0).notNull(),
  totalQuantity: integer("total_quantity").default(0).notNull(),
  avgOrderValue: decimal("avg_order_value", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User preferences for language support
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  language: varchar("language").default("en").notNull(), // en, sw (English, Swahili)
  notificationSettings: jsonb("notification_settings").default({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    promotions: true
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Extended types with relations
export type ProductWithFarmer = Product & {
  farmer: Farmer & { user: User };
};

export type OrderWithDetails = Order & {
  customer: User;
  farmer: Farmer;
  orderItems: (OrderItem & { product: Product })[];
};

export type CartItemWithProduct = CartItem & {
  product: ProductWithFarmer;
};

// GPS Tracking Types
export type DeliveryDriver = typeof deliveryDrivers.$inferSelect;
export type InsertDeliveryDriver = typeof deliveryDrivers.$inferInsert;
export type DeliveryTracking = typeof deliveryTracking.$inferSelect;
export type InsertDeliveryTracking = typeof deliveryTracking.$inferInsert;
export type LocationHistory = typeof locationHistory.$inferSelect;
export type InsertLocationHistory = typeof locationHistory.$inferInsert;

export type DeliveryTrackingWithDriver = DeliveryTracking & {
  driver: DeliveryDriver & { user: User };
};

export type OrderWithDeliveryTracking = Order & {
  customer: User;
  farmer: Farmer;
  deliveryTracking?: DeliveryTrackingWithDriver;
  orderItems: (OrderItem & { product: Product })[];
};
