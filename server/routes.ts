import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { purchaseVerificationSchema, insertPurchaseSchema, promoCodeValidationSchema, insertPromoCodeSchema, subscriptionCreationSchema, subscriptionActionSchema } from "../shared/schema";
import { z } from "zod";
import aiRappersRouter from "./routes/aiRappers";
import aiSongsRouter from "./routes/aiSongs";
import aiAlbumsRouter from "./routes/aiAlbums";
import chartHistoryRouter from "./routes/chartHistory";
// PayPal integration removed per user request
// import paypal from "@paypal/checkout-server-sdk";

// Helper to verify Google Play purchase
async function verifyGooglePlayPurchase(purchaseToken: string, productId: string): Promise<boolean> {
  try {
    // Log the verification attempt
    console.log(`Verifying Google Play purchase: ${productId}, token: ${purchaseToken.substring(0, 10)}...`);
    
    // Check if the required environment variables are set
    const googlePlayClientEmail = process.env.GOOGLE_PLAY_CLIENT_EMAIL;
    const googlePlayPrivateKey = process.env.GOOGLE_PLAY_PRIVATE_KEY;
    
    if (!googlePlayClientEmail || !googlePlayPrivateKey) {
      console.log("Google Play API credentials not configured. Running in development mode.");
      
      // For development or testing, we'll simulate success with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always return success in development mode
      return true;
    }
    
    // This code would be uncommented and used in production:
    
    // You'll need to install these packages:
    // npm install googleapis axios
    
    /*
    import { google } from 'googleapis';
    import axios from 'axios';
    
    // Initialize the JWT client with Google Play API service account
    const jwtClient = new google.auth.JWT(
      googlePlayClientEmail,
      undefined,
      googlePlayPrivateKey.replace(/\\n/g, '\n'), // Fix newlines in the private key
      ['https://www.googleapis.com/auth/androidpublisher']
    );
    
    // Authenticate with the Google Play Developer API
    await jwtClient.authorize();
    
    // Extract package name from product ID (format: packageName.productId)
    // For example: "com.rappersim.premium_subscription" -> packageName = "com.rappersim"
    const packageName = productId.split('.').slice(0, 2).join('.');
    const productSku = productId.split('.').slice(2).join('.');
    
    console.log(`Verifying purchase with packageName: ${packageName}, productSku: ${productSku}`);
    
    // Determine if this is a one-time product or a subscription
    const isSubscription = productId.includes('subscription');
    
    let response;
    
    if (isSubscription) {
      // For subscriptions
      response = await axios.get(
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productSku}/tokens/${purchaseToken}`,
        {
          headers: {
            Authorization: `Bearer ${jwtClient.credentials.access_token}`
          }
        }
      );
      
      // Log the response for debugging
      console.log("Google Play API subscription response:", JSON.stringify(response.data, null, 2));
      
      // Check subscription status
      // paymentState: 0 = payment pending, 1 = payment received
      // For subscriptions, we care about the paymentState and expiryTimeMillis
      const paymentState = response.data.paymentState;
      const expiryTimeMillis = response.data.expiryTimeMillis;
      const currentTimeMillis = Date.now();
      
      // Consider valid if payment received and not expired
      return paymentState === 1 && currentTimeMillis < parseInt(expiryTimeMillis);
    } else {
      // For one-time purchases
      response = await axios.get(
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productSku}/tokens/${purchaseToken}`,
        {
          headers: {
            Authorization: `Bearer ${jwtClient.credentials.access_token}`
          }
        }
      );
      
      // Log the response for debugging
      console.log("Google Play API product response:", JSON.stringify(response.data, null, 2));
      
      // Check if the purchase is valid
      // purchaseState: 0 = purchased, 1 = canceled, 2 = pending
      const purchaseState = response.data.purchaseState;
      
      // Only consider the purchase valid if state is "purchased"
      return purchaseState === 0;
    }
    */
    
    // For now, simulate success in development/testing mode with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('Google Play purchase verification error:', error);
    // Log more details about the error if available
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // For better error handling, you might want to differentiate between different error scenarios
    // For example, network errors vs. validation errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('invalid_token') || errorMessage.includes('Invalid JWT')) {
      console.error('Authentication error with Google Play API - check credentials');
    } else if (errorMessage.includes('404')) {
      console.error('Product or purchase token not found - check product ID and token');
    }
    
    return false;
  }
}

// Helper to verify iOS App Store purchase
async function verifyAppStorePurchase(receiptData: string): Promise<boolean> {
  try {
    // Log the verification attempt
    console.log(`Verifying iOS purchase with receipt: ${receiptData.substring(0, 10)}...`);
    
    // In production, you would connect to the Apple App Store receipt validation API
    // Check if the required environment variables are set
    const appStoreSecret = process.env.APP_STORE_SECRET;
    
    if (!appStoreSecret) {
      console.log("App Store secret not configured. Running in development mode.");
      
      // For development, we'll simulate success with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always return success in development mode
      return true;
    }
    
    /*
    // This would be used in production:
    
    // First, try to validate with production environment
    const productionValidationUrl = 'https://buy.itunes.apple.com/verifyReceipt';
    let response = await axios.post(productionValidationUrl, {
      'receipt-data': receiptData,
      'password': appStoreSecret // Your App Store Connect shared secret
    });
    
    // If it's a sandbox receipt, Apple will return status 21007, and we should retry with sandbox URL
    if (response.data.status === 21007) {
      const sandboxValidationUrl = 'https://sandbox.itunes.apple.com/verifyReceipt';
      response = await axios.post(sandboxValidationUrl, {
        'receipt-data': receiptData,
        'password': appStoreSecret
      });
    }
    
    // Log the response for debugging
    console.log("App Store API response status:", response.data.status);
    
    // Check if the receipt is valid (status 0 means success)
    return response.data.status === 0;
    */
    
    // For now, simulate success in development mode with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('App Store purchase verification error:', error);
    // Log more details about the error
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    return false;
  }
}

// Helper to apply purchase benefits to user account
async function applyPurchaseBenefits(userId: number, productId: string, promoCodeId?: number | null): Promise<void> {
  console.log(`Applying purchase benefits for product: ${productId} to user ${userId}`);
  
  try {
    // Handle ad removal purchase
    if (productId.includes('ad_free')) {
      console.log(`Processing ad removal purchase for user ${userId}`);
      // The ad-free status is managed on the client side, but we can store it in user metadata if needed
    }
    
    // Handle premium features/upgrade
    if (productId.includes('platinum') ||
        productId.includes('premium') ||
        productId.includes('vip')) {
      console.log(`Processing premium status update for user ${userId}`);
      await storage.updateUserPremiumStatus(userId, true);
    }
    
    // Subscriptions - handle different subscription types
    if (productId.includes('subscription') || 
        productId.includes('membership')) {
        
      console.log(`Processing subscription purchase: ${productId} for user ${userId}`);
      
      // Determine subscription tier
      let tier = 'standard';
      if (productId.includes('premium')) tier = 'premium';
      if (productId.includes('platinum')) tier = 'platinum';
      
      // Determine subscription duration based on product ID
      let durationDays = 30; // Default to monthly (30 days)
      
      if (productId.includes('yearly')) {
        durationDays = 365; // Yearly subscription
      } else if (productId.includes('quarterly')) {
        durationDays = 90; // Quarterly subscription
      } else if (productId.includes('biannual')) {
        durationDays = 180; // 6-month subscription
      }
      
      console.log(`Subscription tier: ${tier}, duration: ${durationDays} days`);
      
      // Set expiry date based on subscription duration
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      
      // If user applied a promo code, check if it extends the subscription
      if (promoCodeId) {
        const promoCode = await storage.getPromoCodeById(promoCodeId);
        if (promoCode && promoCode.currencyBonus) {
          // Add bonus days based on promo code (1 day per 1000 currency bonus)
          const bonusDays = Math.floor(promoCode.currencyBonus / 1000);
          if (bonusDays > 0) {
            expiryDate.setDate(expiryDate.getDate() + bonusDays);
            console.log(`Added ${bonusDays} bonus days from promo code`);
          }
        }
      }
      
      // Update the user's subscription status
      await storage.updateUserSubscription(userId, true, productId, expiryDate);
      
      // Also update premium status for subscription users
      await storage.updateUserPremiumStatus(userId, true);
      
      console.log(`User ${userId} subscription activated until ${expiryDate.toISOString()}`);
    }
    
    // Handle virtual currency purchases
    if (productId.includes('currency')) {
      console.log(`Processing currency purchase for user ${userId}`);
      
      // Determine currency amount based on the product tier
      let currencyAmount = 10000; // Default small package
      
      if (productId.includes('medium')) {
        currencyAmount = 50000;
      } else if (productId.includes('large')) {
        currencyAmount = 200000;
      } else if (productId.includes('huge')) {
        currencyAmount = 1000000;
      }
      
      // For virtual currency, we would typically update the user's balance
      // This would be handled in a proper database implementation
      // For now, we just log it since the client handles the currency application
      console.log(`User ${userId} received ${currencyAmount} virtual currency`);
      
      // If we had a user balance in our storage:
      // await storage.updateUserBalance(userId, balance => balance + currencyAmount);
    }
  } catch (error) {
    console.error(`Error applying purchase benefits:`, error);
    throw error; // Re-throw to let the caller handle it
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a test user if none exists
  const testUser = await storage.getUser(1);
  if (!testUser) {
    await storage.createUser({
      username: "testuser",
      password: "password123"
    });
    console.log("Created test user with ID 1");
  }
  // Test user API route
  app.post("/api/test-user", async (req, res) => {
    try {
      // Create or retrieve test user with ID 1
      let user = await storage.getUser(1);
      
      if (!user) {
        user = await storage.createUser({
          username: "testuser",
          password: "password123"
        });
      }
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          premiumUser: user.premiumUser,
          subscriptionActive: user.subscriptionActive
        }
      });
    } catch (error) {
      console.error("Error creating test user:", error);
      res.status(500).json({ 
        error: "Failed to create test user",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Game save API routes
  app.get("/api/saves", (req, res) => {
    try {
      // In a real implementation, we would fetch saves from a database
      // For now, just return success since we're storing in localStorage
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve saved games" });
    }
  });

  app.post("/api/saves", (req, res) => {
    try {
      // In a real implementation, we would save to a database
      // For now, just return success since we're storing in localStorage
      res.json({ success: true, id: req.body.id || "temp-id" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save game" });
    }
  });

  app.delete("/api/saves/:id", (req, res) => {
    try {
      // In a real implementation, we would delete from a database
      // For now, just return success since we're storing in localStorage
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete saved game" });
    }
  });

  // Purchase verification endpoints
  app.post("/api/purchases/verify", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = purchaseVerificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.format() 
        });
      }
      
      const purchaseData = validationResult.data;
      
      // Check if this transaction has already been processed
      const existingPurchase = await storage.getPurchaseByTransactionId(purchaseData.transactionId);
      if (existingPurchase) {
        if (existingPurchase.status === 'verified') {
          return res.json({ success: true, verified: true, status: 'already_verified' });
        }
        
        if (existingPurchase.status === 'failed') {
          return res.status(402).json({ 
            error: "This purchase has previously failed verification", 
            transactionId: purchaseData.transactionId 
          });
        }
      }
      
      // Check if there's a promo code to apply
      let promoCodeRecord = null;
      if (purchaseData.promoCode) {
        promoCodeRecord = await storage.validatePromoCode(purchaseData.promoCode, purchaseData.productId);
        if (promoCodeRecord) {
          console.log(`Valid promo code applied: ${promoCodeRecord.code}`);
        } else {
          console.log(`Invalid promo code attempted: ${purchaseData.promoCode}`);
        }
      }
      
      // Create a pending purchase record first
      const purchaseRecord = await storage.createPurchase({
        userId: purchaseData.userId || 0, // Use 0 for anonymous users
        productId: purchaseData.productId,
        transactionId: purchaseData.transactionId,
        purchaseToken: purchaseData.purchaseToken,
        receiptData: purchaseData.receiptData,
        status: 'pending',
        platform: purchaseData.platform,
        amount: null,
        metadata: typeof purchaseData.metadata === 'object' ? purchaseData.metadata : {},
        promoCodeId: promoCodeRecord ? promoCodeRecord.id : null
      });
      
      // Verify with the appropriate platform
      let isVerified = false;
      
      try {
        if (purchaseData.platform === 'android' && purchaseData.purchaseToken) {
          isVerified = await verifyGooglePlayPurchase(
            purchaseData.purchaseToken, 
            purchaseData.productId
          );
        } 
        else if (purchaseData.platform === 'ios' && purchaseData.receiptData) {
          isVerified = await verifyAppStorePurchase(purchaseData.receiptData);
        }
        else if (purchaseData.platform === 'web') {
          // For web testing, consider purchases verified automatically
          isVerified = true;
        }
      } catch (error) {
        // Mark purchase verification as failed
        await storage.updatePurchaseStatus(purchaseRecord.id, 'failed');
        
        return res.status(502).json({ 
          error: "Failed to verify purchase with payment provider", 
          details: error instanceof Error ? error.message : "Unknown error" 
        });
      }
      
      if (!isVerified) {
        // If verification failed, update status and return error
        await storage.updatePurchaseStatus(purchaseRecord.id, 'failed');
        
        return res.status(402).json({ 
          error: "Purchase verification failed", 
          transactionId: purchaseData.transactionId 
        });
      }
      
      // Update purchase status to verified
      await storage.updatePurchaseStatus(purchaseRecord.id, 'verified');
      
      // Apply benefits for the user if we have a user ID
      if (purchaseData.userId) {
        await applyPurchaseBenefits(
          purchaseData.userId, 
          purchaseData.productId, 
          promoCodeRecord ? promoCodeRecord.id : null
        );
        
        // If a promo code was used, increment its usage counter
        if (promoCodeRecord) {
          await storage.usePromoCode(promoCodeRecord.id);
        }
      }
      
      // Prepare response with promo code info if applicable
      const response: any = { 
        success: true, 
        verified: true,
        purchaseId: purchaseRecord.id,
        transactionId: purchaseData.transactionId
      };
      
      // Add promo code info if one was applied
      if (promoCodeRecord) {
        response.promoCode = {
          id: promoCodeRecord.id,
          code: promoCodeRecord.code
        };
        
        // Add discount info
        if (promoCodeRecord.discountPercentage) {
          response.promoCode.discountType = "percentage";
          response.promoCode.discountValue = promoCodeRecord.discountPercentage;
        } else if (promoCodeRecord.discountAmount) {
          response.promoCode.discountType = "amount";
          response.promoCode.discountValue = promoCodeRecord.discountAmount;
        }
        
        // Add currency bonus if applicable
        if (promoCodeRecord.currencyBonus) {
          response.promoCode.currencyBonus = promoCodeRecord.currencyBonus;
        }
      }
      
      res.json(response);
      
    } catch (error) {
      console.error("Error verifying purchase:", error);
      res.status(500).json({ 
        error: "Failed to process purchase verification",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get purchase history for a user
  app.get("/api/purchases/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const purchases = await storage.getUserPurchases(userId);
      res.json({ purchases });
      
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to retrieve purchase history",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Check premium status for a user
  app.get("/api/user/:userId/premium-status", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if subscription has expired (if it's active)
      let subscriptionActive = user.subscriptionActive;
      if (subscriptionActive && user.subscriptionExpiry) {
        const now = new Date();
        const expiry = new Date(user.subscriptionExpiry);
        
        if (now > expiry) {
          // Subscription has expired, update status
          subscriptionActive = false;
          await storage.updateUserSubscription(userId, false);
        }
      }
      
      res.json({
        userId: user.id,
        premiumUser: user.premiumUser,
        subscriptionActive,
        subscriptionExpiry: user.subscriptionExpiry
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to retrieve premium status",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // === Promo Code Endpoints ===
  
  // Validate a promotion code
  app.post("/api/promo-codes/validate", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = promoCodeValidationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.format() 
        });
      }
      
      const { code, productId, userId } = validationResult.data;
      
      // Validate the promo code
      const promoCode = await storage.validatePromoCode(code, productId);
      
      if (!promoCode) {
        return res.status(404).json({ 
          error: "Invalid or expired promotion code", 
          valid: false 
        });
      }
      
      // Prepare response with discount details
      const response: any = {
        valid: true,
        promoCodeId: promoCode.id,
        code: promoCode.code,
      };
      
      // Add discount info
      if (promoCode.discountPercentage) {
        response.discountType = "percentage";
        response.discountValue = promoCode.discountPercentage;
      } else if (promoCode.discountAmount) {
        response.discountType = "amount";
        response.discountValue = promoCode.discountAmount;
      }
      
      // Add currency bonus if applicable
      if (promoCode.currencyBonus) {
        response.currencyBonus = promoCode.currencyBonus;
      }
      
      res.json(response);
      
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(500).json({ 
        error: "Failed to validate promotion code",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Create a new promo code (admin/dev only)
  app.post("/api/promo-codes", async (req: Request, res: Response) => {
    try {
      // In a real app, this should be protected by authentication and authorization
      
      // Validate request body
      const validationResult = insertPromoCodeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid promo code data", 
          details: validationResult.error.format() 
        });
      }
      
      // Check if code already exists
      const existingCode = await storage.getPromoCodeByCode(validationResult.data.code);
      if (existingCode) {
        return res.status(409).json({ 
          error: "A promotion code with this code already exists" 
        });
      }
      
      // Create the new promo code
      const promoCode = await storage.createPromoCode(validationResult.data);
      
      res.status(201).json(promoCode);
      
    } catch (error) {
      console.error("Error creating promo code:", error);
      res.status(500).json({ 
        error: "Failed to create promotion code",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get all active promo codes
  app.get("/api/promo-codes/active", async (_req: Request, res: Response) => {
    try {
      // In a real app, this should be protected by authentication and authorization
      
      const activePromoCodes = await storage.getActivePromoCodes();
      
      res.json({ 
        promoCodes: activePromoCodes,
        count: activePromoCodes.length
      });
      
    } catch (error) {
      console.error("Error retrieving active promo codes:", error);
      res.status(500).json({ 
        error: "Failed to retrieve active promotion codes",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Update a promo code (admin/dev only)
  app.patch("/api/promo-codes/:id", async (req: Request, res: Response) => {
    try {
      // In a real app, this should be protected by authentication and authorization
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid promo code ID" });
      }
      
      // Get the existing promo code
      const existingPromoCode = await storage.getPromoCodeById(id);
      if (!existingPromoCode) {
        return res.status(404).json({ error: "Promotion code not found" });
      }
      
      // Update the promo code
      const updatedPromoCode = await storage.updatePromoCode(id, req.body);
      
      res.json(updatedPromoCode);
      
    } catch (error) {
      console.error("Error updating promo code:", error);
      res.status(500).json({ 
        error: "Failed to update promotion code",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Delete a promo code (admin/dev only)
  app.delete("/api/promo-codes/:id", async (req: Request, res: Response) => {
    try {
      // In a real app, this should be protected by authentication and authorization
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid promo code ID" });
      }
      
      // Get the existing promo code
      const existingPromoCode = await storage.getPromoCodeById(id);
      if (!existingPromoCode) {
        return res.status(404).json({ error: "Promotion code not found" });
      }
      
      // Delete the promo code (or set isActive to false)
      const deleted = await storage.deletePromoCode(id);
      
      res.json({ success: deleted });
      
    } catch (error) {
      console.error("Error deleting promo code:", error);
      res.status(500).json({ 
        error: "Failed to delete promotion code",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // === Subscription Endpoints ===

  // Set up PayPal client
  // PayPal integration removed per user request
  console.log("PayPal integration has been removed per user request.");
  
  // Simplified mock implementation for subscription handling
  const paypalClient = null;

  // Create a new subscription
  app.post("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      if (!paypalClient) {
        return res.status(503).json({ error: "PayPal service unavailable" });
      }

      // Validate request body
      const validationResult = subscriptionCreationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid subscription data", 
          details: validationResult.error.format() 
        });
      }
      
      const subscriptionData = validationResult.data;
      
      // Check if user exists
      const user = await storage.getUser(subscriptionData.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if user already has an active subscription
      const existingSubscription = await storage.getUserActiveSubscription(subscriptionData.userId);
      if (existingSubscription) {
        return res.status(409).json({ 
          error: "User already has an active subscription",
          subscriptionId: existingSubscription.id
        });
      }
      
      // Apply promo code if provided
      let promoCode = null;
      if (subscriptionData.promoCode) {
        promoCode = await storage.validatePromoCode(subscriptionData.promoCode, subscriptionData.planId);
        if (!promoCode) {
          return res.status(400).json({ error: "Invalid or expired promo code" });
        }
      }
      
      // Create subscription in our system first with "pending" status
      const subscription = await storage.createSubscription({
        userId: subscriptionData.userId,
        planId: subscriptionData.planId,
        status: "pending",
        billingPeriod: subscriptionData.billingPeriod,
        autoRenew: true,
        cancelAtPeriodEnd: false,
        metadata: {
          paymentMethod: subscriptionData.paymentMethod,
          promoCodeId: promoCode ? promoCode.id : null
        } as any
      });
      
      // Handle different payment methods
      if (subscriptionData.paymentMethod.type === "paypal") {
        try {
          // For PayPal we'll create a payment request that the frontend can use
          // In a real implementation, we would create a PayPal subscription request
          
          // Return the subscription details with payment info
          res.json({
            success: true,
            subscription: {
              id: subscription.id,
              status: subscription.status,
              planId: subscription.planId,
              billingPeriod: subscription.billingPeriod,
              startDate: subscription.startDate
            },
            paymentInfo: {
              type: "paypal",
              // PayPal has been removed per user request
              clientId: "paypal-integration-removed",
              planId: subscriptionData.planId,
              // Include discount if applicable
              discount: promoCode ? {
                type: promoCode.discountPercentage ? "percentage" : "amount",
                value: promoCode.discountPercentage || promoCode.discountAmount || 0
              } : null
            }
          });
        } catch (error) {
          console.error("Error creating PayPal subscription:", error);
          
          // Update subscription status to failed
          await storage.updateSubscription(subscription.id, { status: "failed" });
          
          return res.status(502).json({ 
            error: "Failed to create PayPal subscription",
            details: error instanceof Error ? error.message : "Unknown error"
          });
        }
      } 
      else if (subscriptionData.paymentMethod.type === "credit_card") {
        // For credit cards, the frontend should collect card details securely
        // and process them through a secure payment provider
        
        // Here we're just simulating success for demonstration purposes
        // In a real implementation, we would use a proper payment processor
        
        // Update subscription to active
        const activatedSubscription = await storage.updateSubscription(subscription.id, { 
          status: "active" 
        });
        
        // Increment promo code usage if one was applied
        if (promoCode) {
          await storage.usePromoCode(promoCode.id);
        }
        
        res.json({
          success: true,
          subscription: {
            id: activatedSubscription?.id,
            status: activatedSubscription?.status,
            planId: activatedSubscription?.planId,
            billingPeriod: activatedSubscription?.billingPeriod,
            startDate: activatedSubscription?.startDate,
            nextBillingDate: activatedSubscription?.nextBillingDate
          }
        });
      } 
      else {
        // Unsupported payment method
        await storage.updateSubscription(subscription.id, { status: "failed" });
        
        return res.status(400).json({ 
          error: "Unsupported payment method", 
          paymentMethod: subscriptionData.paymentMethod.type 
        });
      }
      
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ 
        error: "Failed to create subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Confirm a PayPal subscription payment
  app.post("/api/subscriptions/:id/confirm", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid subscription ID" });
      }
      
      const { paymentId, payerId } = req.body;
      
      if (!paymentId || !payerId) {
        return res.status(400).json({ error: "Missing payment information" });
      }
      
      // Get the subscription
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      // Only pending subscriptions can be confirmed
      if (subscription.status !== "pending") {
        return res.status(400).json({ 
          error: "Subscription cannot be confirmed", 
          status: subscription.status 
        });
      }
      
      // In a real implementation, we would execute the PayPal payment here
      // using the paymentId and payerId from the client
      
      // For this example, we'll simulate success
      const currentMetadata = subscription.metadata || {};
      const updatedSubscription = await storage.updateSubscription(id, {
        status: "active",
        metadata: {
          ...(typeof currentMetadata === 'object' ? currentMetadata : {}),
          paypalPaymentId: paymentId,
          paypalPayerId: payerId
        }
      });
      
      // Apply promo code if one was used
      const metadata = subscription.metadata as any;
      if (metadata && metadata.promoCodeId) {
        const promoCode = await storage.getPromoCodeById(metadata.promoCodeId);
        if (promoCode) {
          await storage.usePromoCode(promoCode.id);
        }
      }
      
      res.json({
        success: true,
        subscription: {
          id: updatedSubscription?.id,
          status: updatedSubscription?.status,
          planId: updatedSubscription?.planId,
          billingPeriod: updatedSubscription?.billingPeriod,
          startDate: updatedSubscription?.startDate,
          nextBillingDate: updatedSubscription?.nextBillingDate
        }
      });
      
    } catch (error) {
      console.error("Error confirming subscription:", error);
      res.status(500).json({ 
        error: "Failed to confirm subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get user subscriptions
  app.get("/api/users/:userId/subscriptions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // Get all subscriptions for the user
      const subscriptions = await storage.getUserSubscriptions(userId);
      
      res.json({ subscriptions });
      
    } catch (error) {
      console.error("Error retrieving user subscriptions:", error);
      res.status(500).json({ 
        error: "Failed to retrieve user subscriptions",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get subscription details
  app.get("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid subscription ID" });
      }
      
      // Get the subscription
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      res.json({ subscription });
      
    } catch (error) {
      console.error("Error retrieving subscription:", error);
      res.status(500).json({ 
        error: "Failed to retrieve subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Cancel a subscription
  app.post("/api/subscriptions/:id/cancel", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = subscriptionActionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.format() 
        });
      }
      
      const { subscriptionId, userId, action } = validationResult.data;
      
      // Ensure the action is "cancel"
      if (action !== "cancel") {
        return res.status(400).json({ error: "Invalid action for this endpoint" });
      }
      
      // Check if the subscription ID in path matches body
      const pathId = parseInt(req.params.id);
      if (isNaN(pathId) || pathId !== subscriptionId) {
        return res.status(400).json({ error: "Subscription ID mismatch" });
      }
      
      // Get the subscription
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      // Verify the user owns this subscription
      if (subscription.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Cannot cancel an already cancelled subscription
      if (subscription.status === "cancelled") {
        return res.status(400).json({ error: "Subscription is already cancelled" });
      }
      
      // Default to cancel at period end (less disruptive to user)
      const cancelAtPeriodEnd = req.query.immediate !== "true";
      
      // Cancel the subscription
      const cancelledSubscription = await storage.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
      
      res.json({
        success: true,
        subscription: cancelledSubscription,
        message: cancelAtPeriodEnd 
          ? "Subscription will be cancelled at the end of the current billing period" 
          : "Subscription has been cancelled immediately"
      });
      
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ 
        error: "Failed to cancel subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Reactivate a cancelled subscription
  app.post("/api/subscriptions/:id/reactivate", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = subscriptionActionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.format() 
        });
      }
      
      const { subscriptionId, userId, action } = validationResult.data;
      
      // Ensure the action is "reactivate"
      if (action !== "reactivate") {
        return res.status(400).json({ error: "Invalid action for this endpoint" });
      }
      
      // Check if the subscription ID in path matches body
      const pathId = parseInt(req.params.id);
      if (isNaN(pathId) || pathId !== subscriptionId) {
        return res.status(400).json({ error: "Subscription ID mismatch" });
      }
      
      // Get the subscription
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      // Verify the user owns this subscription
      if (subscription.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Can only reactivate cancelled or expired subscriptions
      if (subscription.status !== "cancelled" && subscription.status !== "expired") {
        return res.status(400).json({ 
          error: "Subscription cannot be reactivated", 
          status: subscription.status 
        });
      }
      
      // Reactivate the subscription
      const reactivatedSubscription = await storage.reactivateSubscription(subscriptionId);
      
      res.json({
        success: true,
        subscription: reactivatedSubscription
      });
      
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      res.status(500).json({ 
        error: "Failed to reactivate subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Update payment method for a subscription
  app.post("/api/subscriptions/:id/update-payment", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = subscriptionActionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.format() 
        });
      }
      
      const { subscriptionId, userId, action, paymentMethod } = validationResult.data;
      
      // Ensure the action is "update_payment"
      if (action !== "update_payment") {
        return res.status(400).json({ error: "Invalid action for this endpoint" });
      }
      
      // Payment method is required for this action
      if (!paymentMethod) {
        return res.status(400).json({ error: "Payment method is required" });
      }
      
      // Check if the subscription ID in path matches body
      const pathId = parseInt(req.params.id);
      if (isNaN(pathId) || pathId !== subscriptionId) {
        return res.status(400).json({ error: "Subscription ID mismatch" });
      }
      
      // Get the subscription
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      // Verify the user owns this subscription
      if (subscription.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Update the payment method
      const updatedSubscription = await storage.updateSubscriptionPayment(
        subscriptionId, 
        paymentMethod
      );
      
      res.json({
        success: true,
        subscription: updatedSubscription
      });
      
    } catch (error) {
      console.error("Error updating subscription payment method:", error);
      res.status(500).json({ 
        error: "Failed to update payment method",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Rappers, Songs, Albums, and Chart History APIs
  app.use("/api/ai-rappers", aiRappersRouter);
  app.use("/api/ai-songs", aiSongsRouter);
  app.use("/api/ai-albums", aiAlbumsRouter);
  app.use("/api/chart-history", chartHistoryRouter);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
