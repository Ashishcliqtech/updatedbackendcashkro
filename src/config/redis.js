const redis = require('redis');
const logger = require('../utils/logger');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.UPSTASH_REDIS_URL,
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

(async () => {
  try {
    await redisClient.connect();
    logger.info('✅ Redis connected successfully');
  } catch (err) {
    logger.error('❌ Failed to connect to Redis:', err);
  }
})();

module.exports = redisClient;

