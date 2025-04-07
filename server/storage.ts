import { 
  users, purchases, promoCodes, subscriptions, achievements, gameSaves, 
  aiRappers, aiSongs, aiAlbums, chartHistory,
  type User, type InsertUser, 
  type Purchase, type InsertPurchase, 
  type PromoCode, type InsertPromoCode, 
  type Subscription, type InsertSubscription, 
  type Achievement, type InsertAchievement, 
  type GameSave, type InsertGameSave,
  type AiRapper, type InsertAiRapper,
  type AiSong, type InsertAiSong,
  type AiAlbum, type InsertAiAlbum,
  type ChartHistory, type InsertChartHistory
} from "@shared/schema";
import { and, eq, gte, isNull, lte, lt, desc, or, sql } from "drizzle-orm";
import { db } from "./db";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<User | undefined>;
  updateUserSubscription(
    userId: number, 
    subscriptionActive: boolean, 
    subscriptionId?: string, 
    expiry?: Date
  ): Promise<User | undefined>;
  
  // Achievement methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<Achievement[]>;
  getAchievementById(id: number): Promise<Achievement | undefined>;
  
  // Game Save methods
  createGameSave(gameSave: InsertGameSave): Promise<GameSave>;
  getUserGameSaves(userId: number): Promise<GameSave[]>;
  getGameSaveById(id: number): Promise<GameSave | undefined>;
  getGameSaveBySlot(userId: number, saveSlot: number): Promise<GameSave | undefined>;
  updateGameSave(id: number, updates: Partial<GameSave>): Promise<GameSave | undefined>;
  deleteGameSave(id: number): Promise<boolean>;
  
  // Purchase methods
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchaseByTransactionId(transactionId: string): Promise<Purchase | undefined>;
  getUserPurchases(userId: number): Promise<Purchase[]>;
  updatePurchaseStatus(id: number, status: string, verificationTime?: Date): Promise<Purchase | undefined>;
  getPurchasesByProductId(productId: string): Promise<Purchase[]>;
  
  // Promo code methods
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  getPromoCodeById(id: number): Promise<PromoCode | undefined>;
  getActivePromoCodes(): Promise<PromoCode[]>;
  validatePromoCode(code: string, productId?: string): Promise<PromoCode | undefined>;
  usePromoCode(id: number): Promise<PromoCode | undefined>;
  updatePromoCode(id: number, updates: Partial<PromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;
  
  // Subscription methods
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: number): Promise<Subscription[]>;
  getUserActiveSubscription(userId: number): Promise<Subscription | undefined>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  cancelSubscription(id: number, cancelAtPeriodEnd?: boolean): Promise<Subscription | undefined>;
  reactivateSubscription(id: number): Promise<Subscription | undefined>;
  updateSubscriptionPayment(id: number, paymentDetails: any): Promise<Subscription | undefined>;
  processSubscriptionRenewal(id: number): Promise<Subscription | undefined>;
  
  // AI Rapper methods
  createAiRapper(rapper: InsertAiRapper): Promise<AiRapper>;
  getAiRapperById(id: number): Promise<AiRapper | undefined>;
  getAllAiRappers(): Promise<AiRapper[]>;
  getActiveAiRappers(): Promise<AiRapper[]>;
  updateAiRapper(id: number, updates: Partial<AiRapper>): Promise<AiRapper | undefined>;
  
  // AI Song methods
  createAiSong(song: InsertAiSong): Promise<AiSong>;
  getAiSongById(id: number): Promise<AiSong | undefined>;
  getAiSongsByRapperId(rapperId: number): Promise<AiSong[]>;
  updateAiSong(id: number, updates: Partial<AiSong>): Promise<AiSong | undefined>;
  
  // AI Album methods
  createAiAlbum(album: InsertAiAlbum): Promise<AiAlbum>;
  getAiAlbumById(id: number): Promise<AiAlbum | undefined>;
  getAiAlbumsByRapperId(rapperId: number): Promise<AiAlbum[]>;
  updateAiAlbum(id: number, updates: Partial<AiAlbum>): Promise<AiAlbum | undefined>;
  
  // Chart History methods
  createChartEntry(entry: InsertChartHistory): Promise<ChartHistory>;
  getChartHistoryByType(chartType: string, limit?: number): Promise<ChartHistory[]>;
  getLatestChartsByDate(date: Date): Promise<{
    hot100: ChartHistory[],
    billboard200: ChartHistory[],
    artistRankings: ChartHistory[]
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ premiumUser: isPremium })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser || undefined;
  }

  async updateUserSubscription(
    userId: number, 
    subscriptionActive: boolean, 
    subscriptionId?: string, 
    expiry?: Date
  ): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({
        subscriptionActive,
        premiumUser: subscriptionActive ? true : user.premiumUser, // Premium status is kept if subscription becomes inactive
        subscriptionId: subscriptionId || user.subscriptionId,
        subscriptionExpiry: expiry || user.subscriptionExpiry
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser || undefined;
  }
  
  // Achievement methods
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values({
        ...achievement,
        metadata: achievement.metadata || {}
      })
      .returning();
    
    return newAchievement;
  }
  
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
  }
  
  async getAchievementById(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    
    return achievement || undefined;
  }
  
  // Game Save methods
  async createGameSave(gameSave: InsertGameSave): Promise<GameSave> {
    const [newGameSave] = await db
      .insert(gameSaves)
      .values({
        ...gameSave,
        active: gameSave.active !== undefined ? gameSave.active : true
      })
      .returning();
    
    return newGameSave;
  }
  
  async getUserGameSaves(userId: number): Promise<GameSave[]> {
    return await db
      .select()
      .from(gameSaves)
      .where(eq(gameSaves.userId, userId));
  }
  
  async getGameSaveById(id: number): Promise<GameSave | undefined> {
    const [gameSave] = await db
      .select()
      .from(gameSaves)
      .where(eq(gameSaves.id, id));
    
    return gameSave || undefined;
  }
  
  async getGameSaveBySlot(userId: number, saveSlot: number): Promise<GameSave | undefined> {
    const [gameSave] = await db
      .select()
      .from(gameSaves)
      .where(and(
        eq(gameSaves.userId, userId),
        eq(gameSaves.saveSlot, saveSlot)
      ));
    
    return gameSave || undefined;
  }
  
  async updateGameSave(id: number, updates: Partial<GameSave>): Promise<GameSave | undefined> {
    const [updatedGameSave] = await db
      .update(gameSaves)
      .set(updates)
      .where(eq(gameSaves.id, id))
      .returning();
    
    return updatedGameSave || undefined;
  }
  
  async deleteGameSave(id: number): Promise<boolean> {
    const deleted = await db
      .delete(gameSaves)
      .where(eq(gameSaves.id, id));
    
    return (deleted?.rowCount || 0) > 0;
  }

  // Purchase methods
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db
      .insert(purchases)
      .values({
        ...purchase,
        purchaseTime: new Date(),
        verificationTime: null,
        purchaseToken: purchase.purchaseToken || null,
        receiptData: purchase.receiptData || null,
        amount: purchase.amount || null,
        metadata: purchase.metadata || null,
        promoCodeId: purchase.promoCodeId || null
      })
      .returning();
    
    return newPurchase;
  }
  
  async getPurchaseByTransactionId(transactionId: string): Promise<Purchase | undefined> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.transactionId, transactionId));
    
    return purchase || undefined;
  }
  
  async getUserPurchases(userId: number): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId));
  }
  
  async updatePurchaseStatus(id: number, status: string, verificationTime?: Date): Promise<Purchase | undefined> {
    const [updatedPurchase] = await db
      .update(purchases)
      .set({
        status,
        verificationTime: verificationTime || new Date()
      })
      .where(eq(purchases.id, id))
      .returning();
    
    return updatedPurchase || undefined;
  }
  
  async getPurchasesByProductId(productId: string): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.productId, productId));
  }
  
  // Promo code methods
  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const now = new Date();
    
    const [newPromoCode] = await db
      .insert(promoCodes)
      .values({
        ...promoCode,
        discountPercentage: promoCode.discountPercentage || null,
        discountAmount: promoCode.discountAmount || null,
        currencyBonus: promoCode.currencyBonus || null,
        validFrom: promoCode.validFrom || now,
        validUntil: promoCode.validUntil || null,
        maxUses: promoCode.maxUses || null,
        usesCount: 0,
        applicableProducts: promoCode.applicableProducts || null,
        isActive: promoCode.isActive !== undefined ? promoCode.isActive : true,
        createdAt: now
      })
      .returning();
    
    return newPromoCode;
  }
  
  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const [promoCode] = await db
      .select()
      .from(promoCodes)
      .where(sql`LOWER(${promoCodes.code}) = LOWER(${code})`);
    
    return promoCode || undefined;
  }
  
  async getPromoCodeById(id: number): Promise<PromoCode | undefined> {
    const [promoCode] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.id, id));
    
    return promoCode || undefined;
  }
  
  async getActivePromoCodes(): Promise<PromoCode[]> {
    const now = new Date();
    
    return await db
      .select()
      .from(promoCodes)
      .where(and(
        eq(promoCodes.isActive, true),
        or(
          isNull(promoCodes.maxUses),
          lt(promoCodes.usesCount, promoCodes.maxUses)
        ),
        or(
          isNull(promoCodes.validFrom),
          lte(promoCodes.validFrom, now)
        ),
        or(
          isNull(promoCodes.validUntil),
          gte(promoCodes.validUntil, now)
        )
      ));
  }
  
  async validatePromoCode(code: string, productId?: string): Promise<PromoCode | undefined> {
    const promoCode = await this.getPromoCodeByCode(code);
    if (!promoCode) return undefined;
    
    const now = new Date();
    
    // Check if code is active
    if (!promoCode.isActive) return undefined;
    
    // Check if code has reached max uses
    if (promoCode.maxUses !== null && promoCode.usesCount >= promoCode.maxUses) return undefined;
    
    // Check if code is within valid date range
    if (promoCode.validFrom && promoCode.validFrom > now) return undefined;
    if (promoCode.validUntil && promoCode.validUntil < now) return undefined;
    
    // Check if code applies to specific product (if specified)
    if (productId && promoCode.applicableProducts) {
      const applicableProducts = promoCode.applicableProducts as string[];
      if (applicableProducts.length > 0 && !applicableProducts.includes(productId)) {
        return undefined;
      }
    }
    
    return promoCode;
  }
  
  async usePromoCode(id: number): Promise<PromoCode | undefined> {
    const promoCode = await this.getPromoCodeById(id);
    if (!promoCode) return undefined;
    
    const newUsesCount = promoCode.usesCount + 1;
    const isActive = (promoCode.maxUses !== null && newUsesCount >= promoCode.maxUses) 
      ? false 
      : promoCode.isActive;
    
    const [updatedPromoCode] = await db
      .update(promoCodes)
      .set({
        usesCount: newUsesCount,
        isActive: isActive
      })
      .where(eq(promoCodes.id, id))
      .returning();
    
    return updatedPromoCode || undefined;
  }
  
  async updatePromoCode(id: number, updates: Partial<PromoCode>): Promise<PromoCode | undefined> {
    const [updatedPromoCode] = await db
      .update(promoCodes)
      .set(updates)
      .where(eq(promoCodes.id, id))
      .returning();
    
    return updatedPromoCode || undefined;
  }
  
  async deletePromoCode(id: number): Promise<boolean> {
    const deleted = await db
      .delete(promoCodes)
      .where(eq(promoCodes.id, id));
    
    return (deleted?.rowCount || 0) > 0;
  }
  
  // Subscription methods
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const now = new Date();
    
    let endDate: Date | null = null;
    let nextBillingDate: Date | null = null;
    
    // Calculate end date and next billing date based on billing period
    if (subscription.billingPeriod) {
      const period = subscription.billingPeriod;
      const billingDate = new Date(now);
      
      if (period === "monthly") {
        billingDate.setMonth(billingDate.getMonth() + 1);
      } else if (period === "quarterly") {
        billingDate.setMonth(billingDate.getMonth() + 3);
      } else if (period === "yearly") {
        billingDate.setFullYear(billingDate.getFullYear() + 1);
      }
      
      nextBillingDate = billingDate;
      endDate = new Date(billingDate); // End date is same as next billing if active
    }
    
    const [newSubscription] = await db
      .insert(subscriptions)
      .values({
        ...subscription,
        status: subscription.status || "active",
        startDate: now,
        endDate,
        cancelDate: null,
        lastBillingDate: now,
        nextBillingDate,
        trialEnd: null,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
        autoRenew: subscription.autoRenew || true,
        latestPurchaseId: null,
        metadata: subscription.metadata || {}
      })
      .returning();
    
    // Update user's subscription status
    if (newSubscription.status === "active") {
      await this.updateUserSubscription(
        newSubscription.userId,
        true,
        newSubscription.id.toString(),
        newSubscription.endDate || undefined
      );
    }
    
    return newSubscription;
  }
  
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    
    return subscription || undefined;
  }
  
  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
  }
  
  async getUserActiveSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      ));
    
    return subscription || undefined;
  }
  
  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = await this.getSubscription(id);
    if (!subscription) return undefined;
    
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, id))
      .returning();
    
    // Update user subscription status if status changed
    if (updates.status && subscription.status !== updates.status) {
      const isActive = updates.status === "active";
      await this.updateUserSubscription(
        subscription.userId,
        isActive,
        subscription.id.toString(),
        updatedSubscription.endDate || undefined
      );
    }
    
    return updatedSubscription || undefined;
  }
  
  async cancelSubscription(id: number, cancelAtPeriodEnd: boolean = true): Promise<Subscription | undefined> {
    const subscription = await this.getSubscription(id);
    if (!subscription) return undefined;
    
    const now = new Date();
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        cancelDate: now,
        cancelAtPeriodEnd,
        status: cancelAtPeriodEnd ? "active" : "cancelled"
      })
      .where(eq(subscriptions.id, id))
      .returning();
    
    // If cancelled immediately (not at period end), update user subscription
    if (!cancelAtPeriodEnd) {
      await this.updateUserSubscription(subscription.userId, false);
    }
    
    return updatedSubscription || undefined;
  }
  
  async reactivateSubscription(id: number): Promise<Subscription | undefined> {
    const subscription = await this.getSubscription(id);
    if (!subscription) return undefined;
    
    // Only cancelled or expired subscriptions can be reactivated
    if (subscription.status !== "cancelled" && subscription.status !== "expired") {
      return subscription;
    }
    
    const now = new Date();
    let nextBillingDate: Date | null = null;
    let endDate: Date | null = null;
    
    // Recalculate billing dates
    if (subscription.billingPeriod) {
      const period = subscription.billingPeriod;
      const billingDate = new Date(now);
      
      if (period === "monthly") {
        billingDate.setMonth(billingDate.getMonth() + 1);
      } else if (period === "quarterly") {
        billingDate.setMonth(billingDate.getMonth() + 3);
      } else if (period === "yearly") {
        billingDate.setFullYear(billingDate.getFullYear() + 1);
      }
      
      nextBillingDate = billingDate;
      endDate = new Date(billingDate);
    }
    
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        status: "active",
        cancelDate: null,
        cancelAtPeriodEnd: false,
        lastBillingDate: now,
        nextBillingDate,
        endDate
      })
      .where(eq(subscriptions.id, id))
      .returning();
    
    // Update user subscription status
    await this.updateUserSubscription(
      subscription.userId,
      true,
      subscription.id.toString(),
      updatedSubscription.endDate || undefined
    );
    
    return updatedSubscription || undefined;
  }
  
  async updateSubscriptionPayment(id: number, paymentDetails: any): Promise<Subscription | undefined> {
    const subscription = await this.getSubscription(id);
    if (!subscription) return undefined;
    
    // Update metadata with new payment info
    const metadata = subscription.metadata ? {...subscription.metadata} : {};
    const updatedMetadata = {
      ...metadata,
      paymentDetails
    };
    
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        metadata: updatedMetadata
      })
      .where(eq(subscriptions.id, id))
      .returning();
    
    return updatedSubscription || undefined;
  }
  
  async processSubscriptionRenewal(id: number): Promise<Subscription | undefined> {
    const subscription = await this.getSubscription(id);
    if (!subscription) return undefined;
    
    // Only active subscriptions can be renewed
    if (subscription.status !== "active") {
      return subscription;
    }
    
    // Check if subscription should be cancelled at period end
    if (subscription.cancelAtPeriodEnd) {
      const [updatedSubscription] = await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          endDate: subscription.nextBillingDate
        })
        .where(eq(subscriptions.id, id))
        .returning();
      
      // Update user subscription status
      await this.updateUserSubscription(subscription.userId, false);
      
      return updatedSubscription || undefined;
    }
    
    const now = new Date();
    let nextBillingDate: Date | null = null;
    let endDate: Date | null = null;
    
    // Calculate new billing dates
    if (subscription.billingPeriod) {
      const period = subscription.billingPeriod;
      const billingDate = new Date(now);
      
      if (period === "monthly") {
        billingDate.setMonth(billingDate.getMonth() + 1);
      } else if (period === "quarterly") {
        billingDate.setMonth(billingDate.getMonth() + 3);
      } else if (period === "yearly") {
        billingDate.setFullYear(billingDate.getFullYear() + 1);
      }
      
      nextBillingDate = billingDate;
      endDate = new Date(billingDate);
    }
    
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        lastBillingDate: now,
        nextBillingDate,
        endDate
      })
      .where(eq(subscriptions.id, id))
      .returning();
    
    // Update user subscription status
    await this.updateUserSubscription(
      subscription.userId,
      true,
      subscription.id.toString(),
      updatedSubscription.endDate || undefined
    );
    
    return updatedSubscription || undefined;
  }

  // AI Rapper methods
  async createAiRapper(rapper: InsertAiRapper): Promise<AiRapper> {
    const [newRapper] = await db
      .insert(aiRappers)
      .values({
        ...rapper,
        metadata: rapper.metadata || {}
      })
      .returning();
    
    return newRapper;
  }
  
  async getAiRapperById(id: number): Promise<AiRapper | undefined> {
    const [rapper] = await db
      .select()
      .from(aiRappers)
      .where(eq(aiRappers.id, id));
    
    return rapper || undefined;
  }
  
  async getAllAiRappers(): Promise<AiRapper[]> {
    return await db
      .select()
      .from(aiRappers);
  }
  
  async getActiveAiRappers(): Promise<AiRapper[]> {
    return await db
      .select()
      .from(aiRappers)
      .where(eq(aiRappers.isActive, true));
  }
  
  async updateAiRapper(id: number, updates: Partial<AiRapper>): Promise<AiRapper | undefined> {
    const [updatedRapper] = await db
      .update(aiRappers)
      .set(updates)
      .where(eq(aiRappers.id, id))
      .returning();
    
    return updatedRapper || undefined;
  }
  
  // AI Song methods
  async createAiSong(song: InsertAiSong): Promise<AiSong> {
    const [newSong] = await db
      .insert(aiSongs)
      .values({
        ...song,
        metadata: song.metadata || {}
      })
      .returning();
    
    return newSong;
  }
  
  async getAiSongById(id: number): Promise<AiSong | undefined> {
    const [song] = await db
      .select()
      .from(aiSongs)
      .where(eq(aiSongs.id, id));
    
    return song || undefined;
  }
  
  async getAiSongsByRapperId(rapperId: number): Promise<AiSong[]> {
    return await db
      .select()
      .from(aiSongs)
      .where(eq(aiSongs.rapperId, rapperId));
  }
  
  async updateAiSong(id: number, updates: Partial<AiSong>): Promise<AiSong | undefined> {
    const [updatedSong] = await db
      .update(aiSongs)
      .set(updates)
      .where(eq(aiSongs.id, id))
      .returning();
    
    return updatedSong || undefined;
  }
  
  // AI Album methods
  async createAiAlbum(album: InsertAiAlbum): Promise<AiAlbum> {
    const [newAlbum] = await db
      .insert(aiAlbums)
      .values({
        ...album,
        metadata: album.metadata || {}
      })
      .returning();
    
    return newAlbum;
  }
  
  async getAiAlbumById(id: number): Promise<AiAlbum | undefined> {
    const [album] = await db
      .select()
      .from(aiAlbums)
      .where(eq(aiAlbums.id, id));
    
    return album || undefined;
  }
  
  async getAiAlbumsByRapperId(rapperId: number): Promise<AiAlbum[]> {
    return await db
      .select()
      .from(aiAlbums)
      .where(eq(aiAlbums.rapperId, rapperId));
  }
  
  async updateAiAlbum(id: number, updates: Partial<AiAlbum>): Promise<AiAlbum | undefined> {
    const [updatedAlbum] = await db
      .update(aiAlbums)
      .set(updates)
      .where(eq(aiAlbums.id, id))
      .returning();
    
    return updatedAlbum || undefined;
  }
  
  // Chart History methods
  async createChartEntry(entry: InsertChartHistory): Promise<ChartHistory> {
    const [newEntry] = await db
      .insert(chartHistory)
      .values({
        ...entry,
        metadata: entry.metadata || {}
      })
      .returning();
    
    return newEntry;
  }
  
  async getChartHistoryByType(chartType: string, limit: number = 100): Promise<ChartHistory[]> {
    return await db
      .select()
      .from(chartHistory)
      .where(eq(chartHistory.chartType, chartType))
      .orderBy(desc(chartHistory.chartDate))
      .limit(limit);
  }
  
  async getLatestChartsByDate(date: Date): Promise<{
    hot100: ChartHistory[],
    billboard200: ChartHistory[],
    artistRankings: ChartHistory[]
  }> {
    // Get charts for the specific date
    const charts = await db
      .select()
      .from(chartHistory)
      .where(and(
        sql`DATE(${chartHistory.chartDate}) = DATE(${date})`,
        or(
          eq(chartHistory.chartType, "hot100"),
          eq(chartHistory.chartType, "billboard200"),
          eq(chartHistory.chartType, "artist_rankings")
        )
      ))
      .orderBy(chartHistory.position);
    
    // Separate charts by type
    const hot100 = charts.filter(chart => chart.chartType === "hot100");
    const billboard200 = charts.filter(chart => chart.chartType === "billboard200");
    const artistRankings = charts.filter(chart => chart.chartType === "artist_rankings");
    
    return {
      hot100,
      billboard200,
      artistRankings
    };
  }
}

export const storage = new DatabaseStorage();