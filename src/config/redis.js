const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.UPSTASH_REDIS_URL, // Use the full URL directly
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err);
  }
})();

module.exports = redisClient;
