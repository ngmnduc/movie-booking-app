import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 1
});

redis.on('connect', () => console.log('Redis Connected!'));
redis.on('error', (err) => console.error('Redis Connection Error:', err));

export default redis;

// Local lock for concurrent fetches
const pendingFetches = new Map<string, Promise<any>>();

export const getOrSetCache = async (
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<any>
) => {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) return JSON.parse(cachedData);
  } catch (err) {
    console.warn(`Redis get error for key ${key}, fallback to fetchFn.`);
  }

  if (pendingFetches.has(key)) return pendingFetches.get(key);

  const fetchPromise = fetchFn()
    .then(async (data) => {
      try {
        if (data) await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
      } catch (e) { console.error('Redis set error', e); }
      return data;
    })
    .finally(() => pendingFetches.delete(key));

  pendingFetches.set(key, fetchPromise);

  return fetchPromise;
};