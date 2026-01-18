import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Basic security: In a real app, only admins should call this.
    // For this personal MVP, we'll just limit the results to prevent memory issues.
    return await ctx.db.query("users")
      .take(args.limit ?? 100);
  },
});
