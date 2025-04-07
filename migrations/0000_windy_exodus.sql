CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"metadata" jsonb,
	"achievement_type" text NOT NULL,
	"date_unlocked" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_albums" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"rapper_id" integer NOT NULL,
	"release_date" timestamp DEFAULT now() NOT NULL,
	"cover_art" text,
	"streams" integer DEFAULT 0 NOT NULL,
	"chart_position" integer,
	"previous_position" integer,
	"weeks_on_chart" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "ai_rappers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"bio" text,
	"popularity" integer DEFAULT 50 NOT NULL,
	"monthly_listeners" integer NOT NULL,
	"career_stage" text,
	"genre" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"rapper_id" integer NOT NULL,
	"streams" integer DEFAULT 0 NOT NULL,
	"release_date" timestamp DEFAULT now() NOT NULL,
	"cover_art" text,
	"chart_position" integer,
	"previous_position" integer,
	"weeks_on_chart" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"performance_type" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "chart_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"chart_type" text NOT NULL,
	"chart_date" timestamp DEFAULT now() NOT NULL,
	"entry_id" text NOT NULL,
	"position" integer NOT NULL,
	"is_player" boolean NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "game_saves" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"save_data" jsonb NOT NULL,
	"save_slot" integer NOT NULL,
	"active" boolean DEFAULT true,
	"last_saved" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"discount_percentage" integer,
	"discount_amount" integer,
	"currency_bonus" integer,
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp,
	"max_uses" integer,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"applicable_products" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" text NOT NULL,
	"transaction_id" text NOT NULL,
	"purchase_token" text,
	"receipt_data" text,
	"amount" integer,
	"status" text NOT NULL,
	"purchase_time" timestamp DEFAULT now() NOT NULL,
	"verification_time" timestamp,
	"platform" text NOT NULL,
	"metadata" jsonb,
	"promo_code_id" integer,
	CONSTRAINT "purchases_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" text NOT NULL,
	"status" text NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"cancel_date" timestamp,
	"auto_renew" boolean DEFAULT true,
	"last_billing_date" timestamp DEFAULT now() NOT NULL,
	"next_billing_date" timestamp,
	"billing_period" text NOT NULL,
	"trial_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"latest_purchase_id" integer,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"premium_user" boolean DEFAULT false,
	"subscription_active" boolean DEFAULT false,
	"subscription_id" text,
	"subscription_expiry" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "ai_albums" ADD CONSTRAINT "ai_albums_rapper_id_ai_rappers_id_fk" FOREIGN KEY ("rapper_id") REFERENCES "public"."ai_rappers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_songs" ADD CONSTRAINT "ai_songs_rapper_id_ai_rappers_id_fk" FOREIGN KEY ("rapper_id") REFERENCES "public"."ai_rappers"("id") ON DELETE no action ON UPDATE no action;