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
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  privacyShareData: boolean("privacy_share_data").default(false),
  privacyShowProfile: boolean("privacy_show_profile").default(true),
  theme: varchar("theme").default("light"), // light, dark
  language: varchar("language").default("en"), // en, sw, fr, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment methods table
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // card, mobile_money
  cardLastFour: varchar("card_last_four"), // For display purposes only
  cardBrand: varchar("card_brand"), // visa, mastercard, etc.
  mobileProvider: varchar("mobile_provider"), // mpesa, airtel_money, etc.
  mobileNumber: varchar("mobile_number"), // Encrypted phone number
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
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
  bio: text("bio"), // Enhanced profile field
  farmingPractices: text("farming_practices"), // Enhanced profile field
  profileImageUrl: varchar("profile_image_url"), // Enhanced profile field
  coverImageUrl: varchar("cover_image_url"), // Enhanced profile field
  phoneNumber: varchar("phone_number"), // Contact info
  email: varchar("email"), // Contact info
  website: varchar("website"), // Contact info
  socialMediaLinks: jsonb("social_media_links"), // Enhanced profile field
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Farmer training modules
export const farmerTrainingModules = pgTable("farmer_training_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // crop-management, pest-control, soil-health, irrigation, etc.
  type: varchar("type").notNull(), // guide, video, interactive
  contentUrl: text("content_url"), // URL to video or external resource
  content: text("content"), // For text-based guides
  duration: integer("duration"), // Duration in minutes for videos
  difficulty: varchar("difficulty").default("beginner"), // beginner, intermediate, advanced
  prerequisites: text("prerequisites"), // Required prior modules
  verificationRequired: boolean("verification_required").default(false),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0), // For sorting
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Farmer training completions
export const farmerTrainingCompletions = pgTable("farmer_training_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  moduleId: varchar("module_id").references(() => farmerTrainingModules.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  score: integer("score"), // If there's a quiz/assessment
  verificationBadge: boolean("verification_badge").default(false),
  timeSpent: integer("time_spent"), // Time spent in minutes
});

// Farmer ratings table
export const farmerRatings = pgTable("farmer_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  unhelpfulCount: integer("unhelpful_count").default(0),
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
  business: one(businesses, {
    fields: [users.id],
    references: [businesses.userId],
  }),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  paymentMethods: many(paymentMethods),
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
  ratings: many(farmerRatings),
}));

export const farmerRatingsRelations = relations(farmerRatings, ({ one }) => ({
  user: one(users, {
    fields: [farmerRatings.userId],
    references: [users.id],
  }),
  farmer: one(farmers, {
    fields: [farmerRatings.farmerId],
    references: [farmers.id],
  }),
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
  averageRating: true,
  totalRatings: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFarmerRatingSchema = createInsertSchema(farmerRatings).omit({
  id: true,
  helpfulCount: true,
  unhelpfulCount: true,
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


// B2B Business accounts
export const businessStatusEnum = pgEnum("business_status", [
  "pending",
  "verified", 
  "suspended",
  "rejected"
]);

export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name").notNull(),
  contactPerson: varchar("contact_person").notNull(),
  businessEmail: varchar("business_email").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  address: text("address").notNull(),
  businessLicense: varchar("business_license"), // file path
  verificationStatus: businessStatusEnum("verification_status").default("pending"),
  verificationNotes: text("verification_notes"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bulk order status enum
export const bulkOrderStatusEnum = pgEnum("bulk_order_status", [
  "draft",
  "pending",
  "confirmed",
  "in_progress", 
  "completed",
  "cancelled"
]);

// Recurring frequency enum
export const frequencyEnum = pgEnum("frequency", [
  "daily",
  "weekly",
  "bi_weekly",
  "monthly"
]);

// Bulk orders
export const bulkOrders = pgTable("bulk_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  farmerId: varchar("farmer_id").references(() => farmers.id), // Can be null if not assigned yet
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  status: bulkOrderStatusEnum("status").default("draft"),
  deliveryAddress: text("delivery_address").notNull(),
  requestedDeliveryDate: timestamp("requested_delivery_date"),
  confirmedDeliveryDate: timestamp("confirmed_delivery_date"),
  notes: text("notes"),
  paymentTerms: varchar("payment_terms").default("immediate"), // immediate, net_30, net_60
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bulk order items
export const bulkOrderItems = pgTable("bulk_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bulkOrderId: varchar("bulk_order_id").notNull().references(() => bulkOrders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recurring bulk orders
export const recurringBulkOrders = pgTable("recurring_bulk_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  farmerId: varchar("farmer_id").references(() => farmers.id),
  frequency: frequencyEnum("frequency").notNull(),
  nextDelivery: timestamp("next_delivery").notNull(),
  lastDelivery: timestamp("last_delivery"),
  isActive: boolean("is_active").default(true),
  deliveryAddress: text("delivery_address").notNull(),
  totalDeliveries: integer("total_deliveries").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recurring bulk order items
export const recurringBulkOrderItems = pgTable("recurring_bulk_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recurringOrderId: varchar("recurring_order_id").notNull().references(() => recurringBulkOrders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice status enum
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled"
]);

// Invoices
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  bulkOrderId: varchar("bulk_order_id").references(() => bulkOrders.id),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").default("draft"),
  issuedDate: timestamp("issued_date").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentReference: varchar("payment_reference"),
  pdfUrl: varchar("pdf_url"), // URL to generated PDF
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Volume discount rules
export const volumeDiscounts = pgTable("volume_discounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id),
  productId: varchar("product_id").references(() => products.id), // null = applies to all products
  minQuantity: integer("min_quantity").notNull(),
  maxQuantity: integer("max_quantity"), // null = no maximum
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

// B2B pricing tiers
export const pricingTierEnum = pgEnum("pricing_tier", [
  "retail", // B2C
  "wholesale", // B2B small
  "bulk", // B2B large
  "enterprise" // B2B enterprise
]);

export const productPricing = pgTable("product_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  tier: pricingTierEnum("tier").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  minQuantity: integer("min_quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// B2B Insert schemas (after B2B table definitions)
export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  verificationStatus: true,
  verifiedAt: true,
  verifiedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBulkOrderSchema = createInsertSchema(bulkOrders).omit({
  id: true,
  discountPercent: true,
  discountAmount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBulkOrderItemSchema = createInsertSchema(bulkOrderItems).omit({
  id: true,
  createdAt: true,
});

export const insertRecurringBulkOrderSchema = createInsertSchema(recurringBulkOrders).omit({
  id: true,
  lastDelivery: true,
  isActive: true,
  totalDeliveries: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecurringBulkOrderItemSchema = createInsertSchema(recurringBulkOrderItems).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceNumber: true,
  status: true,
  issuedDate: true,
  paidDate: true,
  pdfUrl: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVolumeDiscountSchema = createInsertSchema(volumeDiscounts).omit({
  id: true,
  isActive: true,
  validFrom: true,
  createdAt: true,
});

export const insertProductPricingSchema = createInsertSchema(productPricing).omit({
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

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect & {
  farmer?: typeof farmers.$inferSelect | null;
  business?: typeof businesses.$inferSelect | null;
};
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type Farmer = typeof farmers.$inferSelect;
export type InsertFarmerRating = z.infer<typeof insertFarmerRatingSchema>;
export type FarmerRating = typeof farmerRatings.$inferSelect;
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

// B2B Types
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertBulkOrder = z.infer<typeof insertBulkOrderSchema>;
export type BulkOrder = typeof bulkOrders.$inferSelect;
export type InsertBulkOrderItem = z.infer<typeof insertBulkOrderItemSchema>;
export type BulkOrderItem = typeof bulkOrderItems.$inferSelect;
export type InsertRecurringBulkOrder = z.infer<typeof insertRecurringBulkOrderSchema>;
export type RecurringBulkOrder = typeof recurringBulkOrders.$inferSelect;
export type InsertRecurringBulkOrderItem = z.infer<typeof insertRecurringBulkOrderItemSchema>;
export type RecurringBulkOrderItem = typeof recurringBulkOrderItems.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertVolumeDiscount = z.infer<typeof insertVolumeDiscountSchema>;
export type VolumeDiscount = typeof volumeDiscounts.$inferSelect;
export type InsertProductPricing = z.infer<typeof insertProductPricingSchema>;
export type ProductPricing = typeof productPricing.$inferSelect;

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

// ============= ESCROW PAYMENT SYSTEM =============

// Escrow transaction status
export const escrowStatusEnum = pgEnum("escrow_status", [
  "pending",          // Payment initiated, awaiting confirmation
  "held",             // Funds held in escrow
  "released",         // Funds released to farmer
  "refunded",         // Funds refunded to customer
  "disputed"          // Dispute raised
]);

// Mobile money providers
export const mobileMoneyProviderEnum = pgEnum("mobile_money_provider", [
  "mpesa",
  "airtel_money",
  "tigopesa",
  "card"
]);

// Escrow transactions table
export const escrowTransactions = pgTable("escrow_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  provider: mobileMoneyProviderEnum("provider").notNull(),
  status: escrowStatusEnum("status").default("pending"),
  transactionRef: varchar("transaction_ref"), // External payment provider reference
  customerPhoneNumber: varchar("customer_phone_number"),
  farmerPhoneNumber: varchar("farmer_phone_number"),
  paymentProof: text("payment_proof"), // Screenshot or receipt URL
  releaseCondition: text("release_condition").default("delivery_confirmed"),
  holdReason: text("hold_reason"),
  disputeReason: text("dispute_reason"),
  heldAt: timestamp("held_at"),
  releasedAt: timestamp("released_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= CROWDSOURCED DELIVERY NETWORK =============

// Rider verification status
export const riderStatusEnum = pgEnum("rider_status", [
  "pending",
  "verified", 
  "active",
  "suspended",
  "banned"
]);

// Boda boda riders registration
export const deliveryRiders = pgTable("delivery_riders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  riderName: varchar("rider_name").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  idNumber: varchar("id_number").notNull(),
  licenseNumber: varchar("license_number"),
  vehicleType: varchar("vehicle_type").notNull(), // motorcycle, bicycle, van
  vehicleRegistration: varchar("vehicle_registration"),
  bankAccount: varchar("bank_account"), // For payments
  status: riderStatusEnum("status").default("pending"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalDeliveries: integer("total_deliveries").default(0),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 7 }),
  currentLongitude: decimal("current_longitude", { precision: 10, scale: 7 }),
  isOnline: boolean("is_online").default(false),
  lastLocationUpdate: timestamp("last_location_update"),
  verificationDocuments: text("verification_documents").array(), // ID, license photos
  emergencyContact: varchar("emergency_contact"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery assignments for route optimization
export const deliveryAssignments = pgTable("delivery_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  riderId: varchar("rider_id").notNull().references(() => deliveryRiders.id),
  status: varchar("status").default("assigned"), // assigned, accepted, rejected, completed
  estimatedDistance: decimal("estimated_distance", { precision: 8, scale: 2 }),
  estimatedDuration: integer("estimated_duration"), // minutes
  actualDistance: decimal("actual_distance", { precision: 8, scale: 2 }),
  actualDuration: integer("actual_duration"), // minutes
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }),
  riderEarnings: decimal("rider_earnings", { precision: 10, scale: 2 }),
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  specialInstructions: text("special_instructions"),
  acceptedAt: timestamp("accepted_at"),
  pickedUpAt: timestamp("picked_up_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= QUALITY ASSURANCE SYSTEM =============

// Certification types
export const certificationTypeEnum = pgEnum("certification_type", [
  "organic",
  "fair_trade",
  "gmo_free",
  "pesticide_free",
  "local_sourced",
  "picked_today"
]);

// Farm photos and certifications
export const farmCertifications = pgTable("farm_certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  certificationType: certificationTypeEnum("certification_type").notNull(),
  issuer: varchar("issuer"), // Certification body
  certificateNumber: varchar("certificate_number"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  documentUrl: text("document_url"), // Certificate document
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => admins.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product quality photos and badges
export const productQuality = pgTable("product_quality", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  farmPhotos: text("farm_photos").array(), // Photos of the farm/field
  harvestPhotos: text("harvest_photos").array(), // Photos during harvest
  qualityGrade: varchar("quality_grade"), // A, B, C grade
  pickedToday: boolean("picked_today").default(false),
  harvestMethod: varchar("harvest_method"), // hand_picked, machine_harvested
  storageConditions: text("storage_conditions"),
  qualityNotes: text("quality_notes"),
  inspectedBy: varchar("inspected_by").references(() => users.id),
  inspectionDate: timestamp("inspection_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= CUSTOMIZABLE PRODUCT BASKETS =============

// Basket templates
export const basketTemplates = pgTable("basket_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // family, individual, bulk
  imageUrl: text("image_url"),
  totalItems: integer("total_items").default(0),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  nutritionScore: decimal("nutrition_score", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Basket items configuration
export const basketItems = pgTable("basket_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  basketId: varchar("basket_id").notNull().references(() => basketTemplates.id),
  category: categoryEnum("category").notNull(),
  quantity: integer("quantity").notNull(),
  unit: unitEnum("unit").notNull(),
  isOptional: boolean("is_optional").default(false),
  alternatives: text("alternatives").array(), // Alternative product names
  nutritionBenefit: text("nutrition_benefit"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer basket orders
export const customerBaskets = pgTable("customer_baskets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  basketTemplateId: varchar("basket_template_id").references(() => basketTemplates.id),
  name: varchar("name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  deliveryFrequency: varchar("delivery_frequency"), // weekly, biweekly, monthly
  nextDelivery: timestamp("next_delivery"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Nutrition information
export const nutritionInfo = pgTable("nutrition_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  calories: integer("calories"), // per 100g
  protein: decimal("protein", { precision: 5, scale: 2 }), // grams per 100g
  carbs: decimal("carbs", { precision: 5, scale: 2 }),
  fiber: decimal("fiber", { precision: 5, scale: 2 }),
  fat: decimal("fat", { precision: 5, scale: 2 }),
  sugar: decimal("sugar", { precision: 5, scale: 2 }),
  sodium: decimal("sodium", { precision: 5, scale: 2 }),
  vitamins: jsonb("vitamins"), // {vitamin_c: 45, vitamin_a: 30}
  minerals: jsonb("minerals"), // {iron: 2.5, calcium: 150}
  healthBenefits: text("health_benefits").array(),
  allergens: text("allergens").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recipe suggestions
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  ingredients: jsonb("ingredients").notNull(), // [{product_id, quantity, unit}]
  instructions: text("instructions").array().notNull(),
  prepTime: integer("prep_time"), // minutes
  cookTime: integer("cook_time"), // minutes
  servings: integer("servings"),
  difficulty: varchar("difficulty"), // easy, medium, hard
  imageUrl: text("image_url"),
  nutritionPer100g: jsonb("nutrition_per_100g"),
  tags: text("tags").array(), // vegetarian, vegan, gluten_free
  authorId: varchar("author_id").references(() => users.id),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= SOCIAL & COMMUNITY FEATURES =============

// Adopt a farm program
export const farmAdoptions = pgTable("farm_adoptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  adoptionType: varchar("adoption_type").notNull(), // tree, plot, animal, greenhouse
  adoptionName: varchar("adoption_name"), // Custom name given by adopter
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).notNull(),
  adoptionDuration: integer("adoption_duration"), // months
  status: varchar("status").default("active"), // active, paused, completed
  benefits: text("benefits").array(), // Regular updates, exclusive products
  adoptionStartDate: date("adoption_start_date").notNull(),
  adoptionEndDate: date("adoption_end_date"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).default("0"),
  lastUpdateSent: timestamp("last_update_sent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Farm adoption updates
export const adoptionUpdates = pgTable("adoption_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adoptionId: varchar("adoption_id").notNull().references(() => farmAdoptions.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  photos: text("photos").array(),
  updateType: varchar("update_type").notNull(), // growth, harvest, maintenance
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= AI DEMAND PREDICTION =============

// Demand prediction data
export const demandPredictions = pgTable("demand_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  location: varchar("location").notNull(),
  predictedDemand: integer("predicted_demand").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100%
  factors: jsonb("factors"), // {weather: 0.3, season: 0.4, events: 0.3}
  predictionDate: date("prediction_date").notNull(),
  actualDemand: integer("actual_demand"), // Filled after the date
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // Calculated accuracy
  modelVersion: varchar("model_version"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Market trends tracking
export const marketTrends = pgTable("market_trends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: categoryEnum("category").notNull(),
  location: varchar("location").notNull(),
  trendType: varchar("trend_type").notNull(), // price, demand, supply
  trendValue: decimal("trend_value", { precision: 10, scale: 2 }),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }),
  period: varchar("period").notNull(), // daily, weekly, monthly
  periodDate: date("period_date").notNull(),
  influencingFactors: text("influencing_factors").array(),
  marketInsights: text("market_insights"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= BLOCKCHAIN TRACEABILITY =============

// Blockchain records for product traceability
export const blockchainRecords = pgTable("blockchain_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  transactionHash: varchar("transaction_hash").notNull(),
  blockNumber: varchar("block_number"),
  contractAddress: varchar("contract_address"),
  eventType: varchar("event_type").notNull(), // planted, harvested, shipped, delivered
  eventData: jsonb("event_data").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  verificationStatus: varchar("verification_status").default("pending"),
  gasUsed: varchar("gas_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= IOT SENSOR INTEGRATION =============

// IoT sensors on farms
export const iotSensors = pgTable("iot_sensors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").notNull().references(() => farmers.id),
  sensorType: varchar("sensor_type").notNull(), // temperature, humidity, soil_moisture, ph
  deviceId: varchar("device_id").notNull().unique(),
  location: varchar("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isActive: boolean("is_active").default(true),
  batteryLevel: integer("battery_level"), // 0-100%
  lastReading: timestamp("last_reading"),
  calibrationDate: timestamp("calibration_date"),
  firmware: varchar("firmware"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// IoT sensor readings
export const sensorReadings = pgTable("sensor_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sensorId: varchar("sensor_id").notNull().references(() => iotSensors.id),
  value: decimal("value", { precision: 10, scale: 3 }).notNull(),
  unit: varchar("unit").notNull(),
  quality: varchar("quality").default("good"), // good, poor, error
  alerts: text("alerts").array(), // Threshold alerts
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// ============= COMMUNITY FORUM TABLES =============

// Forum categories
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  slug: varchar("slug").notNull().unique(),
  icon: varchar("icon"), // Icon class or emoji
  color: varchar("color").default("#10b981"), // Tailwind color
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum topics/threads
export const forumTopics = pgTable("forum_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => forumCategories.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  slug: varchar("slug").notNull().unique(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyUserId: varchar("last_reply_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum posts/replies
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").references(() => forumTopics.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  parentPostId: varchar("parent_post_id").references((): any => forumPosts.id), // For nested replies
  isDeleted: boolean("is_deleted").default(false).notNull(),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum reactions (likes, helpful, etc.)
export const forumReactions = pgTable("forum_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  postId: varchar("post_id").references(() => forumPosts.id),
  topicId: varchar("topic_id").references(() => forumTopics.id),
  reactionType: varchar("reaction_type").notNull(), // like, helpful, heart, thumbs_up
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= EXPANDED TYPES =============

export type EscrowTransaction = typeof escrowTransactions.$inferSelect;
export type InsertEscrowTransaction = typeof escrowTransactions.$inferInsert;
export type DeliveryRider = typeof deliveryRiders.$inferSelect;
export type InsertDeliveryRider = typeof deliveryRiders.$inferInsert;
export type DeliveryAssignment = typeof deliveryAssignments.$inferSelect;
export type InsertDeliveryAssignment = typeof deliveryAssignments.$inferInsert;
export type FarmCertification = typeof farmCertifications.$inferSelect;
export type ProductQuality = typeof productQuality.$inferSelect;
export type BasketTemplate = typeof basketTemplates.$inferSelect;
export type CustomerBasket = typeof customerBaskets.$inferSelect;
export type NutritionInfo = typeof nutritionInfo.$inferSelect;
export type Recipe = typeof recipes.$inferSelect;
export type FarmAdoption = typeof farmAdoptions.$inferSelect;
export type DemandPrediction = typeof demandPredictions.$inferSelect;
export type BlockchainRecord = typeof blockchainRecords.$inferSelect;
export type IoTSensor = typeof iotSensors.$inferSelect;
export type SensorReading = typeof sensorReadings.$inferSelect;

// B2B Relations (defined after all tables)
export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, {
    fields: [businesses.userId],
    references: [users.id],
  }),
  bulkOrders: many(bulkOrders),
  recurringOrders: many(recurringBulkOrders),
  invoices: many(invoices),
}));

export const bulkOrdersRelations = relations(bulkOrders, ({ one, many }) => ({
  business: one(businesses, {
    fields: [bulkOrders.businessId],
    references: [businesses.id],
  }),
  farmer: one(farmers, {
    fields: [bulkOrders.farmerId],
    references: [farmers.id],
  }),
  items: many(bulkOrderItems),
  invoice: one(invoices),
}));

export const bulkOrderItemsRelations = relations(bulkOrderItems, ({ one }) => ({
  bulkOrder: one(bulkOrders, {
    fields: [bulkOrderItems.bulkOrderId],
    references: [bulkOrders.id],
  }),
  product: one(products, {
    fields: [bulkOrderItems.productId],
    references: [products.id],
  }),
}));

export const recurringBulkOrdersRelations = relations(recurringBulkOrders, ({ one, many }) => ({
  business: one(businesses, {
    fields: [recurringBulkOrders.businessId],
    references: [businesses.id],
  }),
  farmer: one(farmers, {
    fields: [recurringBulkOrders.farmerId],
    references: [farmers.id],
  }),
  items: many(recurringBulkOrderItems),
}));

export const recurringBulkOrderItemsRelations = relations(recurringBulkOrderItems, ({ one }) => ({
  recurringOrder: one(recurringBulkOrders, {
    fields: [recurringBulkOrderItems.recurringOrderId],
    references: [recurringBulkOrders.id],
  }),
  product: one(products, {
    fields: [recurringBulkOrderItems.productId],
    references: [products.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  business: one(businesses, {
    fields: [invoices.businessId],
    references: [businesses.id],
  }),
  farmer: one(farmers, {
    fields: [invoices.farmerId],
    references: [farmers.id],
  }),
  bulkOrder: one(bulkOrders, {
    fields: [invoices.bulkOrderId],
    references: [bulkOrders.id],
  }),
}));

export const volumeDiscountsRelations = relations(volumeDiscounts, ({ one }) => ({
  farmer: one(farmers, {
    fields: [volumeDiscounts.farmerId],
    references: [farmers.id],
  }),
  product: one(products, {
    fields: [volumeDiscounts.productId],
    references: [products.id],
  }),
}));

export const productPricingRelations = relations(productPricing, ({ one }) => ({
  product: one(products, {
    fields: [productPricing.productId],
    references: [products.id],
  }),
}));
// ============= PRODUCT NOTIFICATIONS =============

// Product notification subscriptions
export const productSubscriptions = pgTable("product_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subscriptionType: varchar("subscription_type").notNull(), // 'category', 'farmer', 'all'
  targetId: varchar("target_id"), // farmer ID for farmer subscriptions, null for 'all'
  category: varchar("category"), // category name for category subscriptions
  isActive: boolean("is_active").default(true),
  notificationMethods: jsonb("notification_methods").default('["push"]'), // ['push', 'whatsapp', 'email']
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product notifications log
export const productNotifications = pgTable("product_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  subscriptionId: varchar("subscription_id").notNull().references(() => productSubscriptions.id),
  notificationMethod: varchar("notification_method").notNull(), // 'push', 'whatsapp', 'email'
  status: varchar("status").default("pending"), // pending, sent, failed
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product subscription relations
export const productSubscriptionsRelations = relations(productSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [productSubscriptions.userId],
    references: [users.id],
  }),
  farmer: one(farmers, {
    fields: [productSubscriptions.targetId],
    references: [farmers.id],
  }),
  notifications: many(productNotifications),
}));

export const productNotificationsRelations = relations(productNotifications, ({ one }) => ({
  product: one(products, {
    fields: [productNotifications.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [productNotifications.userId],
    references: [users.id],
  }),
  subscription: one(productSubscriptions, {
    fields: [productNotifications.subscriptionId],
    references: [productSubscriptions.id],
  }),
}));

// User preferences relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// Payment methods relations
export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

// ============= TYPE EXPORTS =============

export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = typeof forumCategories.$inferInsert;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = typeof forumTopics.$inferInsert;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;
export type ForumReaction = typeof forumReactions.$inferSelect;
export type InsertForumReaction = typeof forumReactions.$inferInsert;
export type FarmerTrainingModule = typeof farmerTrainingModules.$inferSelect;
export type InsertFarmerTrainingModule = typeof farmerTrainingModules.$inferInsert;
export type FarmerTrainingCompletion = typeof farmerTrainingCompletions.$inferSelect;
export type InsertFarmerTrainingCompletion = typeof farmerTrainingCompletions.$inferInsert;
export type ProductSubscription = typeof productSubscriptions.$inferSelect;
export type InsertProductSubscription = typeof productSubscriptions.$inferInsert;
export type ProductNotification = typeof productNotifications.$inferSelect;
export type InsertProductNotification = typeof productNotifications.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;
