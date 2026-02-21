import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    // We will use this to store the session/token if needed, 
    // or just rely on the ID for this simple MVP.
    name: v.optional(v.string()), 
  }).index("by_email", ["email"]),

  authCodes: defineTable({
    email: v.string(),
    code: v.string(),
    attempts: v.number(),
    expiresAt: v.number(), // Unix epoch in milliseconds
  }).index("by_email", ["email"])
    .index("by_email_code", ["email", "code"]),

  watchlist: defineTable({
    userId: v.id("users"),
    tmdbId: v.number(),
    mediaType: v.string(), // "movie" | "tv"
    title: v.string(),
    posterPath: v.optional(v.string()),
    addedAt: v.number(),
    backdropPath: v.optional(v.string()),
    overview: v.optional(v.string()),
    voteAverage: v.optional(v.number()),
    popularity: v.optional(v.number()),
    releaseDate: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    originalLanguage: v.optional(v.string()),
    runtime: v.optional(v.number()),
    status: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_user_media", ["userId", "tmdbId"]),

  watched: defineTable({
    userId: v.id("users"),
    tmdbId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.optional(v.string()),
    watchedAt: v.number(),
    rating: v.optional(v.number()),
    backdropPath: v.optional(v.string()),
    overview: v.optional(v.string()),
    voteAverage: v.optional(v.number()),
    popularity: v.optional(v.number()),
    releaseDate: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    originalLanguage: v.optional(v.string()),
    runtime: v.optional(v.number()),
    status: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_user_media", ["userId", "tmdbId"]),
});