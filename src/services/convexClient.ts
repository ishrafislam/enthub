import { ConvexHttpClient, ConvexClient } from "convex/browser";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL is not defined in environment variables");
}

export const httpClient = new ConvexHttpClient(convexUrl);
export const client = new ConvexClient(convexUrl);
