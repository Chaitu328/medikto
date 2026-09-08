/**
 * Medikto Server-Side Caching Utility
 * 
 * Supports ElastiCache / Redis when REDIS_URL or ELASTICACHE_ENDPOINT is configured,
 * with an in-process LRU cache fallback.
 * 
 * Sits strictly BEHIND the auth middleware and isolates data per authenticated user.
 */

class InMemoryLruCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key, value, ttlSeconds = 60) {
    if (this.cache.size >= this.maxSize) {
      // Evict oldest entry (first key)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const expiresAt = ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : null;
    this.cache.set(key, { value, expiresAt });
  }

  del(key) {
    this.cache.delete(key);
  }

  delByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix) || key.includes(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

const memoryCache = new InMemoryLruCache(2000);

let redisClient = null;
if (process.env.REDIS_URL || process.env.ELASTICACHE_ENDPOINT) {
  try {
    const Redis = require("ioredis");
    const endpoint = process.env.REDIS_URL || process.env.ELASTICACHE_ENDPOINT;
    redisClient = new Redis(endpoint, {
      tls: process.env.REDIS_TLS === "true" ? {} : undefined,
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
    });
    redisClient.on("error", (err) => {
      console.warn("[Cache:Redis] Redis error, falling back to in-memory:", err.message);
    });
  } catch (err) {
    console.warn("[Cache] ioredis package not found or failed to initialize, using in-memory LRU cache fallback.");
  }
}

const getCache = async (key) => {
  try {
    if (redisClient && redisClient.status === "ready") {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    }
    return memoryCache.get(key);
  } catch (err) {
    return memoryCache.get(key);
  }
};

const setCache = async (key, value, ttlSeconds = 60) => {
  try {
    if (redisClient && redisClient.status === "ready") {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return;
    }
    memoryCache.set(key, value, ttlSeconds);
  } catch (err) {
    memoryCache.set(key, value, ttlSeconds);
  }
};

const delCache = async (keyOrPrefix) => {
  try {
    if (redisClient && redisClient.status === "ready") {
      const keys = await redisClient.keys(`*${keyOrPrefix}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (_) {}
  memoryCache.delByPrefix(keyOrPrefix);
};

const invalidateUserDoseCache = async (userId, patientId) => {
  if (userId) {
    await delCache(`dosehistory:${userId}`);
    await delCache(`adherence:${userId}`);
    await delCache(`today:${userId}`);
  }
  if (patientId && patientId !== userId) {
    await delCache(`dosehistory:${patientId}`);
    await delCache(`adherence:${patientId}`);
    await delCache(`today:${patientId}`);
  }
};

module.exports = {
  getCache,
  setCache,
  delCache,
  invalidateUserDoseCache,
};
