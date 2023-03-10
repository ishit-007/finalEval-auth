/* eslint-disable no-unused-vars */
const redis = require('redis');
const redisURL = 'redis://docker.for.mac.localhost:6379';
const redisClient = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6379,
  },
  legacyMode: true,
});

redisClient.on('connect', (err) => {
  console.log('Redis client connected');
});
const connectRedis = async () => {
  if (!redisClient.isReady) {
    await redisClient.connect();
    console.log('Connecting to redis');
  }

  return redisClient;
};
const disconnectRedis = async () => {
  if (redisClient.isReady) {
    console.log('Disconnecting from redis');
    await redisClient.disconnect();
  }
};
module.exports = {
  connectRedis,
  disconnectRedis,
};
