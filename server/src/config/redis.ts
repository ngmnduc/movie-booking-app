import Redis from 'ioredis';
import redisClient from '../config/redis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export const getSeatMap = async (showtimeId: number) => {
  // 1. Lấy thông tin suất chiếu và toàn bộ ghế cứng của phòng đó
  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    include: {
      auditorium: {
        include: { seats: true }
      }
    }
  });

  if (!showtime) throw new Error('SHOWTIME_NOT_FOUND');

  // 2. Lấy danh sách ID ghế ĐÃ BÁN (DB)
  // Chỉ lấy vé thuộc Booking có status = CONFIRMED hoặc PENDING (chưa hết hạn)
  const soldTickets = await prisma.ticket.findMany({
    where: {
      booking: {
        showtimeId: showtimeId,
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    },
    select: { seatId: true }
  });
  const soldSeatIds = new Set(soldTickets.map(t => t.seatId));

  // 3. Lấy danh sách ID ghế ĐANG KHÓA (Redis)
  // Pattern: lock:showtime:1:seat:25
  const pattern = `lock:showtime:${showtimeId}:seat:*`;
  const lockedKeys = await redisClient.keys(pattern); // Quét Redis
  
  const lockedSeatIds = new Set(
    lockedKeys.map(key => {
      const parts = key.split(':');
      return Number(parts[parts.length - 1]); // Lấy phần tử cuối cùng làm ID ghế
    })
  );

  const seatMap = showtime.auditorium.seats.map(seat => {
    let status = 'AVAILABLE';

    if (soldSeatIds.has(seat.id)) {
      status = 'SOLD';
    } else if (lockedSeatIds.has(seat.id)) {
      status = 'LOCKED';
    }

    return {
      id: seat.id,
      row: seat.row,
      number: seat.number,
      type: seat.type,
      status: status
    };
  });

  return seatMap;
};