import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  watchlist: defineTable({
    userId: v.id("users"),
    tmdbId: v.number(),
    mediaType: v.string(), // "movie" | "tv"
    title: v.string(),
    posterPath: v.optional(v.string()),
    addedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_media", ["userId", "tmdbId"]), // Compound index for quick check

  watched: defineTable({
    userId: v.id("users"),
    tmdbId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.optional(v.string()),
    watchedAt: v.number(),
    rating: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_user_media", ["userId", "tmdbId"]),
});
