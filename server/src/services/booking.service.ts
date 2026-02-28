import { PrismaClient } from "@prisma/client";
import redisClient from '../config/redis';

const prisma = new PrismaClient();
const HOLD_EXPIRE_SECONDS = 300;

export const holdSeat = async  (userId: number,showtimeId: number, seatId: number) => {
    const isSold = await prisma.ticket.findFirst({
        where: {
            seatId,
            booking: {
                showtimeId, status: {in: ['CONFIRMED','PENDING']}
            }
        }
    });

    if (isSold) {
    throw new Error('SEAT_ALREADY_SOLD');
    } 

    const lockKey = `lock:showtime:${showtimeId}:seat:${seatId}`;

    const lockResult = await redisClient.set(lockKey, userId.toString(), 'EX', HOLD_EXPIRE_SECONDS, 'NX');
    if(!lockResult){
        throw new Error('SEAT_ALREADY_LOCKED')
    }
    return {userId, showtimeId,seatId, status: 'LOCKED'};
};

export const releaseSeat = async (userId: number, showtimeId: number, seatId: number) => {
  const lockKey = `lock:showtime:${showtimeId}:seat:${seatId}`;
  
// check người đang giữ ghế
  const currentLockUser = await redisClient.get(lockKey);

  if (!currentLockUser) {
    return; 
  }

  if (Number(currentLockUser) !== userId) {
    throw new Error('NOT_YOUR_LOCK');
  }

  // 2. Xóa khóa
  await redisClient.del(lockKey);
  
  return { showtimeId, seatId, status: 'AVAILABLE' };
};