import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, real, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // Add user premium status fields
  premiumUser: boolean("premium_user").default(false),
  subscriptionActive: boolean("subscription_active").default(false),
  subscriptionId: text("subscription_id"),
  subscriptionExpiry: timestamp("subscription_expiry"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  metadata: jsonb("metadata"),
  achievementType: text("achievement_type").notNull(),
  dateUnlocked: text("date_unlocked").notNull(),
});

export const gameSaves = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  saveData: jsonb("save_data").notNull(),
  saveSlot: integer("save_slot").notNull(),
  active: boolean("active").default(true),
  lastSaved: text("last_saved").notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planId: text("plan_id").notNull(), // e.g., "vip_membership_monthly", "vip_membership_yearly"
  status: text("status").notNull(), // "active", "cancelled", "expired", "pending"
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"), // When subscription will expire
  cancelDate: timestamp("cancel_date"), // When user requested cancellation
  autoRenew: boolean("auto_renew").default(true),
  lastBillingDate: timestamp("last_billing_date").notNull().defaultNow(),
  nextBillingDate: timestamp("next_billing_date"),
  billingPeriod: text("billing_period").notNull(), // "monthly", "yearly", etc.
  trialEnd: timestamp("trial_end"), // If there's a trial period
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  latestPurchaseId: integer("latest_purchase_id"), // Link to the latest purchase
  metadata: jsonb("metadata"), // Additional subscription data
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: text("product_id").notNull(),
  transactionId: text("transaction_id").notNull().unique(),
  purchaseToken: text("purchase_token"), // Google Play purchase token
  receiptData: text("receipt_data"), // iOS receipt data
  amount: integer("amount"), // For currency purchases
  status: text("status").notNull(), // 'pending', 'verified', 'failed'
  purchaseTime: timestamp("purchase_time").notNull().defaultNow(),
  verificationTime: timestamp("verification_time"),
  platform: text("platform").notNull(), // 'android', 'ios', 'web'
  metadata: jsonb("metadata"), // Additional purchase data
  promoCodeId: integer("promo_code_id"), // Reference to a promotional code if used
});

export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercentage: integer("discount_percentage"), // Percentage discount (e.g., 20 = 20%)
  discountAmount: integer("discount_amount"), // Fixed amount discount in cents
  currencyBonus: integer("currency_bonus"), // Amount of in-game currency to add
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validUntil: timestamp("valid_until"),
  maxUses: integer("max_uses"), // Maximum number of times code can be used (null = unlimited)
  usesCount: integer("uses_count").notNull().default(0), // Current usage count
  applicableProducts: jsonb("applicable_products"), // Array of product IDs this code applies to
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Add AI Rappers table for persistent competition
export const aiRappers = pgTable("ai_rappers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  bio: text("bio"),
  popularity: integer("popularity").notNull().default(50), // 0-100 scale
  monthlyListeners: integer("monthly_listeners").notNull(), // Real number of monthly listeners
  careerStage: text("career_stage"), // "rookie", "established", "veteran", "legend"
  genre: text("genre"), // Primary music style
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"), // For additional customizable properties
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI-generated songs table
export const aiSongs = pgTable("ai_songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  rapperId: integer("rapper_id").notNull().references(() => aiRappers.id),
  streams: integer("streams").notNull().default(0),
  releaseDate: timestamp("release_date").notNull().defaultNow(),
  coverArt: text("cover_art"),
  chartPosition: integer("chart_position"),
  previousPosition: integer("previous_position"),
  weeksOnChart: integer("weeks_on_chart").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  performanceType: text("performance_type"), // "viral", "standard", "comeback", "flop"
  metadata: jsonb("metadata"), // For additional customizable properties
});

// AI-generated albums table
export const aiAlbums = pgTable("ai_albums", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  rapperId: integer("rapper_id").notNull().references(() => aiRappers.id),
  releaseDate: timestamp("release_date").notNull().defaultNow(),
  coverArt: text("cover_art"),
  streams: integer("streams").notNull().default(0),
  chartPosition: integer("chart_position"),
  previousPosition: integer("previous_position"),
  weeksOnChart: integer("weeks_on_chart").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"), // For additional customizable properties
});

// Billboard charts historical data table
export const chartHistory = pgTable("chart_history", {
  id: serial("id").primaryKey(),
  chartType: text("chart_type").notNull(), // "hot100", "billboard200", "artist_rankings"
  chartDate: timestamp("chart_date").notNull().defaultNow(),
  entryId: text("entry_id").notNull(), // Can be user song/album ID or AI song/album ID
  position: integer("position").notNull(),
  isPlayer: boolean("is_player").notNull(),
  metadata: jsonb("metadata"), // Store additional data like change in position, etc.
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  metadata: true,
  achievementType: true,
  dateUnlocked: true,
});

export const insertGameSaveSchema = createInsertSchema(gameSaves).pick({
  userId: true,
  saveData: true,
  saveSlot: true,
  active: true,
  lastSaved: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  userId: true,
  productId: true,
  transactionId: true,
  purchaseToken: true, 
  receiptData: true,
  amount: true,
  status: true,
  platform: true,
  metadata: true,
  promoCodeId: true,
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).pick({
  code: true,
  discountPercentage: true,
  discountAmount: true,
  currencyBonus: true,
  validFrom: true,
  validUntil: true,
  maxUses: true,
  applicableProducts: true,
  isActive: true,
});

// Add subscription plan schema
export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  planId: true,
  status: true,
  billingPeriod: true,
  autoRenew: true,
  cancelAtPeriodEnd: true,
  metadata: true
});

// Verification request payload schema
export const purchaseVerificationSchema = z.object({
  productId: z.string(),
  transactionId: z.string(),
  purchaseToken: z.string().optional(),
  receiptData: z.string().optional(),
  platform: z.enum(['android', 'ios', 'web']),
  userId: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  promoCode: z.string().optional(),
});

// Schema for validating a promo code
export const promoCodeValidationSchema = z.object({
  code: z.string(),
  productId: z.string().optional(),
  userId: z.number().optional(),
});

// Schema for subscription creation
export const subscriptionCreationSchema = z.object({
  userId: z.number(),
  planId: z.string(),
  billingPeriod: z.enum(['monthly', 'quarterly', 'yearly']),
  paymentMethod: z.object({
    type: z.enum(['paypal', 'credit_card']),
    details: z.record(z.any())
  }),
  promoCode: z.string().optional(),
});

// Schema for subscription management actions
export const subscriptionActionSchema = z.object({
  subscriptionId: z.number(),
  action: z.enum(['cancel', 'reactivate', 'update_payment', 'update_plan']),
  userId: z.number(),
  planId: z.string().optional(),
  paymentMethod: z.object({
    type: z.enum(['paypal', 'credit_card']),
    details: z.record(z.any())
  }).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
export type GameSave = typeof gameSaves.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
// Schemas for new tables
export const insertAiRapperSchema = createInsertSchema(aiRappers).pick({
  name: true,
  image: true,
  bio: true,
  popularity: true,
  monthlyListeners: true,
  careerStage: true,
  genre: true,
  isActive: true,
  metadata: true
});

export const insertAiSongSchema = createInsertSchema(aiSongs).pick({
  title: true,
  rapperId: true,
  streams: true,
  releaseDate: true,
  coverArt: true,
  chartPosition: true,
  previousPosition: true,
  weeksOnChart: true,
  isActive: true,
  performanceType: true,
  metadata: true
});

export const insertAiAlbumSchema = createInsertSchema(aiAlbums).pick({
  title: true,
  rapperId: true,
  releaseDate: true,
  coverArt: true,
  streams: true,
  chartPosition: true,
  previousPosition: true,
  weeksOnChart: true,
  isActive: true,
  metadata: true
});

export const insertChartHistorySchema = createInsertSchema(chartHistory).pick({
  chartType: true,
  chartDate: true,
  entryId: true,
  position: true,
  isPlayer: true,
  metadata: true
});

// Define relations
export const aiRappersRelations = relations(aiRappers, ({ many }) => ({
  songs: many(aiSongs),
  albums: many(aiAlbums)
}));

export const aiSongsRelations = relations(aiSongs, ({ one }) => ({
  rapper: one(aiRappers, {
    fields: [aiSongs.rapperId],
    references: [aiRappers.id]
  })
}));

export const aiAlbumsRelations = relations(aiAlbums, ({ one }) => ({
  rapper: one(aiRappers, {
    fields: [aiAlbums.rapperId],
    references: [aiRappers.id]
  })
}));

export type InsertAiRapper = z.infer<typeof insertAiRapperSchema>;
export type AiRapper = typeof aiRappers.$inferSelect;
export type InsertAiSong = z.infer<typeof insertAiSongSchema>;
export type AiSong = typeof aiSongs.$inferSelect;
export type InsertAiAlbum = z.infer<typeof insertAiAlbumSchema>;
export type AiAlbum = typeof aiAlbums.$inferSelect;
export type InsertChartHistory = z.infer<typeof insertChartHistorySchema>;
export type ChartHistory = typeof chartHistory.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type PurchaseVerificationRequest = z.infer<typeof purchaseVerificationSchema>;
export type PromoCodeValidationRequest = z.infer<typeof promoCodeValidationSchema>;
export type SubscriptionCreationRequest = z.infer<typeof subscriptionCreationSchema>;
export type SubscriptionActionRequest = z.infer<typeof subscriptionActionSchema>;
