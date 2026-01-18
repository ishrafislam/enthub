import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getListsStatus = query({
  args: { userId: v.id("users"), tmdbId: v.number() },
  handler: async (ctx, args) => {
    const watchlist = await ctx.db
      .query("watchlist")
      .withIndex("by_user_media", (q) =>
        q.eq("userId", args.userId).eq("tmdbId", args.tmdbId)
      )
      .first();

    const watched = await ctx.db
      .query("watched")
      .withIndex("by_user_media", (q) =>
        q.eq("userId", args.userId).eq("tmdbId", args.tmdbId)
      )
      .first();

    return {
      inWatchlist: !!watchlist,
      inWatched: !!watched,
    };
  },
});

export const toggleWatchlist = mutation({
  args: {
    userId: v.id("users"),
    tmdbId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_media", (q) =>
        q.eq("userId", args.userId).eq("tmdbId", args.tmdbId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { added: false };
    } else {
      // 1. Remove from watched if present (re-watching)
      const inWatched = await ctx.db
        .query("watched")
        .withIndex("by_user_media", (q) =>
          q.eq("userId", args.userId).eq("tmdbId", args.tmdbId)
        )
        .first();

      if (inWatched) {
        await ctx.db.delete(inWatched._id);
      }

      // 2. Add to watchlist
      await ctx.db.insert("watchlist", {
        userId: args.userId,
        tmdbId: args.tmdbId,
        mediaType: args.mediaType,
        title: args.title,
        posterPath: args.posterPath,
        addedAt: Date.now(),
      });
      return { added: true };
    }
  },
});

export const markAsWatched = mutation({
  args: {
    userId: v.id("users"),
    tmdbId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Remove from watchlist if present
    const inWatchlist = await ctx.db
      .query("watchlist")
      .withIndex("by_user_media", (q) =>
        q.eq("userId", args.userId).eq("tmdbId", args.tmdbId)
      )
      .first();

    if (inWatchlist) {
      await ctx.db.delete(inWatchlist._id);
    }

    // 2. Add to watched if not already there
    const inWatched = await ctx.db
      .query("watched")
      .withIndex("by_user_media", (q) =>
        q.eq("userId", args.userId).eq("tmdbId", args.tmdbId)
      )
      .first();

    if (!inWatched) {
      await ctx.db.insert("watched", {
        userId: args.userId,
        tmdbId: args.tmdbId,
        mediaType: args.mediaType,
        title: args.title,
        posterPath: args.posterPath,
        watchedAt: Date.now(),
      });
    }
  },
});

export const removeFromWatched = mutation({
  args: { userId: v.id("users"), tmdbId: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("watched")
      .withIndex("by_user_media", (q) =>
        q.eq("userId", args.userId).eq("tmdbId", args.tmdbId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getWatchlist = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getWatched = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("watched")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
