import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const signIn = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    
    // 1. Generate 6-digit code. 
    // In Convex mutations, Math.random() is deterministic but seeded per request.
    // For a simple OTP, this is standard Convex practice.
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 2. Store code
    // Clean up old codes for this email first
    const existing = await ctx.db
      .query("authCodes")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }

    await ctx.db.insert("authCodes", {
      email,
      code,
      attempts: 0,
      expiresAt,
    });

    // 3. Send email (schedule action)
    await ctx.scheduler.runAfter(0, api.actions.sendAuthEmail, {
      email,
      code,
    });

    return { success: true };
  },
});

export const verifyCode = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const code = args.code.trim();

    // 1. Find the active code for this email
    const authCode = await ctx.db
      .query("authCodes")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!authCode) {
      throw new Error("No login request found for this email. Please try again.");
    }

    if (Date.now() > authCode.expiresAt) {
      await ctx.db.delete(authCode._id);
      throw new Error("Code expired. Please request a new one.");
    }

    // 2. Check attempts (Rate Limiting)
    if (authCode.attempts >= 5) {
      await ctx.db.delete(authCode._id);
      throw new Error("Too many failed attempts. For security, this code has been invalidated.");
    }

    if (authCode.code !== code) {
      await ctx.db.patch(authCode._id, { attempts: authCode.attempts + 1 });
      throw new Error(`Invalid code. ${4 - authCode.attempts} attempts remaining.`);
    }

    // 3. Consume code
    await ctx.db.delete(authCode._id);

    // 4. Find or Create User
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        email,
      });
      return { userId };
    }

    return { userId: user._id };
  },
});
