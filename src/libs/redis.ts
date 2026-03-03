import Redis from "ioredis";
import { env } from "../config/env";

export const redis = new Redis(env.redis, {
  maxRetriesPerRequest: null,
  lazyConnect: false,
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});
