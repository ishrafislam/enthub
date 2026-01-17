import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const signIn = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    
    // 1. Generate 6-digit code
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

    if (authCode.code !== code) {
      throw new Error("Invalid code. Please check your email and try again.");
    }

    if (Date.now() > authCode.expiresAt) {
      await ctx.db.delete(authCode._id);
      throw new Error("Code expired. Please request a new one.");
    }

    // 2. Consume code
    await ctx.db.delete(authCode._id);

    // 3. Find or Create User
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
