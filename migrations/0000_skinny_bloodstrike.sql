CREATE TYPE "public"."bulk_order_status" AS ENUM('draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('pending', 'verified', 'suspended', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('fruits', 'vegetables', 'grains', 'dairy', 'herbs', 'others');--> statement-breakpoint
CREATE TYPE "public"."certification_type" AS ENUM('organic', 'fair_trade', 'gmo_free', 'pesticide_free', 'local_sourced', 'picked_today');--> statement-breakpoint
CREATE TYPE "public"."escrow_status" AS ENUM('pending', 'held', 'released', 'refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."frequency" AS ENUM('daily', 'weekly', 'bi_weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."mobile_money_provider" AS ENUM('mpesa', 'airtel_money', 'tigopesa', 'card');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'harvested', 'in_transit', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('mpesa', 'card', 'cash_on_delivery');--> statement-breakpoint
CREATE TYPE "public"."pricing_tier" AS ENUM('retail', 'wholesale', 'bulk', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."rider_status" AS ENUM('pending', 'verified', 'active', 'suspended', 'banned');--> statement-breakpoint
CREATE TYPE "public"."unit_type" AS ENUM('kg', 'piece', 'bunch', 'bag', 'liter');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'admin' NOT NULL,
	"permissions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "adoption_updates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adoption_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"photos" text[],
	"update_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "basket_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"basket_id" varchar NOT NULL,
	"category" "category" NOT NULL,
	"quantity" integer NOT NULL,
	"unit" "unit_type" NOT NULL,
	"is_optional" boolean DEFAULT false,
	"alternatives" text[],
	"nutrition_benefit" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "basket_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"image_url" text,
	"total_items" integer DEFAULT 0,
	"estimated_price" numeric(10, 2),
	"nutrition_score" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blockchain_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"transaction_hash" varchar NOT NULL,
	"block_number" varchar,
	"contract_address" varchar,
	"event_type" varchar NOT NULL,
	"event_data" jsonb NOT NULL,
	"timestamp" timestamp NOT NULL,
	"verification_status" varchar DEFAULT 'pending',
	"gas_used" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulk_order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bulk_order_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulk_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"farmer_id" varchar,
	"total_amount" numeric(10, 2) NOT NULL,
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"final_amount" numeric(10, 2) NOT NULL,
	"status" "bulk_order_status" DEFAULT 'draft',
	"delivery_address" text NOT NULL,
	"requested_delivery_date" timestamp,
	"confirmed_delivery_date" timestamp,
	"notes" text,
	"payment_terms" varchar DEFAULT 'immediate',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"business_name" varchar NOT NULL,
	"contact_person" varchar NOT NULL,
	"business_email" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"address" text NOT NULL,
	"business_license" varchar,
	"verification_status" "business_status" DEFAULT 'pending',
	"verification_notes" text,
	"verified_at" timestamp,
	"verified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar,
	"order_id" varchar,
	"message" text NOT NULL,
	"message_type" varchar DEFAULT 'text' NOT NULL,
	"is_support" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"farmer_id" varchar NOT NULL,
	"order_amount" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"commission_amount" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"category" varchar NOT NULL,
	"tags" text[],
	"images" text[],
	"likes" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_baskets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"basket_template_id" varchar,
	"name" varchar NOT NULL,
	"total_amount" numeric(10, 2),
	"delivery_frequency" varchar,
	"next_delivery" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_insights" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"purchase_count" integer DEFAULT 0,
	"total_revenue" numeric(10, 2) DEFAULT '0',
	"average_rating" numeric(3, 2) DEFAULT '0',
	"last_purchase" timestamp,
	"popular_with_age" varchar,
	"popular_location" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"rider_id" varchar NOT NULL,
	"status" varchar DEFAULT 'assigned',
	"estimated_distance" numeric(8, 2),
	"estimated_duration" integer,
	"actual_distance" numeric(8, 2),
	"actual_duration" integer,
	"delivery_fee" numeric(10, 2),
	"rider_earnings" numeric(10, 2),
	"pickup_address" text NOT NULL,
	"delivery_address" text NOT NULL,
	"special_instructions" text,
	"accepted_at" timestamp,
	"picked_up_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_drivers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"driver_name" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"vehicle_type" varchar NOT NULL,
	"vehicle_number" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"current_latitude" numeric(10, 7),
	"current_longitude" numeric(10, 7),
	"last_location_update" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_riders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"rider_name" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"id_number" varchar NOT NULL,
	"license_number" varchar,
	"vehicle_type" varchar NOT NULL,
	"vehicle_registration" varchar,
	"bank_account" varchar,
	"status" "rider_status" DEFAULT 'pending',
	"rating" numeric(3, 2) DEFAULT '0',
	"total_deliveries" integer DEFAULT 0,
	"current_latitude" numeric(10, 7),
	"current_longitude" numeric(10, 7),
	"is_online" boolean DEFAULT false,
	"last_location_update" timestamp,
	"verification_documents" text[],
	"emergency_contact" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"driver_id" varchar,
	"status" varchar NOT NULL,
	"pickup_address" text,
	"delivery_address" text NOT NULL,
	"pickup_latitude" numeric(10, 7),
	"pickup_longitude" numeric(10, 7),
	"delivery_latitude" numeric(10, 7),
	"delivery_longitude" numeric(10, 7),
	"current_latitude" numeric(10, 7),
	"current_longitude" numeric(10, 7),
	"estimated_arrival" timestamp,
	"actual_pickup_time" timestamp,
	"actual_delivery_time" timestamp,
	"distance_km" numeric(8, 3),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "demand_predictions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"location" varchar NOT NULL,
	"predicted_demand" integer NOT NULL,
	"confidence" numeric(5, 2),
	"factors" jsonb,
	"prediction_date" date NOT NULL,
	"actual_demand" integer,
	"accuracy" numeric(5, 2),
	"model_version" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" varchar NOT NULL,
	"product_id" varchar,
	"discount_type" varchar NOT NULL,
	"min_quantity" integer,
	"discount_percent" numeric(5, 2),
	"max_discount" numeric(10, 2),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "escrow_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"farmer_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"provider" "mobile_money_provider" NOT NULL,
	"status" "escrow_status" DEFAULT 'pending',
	"transaction_ref" varchar,
	"customer_phone_number" varchar,
	"farmer_phone_number" varchar,
	"payment_proof" text,
	"release_condition" text DEFAULT 'delivery_confirmed',
	"hold_reason" text,
	"dispute_reason" text,
	"held_at" timestamp,
	"released_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "farm_adoptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"farmer_id" varchar NOT NULL,
	"adoption_type" varchar NOT NULL,
	"adoption_name" varchar,
	"monthly_fee" numeric(10, 2) NOT NULL,
	"adoption_duration" integer,
	"status" varchar DEFAULT 'active',
	"benefits" text[],
	"adoption_start_date" date NOT NULL,
	"adoption_end_date" date,
	"total_paid" numeric(10, 2) DEFAULT '0',
	"last_update_sent" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "farm_certifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" varchar NOT NULL,
	"certification_type" "certification_type" NOT NULL,
	"issuer" varchar,
	"certificate_number" varchar,
	"issue_date" date,
	"expiry_date" date,
	"document_url" text,
	"is_verified" boolean DEFAULT false,
	"verified_by" varchar,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "farmer_ratings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"farmer_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified_purchase" boolean DEFAULT false,
	"helpful_count" integer DEFAULT 0,
	"unhelpful_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "farmer_training_completions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	"score" integer,
	"verification_badge" boolean DEFAULT false,
	"time_spent" integer
);
--> statement-breakpoint
CREATE TABLE "farmer_training_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"type" varchar NOT NULL,
	"content_url" text,
	"content" text,
	"duration" integer,
	"difficulty" varchar DEFAULT 'beginner',
	"prerequisites" text,
	"verification_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "farmers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"farm_name" text NOT NULL,
	"location" text NOT NULL,
	"farm_size" numeric(10, 2),
	"description" text,
	"bio" text,
	"farming_practices" text,
	"profile_image_url" varchar,
	"cover_image_url" varchar,
	"phone_number" varchar,
	"email" varchar,
	"website" varchar,
	"social_media_links" jsonb,
	"average_rating" numeric(3, 2) DEFAULT '0',
	"total_ratings" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"product_id" varchar,
	"farmer_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"slug" varchar NOT NULL,
	"icon" varchar,
	"color" varchar DEFAULT '#10b981',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "forum_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"parent_post_id" varchar,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_reactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"post_id" varchar,
	"topic_id" varchar,
	"reaction_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_topics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"slug" varchar NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0,
	"reply_count" integer DEFAULT 0,
	"last_reply_at" timestamp,
	"last_reply_user_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "forum_topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar NOT NULL,
	"bulk_order_id" varchar,
	"business_id" varchar NOT NULL,
	"farmer_id" varchar NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_percent" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft',
	"issued_date" timestamp DEFAULT now(),
	"due_date" timestamp NOT NULL,
	"paid_date" timestamp,
	"payment_method" "payment_method",
	"payment_reference" varchar,
	"pdf_url" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "iot_sensors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" varchar NOT NULL,
	"sensor_type" varchar NOT NULL,
	"device_id" varchar NOT NULL,
	"location" varchar NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"is_active" boolean DEFAULT true,
	"battery_level" integer,
	"last_reading" timestamp,
	"calibration_date" timestamp,
	"firmware" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "iot_sensors_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "location_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_tracking_id" varchar NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"accuracy" numeric(8, 2),
	"speed" numeric(6, 2),
	"bearing" numeric(6, 2),
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loyalty_points" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"points" integer NOT NULL,
	"points_used" integer DEFAULT 0,
	"source" varchar NOT NULL,
	"order_id" varchar,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_trends" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "category" NOT NULL,
	"location" varchar NOT NULL,
	"trend_type" varchar NOT NULL,
	"trend_value" numeric(10, 2),
	"change_percent" numeric(5, 2),
	"period" varchar NOT NULL,
	"period_date" date NOT NULL,
	"influencing_factors" text[],
	"market_insights" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'pending',
	"order_id" varchar,
	"phone_number" varchar,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"type" varchar NOT NULL,
	"order_id" varchar,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nutrition_info" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"calories" integer,
	"protein" numeric(5, 2),
	"carbs" numeric(5, 2),
	"fiber" numeric(5, 2),
	"fat" numeric(5, 2),
	"sugar" numeric(5, 2),
	"sodium" numeric(5, 2),
	"vitamins" jsonb,
	"minerals" jsonb,
	"health_benefits" text[],
	"allergens" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"status" varchar NOT NULL,
	"location" varchar,
	"notes" text,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"farmer_id" varchar NOT NULL,
	"status" "order_status" DEFAULT 'pending',
	"payment_method" "payment_method",
	"total_amount" numeric(10, 2) NOT NULL,
	"delivery_address" text NOT NULL,
	"phone_number" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"card_last_four" varchar,
	"card_brand" varchar,
	"mobile_provider" varchar,
	"mobile_number" varchar,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "price_comparisons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_name" varchar NOT NULL,
	"category" "category" NOT NULL,
	"average_price" numeric(10, 2) NOT NULL,
	"lowest_price" numeric(10, 2) NOT NULL,
	"highest_price" numeric(10, 2) NOT NULL,
	"farmers_count" integer NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" varchar NOT NULL,
	"notification_method" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"sent_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_pricing" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"tier" "pricing_tier" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"min_quantity" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_quality" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"farm_photos" text[],
	"harvest_photos" text[],
	"quality_grade" varchar,
	"picked_today" boolean DEFAULT false,
	"harvest_method" varchar,
	"storage_conditions" text,
	"quality_notes" text,
	"inspected_by" varchar,
	"inspection_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_type" varchar NOT NULL,
	"target_id" varchar,
	"category" varchar,
	"is_active" boolean DEFAULT true,
	"notification_methods" jsonb DEFAULT '["push"]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "category" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"unit" "unit_type" NOT NULL,
	"available_quantity" integer NOT NULL,
	"harvest_date" timestamp,
	"images" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"ingredients" jsonb NOT NULL,
	"instructions" text[] NOT NULL,
	"prep_time" integer,
	"cook_time" integer,
	"servings" integer,
	"difficulty" varchar,
	"image_url" text,
	"nutrition_per_100g" jsonb,
	"tags" text[],
	"author_id" varchar,
	"rating" numeric(3, 2) DEFAULT '0',
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_bulk_order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recurring_order_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_bulk_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"farmer_id" varchar,
	"frequency" "frequency" NOT NULL,
	"next_delivery" timestamp NOT NULL,
	"last_delivery" timestamp,
	"is_active" boolean DEFAULT true,
	"delivery_address" text NOT NULL,
	"total_deliveries" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"product_id" varchar,
	"farmer_id" varchar,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" varchar NOT NULL,
	"product_id" varchar,
	"period" varchar NOT NULL,
	"period_date" date NOT NULL,
	"total_sales" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_quantity" integer DEFAULT 0 NOT NULL,
	"avg_order_value" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sensor_readings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sensor_id" varchar NOT NULL,
	"value" numeric(10, 3) NOT NULL,
	"unit" varchar NOT NULL,
	"quality" varchar DEFAULT 'good',
	"alerts" text[],
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simple_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" varchar NOT NULL,
	"customer_phone" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"product_name" varchar NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"delivery_address" text NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"farmer_id" varchar NOT NULL,
	"alert_type" varchar NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"farmer_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"frequency" varchar NOT NULL,
	"next_delivery" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"total_deliveries" integer DEFAULT 0,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"delivery_address" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"notifications_enabled" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"privacy_share_data" boolean DEFAULT false,
	"privacy_show_profile" boolean DEFAULT true,
	"theme" varchar DEFAULT 'light',
	"language" varchar DEFAULT 'en',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"phone_number" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "volume_discounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" varchar,
	"product_id" varchar,
	"min_quantity" integer NOT NULL,
	"max_quantity" integer,
	"discount_percent" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_updates" ADD CONSTRAINT "adoption_updates_adoption_id_farm_adoptions_id_fk" FOREIGN KEY ("adoption_id") REFERENCES "public"."farm_adoptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_basket_id_basket_templates_id_fk" FOREIGN KEY ("basket_id") REFERENCES "public"."basket_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "basket_templates" ADD CONSTRAINT "basket_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_order_items" ADD CONSTRAINT "bulk_order_items_bulk_order_id_bulk_orders_id_fk" FOREIGN KEY ("bulk_order_id") REFERENCES "public"."bulk_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_order_items" ADD CONSTRAINT "bulk_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_orders" ADD CONSTRAINT "bulk_orders_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_orders" ADD CONSTRAINT "bulk_orders_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_order_id_simple_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."simple_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_baskets" ADD CONSTRAINT "customer_baskets_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_baskets" ADD CONSTRAINT "customer_baskets_basket_template_id_basket_templates_id_fk" FOREIGN KEY ("basket_template_id") REFERENCES "public"."basket_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_insights" ADD CONSTRAINT "customer_insights_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_rider_id_delivery_riders_id_fk" FOREIGN KEY ("rider_id") REFERENCES "public"."delivery_riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_drivers" ADD CONSTRAINT "delivery_drivers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_riders" ADD CONSTRAINT "delivery_riders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_driver_id_delivery_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."delivery_drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_predictions" ADD CONSTRAINT "demand_predictions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_adoptions" ADD CONSTRAINT "farm_adoptions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_adoptions" ADD CONSTRAINT "farm_adoptions_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_certifications" ADD CONSTRAINT "farm_certifications_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_certifications" ADD CONSTRAINT "farm_certifications_verified_by_admins_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_ratings" ADD CONSTRAINT "farmer_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_ratings" ADD CONSTRAINT "farmer_ratings_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_training_completions" ADD CONSTRAINT "farmer_training_completions_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_training_completions" ADD CONSTRAINT "farmer_training_completions_module_id_farmer_training_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."farmer_training_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_topic_id_forum_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_parent_post_id_forum_posts_id_fk" FOREIGN KEY ("parent_post_id") REFERENCES "public"."forum_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_topic_id_forum_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_last_reply_user_id_users_id_fk" FOREIGN KEY ("last_reply_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_bulk_order_id_bulk_orders_id_fk" FOREIGN KEY ("bulk_order_id") REFERENCES "public"."bulk_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_sensors" ADD CONSTRAINT "iot_sensors_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_history" ADD CONSTRAINT "location_history_delivery_tracking_id_delivery_tracking_id_fk" FOREIGN KEY ("delivery_tracking_id") REFERENCES "public"."delivery_tracking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_notifications" ADD CONSTRAINT "message_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_notifications" ADD CONSTRAINT "message_notifications_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_simple_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."simple_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_info" ADD CONSTRAINT "nutrition_info_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_tracking" ADD CONSTRAINT "order_tracking_order_id_simple_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."simple_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_tracking" ADD CONSTRAINT "order_tracking_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_notifications" ADD CONSTRAINT "product_notifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_notifications" ADD CONSTRAINT "product_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_notifications" ADD CONSTRAINT "product_notifications_subscription_id_product_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."product_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_pricing" ADD CONSTRAINT "product_pricing_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_quality" ADD CONSTRAINT "product_quality_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_quality" ADD CONSTRAINT "product_quality_inspected_by_users_id_fk" FOREIGN KEY ("inspected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_subscriptions" ADD CONSTRAINT "product_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bulk_order_items" ADD CONSTRAINT "recurring_bulk_order_items_recurring_order_id_recurring_bulk_orders_id_fk" FOREIGN KEY ("recurring_order_id") REFERENCES "public"."recurring_bulk_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bulk_order_items" ADD CONSTRAINT "recurring_bulk_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bulk_orders" ADD CONSTRAINT "recurring_bulk_orders_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bulk_orders" ADD CONSTRAINT "recurring_bulk_orders_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_analytics" ADD CONSTRAINT "sales_analytics_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_analytics" ADD CONSTRAINT "sales_analytics_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensor_id_iot_sensors_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."iot_sensors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simple_orders" ADD CONSTRAINT "simple_orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volume_discounts" ADD CONSTRAINT "volume_discounts_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volume_discounts" ADD CONSTRAINT "volume_discounts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");