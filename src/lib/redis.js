const logger = require("./logger");

let client = null;
let memoryStore = new Map();

function isRedisEnabled() {
  return Boolean(process.env.REDIS_URL?.trim());
}

async function connectRedis() {
  if (!isRedisEnabled()) return null;
  if (client) return client;

  try {
    const { createClient } = require("redis");
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => {
      logger.warn("redis.error", { message: err.message });
    });
    await client.connect();
    logger.info("redis.connected");
    return client;
  } catch (err) {
    logger.warn("redis.unavailable", { message: err.message });
    client = null;
    return null;
  }
}

async function setWithExpiry(key, value, ttlSeconds) {
  const redis = await connectRedis();
  if (redis) {
    await redis.set(key, value, { EX: ttlSeconds });
    return;
  }
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

async function get(key) {
  const redis = await connectRedis();
  if (redis) {
    return redis.get(key);
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

async function del(key) {
  const redis = await connectRedis();
  if (redis) {
    await redis.del(key);
    return;
  }
  memoryStore.delete(key);
}

async function closeRedis() {
  if (client) {
    await client.quit();
    client = null;
  }
  memoryStore.clear();
}

module.exports = {
  connectRedis,
  setWithExpiry,
  get,
  del,
  closeRedis,
  isRedisEnabled,
};
