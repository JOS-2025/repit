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
